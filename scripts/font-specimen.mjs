/**
 * Renders the design's real headline and body copy in several families so a
 * substitution can be judged by eye as well as by metrics.
 *
 * Metrics rank likeness of size and proportion but say nothing about
 * letterforms, and letterforms are what make a face recognisable: Avenir Next
 * pairs a double-storey `a` with a single-storey `g`, which several
 * metrically-close candidates get wrong.
 *
 * Usage: node scripts/font-specimen.mjs [out.png] [Family ...]
 */

import { launch } from "./cdp.mjs";
import { writeFileSync } from "node:fs";

const [out = "/tmp/font-specimen.png", ...rest] = process.argv.slice(2);
const FAMILIES = rest.length
  ? rest
  : ["Avenir Next", "Jost", "Nunito Sans", "Hanken Grotesk", "Figtree", "Mulish"];

// Sizes are the Figma values scaled from the 1728px frame to a 1440 viewport.
const H1 = 64 / 1.2;
const BODY = 20 / 1.2;

const html = `<!doctype html><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?${FAMILIES.filter(
  (f) => f !== "Avenir Next",
)
  .map((f) => `family=${f.replace(/ /g, "+")}:wght@400;500;700`)
  .join("&")}&display=block">
<style>
  body { margin: 0; background: #061024; color: #fff; padding: 28px 36px; }
  section { padding: 18px 0 22px; border-bottom: 1px solid #ffffff22; }
  h2 { margin: 0 0 10px; font: 600 12px/1 ui-monospace, monospace;
       letter-spacing: .14em; text-transform: uppercase; color: #39dbff; }
  p.h1 { margin: 0 0 6px; font-size: ${H1}px; line-height: ${73 / 1.2}px; font-weight: 400; }
  p.body { margin: 0; font-size: ${BODY}px; line-height: ${27 / 1.2}px; font-weight: 400;
           color: #ffffffcc; max-width: 34em; }
  p.glyphs { margin: 8px 0 0; font-size: 34px; letter-spacing: .06em; color: #a9edfb; }
</style>
${FAMILIES.map(
  (f) => `<section style='font-family: "${f}", sans-serif'>
  <h2>${f}</h2>
  <p class="h1">Find Lasting<br>Stem Cell Therapy for Joint Pain</p>
  <p class="body">At One Light Medical, we provide advanced, non-surgical stem cell
  therapies to target root-cause joint pain, restore mobility.</p>
  <p class="glyphs">a g e R 1 2 3 &amp; %</p>
</section>`,
).join("\n")}`;

const browser = await launch();
await browser.send("Page.enable");
await browser.send("Runtime.enable");
await browser.send("Emulation.setDeviceMetricsOverride", {
  width: 900,
  height: 800,
  deviceScaleFactor: 2,
  mobile: false,
});
await browser.send("Page.navigate", {
  url: `data:text/html;charset=utf-8,${encodeURIComponent(html)}`,
});
await new Promise((r) => setTimeout(r, 3000));

const { result } = await browser.send("Runtime.evaluate", {
  returnByValue: true,
  expression: `document.documentElement.scrollHeight`,
});
await browser.send("Emulation.setDeviceMetricsOverride", {
  width: 900,
  height: Math.ceil(result.value),
  deviceScaleFactor: 2,
  mobile: false,
});
await new Promise((r) => setTimeout(r, 500));

const shot = await browser.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true });
writeFileSync(out, Buffer.from(shot.data, "base64"));
console.log(`${out}  (${FAMILIES.join(", ")})`);

await browser.close();
process.exit(0);
