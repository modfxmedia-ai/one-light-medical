import type { Metadata } from "next";

import { PaperworkPage } from "@/components/paperwork-page";
import { legacyMetadata } from "@/components/legacy-page";

const SLUG = "patient-paperwork";

export function generateMetadata(): Metadata {
  return legacyMetadata(SLUG);
}

export default function Page() {
  return <PaperworkPage />;
}
