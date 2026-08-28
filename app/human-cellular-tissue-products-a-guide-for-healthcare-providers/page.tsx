import type { Metadata } from "next";

import { LegacyPage, legacyMetadata } from "@/components/legacy-page";

const SLUG = "human-cellular-tissue-products-a-guide-for-healthcare-providers";

export function generateMetadata(): Metadata {
  return legacyMetadata(SLUG);
}

export default function Page() {
  return <LegacyPage slug={SLUG} />;
}
