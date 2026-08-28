import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/json-ld";
import { MarkdownBody } from "@/components/markdown-body";
import { loadPage } from "@/lib/markdown";
import { buildMetadata } from "@/lib/metadata";
import { pathForSlug } from "@/lib/route-map";
import { getPageSchema } from "@/lib/schema";

/** Head tags for a legacy route, resolved from content/route-map.json by path. */
export function legacyMetadata(slug: string): Metadata {
  return buildMetadata(pathForSlug(slug));
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

export function LegacyPage({ slug, children }: { slug: string; children?: React.ReactNode }) {
  const document = loadPage(slug);
  if (!document) notFound();

  const { frontmatter } = document;
  const published = formatDate(frontmatter.publishedTime);
  const modified = formatDate(frontmatter.modifiedTime);

  return (
    <>
      <JsonLd graphs={getPageSchema(pathForSlug(slug))} />
      <article>
        <h1>{frontmatter.h1}</h1>

        {frontmatter.type === "post" && published ? (
          <p>
            Published <time dateTime={frontmatter.publishedTime}>{published}</time>
            {modified && modified !== published ? (
              <>
                {" · Updated "}
                <time dateTime={frontmatter.modifiedTime}>{modified}</time>
              </>
            ) : null}
          </p>
        ) : null}

        <MarkdownBody nodes={document.nodes} />
        {children}
      </article>
    </>
  );
}
