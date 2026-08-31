/**
 * Harvests the design tokens actually used inside a Figma frame.
 *
 * This file has no published styles, so there are no Figma-given names to read.
 * Everything here is derived from the layers themselves: solid fills, gradient
 * stops, effects, corner radii and the type scale, each with a usage count so
 * the frequently used values can be told apart from one-offs when naming them.
 *
 * Usage: node scripts/figma-tokens.mjs <nodeId> [depth]
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function env(name) {
  if (process.env[name]) return process.env[name];
  const line = readFileSync(join(ROOT, ".env.local"), "utf8")
    .split("\n")
    .find((l) => l.trim().startsWith(`${name}=`));
  return line?.slice(line.indexOf("=") + 1).trim();
}

const TOKEN = env("FIGMA_API_KEY");
const FILE = env("FIGMA_FILE_KEY") ?? "0tmbjkm4IK9JpJbJ4cgSVX";
const [nodeId = "140:30", depth = "6"] = process.argv.slice(2);

const res = await fetch(
  `https://api.figma.com/v1/files/${FILE}/nodes?ids=${encodeURIComponent(nodeId)}&depth=${depth}`,
  { headers: { "X-Figma-Token": TOKEN } },
);
if (!res.ok) {
  console.error(`${res.status} ${res.statusText}`);
  process.exit(1);
}
const data = await res.json();

const hex = ({ r, g, b }) =>
  "#" +
  [r, g, b]
    .map((v) =>
      Math.round(v * 255)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("");

const rgba = (c) => (c.a === undefined || c.a >= 1 ? hex(c) : `${hex(c)} @${c.a.toFixed(2)}`);

const solids = new Map();
const gradients = new Map();
const effects = new Map();
const radii = new Map();
const type = new Map();
const bump = (map, key, who) => {
  const e = map.get(key) ?? { n: 0, where: new Set() };
  e.n += 1;
  if (e.where.size < 4) e.where.add(who);
  map.set(key, e);
};

/** Angle of a Figma gradient handle set, as a CSS `deg` for linear-gradient. */
function gradientAngle(handles) {
  if (!handles || handles.length < 2) return null;
  const [a, b] = handles;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  // CSS 0deg points up and grows clockwise; Figma's y axis grows downward.
  return Math.round(((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360);
}

function walk(n) {
  const who = n.name;

  for (const f of n.fills ?? []) {
    if (f.visible === false) continue;
    if (f.type === "SOLID") bump(solids, rgba({ ...f.color, a: f.opacity ?? f.color.a }), who);
    if (f.type?.startsWith("GRADIENT")) {
      const stops = (f.gradientStops ?? [])
        .map((s) => `${rgba(s.color)} ${Math.round(s.position * 100)}%`)
        .join(", ");
      const angle = gradientAngle(f.gradientHandlePositions);
      bump(gradients, `${f.type.replace("GRADIENT_", "").toLowerCase()} ${angle}deg  ${stops}`, who);
    }
  }

  for (const s of n.strokes ?? []) {
    if (s.type === "SOLID") bump(solids, `${rgba(s.color)} (stroke ${n.strokeWeight ?? "?"})`, who);
  }

  for (const e of n.effects ?? []) {
    if (e.visible === false) continue;
    const parts = [e.type.toLowerCase()];
    if (e.radius !== undefined) parts.push(`blur ${Math.round(e.radius)}`);
    if (e.offset) parts.push(`offset ${Math.round(e.offset.x)},${Math.round(e.offset.y)}`);
    if (e.spread) parts.push(`spread ${Math.round(e.spread)}`);
    if (e.color) parts.push(rgba(e.color));
    bump(effects, parts.join("  "), who);
  }

  if (typeof n.cornerRadius === "number") bump(radii, `${n.cornerRadius}px`, who);
  if (n.rectangleCornerRadii) bump(radii, `mixed ${n.rectangleCornerRadii.join("/")}`, who);

  if (n.style?.fontFamily) {
    const s = n.style;
    bump(
      type,
      `${s.fontFamily} ${s.fontWeight} ${Math.round(s.fontSize)}/${
        s.lineHeightPx ? Math.round(s.lineHeightPx) : "?"
      }${s.letterSpacing ? ` ls ${s.letterSpacing.toFixed(2)}` : ""}`,
      who,
    );
  }

  for (const c of n.children ?? []) walk(c);
}

for (const key of Object.keys(data.nodes)) walk(data.nodes[key].document);

const report = (title, map, limit = 40) => {
  console.log(`\n=== ${title} (${map.size}) ===`);
  const rows = [...map.entries()].sort((a, b) => b[1].n - a[1].n).slice(0, limit);
  for (const [k, v] of rows) {
    console.log(`${String(v.n).padStart(4)}x  ${k}`);
    console.log(`        used on: ${[...v.where].join(", ")}`);
  }
};

report("solid fills / strokes", solids);
report("gradients", gradients);
report("effects", effects);
report("corner radii", radii);
report("type scale", type);
