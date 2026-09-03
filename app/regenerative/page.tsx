import type { Metadata } from "next";

import { RegenerativePage } from "@/components/regenerative-page";
import { buildMetadata } from "@/lib/metadata";

export function generateMetadata(): Metadata {
  return buildMetadata("/regenerative/");
}

export default function Page() {
  return <RegenerativePage />;
}
