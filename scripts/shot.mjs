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
 *
 * openSelector opens matching <details> elements before capturing, for
 * reviewing the mobile menu or an expanded accordion.
 */

import { writeFileSync } from "node:fs";

import { launch } from "./cdp.mjs";

const [url, out, width = "1440", height = "765", scale = "1", open] = process.argv.slice(2);

if (!url || !out) {
  console.error("usage: node scripts/shot.mjs <url> <out.png> [width] [height] [scale]");
  process.exit(1);
}

const browser = await launch();
await browser.open(url, {
  width: Number(width),
  height: Number(height),
  scale: Number(scale),
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
