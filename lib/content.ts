import routesData from "@/content/routes.json";

/**
 * Access to the full harvest in content/routes.json.
 *
 * Page copy and head metadata come from content/pages/*.md and
 * content/route-map.json. This file is the source for the one thing neither of
 * those can express: the verbatim JSON-LD graph captured from each legacy page.
 */

export type RouteType = "home" | "service" | "page" | "post" | "blog-index";

export type ContentBlock =
  | {
      type: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "blockquote";
      html: string;
      text: string;
      anchorId?: string;
    }
  | { type: "ul" | "ol"; items: string[] }
  | { type: "img"; src: string; alt: string; width?: number; height?: number };

export interface RouteRecord {
  url: string;
  path: string;
  slug: string;
  sitemap: "page" | "post";
  lastmod: string | null;
  type: RouteType;
  meta: {
    title?: string | null;
    description?: string;
    robots?: string;
    canonical?: string | null;
    openGraph: Record<string, string>;
    twitter: Record<string, string>;
    other: Record<string, string>;
  };
  /** Captured verbatim so the legacy graph is reproduced exactly. */
  jsonLd: unknown[];
  h1: string | null;
  dates: { datePublished?: string; dateModified?: string };
  blocks: ContentBlock[];
  images: { src: string; alt: string; width?: number; height?: number }[];
  internalLinks: { href: string; text: string }[];
}

const routes = routesData as unknown as RouteRecord[];
const byPath = new Map(routes.map((route) => [route.path, route]));

export function getRouteByPath(path: string): RouteRecord | undefined {
  return byPath.get(path);
}
