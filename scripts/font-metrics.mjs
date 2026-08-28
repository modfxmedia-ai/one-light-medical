/**
 * Compares the rendered metrics of two font families at the same font-size.
 *
 * Swapping a typeface changes how big the text *looks* even when the CSS size is
 * untouched, because what the eye reads is the x-height, not the em box. This
 * prints the ratios needed to keep the optical size constant across a swap.
 *
 * Usage: node scripts/font-metrics.mjs <url> "Font A" "Font B"
 */

import { launch } from "./cdp.mjs";

const [url, a = "Josefin Sans", b = "Montserrat"] = process.argv.slice(2);

const browser = await launch();
await browser.open(url, { settle: 2500 });

const { result } = await browser.send("Runtime.evaluate", {
  returnByValue: true,
  awaitPromise: true,
  expression: `(async () => {
    await document.fonts.ready;
    await document.fonts.load('400 100px "${a}"');
    await document.fonts.load('400 100px "${b}"');

    const ctx = document.createElement("canvas").getContext("2d");
    const read = (family) => {
      ctx.font = '400 100px "' + family + '", sans-serif';
      const x = ctx.measureText("x");
      const caps = ctx.measureText("H");
      const line = ctx.measureText("Find Lasting Relief for Joints");
      return {
        family,
        xHeight: x.actualBoundingBoxAscent,
        capHeight: caps.actualBoundingBoxAscent,
        advance: line.width,
      };
    };
    return { a: read("${a}"), b: read("${b}") };
  })()`,
});

const { a: fa, b: fb } = result.value;
const row = (f) =>
  `${f.family.padEnd(16)} x-height ${f.xHeight.toFixed(1)}  cap ${f.capHeight.toFixed(
    1,
  )}  advance ${f.advance.toFixed(1)}`;

console.log(row(fa));
console.log(row(fb));
console.log("");
console.log(`to match x-height:  size x ${(fb.xHeight / fa.xHeight).toFixed(4)}`);
console.log(`to match cap:       size x ${(fb.capHeight / fa.capHeight).toFixed(4)}`);
console.log(`to match set width: size x ${(fb.advance / fa.advance).toFixed(4)}`);

await browser.close();
process.exit(0);
