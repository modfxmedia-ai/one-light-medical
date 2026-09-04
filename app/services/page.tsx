import type { Metadata } from "next";

import { ServicesPage } from "@/components/services-page";
import { buildMetadata } from "@/lib/metadata";

export function generateMetadata(): Metadata {
  return buildMetadata("/services/");
}

export default function Page() {
  return <ServicesPage />;
}
