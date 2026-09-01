/**
 * Verifies the LeadConnector chat widget that the root layout loads site-wide.
 *
 * The widget is a third-party custom element that renders into a shadow root, so
 * none of the other checks can see it: check-responsive walks the light DOM and
 * check-lock only reads anchors. Four things can break quietly here.
 *
 *  - The loader tag losing its data-* attributes. They are the widget's entire
 *    configuration and it reads them off its own script element, so a build step
 *    that strips unknown attributes would leave a loader that does nothing.
 *  - The widget not reaching every route, which is the whole point of putting it
 *    in the root layout rather than on one page.
 *  - The home page's preview lock catching it. That rule is broad by design, and
 *    a bubble that renders but cannot be clicked looks identical to a working one.
 *  - The bubble covering the mobile menu. It sits at z-index 99999999, far above
 *    the menu overlay, so it draws on top of an open menu by definition -- what
 *    matters is whether it lands on any of the links.
 *
 * Usage: node scripts/check-chat-widget.mjs [base-url]
 */

import { launch } from "./cdp.mjs";

const base = (process.argv[2] ?? "http://127.0.0.1:3000").replace(/\/$/, "");
const WIDGET_ID = "6a95832e95e98a97bd7f9972";
/* One of each kind of route: the locked home page, the contact page, a service
   page and a blog post, the last two still being unstyled Stage A markup. */
const ROUTES = ["/", "/contact/", "/knee-pain/", "/chronic-joint-pain/"];

let failures = 0;
const fail = (msg) => {
  failures += 1;
  console.log(`  FAIL ${msg}`);
};

const browser = await launch();

const probe = `(() => {
  const loader = document.querySelector('script[src*="widgets.leadconnectorhq.com/loader.js"]');
  const host = document.querySelector('chat-widget');
  const root = host?.shadowRoot;
  const bubble = root?.querySelector('.lc_text-widget--bubble');
  if (!bubble) {
    return JSON.stringify({
      loader: loader ? { id: loader.getAttribute('data-widget-id'), res: loader.getAttribute('data-resources-url') } : null,
      host: !!host,
      shadow: !!root,
      bubble: null,
    });
  }

  const cs = getComputedStyle(bubble);
  const r = bubble.getBoundingClientRect();
  const x = r.left + r.width / 2;
  const y = r.top + r.height / 2;
  // A shadow-DOM hit resolves to the host element, so reaching <chat-widget> is
  // what a real click landing on the bubble looks like from the outside.
  const hit = document.elementFromPoint(x, y);

  return JSON.stringify({
    loader: loader ? { id: loader.getAttribute('data-widget-id'), res: loader.getAttribute('data-resources-url') } : null,
    host: !!host,
    shadow: !!root,
    bubble: {
      box: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)],
      position: cs.position,
      pointer: cs.pointerEvents,
      visibility: cs.visibility,
      reachable: hit?.tagName.toLowerCase() === 'chat-widget',
      hit: hit?.tagName.toLowerCase() ?? 'nothing',
      inViewport: r.right <= innerWidth + 1 && r.bottom <= innerHeight + 1 && r.left >= 0 && r.top >= 0,
    },
    docWidth: document.documentElement.scrollWidth,
    viewport: innerWidth,
  });
})()`;

for (const route of ROUTES) {
  console.log(`\n${route}`);
  // The loader is lazyOnload and then fetches its own bundles, so this needs a
  // long settle -- a short one fails on the network, not on the code.
  await browser.open(base + route, { width: 1440, height: 900, settle: 14000 });

  const { result } = await browser.send("Runtime.evaluate", { expression: probe, returnByValue: true });
  const s = JSON.parse(result.value);

  if (!s.loader) fail("loader script tag missing");
  else {
    if (s.loader.id !== WIDGET_ID) fail(`wrong data-widget-id: ${s.loader.id}`);
    if (!s.loader.res?.includes("chat-widget/loader.js")) {
      fail(`wrong data-resources-url: ${s.loader.res}`);
    }
  }

  if (!s.host) fail("<chat-widget> never mounted");
  else if (!s.shadow) fail("<chat-widget> mounted but has no shadow root");
  else if (!s.bubble) fail("widget mounted but rendered no bubble");
  else {
    const b = s.bubble;
    if (b.position !== "fixed") fail(`bubble is ${b.position}, not fixed`);
    if (b.pointer === "none") fail("bubble is not interactive -- the preview lock caught it");
    if (b.visibility !== "visible") fail(`bubble is ${b.visibility}`);
    if (!b.inViewport) fail(`bubble is outside the viewport at ${b.box}`);
    if (!b.reachable) fail(`a click on the bubble would hit ${b.hit}`);
    if (failures === 0 || b.reachable) console.log(`  bubble ${b.box[2]}x${b.box[3]} at ${b.box[0]},${b.box[1]}, clickable`);
  }

  if (s.docWidth > s.viewport) fail(`widget introduced overflow: ${s.docWidth}px in ${s.viewport}px`);
}

/* Phone, with the menu open: the one place the bubble and the site's own UI
   compete for the same corner. */
console.log("\n390px, mobile menu open");
await browser.open(base + "/", { width: 390, height: 844, settle: 14000 });
await browser.send("Runtime.evaluate", {
  expression: `document.querySelector('.site-nav-toggle').open = true`,
});
await new Promise((r) => setTimeout(r, 900));

const { result: menu } = await browser.send("Runtime.evaluate", {
  returnByValue: true,
  expression: `(() => {
    const bubble = document.querySelector('chat-widget')?.shadowRoot?.querySelector('.lc_text-widget--bubble');
    if (!bubble) return JSON.stringify({ bubble: null });
    const r = bubble.getBoundingClientRect();
    const covered = [...document.querySelectorAll('.site-nav-toggle[open] a, .site-nav-toggle[open] summary')]
      .filter((el) => {
        const b = el.getBoundingClientRect();
        return b.width && r.left < b.right && r.right > b.left && r.top < b.bottom && r.bottom > b.top;
      })
      .map((el) => el.textContent.trim());
    return JSON.stringify({
      bubble: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)],
      covered,
      fitsViewport: r.right <= innerWidth + 1 && r.bottom <= innerHeight + 1,
    });
  })()`,
});
const m = JSON.parse(menu.value);

if (!m.bubble) fail("no bubble on the phone layout");
else {
  if (m.covered.length) fail(`bubble covers menu items: ${m.covered.join(", ")}`);
  if (!m.fitsViewport) fail(`bubble spills out of the phone viewport at ${m.bubble}`);
  if (!m.covered.length && m.fitsViewport) console.log(`  bubble at ${m.bubble}, covers no menu item`);
}

await browser.close();
console.log(failures ? `\n${failures} failure(s)` : "\nall checks passed");
process.exit(failures ? 1 : 0);
