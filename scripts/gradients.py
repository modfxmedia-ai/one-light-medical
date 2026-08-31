"""Prints Figma gradient geometry from a `figma.mjs raw` dump on stdin.

Figma describes a gradient with three normalised handles rather than a CSS
angle: handle 0 is the origin, handle 1 the end of the primary axis and handle 2
the end of the secondary axis. For a radial fill that makes handle 0 the centre
and the distance to handles 1 and 2 the two radii, which is what CSS needs as
`radial-gradient(<rx> <ry> at <x>% <y>%, ...)`.

Usage: node scripts/figma.mjs raw <node> <depth> | python3 scripts/gradients.py
"""

import json
import math
import sys


def hexof(c):
    return "#%02x%02x%02x" % (
        round(c["r"] * 255),
        round(c["g"] * 255),
        round(c["b"] * 255),
    )


def main():
    data = json.load(sys.stdin)
    seen = set()

    def walk(node):
        box = node.get("absoluteBoundingBox") or {}
        w = box.get("width") or 0
        h = box.get("height") or 0

        for fill in node.get("fills") or []:
            if not fill.get("type", "").startswith("GRADIENT"):
                continue
            if fill.get("visible") is False:
                continue

            stops = tuple(
                (round(s["position"], 3), hexof(s["color"]), round(s["color"]["a"], 2))
                for s in fill["gradientStops"]
            )
            key = (fill["type"], stops)
            if key in seen:
                continue
            seen.add(key)

            handles = fill["gradientHandlePositions"]
            print(f"{node['name']}  [{node['id']}]  {fill['type']}  box {round(w)}x{round(h)}")

            origin, primary, secondary = handles[0], handles[1], handles[2]
            print(
                f"   centre {origin['x'] * 100:.1f}% {origin['y'] * 100:.1f}%"
                f"   (px {origin['x'] * w:.0f},{origin['y'] * h:.0f})"
            )

            # Radii in pixels, so the CSS ellipse can be written in real units.
            for label, pt in (("primary", primary), ("secondary", secondary)):
                dx = (pt["x"] - origin["x"]) * w
                dy = (pt["y"] - origin["y"]) * h
                print(
                    f"   {label} radius {math.hypot(dx, dy):.0f}px"
                    f"  (dx {dx:.0f}, dy {dy:.0f})"
                )

            if fill["type"] == "GRADIENT_LINEAR":
                dx = primary["x"] - origin["x"]
                dy = primary["y"] - origin["y"]
                angle = (math.degrees(math.atan2(dx, -dy)) + 360) % 360
                print(f"   css angle {angle:.0f}deg")

            for pos, hx, alpha in stops:
                print(f"   stop {pos:.3f}  {hx}  a={alpha}")
            print()

        for child in node.get("children") or []:
            walk(child)

    for key in data["nodes"]:
        walk(data["nodes"][key]["document"])


if __name__ == "__main__":
    main()
