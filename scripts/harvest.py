#!/usr/bin/env python3
"""Harvest the live site into a route map and one markdown file per URL.

Fetches the sitemap index and both child sitemaps, then every one of the 62 legacy
URLs, and writes:

  content/route-map.json      one entry per URL
  content/pages/{slug}.md     frontmatter + cleaned body copy
  content/harvest-errors.log  any URL that failed twice

Fetches are live (no cache) so the success/failure count reflects reality. Content
extraction reuses scrape.py, which already handles the NitroPack lazy-image
rewriting and the legacy posts that pack an entire article into a single <p>.
"""

from __future__ import annotations

import json
import sys
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from xml.etree import ElementTree

from bs4 import BeautifulSoup, NavigableString, Tag

sys.path.insert(0, str(Path(__file__).resolve().parent))
from scrape import (  # noqa: E402
    ORIGIN,
    SERVICE_SLUGS,
    content_root,
    extract_blocks,
    extract_jsonld,
    extract_meta,
    rewrite_href,
)

UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "content"
PAGES = CONTENT / "pages"
ERROR_LOG = CONTENT / "harvest-errors.log"

SITEMAP_INDEX = f"{ORIGIN}/sitemap_index.xml"
SM_NS = "{http://www.sitemaps.org/schemas/sitemap/0.9}"

# An image with an empty alt and icon-sized dimensions is genuinely decorative;
# a large in-content image with an empty alt is meaningful but unlabelled.
ICON_MAX_EDGE = 64

errors: list[str] = []


def log_error(url: str, message: str) -> None:
    stamp = datetime.now(timezone.utc).isoformat(timespec="seconds")
    line = f"{stamp}\t{url}\t{message}"
    errors.append(line)
    print(f"    ! {message}", file=sys.stderr)


def fetch(url: str) -> str | None:
    """Fetch a URL live, retrying once before giving up and logging."""
    last: Exception | None = None
    for attempt in range(2):
        try:
            request = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(request, timeout=45) as response:
                return response.read().decode("utf-8", errors="replace")
        except (urllib.error.URLError, TimeoutError, OSError) as error:
            last = error
            if attempt == 0:
                time.sleep(3)
    log_error(url, f"fetch failed after retry: {last}")
    return None


def read_sitemaps() -> list[dict]:
    """Read the sitemap index, then each child sitemap it points at."""
    index_xml = fetch(SITEMAP_INDEX)
    if index_xml is None:
        raise SystemExit("cannot continue without the sitemap index")

    children = [
        node.findtext(f"{SM_NS}loc")
        for node in ElementTree.fromstring(index_xml).findall(f"{SM_NS}sitemap")
    ]
    print(f"sitemap index lists {len(children)} sitemaps:")
    for child in children:
        print(f"  {child}")

    routes: list[dict] = []
    for child in children:
        if not child:
            continue
        kind = "post" if "post-sitemap" in child else "page"
        xml = fetch(child)
        if xml is None:
            continue
        entries = ElementTree.fromstring(xml).findall(f"{SM_NS}url")
        print(f"  {child.rsplit('/', 1)[-1]}: {len(entries)} URLs ({kind})")
        for node in entries:
            loc = node.findtext(f"{SM_NS}loc") or ""
            path = loc.replace(ORIGIN, "") or "/"
            routes.append(
                {
                    "url": loc,
                    "path": path,
                    "slug": "home" if path == "/" else path.strip("/"),
                    "type": kind,
                    "lastmod": node.findtext(f"{SM_NS}lastmod"),
                }
            )
    return routes


def schema_types(graphs: list) -> list[str]:
    """Collect every distinct @type present in the page's JSON-LD."""
    found: set[str] = set()

    def visit(node) -> None:
        if isinstance(node, dict):
            value = node.get("@type")
            if isinstance(value, str):
                found.add(value)
            elif isinstance(value, list):
                found.update(v for v in value if isinstance(v, str))
            for child in node.values():
                visit(child)
        elif isinstance(node, list):
            for child in node:
                visit(child)

    visit(graphs)
    return sorted(found)


def json_ld_dates(graphs: list) -> dict:
    dates: dict[str, str] = {}

    def visit(node) -> None:
        if isinstance(node, dict):
            for key in ("datePublished", "dateModified"):
                if isinstance(node.get(key), str) and key not in dates:
                    dates[key] = node[key]
            for child in node.values():
                visit(child)
        elif isinstance(node, list):
            for child in node:
                visit(child)

    visit(graphs)
    return dates


def inline_markdown(html: str) -> str:
    """Convert the scraper's limited inline HTML (links, emphasis) to markdown."""
    soup = BeautifulSoup(html, "html.parser")

    def walk(node) -> str:
        parts: list[str] = []
        for child in node.children:
            if isinstance(child, NavigableString):
                parts.append(str(child))
            elif isinstance(child, Tag):
                inner = walk(child)
                if child.name == "a":
                    href = child.get("href", "")
                    parts.append(f"[{inner}]({href})" if href else inner)
                elif child.name in ("strong", "b"):
                    parts.append(f"**{inner}**")
                elif child.name in ("em", "i"):
                    parts.append(f"*{inner}*")
                elif child.name == "br":
                    parts.append("\n")
                else:
                    parts.append(inner)
        return "".join(parts)

    return walk(soup).strip()


def classify_image(image: dict) -> dict:
    """Label each content image so Stage B knows which ones still need alt text."""
    alt = (image.get("alt") or "").strip()
    width = image.get("width")
    height = image.get("height")
    is_icon = (
        isinstance(width, int)
        and isinstance(height, int)
        and width <= ICON_MAX_EDGE
        and height <= ICON_MAX_EDGE
    )

    if alt:
        role = "meaningful"
    elif is_icon:
        role = "decorative"
    else:
        # Empty alt on a full-size content image: the live site simply never set one.
        role = "meaningful-alt-missing"

    return {
        "src": ORIGIN + image["src"],
        "alt": alt,
        "role": role,
        "decorative": role == "decorative",
    }


def blocks_to_markdown(blocks: list[dict]) -> str:
    lines: list[str] = []
    for block in blocks:
        kind = block["type"]
        if kind == "h1":
            continue  # captured separately in frontmatter
        if kind == "img":
            alt = (block.get("alt") or "").strip()
            lines.append(f"![{alt}]({ORIGIN}{block['src']})")
        elif kind in ("h2", "h3", "h4", "h5", "h6"):
            lines.append("#" * int(kind[1]) + " " + inline_markdown(block["html"]))
        elif kind == "p":
            lines.append(inline_markdown(block["html"]))
        elif kind == "blockquote":
            body = inline_markdown(block["html"]).replace("\n", "\n> ")
            lines.append(f"> {body}")
        elif kind in ("ul", "ol"):
            # Emit the list as one block so items stay on consecutive lines.
            items = [
                f"{'-' if kind == 'ul' else f'{index}.'} {inline_markdown(item)}"
                for index, item in enumerate(block["items"], 1)
            ]
            lines.append("\n".join(items))
    return "\n\n".join(line for line in lines if line.strip() != "") + "\n"


def frontmatter(entry: dict, extra: dict) -> str:
    """Emit YAML frontmatter. Values go through json.dumps, which is valid YAML."""
    lines = ["---"]
    for key, value in {**entry, **extra}.items():
        if value is None:
            continue
        if isinstance(value, list) and value and isinstance(value[0], dict):
            lines.append(f"{key}:")
            for item in value:
                lines.append(f"  - {json.dumps(item, ensure_ascii=False)}")
        elif isinstance(value, list):
            lines.append(f"{key}: {json.dumps(value, ensure_ascii=False)}")
        else:
            lines.append(f"{key}: {json.dumps(value, ensure_ascii=False)}")
    lines.append("---")
    return "\n".join(lines)


def harvest(route: dict) -> dict | None:
    html = fetch(route["url"])
    if html is None:
        return None

    soup = BeautifulSoup(html, "html.parser")
    meta = extract_meta(soup)
    graphs = extract_jsonld(soup)

    for tag in soup.find_all(["script", "style", "noscript", "svg"]):
        tag.decompose()

    heading = soup.select_one('[data-elementor-type="single-post"] h1') or soup.find("h1")
    root = content_root(soup, route["type"])
    if root is None:
        log_error(route["url"], "no main content area found")
        return None
    for card in root.select("article.elementor-post"):
        card.decompose()

    blocks, images = extract_blocks(root)

    links: list[str] = []
    for anchor in root.find_all("a", href=True):
        href = rewrite_href(anchor["href"])
        if not href or not href.startswith("/"):
            continue
        href = href.split("?")[0].split("#")[0]
        if href and href not in links:
            links.append(href)

    og = meta.get("openGraph") or {}
    dates = json_ld_dates(graphs)
    published = meta.get("other", {}).get("article:published_time") or dates.get("datePublished")
    modified = meta.get("other", {}).get("article:modified_time") or dates.get("dateModified")

    entry = {
        "path": route["path"],
        "type": route["type"],
        "title": meta.get("title"),
        "metaDescription": meta.get("description"),
        "canonical": meta.get("canonical"),
        # Carried so the rebuild keeps directives like max-image-preview:large,
        # which affect how Google renders results.
        "robots": meta.get("robots"),
        "ogImage": og.get("image"),
        "schemaTypes": schema_types(graphs),
        "h1": heading.get_text(" ", strip=True) if heading else None,
    }
    # Recorded for pages as well as posts so the sitemap can emit a lastmod for
    # every route, matching the lastmod the legacy sitemaps advertise.
    if published:
        entry["publishedTime"] = published
    if modified:
        entry["modifiedTime"] = modified

    return {
        "entry": entry,
        "slug": route["slug"],
        "extra": {
            "ogTitle": og.get("title"),
            "ogDescription": og.get("description"),
            "ogType": og.get("type"),
            "images": [classify_image(image) for image in images],
            "internalLinks": sorted(links),
        },
        "body": blocks_to_markdown(blocks),
    }


def main() -> int:
    routes = read_sitemaps()
    print(f"\n{len(routes)} URLs to harvest\n")

    PAGES.mkdir(parents=True, exist_ok=True)
    entries: list[dict] = []
    failed: list[str] = []

    for index, route in enumerate(routes, 1):
        print(f"[{index}/{len(routes)}] {route['path']}")
        result = harvest(route)
        if result is None:
            failed.append(route["path"])
            continue

        entries.append(result["entry"])
        document = (
            frontmatter(result["entry"], result["extra"]) + "\n\n" + result["body"]
        )
        (PAGES / f"{result['slug']}.md").write_text(document, encoding="utf-8")

    (CONTENT / "route-map.json").write_text(
        json.dumps(entries, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )

    if errors:
        ERROR_LOG.write_text("\n".join(errors) + "\n", encoding="utf-8")
    elif ERROR_LOG.exists():
        ERROR_LOG.unlink()

    pages = sum(1 for e in entries if e["type"] == "page")
    posts = sum(1 for e in entries if e["type"] == "post")
    services = sum(1 for e in entries if e["path"].strip("/") in SERVICE_SLUGS)

    print("\n" + "=" * 60)
    print(f"expected 62 | succeeded {len(entries)} | failed {len(failed)}")
    print(f"  pages {pages} (of which service pages {services}) | posts {posts}")
    print(f"  route map:  content/route-map.json")
    print(f"  markdown:   content/pages/ ({len(entries)} files)")
    print(f"  errors log: {'content/harvest-errors.log' if errors else 'none written'}")
    if failed:
        print(f"  FAILED: {failed}")
    print("=" * 60)
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
