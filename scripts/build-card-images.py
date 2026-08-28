"""Derive homepage card artwork from the Figma photo exports in /images.

The exports already sit close to the target aspect ratios, so this mostly
normalises them to two sizes and converts to WebP -- the PNG originals are
~2MB each, which is far too heavy to ship. Portrait crops feed the service
accordion; landscape crops feed the three "why choose us" cards.

Run after adding or replacing an export:  python3 scripts/build-card-images.py
"""

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public/images/cards"

PORTRAIT = (900, 1240)
LANDSCAPE = (1200, 780)

# output name, source (relative to repo root), output size, focal point
CARDS = [
    ("auto-injury", "images/auto-injury0relief.png", PORTRAIT, (0.5, 0.5)),
    ("knee-pain", "images/knee-pain-care-2.png", PORTRAIT, (0.5, 0.5)),
    ("neuropathy", "images/neuropathy-care.png", PORTRAIT, (0.5, 0.5)),
    ("spinal-decompression", "images/spinal-decompression.png", PORTRAIT, (0.5, 0.5)),
    ("comprehensive-care", "images/comprehensive-pain-relief.png", LANDSCAPE, (0.5, 0.5)),
    ("non-surgical", "images/non-surgical-solutions.png", LANDSCAPE, (0.5, 0.5)),
    ("care-team", "images/experienced-and-compassionate-team.png", LANDSCAPE, (0.5, 0.5)),
]

# Full-bleed section backgrounds keep their native aspect ratio -- the section
# box is sized from it -- so these are re-encoded rather than cropped.
BANNERS = [
    ("restore-banner", "images/restore-revive-reclaim-your-health-banner-bg.png", 2132),
]


def cover(im: Image.Image, size: tuple[int, int], focus: tuple[float, float]) -> Image.Image:
    """Scale to fill `size`, then crop around the focal point."""
    target_w, target_h = size
    scale = max(target_w / im.width, target_h / im.height)
    im = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)
    left = min(max(round(im.width * focus[0] - target_w / 2), 0), im.width - target_w)
    top = min(max(round(im.height * focus[1] - target_h / 2), 0), im.height - target_h)
    return im.crop((left, top, left + target_w, top + target_h))


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for name, rel, size, focus in CARDS:
        src = ROOT / rel
        im = Image.open(src).convert("RGB")
        dest = OUT / f"{name}.webp"
        cover(im, size, focus).save(dest, quality=86, method=6)
        print(
            f"{name:22} {im.width}x{im.height} -> {size[0]}x{size[1]}"
            f"  {src.stat().st_size // 1024}KB -> {dest.stat().st_size // 1024}KB"
        )

    banner_out = ROOT / "public/images"
    for name, rel, width in BANNERS:
        src = ROOT / rel
        im = Image.open(src).convert("RGB")
        if im.width > width:
            im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
        dest = banner_out / f"{name}.webp"
        im.save(dest, quality=88, method=6)
        print(
            f"{name:22} {im.width}x{im.height}"
            f"  {src.stat().st_size // 1024}KB -> {dest.stat().st_size // 1024}KB"
        )


if __name__ == "__main__":
    main()
