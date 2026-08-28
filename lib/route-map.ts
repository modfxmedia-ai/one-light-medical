import routeMapData from "@/content/route-map.json";

export interface RouteMapEntry {
  path: string;
  type: "page" | "post";
  title: string;
  metaDescription: string;
  canonical: string;
  robots: string;
  ogImage: string | null;
  schemaTypes: string[];
  h1: string;
  publishedTime?: string;
  modifiedTime?: string;
}

const entries = routeMapData as RouteMapEntry[];
const byPath = new Map(entries.map((entry) => [entry.path, entry]));

export function getRouteMap(): RouteMapEntry[] {
  return entries;
}

export function getEntryByPath(path: string): RouteMapEntry | undefined {
  return byPath.get(path);
}

export function getPostEntries(): RouteMapEntry[] {
  return entries
    .filter((entry) => entry.type === "post")
    .sort((a, b) => (b.publishedTime ?? "").localeCompare(a.publishedTime ?? ""));
}

/** "/knee-pain/" -> "knee-pain"; "/" -> "home", matching the harvested filenames. */
export function slugForPath(path: string): string {
  return path === "/" ? "home" : path.replace(/^\/|\/$/g, "");
}

export function pathForSlug(slug: string): string {
  return slug === "home" ? "/" : `/${slug}/`;
}
