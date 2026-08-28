import type { MetadataRoute } from "next";

import { getRouteMap } from "@/lib/route-map";
import { SITE_URL } from "@/lib/site";

/**
 * Generated from content/route-map.json, so adding a route to the harvest is
 * enough to list it here. This file should never be edited to add URLs.
 *
 * Paths in the route map already carry their trailing slash, which is the form
 * indexed today, so they are concatenated rather than normalized.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return getRouteMap().map((entry) => {
    const lastModified = entry.modifiedTime ?? entry.publishedTime;

    return {
      url: `${SITE_URL}${entry.path}`,
      ...(lastModified ? { lastModified: new Date(lastModified) } : {}),
    };
  });
}
