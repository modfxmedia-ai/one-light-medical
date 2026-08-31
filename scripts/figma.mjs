/**
 * Minimal Figma REST client for design inspection.
 *
 * Reads FIGMA_API_KEY from .env.local so the token never appears in a command
 * line, a committed file, or this script.
 *
 * Commands:
 *   node scripts/figma.mjs tree  [depth]        pages and frames with node-ids
 *   node scripts/figma.mjs node  <id> [depth]   one subtree, summarised
 *   node scripts/figma.mjs raw   <id> [depth]   one subtree as raw JSON
 *   node scripts/figma.mjs styles                published colour/text styles
 *   node scripts/figma.mjs image <id> [scale]   render a node to PNG
 *   node scripts/figma.mjs svg   <id>           export a node as SVG
 *
 * Env:
 *   FIGMA_FILE_KEY  overrides the default file key
 */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function env(name) {
  if (process.env[name]) return process.env[name];
  try {
    const line = readFileSync(join(ROOT, ".env.local"), "utf8")
      .split("\n")
      .find((l) => l.trim().startsWith(`${name}=`));
    return line?.slice(line.indexOf("=") + 1).trim();
  } catch {
    return undefined;
  }
}

const TOKEN = env("FIGMA_API_KEY");
const FILE = env("FIGMA_FILE_KEY") ?? "0tmbjkm4IK9JpJbJ4cgSVX";

if (!TOKEN) {
  console.error("FIGMA_API_KEY missing (expected in .env.local)");
  process.exit(1);
}

async function api(path) {
  const res = await fetch(`https://api.figma.com/v1${path}`, {
    headers: { "X-Figma-Token": TOKEN },
  });
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText} on ${path}\n${await res.text()}`);
  }
  return res.json();
}

const hex = (c) =>
  "#" +
  [c.r, c.g, c.b]
    .map((v) =>
      Math.round(v * 255)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("") +
  (c.a !== undefined && c.a < 1 ? ` (a ${c.a.toFixed(2)})` : "");

const [cmd, arg, arg2] = process.argv.slice(2);

if (cmd === "tree") {
  const depth = Number(arg ?? 2);
  const { name, document: doc, lastModified } = await api(`/files/${FILE}?depth=${depth}`);
  console.log(`file: ${name}   modified ${lastModified}\n`);
  for (const page of doc.children ?? []) {
    console.log(`PAGE  ${page.name}   [${page.id}]`);
    for (const frame of page.children ?? []) {
      const b = frame.absoluteBoundingBox;
      const size = b ? `${Math.round(b.width)}x${Math.round(b.height)}` : "-";
      console.log(`  ${frame.type.padEnd(9)} ${frame.name.padEnd(40)} [${frame.id}]  ${size}`);
    }
    console.log("");
  }
} else if (cmd === "node") {
  const depth = Number(arg2 ?? 3);
  const data = await api(`/files/${FILE}/nodes?ids=${encodeURIComponent(arg)}&depth=${depth}`);
  const walk = (n, indent = 0) => {
    const b = n.absoluteBoundingBox;
    const size = b ? `${Math.round(b.width)}x${Math.round(b.height)}` : "";
    const pos = b ? `@${Math.round(b.x)},${Math.round(b.y)}` : "";
    const bits = [];
    if (n.style) {
      bits.push(
        `${n.style.fontFamily} ${n.style.fontWeight} ${Math.round(n.style.fontSize)}/${
          n.style.lineHeightPx ? Math.round(n.style.lineHeightPx) : "?"
        }`,
      );
    }
    const solid = (n.fills ?? []).find((f) => f.type === "SOLID" && f.visible !== false);
    if (solid) bits.push(hex(solid.color));
    if ((n.fills ?? []).some((f) => f.type?.startsWith("GRADIENT"))) bits.push("gradient");
    if (n.cornerRadius !== undefined) bits.push(`r${n.cornerRadius}`);
    if (n.characters) bits.push(JSON.stringify(n.characters.slice(0, 46)));
    console.log(
      `${" ".repeat(indent)}${n.type.padEnd(9)} ${n.name}  [${n.id}] ${size}${pos}  ${bits.join("  ")}`,
    );
    for (const c of n.children ?? []) walk(c, indent + 2);
  };
  for (const key of Object.keys(data.nodes)) walk(data.nodes[key].document);
} else if (cmd === "raw") {
  const depth = Number(arg2 ?? 2);
  const data = await api(`/files/${FILE}/nodes?ids=${encodeURIComponent(arg)}&depth=${depth}`);
  console.log(JSON.stringify(data, null, 1));
} else if (cmd === "styles") {
  const { meta } = await api(`/files/${FILE}/styles`);
  const list = meta?.styles ?? [];
  if (list.length === 0) console.log("(no published styles in this file)");
  for (const s of list) {
    console.log(`${s.style_type.padEnd(6)} ${s.name.padEnd(38)} [${s.node_id}]  ${s.description ?? ""}`);
  }
} else if (cmd === "image" || cmd === "svg") {
  const format = cmd === "svg" ? "svg" : "png";
  const scale = cmd === "image" ? `&scale=${arg2 ?? 2}` : "";
  const { images, err } = await api(
    `/images/${FILE}?ids=${encodeURIComponent(arg)}&format=${format}${scale}`,
  );
  if (err) throw new Error(err);
  for (const [id, url] of Object.entries(images)) {
    if (!url) {
      console.error(`no render for ${id}`);
      continue;
    }
    const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
    const out = join("/tmp", `figma-${id.replace(/[:;]/g, "_")}.${format}`);
    writeFileSync(out, buf);
    console.log(`${id} -> ${out} (${buf.length} bytes)`);
  }
} else {
  console.error("unknown command; see the header of this file");
  process.exit(1);
}
