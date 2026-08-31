"""Turns the raw Figma layer exports into right-sized WebP for the homepage.

The exports come out at 2x the 1728px Figma frame. The site lays out against a
1440px reference, so the useful retina width is figma_width / 1.2 * 2, which is
appreciably smaller than what Figma hands back -- one export is 6 MB. This also
gives the files names that say what they are, since the Figma layers are all
called "Rectangle 12" and similar.

Usage: python3 scripts/prep-figma-assets.py
"""

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "public" / "images" / "figma"
OUT = ROOT / "public" / "images" / "home"

FRAME_TO_LAYOUT = 1.2  # 1728px Figma frame -> 1440px layout reference
RETINA = 2

# source file stem -> (output name, width in the Figma frame, quality)
ASSETS = [
    ("image-8-140_217", "hero-stem-cell", 1020, 82),
    ("image-3-140_69", "services-backdrop", 1744, 78),
    ("rectangle-6-I140_183_39_321", "card-stem-cell-therapy", 398, 82),
    ("rectangle-7-I140_183_39_322", "card-red-light-therapy", 398, 82),
    ("rectangle-9-I140_183_39_324", "card-spinal-decompression", 398, 82),
    ("rectangle-8-I140_183_39_323", "card-softwave-therapy", 398, 82),
    ("rectangle-10-140_77", "why-comprehensive-pain-relief", 485, 82),
    ("rectangle-11-140_79", "why-non-surgical-solutions", 485, 82),
    ("rectangle-12-140_81", "why-experienced-team", 485, 82),
    ("rectangle-22-146_219", "iv-therapy-backdrop", 1728, 76),
    ("image-4-140_100", "restore-left", 1100, 80),
    ("image-5-140_99", "restore-right", 1027, 80),
    ("rectangle-15-140_34", "closer-backdrop", 1728, 76),
    ("image-2-140_37", "logo-header", 158, 90),
    ("image-6-140_155", "logo-footer", 232, 90),
]


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    total_in = total_out = 0

    for stem, name, figma_w, quality in ASSETS:
        src = SRC / f"{stem}.png"
        if not src.exists():
            print(f"  ! missing {src.name}")
            continue

        im = Image.open(src)
        target_w = round(figma_w / FRAME_TO_LAYOUT * RETINA)
        if im.width > target_w:
            target_h = round(im.height * target_w / im.width)
            im = im.resize((target_w, target_h), Image.LANCZOS)

        # Keep alpha where a layer relies on it (logos, cut-out artwork).
        if im.mode not in ("RGB", "RGBA"):
            im = im.convert("RGBA")

        dest = OUT / f"{name}.webp"
        im.save(dest, "WEBP", quality=quality, method=6)

        size_in = src.stat().st_size
        size_out = dest.stat().st_size
        total_in += size_in
        total_out += size_out
        print(
            f"  {name:30} {im.width:5}x{im.height:<5} "
            f"{size_in / 1024:7.0f} KB -> {size_out / 1024:6.0f} KB"
        )

    print(f"\n  total {total_in / 1024 / 1024:.1f} MB -> {total_out / 1024 / 1024:.1f} MB")


if __name__ == "__main__":
    main()
