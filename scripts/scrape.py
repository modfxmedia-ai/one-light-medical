#!/usr/bin/env python3
"""Snapshot the legacy WordPress site into structured JSON for the Next.js rebuild.

Produces content/routes.json: one record per legacy URL containing head metadata,
verbatim JSON-LD, the H1, ordered semantic content blocks, images and internal links.

NitroPack serves lazy-loaded <img> tags whose src is a base64 placeholder and whose
real URL points at a CDN mirror, so image sources are mapped back to origin
/wp-content/ paths to keep every asset URL identical to the live site.
"""

from __future__ import annotations

import json
import re
import sys
import time
import urllib.request
import urllib.error
from pathlib import Path
from xml.etree import ElementTree

from bs4 import BeautifulSoup, NavigableString, Tag

ORIGIN = "https://onelightmedical.com"
SITEMAPS = ["post-sitemap.xml", "page-sitemap.xml"]
UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "content"
CACHE_DIR = ROOT / ".scrape-cache"

SERVICE_SLUGS = [
    "auto-injury",
    "knee-pain",
    "neuropathy",
    "spinal-decompression",
    "softwave-trt-treatment",
    "chiropractic-care",
    "weight-loss",
    "red-light-therapy",
]

# Same-page anchors the legacy nav and footer actually link to. Elementor and the
# WordPress comment form emit many other ids that nothing links to, so keeping only
# the linked ones avoids carrying generated markup into the rebuild.
LINKED_ANCHORS = {"Testimonials"}

# Inline tags kept inside paragraph copy; everything else is flattened to text.
INLINE_KEEP = {"a", "strong", "b", "em", "i", "br", "u", "sup", "sub"}
BLOCK_TAGS = ("h1", "h2", "h3", "h4", "h5", "h6", "p", "ul", "ol", "blockquote", "img")


def fetch(url: str, *, retries: int = 3) -> str:
    """Fetch a URL as text, caching on disk so re-runs don't re-hit the origin."""
    CACHE_DIR.mkdir(exist_ok=True)
    key = re.sub(r"[^a-zA-Z0-9]+", "_", url.replace(ORIGIN, "")).strip("_") or "index"
    cached = CACHE_DIR / f"{key}.html"
    if cached.exists():
        return cached.read_text(encoding="utf-8")

    last_error: Exception | None = None
    for attempt in range(retries):
        try:
            request = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(request, timeout=45) as response:
                html = response.read().decode("utf-8", errors="replace")
            cached.write_text(html, encoding="utf-8")
            return html
        except (urllib.error.URLError, TimeoutError, OSError) as error:
            last_error = error
            time.sleep(2 * (attempt + 1))
    raise RuntimeError(f"failed to fetch {url}: {last_error}")


def discover_routes() -> list[dict]:
    """Read the Rank Math sitemaps to get the authoritative URL inventory."""
    namespace = "{http://www.sitemaps.org/schemas/sitemap/0.9}"
    routes: list[dict] = []
    for name in SITEMAPS:
        kind = "post" if name.startswith("post") else "page"
        tree = ElementTree.fromstring(fetch(f"{ORIGIN}/{name}"))
        for node in tree.findall(f"{namespace}url"):
            loc = node.findtext(f"{namespace}loc") or ""
            lastmod = node.findtext(f"{namespace}lastmod")
            path = loc.replace(ORIGIN, "") or "/"
            routes.append(
                {
                    "url": loc,
                    "path": path,
                    "slug": path.strip("/"),
                    "sitemap": kind,
                    "lastmod": lastmod,
                }
            )
    return routes


def classify(route: dict) -> str:
    if route["path"] == "/":
        return "home"
    if route["path"] == "/blog/":
        return "blog-index"
    if route["slug"] in SERVICE_SLUGS:
        return "service"
    return "post" if route["sitemap"] == "post" else "page"


def to_origin_src(value: str | None) -> str | None:
    """Resolve a NitroPack CDN or protocol-relative URL back to an origin path."""
    if not value or value.startswith("data:"):
        return None
    match = re.search(r"onelightmedical\.com(/wp-content/.*)$", value)
    if match:
        return match.group(1)
    if value.startswith("//"):
        value = "https:" + value
    if value.startswith(ORIGIN):
        return value[len(ORIGIN) :]
    if value.startswith("/"):
        return value
    return value


def image_from_tag(tag: Tag) -> dict | None:
    src = to_origin_src(
        tag.get("src")
        or tag.get("nitro-lazy-src")
        or tag.get("data-src")
        or tag.get("data-lazy-src")
    )
    if not src:
        src = to_origin_src(tag.get("nitro-lazy-src") or tag.get("data-src"))
    if not src or not src.startswith("/wp-content/"):
        return None
    image = {"src": src, "alt": tag.get("alt", "") or ""}
    for dimension in ("width", "height"):
        if tag.get(dimension) and str(tag[dimension]).isdigit():
            image[dimension] = int(tag[dimension])
    return image


def rewrite_href(href: str | None) -> str | None:
    if not href:
        return None
    href = href.strip()
    if href.startswith(ORIGIN):
        href = href[len(ORIGIN) :] or "/"
    if href.startswith(("mailto:", "tel:", "#", "http")):
        return href
    if href.startswith("/") and not href.endswith("/") and "." not in href.rsplit("/", 1)[-1]:
        href += "/"
    return href


def inline_segments(node: Tag) -> list[str]:
    """Serialize inline content into segments split on <br>.

    Splitting happens on the DOM rather than the serialized string, because legacy
    posts wrap emphasis around <br> boundaries (e.g. a bolded Q&A pair). Splitting
    the string would cut through the <strong> and leave unbalanced markup, so each
    segment re-wraps the emphasis it inherited.
    """
    segments: list[str] = []
    current: list[str] = []

    def flush() -> None:
        segments.append("".join(current))
        current.clear()

    def wrap(tag: Tag, inner: str) -> str:
        # Elementor emits empty <i>/<span> elements to render icon-font glyphs;
        # keeping them would produce emphasis with no content.
        if not inner.strip():
            return ""
        if tag.name == "a":
            href = rewrite_href(tag.get("href"))
            return f'<a href="{href}">{inner}</a>' if href else inner
        name = {"b": "strong", "i": "em"}.get(tag.name, tag.name)
        return f"<{name}>{inner}</{name}>"

    for child in node.children:
        if isinstance(child, NavigableString):
            current.append(str(child))
            continue
        if not isinstance(child, Tag):
            continue

        if child.name == "br":
            flush()
            continue

        parts = inline_segments(child)
        keep = child.name in INLINE_KEEP
        rendered = [wrap(child, part) if keep else part for part in parts]

        current.append(rendered[0])
        for middle in rendered[1:]:
            flush()
            current.append(middle)

    flush()
    return [re.sub(r"[ \t\r\f\v]+", " ", segment).strip() for segment in segments]


def inline_html(node: Tag) -> str:
    """Serialize inline content, keeping links and emphasis, dropping everything else."""
    return "<br />".join(segment for segment in inline_segments(node) if segment)


def content_root(soup: BeautifulSoup, kind: str) -> Tag | None:
    if kind == "post":
        root = soup.select_one(".elementor-widget-theme-post-content")
        if root:
            return root
    for selector in (
        '[data-elementor-type="wp-page"]',
        '[data-elementor-type="single-post"]',
        ".entry-content",
        "main",
    ):
        root = soup.select_one(selector)
        if root:
            return root
    return soup.body


def anchor_for(tag: Tag, claimed: set[str]) -> str | None:
    """Find an unclaimed section anchor above this tag, e.g. the /#Testimonials target.

    Anchors are load-bearing because the legacy nav and footer link to them, so the
    first block inside an anchored section inherits the id.
    """
    for parent in tag.parents:
        if not isinstance(parent, Tag) or parent.name not in ("section", "div"):
            continue
        anchor = parent.get("id")
        if isinstance(anchor, str) and anchor and anchor not in claimed and anchor in LINKED_ANCHORS:
            claimed.add(anchor)
            return anchor
    return None


def extract_blocks(root: Tag) -> tuple[list[dict], list[dict]]:
    """Walk the content root and emit ordered semantic blocks plus collected images."""
    blocks: list[dict] = []
    images: list[dict] = []
    seen_text: set[str] = set()
    seen_images: set[str] = set()
    claimed_anchors: set[str] = set()

    for tag in root.find_all(BLOCK_TAGS):
        # Skip nodes inside a block already emitted (e.g. <p> nested in <blockquote>).
        if tag.find_parent(["blockquote", "li"]) and tag.name in ("p", "img"):
            continue

        if tag.name == "img":
            image = image_from_tag(tag)
            if image and image["src"] not in seen_images:
                seen_images.add(image["src"])
                images.append(image)
                blocks.append({"type": "img", **image})
            continue

        if tag.name in ("ul", "ol"):
            items = [inline_html(li) for li in tag.find_all("li", recursive=False)]
            items = [i for i in items if i]
            if items:
                blocks.append({"type": tag.name, "items": items})
            continue

        if not tag.get_text(strip=True):
            continue

        # Some legacy posts hold an entire article in one <p> split only by <br>,
        # so break those into real paragraphs rather than emit one giant block.
        if tag.name == "p":
            segments = [segment for segment in inline_segments(tag) if segment]
        else:
            segments = [inline_html(tag)]

        for segment in segments:
            # Replace tags with a space, not nothing, so "…therapy</strong>is"
            # does not collapse into a glued "therapyis".
            text = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", segment)).strip()
            if not text:
                continue
            marker = f"{tag.name}:{text.lower()}"
            if marker in seen_text:
                continue
            seen_text.add(marker)
            block = {"type": tag.name, "html": segment, "text": text}
            anchor = anchor_for(tag, claimed_anchors)
            if anchor:
                block["anchorId"] = anchor
            blocks.append(block)

    return blocks, images


def extract_meta(soup: BeautifulSoup) -> dict:
    meta: dict = {"openGraph": {}, "twitter": {}, "other": {}}
    title = soup.find("title")
    meta["title"] = title.get_text(strip=True) if title else None

    # The caching layer injects a second copy of some meta tags further down the
    # head, and on two pages that copy holds different text. Browsers and crawlers
    # honour the first occurrence, so the first one wins here too.
    for tag in soup.find_all("meta"):
        name = tag.get("name")
        prop = tag.get("property")
        content = tag.get("content")
        if content is None:
            continue
        if name == "description":
            meta.setdefault("description", content)
        elif name == "robots":
            meta.setdefault("robots", content)
        elif prop and prop.startswith("og:"):
            meta["openGraph"].setdefault(prop[3:], content)
        elif name and name.startswith("twitter:"):
            meta["twitter"].setdefault(name[8:], content)
        elif prop and prop.startswith("article:"):
            meta["other"].setdefault(prop, content)

    canonical = soup.find("link", rel="canonical")
    meta["canonical"] = canonical.get("href") if canonical else None
    return meta


def extract_jsonld(soup: BeautifulSoup) -> list:
    """Capture JSON-LD verbatim so the rebuild can reproduce the live graph exactly."""
    graphs = []
    for script in soup.find_all("script", type="application/ld+json"):
        raw = script.string or script.get_text()
        if not raw or not raw.strip():
            continue
        try:
            graphs.append(json.loads(raw))
        except json.JSONDecodeError:
            print(f"    ! unparseable JSON-LD block skipped", file=sys.stderr)
    return graphs


def find_dates(graphs: list) -> dict:
    dates: dict = {}

    def visit(node):
        if isinstance(node, dict):
            for key in ("datePublished", "dateModified"):
                if key in node and key not in dates and isinstance(node[key], str):
                    dates[key] = node[key]
            for value in node.values():
                visit(value)
        elif isinstance(node, list):
            for item in node:
                visit(item)

    visit(graphs)
    return dates


def scrape(route: dict) -> dict:
    kind = classify(route)
    soup = BeautifulSoup(fetch(route["url"]), "html.parser")

    # Read the head before stripping <script>, since JSON-LD lives in a script tag.
    meta = extract_meta(soup)
    graphs = extract_jsonld(soup)

    # <noscript> holds duplicate non-lazy copies of every image; drop before walking.
    for tag in soup.find_all(["script", "style", "noscript", "svg"]):
        tag.decompose()

    heading = soup.select_one('[data-elementor-type="single-post"] h1') or soup.find("h1")

    root = content_root(soup, kind)
    if root is None:
        raise RuntimeError(f"no content root for {route['url']}")

    # Related-post cards at the foot of an article are navigation, not body copy.
    for card in root.select("article.elementor-post"):
        card.decompose()
    blocks, images = extract_blocks(root)
    if blocks and blocks[0]["type"] == "h1":
        blocks = blocks[1:]

    links = []
    seen_links = set()
    for anchor in root.find_all("a", href=True):
        href = rewrite_href(anchor["href"])
        text = anchor.get_text(" ", strip=True)
        if href and href.startswith("/") and (href, text) not in seen_links:
            seen_links.add((href, text))
            links.append({"href": href, "text": text})

    return {
        **route,
        "type": kind,
        "meta": meta,
        "jsonLd": graphs,
        "h1": heading.get_text(" ", strip=True) if heading else None,
        "dates": find_dates(graphs),
        "blocks": blocks,
        "images": images,
        "internalLinks": links,
    }


def main() -> None:
    routes = discover_routes()
    print(f"discovered {len(routes)} legacy URLs")

    records = []
    for index, route in enumerate(routes, 1):
        print(f"[{index}/{len(routes)}] {route['path']}")
        try:
            records.append(scrape(route))
        except Exception as error:  # keep going; report gaps at the end
            print(f"    ! {error}", file=sys.stderr)

    OUT_DIR.mkdir(exist_ok=True)
    (OUT_DIR / "routes.json").write_text(
        json.dumps(records, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )

    sources = sorted({image["src"] for record in records for image in record["images"]})
    (OUT_DIR / "images.json").write_text(
        json.dumps(sources, indent=2) + "\n", encoding="utf-8"
    )

    by_type: dict[str, int] = {}
    for record in records:
        by_type[record["type"]] = by_type.get(record["type"], 0) + 1
    print(f"\nwrote {len(records)} routes -> content/routes.json")
    print(f"types: {by_type}")
    print(f"unique images: {len(sources)} -> content/images.json")

    missing_title = [r["path"] for r in records if not r["meta"].get("title")]
    missing_h1 = [r["path"] for r in records if not r["h1"]]
    if missing_title:
        print(f"WARNING no title: {missing_title}")
    if missing_h1:
        print(f"WARNING no h1: {missing_h1}")


if __name__ == "__main__":
    main()
