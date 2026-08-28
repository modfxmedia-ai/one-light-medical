import Link from "next/link";
import type { ReactNode } from "react";

import { toLocalAsset, type MarkdownNode } from "@/lib/markdown";

/** Inline markdown emitted by the harvester: links, bold and italic. */
const INLINE = /\[([^\]]*)\]\(([^)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*/g;

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let cursor = 0;
  let key = 0;

  for (const match of text.matchAll(INLINE)) {
    const start = match.index ?? 0;
    if (start > cursor) nodes.push(text.slice(cursor, start));

    const [, linkText, href, bold, italic] = match;
    if (href !== undefined) {
      const label = linkText?.trim() ? renderInline(linkText) : href;
      nodes.push(
        href.startsWith("/") ? (
          <Link key={key} href={href}>
            {label}
          </Link>
        ) : (
          <a key={key} href={href}>
            {label}
          </a>
        ),
      );
    } else if (bold !== undefined) {
      nodes.push(<strong key={key}>{renderInline(bold)}</strong>);
    } else if (italic !== undefined) {
      nodes.push(<em key={key}>{renderInline(italic)}</em>);
    }

    cursor = start + match[0].length;
    key += 1;
  }

  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
}

function renderNode(node: MarkdownNode, key: string) {
  switch (node.kind) {
    case "heading": {
      const Tag = `h${node.level}` as "h2";
      return <Tag key={key}>{renderInline(node.text)}</Tag>;
    }

    case "paragraph":
      return <p key={key}>{renderInline(node.text)}</p>;

    case "quote":
      return (
        <blockquote key={key}>
          <p>{renderInline(node.text)}</p>
        </blockquote>
      );

    case "list": {
      const Tag = node.ordered ? "ol" : "ul";
      return (
        <Tag key={key} className={node.ordered ? "list-decimal pl-6" : "list-disc pl-6"}>
          {node.items.map((item, index) => (
            <li key={index}>{renderInline(item)}</li>
          ))}
        </Tag>
      );
    }

    case "image":
      return (
        <img
          key={key}
          src={toLocalAsset(node.src)}
          alt={node.alt}
          className="h-auto max-w-full"
        />
      );
  }
}

export function MarkdownBody({ nodes }: { nodes: MarkdownNode[] }) {
  return <>{nodes.map((node, index) => renderNode(node, `${node.kind}-${index}`))}</>;
}
