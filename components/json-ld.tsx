/**
 * Emits the legacy structured data verbatim.
 *
 * Each legacy page carries its own complete graph (Organization + WebSite +
 * WebPage, plus Service or BlogPosting where applicable), so the captured
 * blocks are re-serialized untouched rather than rebuilt from parts.
 *
 * The payload is harvested from the old site, so "<" is escaped to stop any
 * stray markup in the source data from closing the script element early.
 */
function serialize(graph: unknown): string {
  return JSON.stringify(graph).replace(/</g, "\\u003c");
}

export function JsonLd({ graphs }: { graphs: unknown[] }) {
  return (
    <>
      {graphs.map((graph, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serialize(graph) }}
        />
      ))}
    </>
  );
}
