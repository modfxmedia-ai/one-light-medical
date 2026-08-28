#!/usr/bin/env python3
"""Download every legacy image into public/ at its original /wp-content/ path.

Keeping the original path means each asset is self-hosted by the new site while
its public URL stays byte-identical to the live site, so image search results and
any external hotlinks keep resolving after the cutover.
"""

from __future__ import annotations

import json
import re
import time
import urllib.error
import urllib.request
from pathlib import Path

ORIGIN = "https://onelightmedical.com"
UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"


def collect_sources() -> list[str]:
    """Gather /wp-content/ paths from content blocks, OG tags and JSON-LD alike."""
    routes = json.loads((ROOT / "content" / "routes.json").read_text(encoding="utf-8"))
    found: set[str] = set()

    def visit(node) -> None:
        if isinstance(node, str):
            for match in re.findall(r"(?:https?://[^\"'\s]*?)?(/wp-content/[^\"'\s)]+)", node):
                if re.search(r"\.(png|jpe?g|webp|gif|svg|avif)$", match, re.I):
                    found.add(match)
        elif isinstance(node, dict):
            for value in node.values():
                visit(value)
        elif isinstance(node, list):
            for item in node:
                visit(item)

    visit(routes)
    return sorted(found)


def download(path: str) -> str:
    target = PUBLIC / path.lstrip("/")
    if target.exists() and target.stat().st_size > 0:
        return "cached"

    target.parent.mkdir(parents=True, exist_ok=True)
    request = urllib.request.Request(ORIGIN + path, headers={"User-Agent": UA})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(request, timeout=60) as response:
                data = response.read()
            if not data:
                raise RuntimeError("empty response")
            target.write_bytes(data)
            return f"{len(data) // 1024} KB"
        except (urllib.error.URLError, TimeoutError, OSError, RuntimeError) as error:
            if attempt == 2:
                return f"FAILED ({error})"
            time.sleep(2 * (attempt + 1))
    return "FAILED"


def main() -> None:
    sources = collect_sources()
    print(f"{len(sources)} unique image paths referenced\n")

    failures = []
    for index, path in enumerate(sources, 1):
        result = download(path)
        print(f"[{index}/{len(sources)}] {path} -> {result}")
        if result.startswith("FAILED"):
            failures.append(path)

    print(f"\ndownloaded into public/, {len(failures)} failure(s)")
    for path in failures:
        print(f"  FAILED {path}")


if __name__ == "__main__":
    main()
