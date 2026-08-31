/**
 * Exports every image-bearing layer in a Figma frame as a rendered PNG.
 *
 * Rendering the layer rather than downloading its raw image fill matters here:
 * the fills are cropped and scaled by their frames, so the raw asset is often a
 * different size and composition from what the design actually shows.
 *
 * Usage: node scripts/figma-export.mjs <nodeId> [scale] [outDir]
 */

import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
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
const [nodeId = "140:30", scale = "2", outDir = "public/images/figma"] = process.argv.slice(2);

const api = async (path) => {
  const res = await fetch(`https://api.figma.com/v1${path}`, {
    headers: { "X-Figma-Token": TOKEN },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} on ${path}`);
  return res.json();
};

const tree = await api(`/files/${FILE}/nodes?ids=${encodeURIComponent(nodeId)}&depth=6`);

const targets = [];
const slug = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || "layer";

function walk(n) {
  const hasImage = (n.fills ?? []).some((f) => f.type === "IMAGE" && f.visible !== false);
  if (hasImage) {
    const b = n.absoluteBoundingBox;
    targets.push({
      id: n.id,
      name: n.name,
      slug: slug(n.name),
      w: b ? Math.round(b.width) : null,
      h: b ? Math.round(b.height) : null,
    });
  }
  for (const c of n.children ?? []) walk(c);
}
for (const k of Object.keys(tree.nodes)) walk(tree.nodes[k].document);

if (targets.length === 0) {
  console.log("no image fills found");
  process.exit(0);
}

console.log(`${targets.length} image layers:`);
for (const t of targets) console.log(`  ${t.name.padEnd(16)} [${t.id}]  ${t.w}x${t.h}`);

const ids = targets.map((t) => t.id).join(",");
const { images, err } = await api(
  `/images/${FILE}?ids=${encodeURIComponent(ids)}&format=png&scale=${scale}`,
);
if (err) throw new Error(err);

const dir = join(ROOT, outDir);
mkdirSync(dir, { recursive: true });

for (const t of targets) {
  const url = images[t.id];
  if (!url) {
    console.log(`  ! no render for ${t.name}`);
    continue;
  }
  const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
  // Ids are part of the filename because layer names repeat in this file.
  const file = `${t.slug}-${t.id.replace(/[:;]/g, "_")}.png`;
  writeFileSync(join(dir, file), buf);
  console.log(`  ${outDir}/${file}  ${(buf.length / 1024).toFixed(0)} KB`);
}
