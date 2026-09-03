import { JsonLd } from "@/components/json-ld";
import { RegenerativePillars } from "@/components/regenerative-pillars";
import { SITE_URL } from "@/lib/site";

const pageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${SITE_URL}/regenerative/#webpage`,
  url: `${SITE_URL}/regenerative/`,
  name: "Regenerative Medicine in Amarillo, TX | One Light Medical",
  description:
    "Stem cell, Wharton's Jelly, and exosome options at One Light Medical in Amarillo. Honest candidacy, clinic-based regenerative care.",
};

export function RegenerativePage() {
  return (
    <>
      <JsonLd graphs={[pageSchema]} />
      <RegenerativePillars titleAs="h1" />
    </>
  );
}
