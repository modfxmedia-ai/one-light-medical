/**
 * Full-page screenshot helper for design review.
 *
 * Chrome's `--screenshot` flag only captures one window's worth of pixels and
 * clamps windows to 500px wide, so it can't show anything below the fold. That
 * matters here because the hero is sized in `svh` -- growing the window just
 * grows the hero. Driving Chrome over the DevTools Protocol instead keeps the
 * viewport realistic while the capture extends the full page height.
 *
 * Usage: node scripts/shot.mjs <url> <out.png> [width] [height] [scale] [openSelector]
 *        node scripts/shot.mjs <url> <out.png> [width] ... --reduce-motion --settle=9000
 *
 * openSelector opens matching <details> elements before capturing, for
 * reviewing the mobile menu or an expanded accordion.
 *
 * --settle waits longer before capturing. The default is tuned for this site's
 * own assets; the contact form is a third-party embed that fetches, renders and
 * only then reports its height, so capturing it early catches the box mid-resize
 * and the page below it in the wrong place.
 *
 * Known artefact: on /contact/ the captured image shows the form's white surface
 * running past the bottom of its card and hiding the footer. The page is fine --
 * the DOM measures the same before and after a capture, and fold-sized captures
 * with captureBeyondViewport off render it correctly. A cross-origin iframe is
 * composited separately, and capturing beyond the viewport paints that surface
 * at its own full height rather than clipped to the box. Review that page by
 * scrolling and capturing folds, not with one full-page shot.
 *
 * --reduce-motion emulates the reduced-motion preference, which unpins the
 * testimonial deck. That is the only way to capture the page at the height the
 * Figma frame draws: pinned, the deck adds its scroll distance to the page and
 * the two are no longer comparable band for band.
 */

import { writeFileSync } from "node:fs";

import { launch } from "./cdp.mjs";

const argv = process.argv.slice(2);
const reduceMotion = argv.includes("--reduce-motion");
const settleArg = argv.find((a) => a.startsWith("--settle="));
const [url, out, width = "1440", height = "765", scale = "1", open] = argv.filter(
  (a) => a !== "--reduce-motion" && a !== settleArg,
);

if (!url || !out) {
  console.error("usage: node scripts/shot.mjs <url> <out.png> [width] [height] [scale]");
  process.exit(1);
}

const browser = await launch();
if (reduceMotion) {
  await browser.send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "reduce" }],
  });
}
await browser.open(url, {
  width: Number(width),
  height: Number(height),
  scale: Number(scale),
  ...(settleArg ? { settle: Number(settleArg.slice(9)) } : {}),
});

if (open) {
  await browser.send("Runtime.evaluate", {
    expression: `document.querySelectorAll(${JSON.stringify(open)}).forEach((d) => (d.open = true))`,
  });
  await new Promise((r) => setTimeout(r, 600));
}

const { data } = await browser.send("Page.captureScreenshot", {
  format: "png",
  captureBeyondViewport: true,
  fromSurface: true,
});
writeFileSync(out, Buffer.from(data, "base64"));
console.log(`wrote ${out} at viewport ${width}x${height}@${scale}x`);

await browser.close();
process.exit(0);
