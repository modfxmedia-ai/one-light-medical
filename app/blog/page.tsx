import type { Metadata } from "next";
import Link from "next/link";

import { LegacyPage, legacyMetadata } from "@/components/legacy-page";
import { getPostEntries } from "@/lib/route-map";

const SLUG = "blog";

export function generateMetadata(): Metadata {
  return legacyMetadata(SLUG);
}

function formatDate(value?: string) {
  if (!value) return null;
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Blog index only. The 48 posts live at the flat root, matching the legacy site,
 * and are served by app/[slug]/page.tsx rather than nested under /blog/.
 */
export default function BlogIndexPage() {
  const posts = getPostEntries();

  return (
    <LegacyPage slug={SLUG}>
      <ul>
        {posts.map((post) => {
          const published = formatDate(post.publishedTime);
          return (
            <li key={post.path}>
              <h2>
                <Link href={post.path}>{post.h1}</Link>
              </h2>
              <p>{post.metaDescription}</p>
              {published ? (
                <p>
                  <time dateTime={post.publishedTime}>{published}</time>
                </p>
              ) : null}
            </li>
          );
        })}
      </ul>
    </LegacyPage>
  );
}
