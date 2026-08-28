#!/usr/bin/env python3
"""Compare the prerendered build output against the legacy site snapshot.

Reads .next/server/app/*.html and asserts that title, description, canonical,
robots, Open Graph tags, H1 and the JSON-LD graph match what the live site
served for the same URL, and that every referenced image exists in public/.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parent.parent
BUILD = ROOT / ".next" / "server" / "app"
PUBLIC = ROOT / "public"

# og:updated_time cannot be expressed through the Metadata API. The og:image
# sub-attributes are deliberately not reproduced: the agreed Open Graph surface is
# url/title/description/image/type/site_name/locale, and these extras are Facebook
# rendering hints with no bearing on search.
IGNORED_OG = {
    "updated_time",
    "image:secure_url",
    "image:width",
    "image:height",
    "image:type",
    "image:alt",
}


# The sitewide MedicalOrganization block, by the set of types it contains.
MEDICAL_ORG_TYPES = {"MedicalOrganization", "PostalAddress", "OfferCatalog", "Offer", "Service"}


def fingerprint(node):
    """Normalize a JSON-LD block for comparison.

    The clinic email is added to the rebuilt MedicalOrganization node, so it is
    dropped on both sides rather than reported as a difference.
    """
    if isinstance(node, dict):
        return {k: fingerprint(v) for k, v in node.items() if k != "email"}
    if isinstance(node, list):
        return [fingerprint(item) for item in node]
    return node


def collect_types(node) -> set[str]:
    """Every @type appearing anywhere inside a JSON-LD block."""
    found: set[str] = set()
    if isinstance(node, dict):
        value = node.get("@type")
        if isinstance(value, str):
            found.add(value)
        elif isinstance(value, list):
            found.update(v for v in value if isinstance(v, str))
        for child in node.values():
            found |= collect_types(child)
    elif isinstance(node, list):
        for child in node:
            found |= collect_types(child)
    return found


def build_file(path: str) -> Path:
    return BUILD / ("index.html" if path == "/" else f"{path.strip('/')}.html")


def head_of(html: str) -> dict:
    soup = BeautifulSoup(html, "html.parser")
    title = soup.find("title")
    canonical = soup.find("link", rel="canonical")

    og: dict[str, str] = {}
    description = robots = None
    for tag in soup.find_all("meta"):
        content = tag.get("content")
        if content is None:
            continue
        if tag.get("name") == "description":
            description = content
        elif tag.get("name") == "robots":
            robots = content
        elif (tag.get("property") or "").startswith("og:"):
            og[tag["property"][3:]] = content

    graphs = []
    for script in soup.find_all("script", type="application/ld+json"):
        raw = script.string or script.get_text()
        if raw and raw.strip():
            graphs.append(json.loads(raw))

    h1 = soup.find("h1")
    return {
        "title": title.get_text(strip=True) if title else None,
        "description": description,
        "robots": robots,
        "canonical": canonical.get("href") if canonical else None,
        "og": og,
        "jsonLd": graphs,
        "h1": h1.get_text(" ", strip=True) if h1 else None,
        "images": [
            img.get("src") for img in soup.find_all("img") if (img.get("src") or "").startswith("/")
        ],
    }


def main() -> int:
    routes = json.loads((ROOT / "content" / "routes.json").read_text(encoding="utf-8"))
    built = {r["path"]: r for r in routes if build_file(r["path"]).exists()}

    print(f"{len(built)} of {len(routes)} legacy routes are built; verifying those\n")

    failures: list[str] = []
    for path, route in sorted(built.items()):
        actual = head_of(build_file(path).read_text(encoding="utf-8"))
        expected = route["meta"]
        problems: list[str] = []

        if actual["title"] != expected.get("title"):
            problems.append(f"title\n      live:  {expected.get('title')!r}\n      built: {actual['title']!r}")
        if actual["description"] != expected.get("description"):
            problems.append(
                f"description\n      live:  {str(expected.get('description'))[:70]!r}"
                f"\n      built: {str(actual['description'])[:70]!r}"
            )
        if actual["canonical"] != expected.get("canonical"):
            problems.append(f"canonical live={expected.get('canonical')} built={actual['canonical']}")
        if actual["robots"] != expected.get("robots"):
            problems.append(f"robots\n      live:  {expected.get('robots')}\n      built: {actual['robots']}")

        for key, value in (expected.get("openGraph") or {}).items():
            if key in IGNORED_OG:
                continue
            if actual["og"].get(key) != value:
                problems.append(f"og:{key} live={value!r} built={actual['og'].get(key)!r}")

        if route["h1"] and actual["h1"] != route["h1"]:
            problems.append(f"h1 live={route['h1']!r} built={actual['h1']!r}")

        # Every live JSON-LD block must still be present. The rebuild additionally
        # emits the MedicalOrganization block sitewide, which the legacy site served
        # on the home page only, and adds the clinic email to it.
        built_keys = [json.dumps(fingerprint(b), sort_keys=True) for b in actual["jsonLd"]]
        live_keys = [json.dumps(fingerprint(b), sort_keys=True) for b in route["jsonLd"]]

        for block, key in zip(route["jsonLd"], live_keys):
            if key not in built_keys:
                problems.append(f"json-ld block missing from build: {sorted(collect_types(block))}")

        for block, key in zip(actual["jsonLd"], built_keys):
            if key in live_keys:
                continue
            if collect_types(block) != MEDICAL_ORG_TYPES:
                problems.append(f"unexpected extra json-ld block: {sorted(collect_types(block))}")

        for src in actual["images"]:
            if not (PUBLIC / src.lstrip("/")).exists():
                problems.append(f"missing asset {src}")

        status = "OK  " if not problems else "FAIL"
        print(f"  {status} {path}")
        for problem in problems:
            print(f"       - {problem}")
        if problems:
            failures.append(path)

    print()
    if failures:
        print(f"{len(failures)} route(s) with mismatches: {failures}")
        return 1
    print(f"all {len(built)} built routes match the legacy snapshot")
    return 0


if __name__ == "__main__":
    sys.exit(main())
