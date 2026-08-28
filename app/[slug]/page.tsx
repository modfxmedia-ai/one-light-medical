import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LegacyPage, legacyMetadata } from "@/components/legacy-page";
import { getPostEntries, slugForPath } from "@/lib/route-map";

/**
 * All 48 blog posts, which the legacy site serves at the flat root rather than
 * under /blog/. The 13 static page routes sit alongside this segment and win
 * during resolution, so this route only ever handles post slugs.
 */
const POST_SLUGS = getPostEntries().map((entry) => slugForPath(entry.path));

export function generateStaticParams() {
  return POST_SLUGS.map((slug) => ({ slug }));
}

// Anything outside the harvested post list must 404 rather than be rendered.
export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps<"/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return POST_SLUGS.includes(slug) ? legacyMetadata(slug) : {};
}

export default async function BlogPostPage({ params }: PageProps<"/[slug]">) {
  const { slug } = await params;
  if (!POST_SLUGS.includes(slug)) notFound();

  return <LegacyPage slug={slug} />;
}
