"""Puts the Figma frame render and the built page side by side, band by band.

The frame is drawn at 1728px and the site is screenshotted at 1440px, so the
Figma render is scaled by 1440/1728 first; after that the two should agree on
both position and size, and any drift is a real difference rather than a
difference of units.

Usage:
  python3 scripts/compare-figma.py <figma.png> <build.png> [outdir] [bands]

`bands` is the number of horizontal slices to emit (default 10).
"""

import sys
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw

FIGMA_WIDTH = 1728
BUILD_WIDTH = 1440


def main() -> None:
    figma_path = sys.argv[1] if len(sys.argv) > 1 else "/tmp/figma-140_30.png"
    build_path = sys.argv[2] if len(sys.argv) > 2 else "/tmp/new-home.png"
    outdir = Path(sys.argv[3] if len(sys.argv) > 3 else "/tmp/cmp")
    bands = int(sys.argv[4]) if len(sys.argv) > 4 else 10

    outdir.mkdir(parents=True, exist_ok=True)

    figma = Image.open(figma_path).convert("RGB")
    build = Image.open(build_path).convert("RGB")

    scale = BUILD_WIDTH / FIGMA_WIDTH
    figma = figma.resize(
        (BUILD_WIDTH, round(figma.height * scale)), Image.LANCZOS
    )

    print(f"figma {figma.size}   build {build.size}   delta {build.height - figma.height}px")

    height = min(figma.height, build.height)
    step = height // bands

    for i in range(bands):
        top = i * step
        bottom = min(top + step, height)
        f = figma.crop((0, top, BUILD_WIDTH, bottom))
        b = build.crop((0, top, BUILD_WIDTH, bottom))

        gap = 16
        label = 26
        sheet = Image.new("RGB", (BUILD_WIDTH * 2 + gap, f.height + label), (16, 16, 20))
        sheet.paste(f, (0, label))
        sheet.paste(b, (BUILD_WIDTH + gap, label))
        dr = ImageDraw.Draw(sheet)
        dr.text((6, 8), f"FIGMA  y {top}-{bottom}", fill=(120, 230, 255))
        dr.text((BUILD_WIDTH + gap + 6, 8), f"BUILD  y {top}-{bottom}", fill=(255, 200, 120))

        # Halve it so a full band fits in one readable image.
        sheet = sheet.resize((sheet.width // 2, sheet.height // 2), Image.LANCZOS)
        sheet.save(outdir / f"band-{i:02d}.png")

    # A single whole-page difference map, to spot drift the bands hide.
    common = (BUILD_WIDTH, height)
    diff = ImageChops.difference(figma.crop((0, 0, *common)), build.crop((0, 0, *common)))
    diff = diff.convert("L").point(lambda v: min(255, v * 3))
    scale_h = 900
    diff.resize((round(BUILD_WIDTH * scale_h / height), scale_h), Image.LANCZOS).save(
        outdir / "diff-map.png"
    )

    print(f"wrote {bands} bands + diff-map.png to {outdir}")


if __name__ == "__main__":
    main()
