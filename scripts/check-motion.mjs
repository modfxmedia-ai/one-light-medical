/**
 * Verify the two scroll-driven behaviours on the homepage actually run.
 *
 * Both are easy to break in ways a screenshot of the top of the page will not
 * show, and both have a no-JS path that has to keep working, so this checks:
 *
 *  - the outcome dials arm themselves to zero off-screen, then count up and fill
 *    their rings once scrolled to, landing exactly on the real figures;
 *  - the testimonial deck advances through every review as its pinned track is
 *    scrolled, and holds still while pinned rather than scrolling away.
 *
 * Usage: node scripts/check-motion.mjs [url] [--w=1440]
 */

import { launch } from "./cdp.mjs";

const args = process.argv.slice(2);
const widthArg = args.find((a) => a.startsWith("--w="));
const width = widthArg ? Number(widthArg.slice(4)) : 1440;
const url = args.find((a) => !a.startsWith("--")) ?? "http://127.0.0.1:3001/";

const browser = await launch();
const evaluate = async (expression) => {
  const { result } = await browser.send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  return result.value;
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

await browser.open(url, { width, height: 900 });

let failures = 0;
const check = (label, pass, detail) => {
  if (!pass) failures += 1;
  console.log(`  ${pass ? "ok  " : "FAIL"}  ${label}${detail ? `  ${detail}` : ""}`);
};

const EXPECTED = [85, 90, 78, 100];

console.log(`\n${url}  @${width}px`);

// ---- Dials ---------------------------------------------------------------
console.log("\noutcome dials");

const readDials = () =>
  evaluate(`JSON.stringify({
    values: [...document.querySelectorAll('.dial-value')].map((el) => el.textContent.trim()),
    dashes: [...document.querySelectorAll('.dial-progress')].map(
      (el) => Math.round(parseFloat(el.getAttribute('stroke-dasharray')) * 10) / 10,
    ),
  })`);

const armed = JSON.parse(await readDials());
check(
  "armed at zero while below the fold",
  armed.values.every((v) => v === "0%") && armed.dashes.every((d) => d === 0),
  `values ${armed.values.join(",")}`,
);

/* Instant, not smooth: the page sets scroll-behavior: smooth, and letting that
   run would mean sampling the count before the section had even arrived. */
await evaluate(`(() => {
  // The row itself, not the section: on narrow screens the section's heading is
  // tall enough that its top leaves the dials still well below the fold.
  const box = document.querySelector('.dial-row').getBoundingClientRect();
  window.scrollTo({ top: window.scrollY + box.top - window.innerHeight * 0.4, behavior: 'instant' });
  return 'done';
})()`);

// Sample across the run and collect the distinct readings, so the assertion is
// that the figures climb rather than snapping straight to their final value.
const climb = new Set();
for (let i = 0; i < 26; i += 1) {
  const frame = JSON.parse(await readDials());
  climb.add(frame.values[0]);
  await sleep(60);
}
const first = [...climb].map((v) => parseInt(v, 10)).filter((n) => n > 0 && n < EXPECTED[0]);
check(
  "counts up through intermediate values rather than snapping",
  first.length >= 3,
  `saw ${[...climb].length} distinct readings, ${first.length} between 0 and ${EXPECTED[0]}`,
);

await sleep(1500);
const settled = JSON.parse(await readDials());
check(
  "settles on the real figures",
  settled.values.join(",") === EXPECTED.map((n) => `${n}%`).join(","),
  `values ${settled.values.join(",")}`,
);
check(
  "ring sweep matches the figure",
  settled.dashes.join(",") === EXPECTED.join(","),
  `dashes ${settled.dashes.join(",")}`,
);

// ---- Testimonial deck ----------------------------------------------------
console.log("\ntestimonial deck");

const geometry = JSON.parse(
  await evaluate(`(() => {
    const track = document.querySelector('.deck-track');
    return JSON.stringify({
      pinned: track.dataset.pinned === 'true',
      top: track.offsetTop,
      height: track.offsetHeight,
      cards: document.querySelectorAll('.deck-card').length,
      viewport: window.innerHeight,
    });
  })()`),
);

check("track is pinned", geometry.pinned === true);
check(
  "track is taller than the viewport, so there is travel to pin through",
  geometry.height > geometry.viewport,
  `${geometry.height}px vs ${geometry.viewport}px`,
);

const travel = geometry.height - geometry.viewport;
const seen = [];
const pinOffsets = [];

for (let step = 0; step < geometry.cards; step += 1) {
  const target = geometry.top + ((step + 0.5) / geometry.cards) * travel;
  // Instant again: a smooth scroll would still be in flight when the panel's
  // offset is read, and the sticky top would not have settled yet.
  await evaluate(
    `window.scrollTo({ top: ${Math.round(target)}, behavior: 'instant' }); 'done'`,
  );
  await sleep(260);
  const state = JSON.parse(
    await evaluate(`(() => {
      const cards = [...document.querySelectorAll('.deck-card')];
      const pin = document.querySelector('.deck-pin').getBoundingClientRect();
      return JSON.stringify({
        current: cards.findIndex((c) => c.dataset.current === 'true'),
        pinTop: Math.round(pin.top),
      });
    })()`),
  );
  seen.push(state.current);
  pinOffsets.push(state.pinTop);
}

check(
  "each review is reached in order as the track is scrolled",
  seen.join(",") === seen.map((_, i) => i).join(","),
  `showed ${seen.join(",")}`,
);
check(
  "panel stays put while pinned",
  Math.max(...pinOffsets) - Math.min(...pinOffsets) <= 2,
  `top ranged ${Math.min(...pinOffsets)}..${Math.max(...pinOffsets)}px`,
);

// ---- No-JS / reduced-motion fallbacks ------------------------------------
console.log("\nfallbacks");

await browser.send("Emulation.setEmulatedMedia", {
  features: [{ name: "prefers-reduced-motion", value: "reduce" }],
});
await browser.open(url, { width, height: 900 });

const reduced = JSON.parse(
  await evaluate(`JSON.stringify({
    pinned: document.querySelector('.deck-track').dataset.pinned === 'true',
    values: [...document.querySelectorAll('.dial-value')].map((el) => el.textContent.trim()),
    trackHeight: document.querySelector('.deck-track').offsetHeight,
    viewport: window.innerHeight,
  })`),
);

check(
  "reduced motion: dials show the real figures without animating",
  reduced.values.join(",") === EXPECTED.map((n) => `${n}%`).join(","),
  `values ${reduced.values.join(",")}`,
);
check("reduced motion: deck is not pinned", reduced.pinned === false);
check(
  "reduced motion: track collapses to its natural height",
  reduced.trackHeight < reduced.viewport * 2,
  `${reduced.trackHeight}px`,
);

console.log(
  failures === 0
    ? "\nall scroll-driven behaviour verified\n"
    : `\n${failures} check(s) failed\n`,
);

await browser.close();
process.exit(failures === 0 ? 0 : 1);
