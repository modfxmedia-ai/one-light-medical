import type { Metadata } from "next";

import { LegacyPage, legacyMetadata } from "@/components/legacy-page";

const SLUG = "weight-loss";

export function generateMetadata(): Metadata {
  return legacyMetadata(SLUG);
}

export default function Page() {
  return <LegacyPage slug={SLUG} />;
}
