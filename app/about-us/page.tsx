import type { Metadata } from "next";

import { AboutPage } from "@/components/about-page";
import { legacyMetadata } from "@/components/legacy-page";

const SLUG = "about-us";

export function generateMetadata(): Metadata {
  return legacyMetadata(SLUG);
}

export default function Page() {
  return <AboutPage />;
}
