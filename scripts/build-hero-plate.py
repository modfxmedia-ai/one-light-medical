"""Composite the homepage hero plate.

The Figma frame places the anatomy artwork inset from the frame edges (85% of
frame width, 5.3% from the left, 15.8% from the top) rather than full-bleed.
Because the artwork carries its own blue glow, dropping it straight onto the
flat navy leaves a visible rectangle. This bakes it onto a surround built from
the same artwork, blown up concentrically and blurred, so the glow continues
past the plate edge and the seam disappears.
"""

from pathlib import Path

from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "public/images/homepage-banner-bg-image.png"
OUTPUT = ROOT / "public/images/homepage-hero.webp"

# Figma frame is 1440x765; render at 2x for high-DPI screens.
CANVAS_W, CANVAS_H = 2880, 1530
ART_WIDTH_PCT = 0.85
ART_LEFT_PCT = 0.053
ART_TOP_PCT = 0.158
BLUR = 120
FEATHER = 150


def extend_edges(canvas: Image.Image, box: tuple[int, int, int, int]) -> Image.Image:
    """Stretch the plate's border pixels out to the canvas edges.

    Replicating each edge (rather than zooming the whole artwork) keeps the
    left side bright and the right side dark, which is what the frame does.
    """
    x0, y0, x1, y1 = box
    w, h = canvas.size
    if x0 > 0:
        canvas.paste(canvas.crop((x0, y0, x0 + 1, y1)).resize((x0, y1 - y0)), (0, y0))
    if x1 < w:
        canvas.paste(canvas.crop((x1 - 1, y0, x1, y1)).resize((w - x1, y1 - y0)), (x1, y0))
    if y0 > 0:
        canvas.paste(canvas.crop((0, y0, w, y0 + 1)).resize((w, y0)), (0, 0))
    if y1 < h:
        canvas.paste(canvas.crop((0, y1 - 1, w, y1)).resize((w, h - y1)), (0, y1))
    return canvas


def main() -> None:
    src = Image.open(SOURCE).convert("RGB")
    aspect = src.height / src.width

    art_w = round(CANVAS_W * ART_WIDTH_PCT)
    art_h = round(art_w * aspect)
    art_x = round(CANVAS_W * ART_LEFT_PCT)
    art_y = round(CANVAS_H * ART_TOP_PCT)
    art = src.resize((art_w, art_h), Image.LANCZOS)

    field = Image.new("RGB", (CANVAS_W, CANVAS_H), "#031225")
    field.paste(art, (art_x, art_y))
    field = extend_edges(
        field,
        (max(art_x, 0), max(art_y, 0), min(art_x + art_w, CANVAS_W), min(art_y + art_h, CANVAS_H)),
    )
    canvas = field.filter(ImageFilter.GaussianBlur(BLUR))

    mask = Image.new("L", (art_w, art_h), 0)
    mask.paste(255, (FEATHER, FEATHER, art_w - FEATHER, art_h - FEATHER))
    mask = mask.filter(ImageFilter.GaussianBlur(FEATHER / 2))

    canvas.paste(art, (art_x, art_y), mask)
    canvas.save(OUTPUT, quality=90, method=6)
    print(f"wrote {OUTPUT.relative_to(ROOT)} at {canvas.size}")


if __name__ == "__main__":
    main()
