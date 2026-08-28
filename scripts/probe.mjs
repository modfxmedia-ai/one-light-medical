/**
 * Prints the box, containing block and clipping context of specific selectors at
 * one viewport width, for working out whether an overflow is a bug or intent.
 *
 * Usage: node scripts/probe.mjs <url> <width> <selector> [selector...]
 */

import { launch } from "./cdp.mjs";

const [url, width, ...selectors] = process.argv.slice(2);

const browser = await launch();
await browser.open(url, { width: Number(width), height: 900, settle: 1800 });

const { result } = await browser.send("Runtime.evaluate", {
  returnByValue: true,
  expression: `(() => {
    const out = [];
    for (const sel of ${JSON.stringify(selectors)}) {
      for (const el of document.querySelectorAll(sel)) {
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        let scroller = null;
        for (let p = el.parentElement; p; p = p.parentElement) {
          const ov = getComputedStyle(p).overflowX;
          if (ov === "auto" || ov === "scroll") {
            scroller = p.tagName.toLowerCase() + "." + String(p.className).trim();
            break;
          }
        }
        out.push({
          sel,
          left: Math.round(r.left),
          right: Math.round(r.right),
          w: Math.round(r.width),
          h: Math.round(r.height),
          display: cs.display,
          position: cs.position,
          visibility: cs.visibility,
          inScroller: scroller,
        });
      }
    }
    return { vw: document.documentElement.clientWidth, out };
  })()`,
});

console.log(`viewport ${result.value.vw}px`);
for (const r of result.value.out) console.log(r);

await browser.close();
process.exit(0);
