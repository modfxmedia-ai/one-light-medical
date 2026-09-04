import type { Metadata } from "next";

import { BlogPage } from "@/components/blog-page";
import { legacyMetadata } from "@/components/legacy-page";

export function generateMetadata(): Metadata {
  return legacyMetadata("blog");
}

export default function Page() {
  return <BlogPage />;
}
