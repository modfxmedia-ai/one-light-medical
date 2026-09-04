import type { Metadata } from "next";

import { legacyMetadata } from "@/components/legacy-page";
import { ServicePage } from "@/components/service-page";
import { SERVICES } from "@/content/services";

export function generateMetadata(): Metadata {
  return legacyMetadata("knee-pain");
}

export default function Page() {
  return <ServicePage service={SERVICES["knee-pain"]} />;
}
