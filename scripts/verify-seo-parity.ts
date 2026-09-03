/**
 * Compares the rebuilt site against live onelightmedical.com, route by route.
 *
 * For each of the harvested routes it fetches the live URL and the same path on
 * a locally running server, then compares the fields that carry ranking signal:
 * title, meta description, canonical, H1 and the set of JSON-LD @types.
 *
 * Usage:
 *   npm run build && npm start -- --port 3100     # in one shell
 *   npm run verify:seo                            # in another
 *
 * Env:
 *   LOCAL_BASE   local origin to test (default http://localhost:3100)
 *   CONCURRENCY  parallel route checks (default 6)
 *
 * Exits non-zero when any route differs, so it can gate a deploy.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const LIVE_BASE = "https://onelightmedical.com";
const LOCAL_BASE = process.env.LOCAL_BASE ?? "http://localhost:3100";
const CONCURRENCY = Number(process.env.CONCURRENCY ?? 6);

/**
 * The rebuild emits the MedicalOrganization block on every page, where the
 * legacy site served it on the home page only. Those are the only @types the
 * local pages may add; anything else, in either direction, is a failure.
 */
const SITEWIDE_ADDED_TYPES = new Set([
  "MedicalOrganization",
  "OfferCatalog",
  "Offer",
  "PostalAddress",
  "Service",
]);

/**
 * Types a single route may add on top of those, because the rebuild gives it
 * content the legacy page never had. Scoped per path so an FAQPage appearing
 * somewhere unintended still fails.
 */
const ROUTE_ADDED_TYPES: Record<string, Set<string>> = {
  // The redesigned home page carries its own FAQ section.
  "/": new Set(["FAQPage", "Question", "Answer"]),
};

/**
 * Text fields a route is allowed to diverge from live on, with the expected new
 * value. Declaring the value rather than just waiving the field means an
 * accidental third value still fails, so the check keeps its teeth.
 *
 * Every entry here is a deliberate content decision, not a rebuild artefact.
 */
/** New routes that do not exist on the live site yet. Compared locally only. */
const LOCAL_ONLY_PATHS = new Set(["/regenerative/"]);

const ROUTE_ALLOWED_TEXT: Record<string, Record<string, string>> = {
  // Homepage now leads with regenerative medicine. Title, description and H1
  // all diverge from the indexed live page by client direction.
  "/": {
    title: "One Light Medical | Regenerative Medicine in Amarillo, TX",
    description:
      "Regenerative medicine in Amarillo, TX — non-surgical care for joint pain and mobility. Stem cell therapy is one option within a broader regenerative plan. Book a consultation.",
    h1: "Find Lasting Regenerative Medicine for Joint Pain",
  },
};

interface RouteMapEntry {
  path: string;
  type: string;
}

interface Extracted {
  title: string | null;
  description: string | null;
  canonical: string | null;
  h1: string | null;
  schemaTypes: string[];
}

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  ndash: "\u2013",
  mdash: "\u2014",
  hellip: "\u2026",
  lsquo: "\u2018",
  rsquo: "\u2019",
  ldquo: "\u201c",
  rdquo: "\u201d",
};

function decodeEntities(value: string): string {
  return value.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (match, ref: string) => {
    if (ref.startsWith("#")) {
      const code = ref[1] === "x" || ref[1] === "X"
        ? parseInt(ref.slice(2), 16)
        : parseInt(ref.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : match;
    }
    return NAMED_ENTITIES[ref.toLowerCase()] ?? match;
  });
}

/** Collapse whitespace and decode entities so the two sources compare fairly. */
function normalize(value: string | null): string | null {
  if (value === null) return null;
  return decodeEntities(value).replace(/\s+/g, " ").trim();
}

function stripTags(html: string): string {
  return html.replace(/<[^>]*>/g, " ");
}

/** Parse the attributes of a single tag into a map. */
function attributes(tag: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const pattern = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'>]+))/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(tag)) !== null) {
    attrs[match[1].toLowerCase()] = match[3] ?? match[4] ?? match[5] ?? "";
  }
  return attrs;
}

function metaContent(html: string, key: "name" | "property", value: string): string | null {
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    const attrs = attributes(tag);
    if (attrs[key]?.toLowerCase() === value) return attrs.content ?? null;
  }
  return null;
}

function canonicalHref(html: string): string | null {
  for (const tag of html.match(/<link\b[^>]*>/gi) ?? []) {
    const attrs = attributes(tag);
    if (attrs.rel?.toLowerCase().split(/\s+/).includes("canonical")) return attrs.href ?? null;
  }
  return null;
}

/** Every @type appearing anywhere in the page's JSON-LD, deduped and sorted. */
function schemaTypes(html: string): string[] {
  const found = new Set<string>();

  const collect = (node: unknown): void => {
    if (Array.isArray(node)) {
      node.forEach(collect);
      return;
    }
    if (typeof node !== "object" || node === null) return;

    const record = node as Record<string, unknown>;
    const type = record["@type"];
    if (typeof type === "string") found.add(type);
    else if (Array.isArray(type)) type.forEach((t) => typeof t === "string" && found.add(t));

    Object.values(record).forEach(collect);
  };

  const pattern = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(html)) !== null) {
    try {
      collect(JSON.parse(match[1].trim()));
    } catch {
      found.add("!!unparseable-json-ld");
    }
  }
  return [...found].sort();
}

function extract(html: string): Extracted {
  const head = html.split(/<\/head>/i)[0] ?? html;
  const title = head.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? null;
  const h1 = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? null;

  return {
    title: normalize(title),
    description: normalize(metaContent(head, "name", "description")),
    canonical: normalize(canonicalHref(head)),
    h1: normalize(h1 === null ? null : stripTags(h1)),
    schemaTypes: schemaTypes(html),
  };
}

async function fetchHtml(url: string): Promise<{ html?: string; error?: string }> {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetch(url, {
        redirect: "follow",
        headers: {
          "user-agent": "one-light-medical-seo-parity-check",
          accept: "text/html",
        },
        signal: AbortSignal.timeout(30_000),
      });
      if (!response.ok) {
        if (attempt === 0) continue;
        return { error: `HTTP ${response.status}` };
      }
      return { html: await response.text() };
    } catch (error) {
      if (attempt === 1) return { error: error instanceof Error ? error.message : String(error) };
    }
  }
  return { error: "unreachable" };
}

interface Field {
  label: string;
  ok: boolean;
  detail?: string;
  note?: string;
}

interface Result {
  path: string;
  fields: Field[];
  notes: string[];
  failures: string[];
}

function compareText(
  label: string,
  live: string | null,
  local: string | null,
  path?: string,
): Field {
  if (live === local) return { label, ok: true };

  const expected = path ? ROUTE_ALLOWED_TEXT[path]?.[label] : undefined;
  if (expected !== undefined && normalize(expected) === local) {
    return { label, ok: true, note: `${label} intentionally changed from live` };
  }

  return {
    label,
    ok: false,
    detail: `${label}\n      live:  ${live ?? "(missing)"}\n      local: ${local ?? "(missing)"}`,
  };
}

function compareSchema(path: string, live: string[], local: string[]): { field: Field; note?: string } {
  const liveSet = new Set(live);
  const localSet = new Set(local);
  const allowed = ROUTE_ADDED_TYPES[path];
  const missing = live.filter((t) => !localSet.has(t));
  const added = local.filter((t) => !liveSet.has(t));
  const unexpected = added.filter((t) => !SITEWIDE_ADDED_TYPES.has(t) && !allowed?.has(t));

  if (missing.length === 0 && unexpected.length === 0) {
    return {
      field: { label: "schema", ok: true },
      note: added.length > 0 ? `adds ${added.join(", ")} (sitewide MedicalOrganization block)` : undefined,
    };
  }

  const parts: string[] = [];
  if (missing.length > 0) parts.push(`missing from local: ${missing.join(", ")}`);
  if (unexpected.length > 0) parts.push(`unexpected in local: ${unexpected.join(", ")}`);
  return { field: { label: "schema", ok: false, detail: `schema\n      ${parts.join("\n      ")}` } };
}

async function checkRoute(path: string): Promise<Result> {
  if (LOCAL_ONLY_PATHS.has(path)) {
    const local = await fetchHtml(`${LOCAL_BASE}${path}`);
    if (local.error) {
      return {
        path,
        fields: [],
        notes: ["new route, not on live site"],
        failures: [`local unreachable (${local.error})`],
      };
    }
    return {
      path,
      fields: [{ label: "local", ok: true }],
      notes: ["new route, not compared to live"],
      failures: [],
    };
  }

  const [live, local] = await Promise.all([
    fetchHtml(`${LIVE_BASE}${path}`),
    fetchHtml(`${LOCAL_BASE}${path}`),
  ]);

  if (live.error || local.error) {
    const which = [
      live.error ? `live unreachable (${live.error})` : null,
      local.error ? `local unreachable (${local.error})` : null,
    ].filter(Boolean) as string[];
    return { path, fields: [], notes: [], failures: which };
  }

  const a = extract(live.html!);
  const b = extract(local.html!);
  const schema = compareSchema(path, a.schemaTypes, b.schemaTypes);

  const fields: Field[] = [
    compareText("title", a.title, b.title, path),
    compareText("description", a.description, b.description, path),
    compareText("canonical", a.canonical, b.canonical, path),
    compareText("h1", a.h1, b.h1, path),
    schema.field,
  ];

  return {
    path,
    fields,
    notes: [schema.note, ...fields.map((f) => f.note)].filter(Boolean) as string[],
    failures: fields.filter((f) => !f.ok).map((f) => f.detail ?? f.label),
  };
}

async function mapWithLimit<T, R>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let cursor = 0;

  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await worker(items[index]);
    }
  });

  await Promise.all(runners);
  return results;
}

function shorten(path: string, width: number): string {
  return path.length <= width ? path.padEnd(width) : `${path.slice(0, width - 1)}…`;
}

async function main(): Promise<void> {
  const routeMap = JSON.parse(
    readFileSync(join(ROOT, "content", "route-map.json"), "utf8"),
  ) as RouteMapEntry[];
  const paths = routeMap.map((entry) => entry.path);

  console.log(`Comparing ${paths.length} routes: ${LIVE_BASE} vs ${LOCAL_BASE}\n`);

  const width = 52;
  const columns = ["title", "desc", "canon", "h1", "schema"];
  console.log(`${"route".padEnd(width)}  ${columns.map((c) => c.padEnd(6)).join(" ")} `);
  console.log("-".repeat(width + columns.length * 7 + 2));

  const results = await mapWithLimit(paths, CONCURRENCY, async (path) => {
    const result = await checkRoute(path);
    const cells =
      result.fields.length === 0
        ? columns.map(() => "  ?  ".padEnd(6)).join(" ")
        : result.fields.map((f) => (f.ok ? "  ok  " : " FAIL ").padEnd(6)).join(" ");
    console.log(`${shorten(path, width)}  ${cells} ${result.failures.length ? " <-" : ""}`);
    return result;
  });

  const failed = results.filter((r) => r.failures.length > 0);
  const noted = results.filter((r) => r.notes.length > 0);

  console.log();
  if (noted.length > 0) {
    const sample = noted[0].notes[0];
    console.log(`note: ${noted.length}/${paths.length} routes ${sample}`);
    console.log("      This is the intended sitewide block, not a difference in page content.\n");
  }

  if (failed.length === 0) {
    console.log(`${paths.length}/${paths.length} routes match`);
    return;
  }

  console.log(`${paths.length - failed.length}/${paths.length} routes match — ${failed.length} differ:\n`);
  for (const result of failed) {
    console.log(`  ${result.path}`);
    for (const failure of result.failures) console.log(`    - ${failure}`);
    console.log();
  }
  process.exitCode = 1;
}

await main();
