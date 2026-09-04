import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BlogPost } from "@/components/blog-post";
import { legacyMetadata } from "@/components/legacy-page";
import { getPostEntries, slugForPath } from "@/lib/route-map";

/**
 * All blog posts, which the legacy site serves at the flat root rather than
 * under /blog/. The 13 static page routes sit alongside this segment and win
 * during resolution, so this route only ever handles post slugs.
 */
function postSlugs() {
  return getPostEntries().map((entry) => slugForPath(entry.path));
}

export function generateStaticParams() {
  return postSlugs().map((slug) => ({ slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps<"/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return postSlugs().includes(slug) ? legacyMetadata(slug) : {};
}

export default async function BlogPostPage({ params }: PageProps<"/[slug]">) {
  const { slug } = await params;
  if (!postSlugs().includes(slug)) notFound();

  return <BlogPost slug={slug} />;
}
