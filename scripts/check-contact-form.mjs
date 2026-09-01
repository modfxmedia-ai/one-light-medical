/**
 * Verifies the LeadConnector enquiry embed on /contact/.
 *
 * The form is a third-party iframe whose height is written by their
 * form_embed.js once the child frame has measured itself. Several things can
 * break here without producing any build error: the script tag going missing,
 * the vendor endpoint failing, or the height staying at the reserved fallback so
 * the form scrolls inside its own box.
 *
 * The resize is the signal this leans on, because it can only happen if the
 * child frame loaded and ran: the frame itself is cross-origin, so Chrome puts
 * it in its own process and it never appears in the page's frame tree or network
 * log. A height above the reserved 905 therefore proves the whole chain worked.
 *
 * Usage: node scripts/check-contact-form.mjs [url]
 */

import { launch } from "./cdp.mjs";

const url = process.argv[2] ?? "http://127.0.0.1:3000/contact/";
const WIDTHS = [1728, 1024, 390];
const RESERVED = 905;
/* Measured, not documented: the embed lays its fields out to this width and
   centres them in whatever box it is given. Mirrors --form-w in globals.css. */
const CAP = 800;
const VENDOR = {
  form: "https://api.leadconnectorhq.com/widget/form/igzUET4yZBVHhMnCB1wJ",
  script: "https://link.msgsndr.com/js/form_embed.js",
};

let failures = 0;
const fail = (msg) => {
  failures += 1;
  console.log(`  FAIL ${msg}`);
};

console.log("vendor endpoints");
for (const [name, endpoint] of Object.entries(VENDOR)) {
  const status = await fetch(endpoint, { method: "GET" })
    .then((r) => r.status)
    .catch((e) => e.message);
  if (status === 200) console.log(`  ok ${name} 200`);
  else fail(`${name} returned ${status}`);
}

const browser = await launch();

for (const width of WIDTHS) {
  console.log(`\n${width}px`);
  // Generous settle: the embed has to fetch, render and then report its height.
  await browser.open(url, { width, height: 900, settle: 9000 });

  const { result } = await browser.send("Runtime.evaluate", {
    expression: `(() => {
      const frame = document.querySelector('.contact-form-frame iframe');
      if (!frame) return JSON.stringify({ missing: true });
      const box = frame.getBoundingClientRect();
      const card = document.querySelector('.contact-form-panel').getBoundingClientRect();
      return JSON.stringify({
        src: frame.getAttribute('src'),
        height: Math.round(box.height),
        width: Math.round(box.width),
        cardWidth: Math.round(card.width),
        script: !!document.querySelector('script[src*="form_embed"]'),
        docWidth: document.documentElement.scrollWidth,
        viewport: window.innerWidth,
      });
    })()`,
    returnByValue: true,
  });
  const state = JSON.parse(result.value);

  if (state.missing) {
    fail("no iframe rendered");
    continue;
  }

  if (!state.script) fail("form_embed.js tag not in the document");
  if (!state.src?.includes("igzUET4yZBVHhMnCB1wJ")) fail(`unexpected iframe src: ${state.src}`);

  if (state.height <= RESERVED) {
    fail(`height still ${state.height}px -- the embed never reported, form will scroll internally`);
  } else {
    console.log(`  embed resized to ${state.height}px`);
  }

  /* The two width rules are what keep the form from reading as a frame inside a
     frame. The embed paints its own bordered container edge to edge, so the panel
     must not inset it, and it centres its fields under a fixed ceiling, so a
     panel wider than that ceiling gets white margins inside the form instead of a
     wider form. */
  if (state.width !== state.cardWidth) {
    fail(`iframe inset ${state.cardWidth - state.width}px inside its panel, so the form is framed twice`);
  }
  if (state.width > CAP) {
    fail(`iframe ${state.width}px exceeds the embed's ~${CAP}px field ceiling, so the form floats inside it`);
  }
  if (state.docWidth > state.viewport) {
    fail(`horizontal overflow: document ${state.docWidth}px in ${state.viewport}px`);
  }

  console.log(`  iframe ${state.width}px, flush in a ${state.cardWidth}px panel`);
}

await browser.close();
console.log(failures ? `\n${failures} failure(s)` : "\nall checks passed");
process.exit(failures ? 1 : 0);
