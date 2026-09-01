import type { Metadata } from "next";

import { ContactPage } from "@/components/contact-page";
import { legacyMetadata } from "@/components/legacy-page";

const SLUG = "contact";

export function generateMetadata(): Metadata {
  return legacyMetadata(SLUG);
}

export default function Page() {
  return <ContactPage />;
}
