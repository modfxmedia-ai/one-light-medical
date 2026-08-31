/**
 * Ranks Google Fonts candidates by how closely they render to a reference face.
 *
 * The Figma file is set in Avenir Next, which is a licensed Linotype family and
 * so cannot be served by next/font/google. Avenir Next ships with macOS though,
 * so it can be measured locally and the free candidates scored against it
 * instead of picked by reputation.
 *
 * Scored on the three things that decide whether a substitution reads as the
 * same design: x-height relative to the em (optical size), the x-height to
 * cap-height ratio (the family's proportions) and set width (how much
 * horizontal room a line needs, which decides whether hand-broken lines hold).
 *
 * Usage: node scripts/font-match.mjs ["Reference Family"] [Candidate ...]
 */

import { launch } from "./cdp.mjs";

const args = process.argv.slice(2);
const REFERENCE = args[0] ?? "Avenir Next";
const CANDIDATES =
  args.length > 1
    ? args.slice(1)
    : [
        "Nunito Sans",
        "Mulish",
        "DM Sans",
        "Manrope",
        "Figtree",
        "Hanken Grotesk",
        "Montserrat",
        "Poppins",
        "Jost",
        "Inter",
        "Josefin Sans",
      ];

const browser = await launch();
await browser.open("about:blank", { settle: 200 });

const { result } = await browser.send("Runtime.evaluate", {
  returnByValue: true,
  awaitPromise: true,
  expression: `(async () => {
    const reference = ${JSON.stringify(REFERENCE)};
    const candidates = ${JSON.stringify(CANDIDATES)};

    // One stylesheet for every candidate, so a single load settles them all.
    const families = candidates
      .map((f) => "family=" + f.replace(/ /g, "+") + ":wght@400;500;700")
      .join("&");
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?" + families + "&display=block";
    document.head.appendChild(link);
    await new Promise((r) => (link.onload = link.onerror = r));

    for (const f of [reference, ...candidates]) {
      try { await document.fonts.load('400 100px "' + f + '"'); } catch {}
    }
    await document.fonts.ready;

    const ctx = document.createElement("canvas").getContext("2d");
    const SAMPLE = "Find Lasting Stem Cell Therapy for Joint Pain";

    const read = (family) => {
      // A deliberately absent fallback: if the family is missing the numbers
      // would silently be the fallback's, so compare against a known miss.
      ctx.font = '400 100px "' + family + '", "__missing__"';
      const probe = ctx.measureText(SAMPLE).width;
      ctx.font = '400 100px "__missing__"';
      const fallback = ctx.measureText(SAMPLE).width;

      ctx.font = '400 100px "' + family + '", "__missing__"';
      const x = ctx.measureText("x");
      const caps = ctx.measureText("H");
      const asc = ctx.measureText("Hbdfhklt");
      const desc = ctx.measureText("gjpqy");
      return {
        family,
        loaded: Math.abs(probe - fallback) > 0.5,
        xHeight: x.actualBoundingBoxAscent,
        capHeight: caps.actualBoundingBoxAscent,
        ascender: asc.actualBoundingBoxAscent,
        descender: desc.actualBoundingBoxDescent,
        advance: probe,
      };
    };

    return { ref: read(reference), rows: candidates.map(read) };
  })()`,
});

await browser.close();

const { ref, rows } = result.value;

if (!ref.loaded) {
  console.error(`reference "${REFERENCE}" did not load - is it installed?`);
  process.exit(1);
}

const shape = (f) => f.xHeight / f.capHeight;

const scored = rows
  .filter((f) => f.loaded)
  .map((f) => ({
    ...f,
    dx: f.xHeight / ref.xHeight - 1,
    dcap: f.capHeight / ref.capHeight - 1,
    dshape: shape(f) / shape(ref) - 1,
    dwidth: f.advance / ref.advance - 1,
  }))
  .map((f) => ({
    ...f,
    // x-height and proportion dominate perceived likeness; set width matters
    // but a few percent is absorbable by fluid type, so it is weighted lower.
    score: Math.abs(f.dshape) * 3 + Math.abs(f.dx) * 2 + Math.abs(f.dwidth) * 1,
  }))
  .sort((a, b) => a.score - b.score);

const pct = (v) => `${v >= 0 ? "+" : ""}${(v * 100).toFixed(1)}%`;

console.log(`reference: ${ref.family}   (all values at font-size 100px)\n`);
console.log(
  `${"".padEnd(16)}  x-ht    cap    x/cap   set width      vs reference` +
    `\n${"".padEnd(16)}                                  x-ht    x/cap   width`,
);
console.log(
  `${ref.family.padEnd(16)}  ${ref.xHeight.toFixed(1).padStart(5)}  ${ref.capHeight
    .toFixed(1)
    .padStart(5)}   ${shape(ref).toFixed(3)}   ${ref.advance.toFixed(0).padStart(5)}`,
);
console.log("-".repeat(78));
for (const f of scored) {
  console.log(
    `${f.family.padEnd(16)}  ${f.xHeight.toFixed(1).padStart(5)}  ${f.capHeight
      .toFixed(1)
      .padStart(5)}   ${shape(f).toFixed(3)}   ${f.advance
      .toFixed(0)
      .padStart(5)}   ${pct(f.dx).padStart(7)} ${pct(f.dshape).padStart(7)} ${pct(f.dwidth).padStart(
      7,
    )}   score ${f.score.toFixed(3)}`,
  );
}

const missing = rows.filter((f) => !f.loaded).map((f) => f.family);
if (missing.length) console.log(`\nnot loaded: ${missing.join(", ")}`);

const winner = scored[0];
console.log(
  `\nclosest: ${winner.family} - set sizes x ${(ref.xHeight / winner.xHeight).toFixed(
    4,
  )} to hold the same optical size as ${ref.family}`,
);

process.exit(0);
