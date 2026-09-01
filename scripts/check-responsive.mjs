/**
 * Finds horizontal overflow across a range of viewport widths.
 *
 * "Fits every screen" is testable: the document must never scroll sideways, and
 * no element may stick out past the viewport. Eyeballing screenshots misses
 * both, because a hidden overflow still steals the layout and a clipped element
 * still looks fine in a capture.
 *
 * Usage: node scripts/check-responsive.mjs <url> [width,width,...]
 */

import { launch } from "./cdp.mjs";

const [url = "http://localhost:3000/", list] = process.argv.slice(2);
/* 2560 and 1920 are external displays, 1728 is the frame width and the 16-inch
   MacBook Pro, 1512 the 14-inch. The design scales up through this range, so it
   has to be checked there and not only below the old 1440 reference. */
const WIDTHS = (list ?? "2560,1920,1728,1512,1440,1280,1180,1024,900,834,768,600,430,390,360,320")
  .split(",")
  .map(Number);

const browser = await launch();
await browser.open(url, { settle: 1800 });

let bad = 0;

for (const width of WIDTHS) {
  await browser.send("Emulation.setDeviceMetricsOverride", {
    width,
    height: 900,
    deviceScaleFactor: 1,
    mobile: width <= 900,
  });
  // Give the layout a moment to settle after the resize.
  await new Promise((r) => setTimeout(r, 500));

  const { result } = await browser.send("Runtime.evaluate", {
    returnByValue: true,
    expression: `(() => {
      const vw = document.documentElement.clientWidth;
      const scroll = document.documentElement.scrollWidth;

      /* An element past the viewport edge only matters if a visitor can reach
         it. These three cases are all invisible or intended:
           - an ancestor clips the x axis, which is how the full-bleed art and
             the tilted testimonial slabs are meant to bleed
           - an ancestor scrolls the x axis, i.e. it is carousel content
           - it sits inside a closed <details>, which is not rendered at all */
      const excused = (el) => {
        for (let p = el.parentElement; p; p = p.parentElement) {
          if (p.tagName === "DETAILS" && !p.open) return true;
          const ov = getComputedStyle(p).overflowX;
          if (ov !== "visible") return true;
        }
        return false;
      };

      const offenders = [];
      for (const el of document.body.querySelectorAll("*")) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) continue;
        const over = Math.max(r.right - vw, -r.left);
        if (over <= 1 || excused(el)) continue;
        // Outermost only: a wide parent drags its subtree past the edge with it
        // and the children are not the bug.
        if (offenders.some((o) => o.node.contains(el))) continue;
        offenders.push({
          node: el,
          label:
            el.tagName.toLowerCase() +
            (el.className && typeof el.className === "string"
              ? "." + el.className.trim().split(/\\s+/).join(".")
              : ""),
          over: Math.round(over),
        });
      }

      return {
        vw,
        scroll,
        overflow: scroll - vw,
        offenders: offenders.slice(0, 8).map((o) => o.label + " +" + o.over + "px"),
      };
    })()`,
  });

  const { scroll, overflow, offenders } = result.value;
  const ok = overflow <= 0 && offenders.length === 0;
  if (!ok) bad += 1;
  console.log(
    `${String(width).padStart(5)}px  scrollWidth ${String(scroll).padStart(5)}  ` +
      `${ok ? "ok" : `OVERFLOW +${overflow}`}`,
  );
  for (const o of offenders) console.log(`         ${o}`);
}

console.log(bad === 0 ? "\nno horizontal overflow at any width" : `\n${bad} width(s) overflow`);

await browser.close();
process.exit(bad === 0 ? 0 : 1);
