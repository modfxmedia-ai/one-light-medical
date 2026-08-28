/**
 * Checks that every outcome-dial caption stays inside its ring.
 *
 * The caption sits below the centre of a circle, so the room available to it
 * narrows on every line. A plain "does the box fit the box" test passes while
 * the last line still pokes through the stroke, so this compares each line's
 * half-width against the circle's half-chord at that line's own depth.
 *
 * Usage: node scripts/check-dials.mjs <url> [width,width,...]
 */

import { launch } from "./cdp.mjs";

const [url = "http://localhost:3000/", list] = process.argv.slice(2);
const WIDTHS = (list ?? "1440,1280,1024,900,768,600,430,390,360").split(",").map(Number);

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
  await new Promise((r) => setTimeout(r, 400));

  const { result } = await browser.send("Runtime.evaluate", {
    returnByValue: true,
    expression: `(() => {
      const rows = [];
      for (const dial of document.querySelectorAll(".dial")) {
        const d = dial.getBoundingClientRect();
        const cx = d.left + d.width / 2;
        const cy = d.top + d.height / 2;
        // Inner edge of the ring: r=47.5 of a 100 viewBox, stroke 4.95 centred.
        const r = (d.width * (47.5 - 4.95 / 2)) / 100;

        const note = dial.querySelector(".dial-note");
        const range = document.createRange();
        let worst = 0;
        for (const node of note.childNodes) {
          if (node.nodeType !== Node.TEXT_NODE) continue;
          range.selectNodeContents(node);
          for (const line of range.getClientRects()) {
            // Deepest corner of this line box relative to the centre.
            const dy = Math.max(Math.abs(line.top - cy), Math.abs(line.bottom - cy));
            const half = Math.max(Math.abs(line.left - cx), Math.abs(line.right - cx));
            const room = Math.sqrt(Math.max(r * r - dy * dy, 0));
            worst = Math.max(worst, half - room);
          }
        }
        rows.push({
          value: dial.querySelector(".dial-value").textContent,
          size: Math.round(d.width),
          spill: Math.round(worst * 10) / 10,
        });
      }
      return rows;
    })()`,
  });

  const rows = result.value;
  const over = rows.filter((r) => r.spill > 0);
  if (over.length) bad += 1;
  console.log(
    `${String(width).padStart(5)}px  dial ${rows[0].size}px  ` +
      (over.length
        ? `SPILL ${over.map((r) => `${r.value} +${r.spill}px`).join("  ")}`
        : `ok (worst ${Math.max(...rows.map((r) => r.spill)).toFixed(1)}px)`),
  );
}

console.log(bad === 0 ? "\nall captions inside their rings" : `\n${bad} width(s) spill`);

await browser.close();
process.exit(bad === 0 ? 0 : 1);
