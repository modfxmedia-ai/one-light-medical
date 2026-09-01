/**
 * Print laid-out geometry and type metrics for CSS selectors.
 *
 * Reading getBoundingClientRect beats measuring pixels in a screenshot: the
 * aurora backgrounds on this page defeat edge detection, and computed font
 * sizes are what actually need to match the Figma frame.
 *
 * Usage: node scripts/measure.mjs <url> [--w=1728] <selector> [selector...]
 */

import { launch } from "./cdp.mjs";

const args = process.argv.slice(2);
const widthArg = args.find((a) => a.startsWith("--w="));
const width = widthArg ? Number(widthArg.slice(4)) : 1440;
const [url, ...selectors] = args.filter((a) => a !== widthArg);
if (!url || !selectors.length) {
  console.error("usage: node scripts/measure.mjs <url> [--w=1728] <selector> [selector...]");
  process.exit(1);
}

const browser = await launch();
await browser.open(url, { width });

const { result } = await browser.send("Runtime.evaluate", {
  expression: `JSON.stringify(${JSON.stringify(selectors)}.map((sel) => ({
    sel,
    nodes: [...document.querySelectorAll(sel)].slice(0, 6).map((el) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      // Line box widths, not the element box: a heading with a <br> fills its
      // container, so only the rendered runs can be compared to the design.
      const range = document.createRange();
      range.selectNodeContents(el);
      const lines = [...range.getClientRects()]
        .filter((b) => b.width > 1 && b.height > 1)
        .map((b) => Math.round(b.width));
      return {
        x: Math.round(r.x), y: Math.round(r.y + window.scrollY),
        w: Math.round(r.width), h: Math.round(r.height),
        font: cs.fontSize, weight: cs.fontWeight, lh: cs.lineHeight,
        family: cs.fontFamily.split(",")[0].replace(/["']/g, ""),
        ink: cs.color, bg: cs.backgroundColor,
        lines,
        text: (el.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 46),
      };
    }),
  })))`,
  returnByValue: true,
});

for (const { sel, nodes } of JSON.parse(result.value)) {
  console.log(`\n${sel}  (${nodes.length})`);
  if (!nodes.length) console.log("   -- no match --");
  for (const n of nodes) {
    console.log(
      `   ${String(n.w).padStart(5)}x${String(n.h).padEnd(5)} at ${String(n.x).padStart(5)},${String(n.y).padEnd(6)} ` +
        `${n.family.slice(0, 12).padEnd(12)} ${n.font.padStart(7)}/${n.weight} lh ${n.lh.padEnd(7)} ${n.text}`,
    );
    console.log(`         ink ${n.ink}   bg ${n.bg}`);
    if (n.lines.length) console.log(`         lines: ${n.lines.join(" ")}`);
  }
}

await browser.close();
process.exit(0);
