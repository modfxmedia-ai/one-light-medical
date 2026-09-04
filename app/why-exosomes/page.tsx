import type { Metadata } from "next";

import { ServicePage } from "@/components/service-page";
import { SERVICES } from "@/content/services";
import { buildMetadata } from "@/lib/metadata";

export function generateMetadata(): Metadata {
  return buildMetadata("/why-exosomes/");
}

export default function Page() {
  return <ServicePage service={SERVICES["why-exosomes"]} />;
}
