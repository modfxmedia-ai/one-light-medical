import type { Metadata } from "next";

import { legacyMetadata } from "@/components/legacy-page";
import { ServicePage } from "@/components/service-page";
import { SERVICES } from "@/content/services";

export function generateMetadata(): Metadata {
  return legacyMetadata("spinal-decompression");
}

export default function Page() {
  return <ServicePage service={SERVICES["spinal-decompression"]} />;
}
