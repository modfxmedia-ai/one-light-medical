import type { Metadata } from "next";

import { HomePage } from "@/components/home-page";
import { legacyMetadata } from "@/components/legacy-page";

const SLUG = "home";

export function generateMetadata(): Metadata {
  return legacyMetadata(SLUG);
}

export default function Page() {
  return <HomePage />;
}
