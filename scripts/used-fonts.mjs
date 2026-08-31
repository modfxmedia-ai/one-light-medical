/**
 * Reports the font actually used to render key elements on a page.
 *
 * Stylesheets lie about this: a theme can declare half a dozen families in CSS
 * variables and @font-face blocks while the page renders in something else
 * entirely. This reads the computed family off real elements instead.
 *
 * Usage: node scripts/used-fonts.mjs <url>
 */

import { launch } from "./cdp.mjs";

const [url] = process.argv.slice(2);

const browser = await launch();
await browser.open(url, { settle: 3500 });

const { result } = await browser.send("Runtime.evaluate", {
  returnByValue: true,
  expression: `(() => {
    const pick = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const cs = getComputedStyle(el);
      return {
        sel,
        family: cs.fontFamily,
        weight: cs.fontWeight,
        size: cs.fontSize,
        lineHeight: cs.lineHeight,
        text: (el.textContent || "").trim().slice(0, 42),
      };
    };

    // Tally what the bulk of the visible text renders in.
    const tally = {};
    for (const el of document.body.querySelectorAll("h1,h2,h3,p,a,li,span,button")) {
      const t = (el.textContent || "").trim();
      if (!t || el.children.length) continue;
      const fam = getComputedStyle(el).fontFamily.split(",")[0].replace(/["']/g, "");
      tally[fam] = (tally[fam] || 0) + 1;
    }

    return {
      elements: ["h1", "h2", "h3", "p", "nav a", "button"].map(pick).filter(Boolean),
      tally: Object.entries(tally).sort((a, b) => b[1] - a[1]).slice(0, 8),
    };
  })()`,
});

for (const e of result.value.elements) {
  console.log(
    `${e.sel.padEnd(9)} ${e.family.padEnd(34)} w${e.weight.padEnd(4)} ${e.size.padEnd(7)} lh ${e.lineHeight}`,
  );
}
console.log("\nmost-used families across visible text:");
for (const [fam, n] of result.value.tally) console.log(`  ${String(n).padStart(4)}x  ${fam}`);

await browser.close();
process.exit(0);
