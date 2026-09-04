import type { ReactNode } from "react";

import { BUSINESS } from "@/lib/site";

type LegalPageProps = {
  kicker: string;
  title: string;
  updated: string;
  children: ReactNode;
};

export function LegalPage({ kicker, title, updated, children }: LegalPageProps) {
  return (
    <div className="legal">
      <section className="legal-hero">
        <div className="wrap">
          <p className="legal-kicker">{kicker}</p>
          <h1>{title}</h1>
          <p className="legal-updated">Last updated {updated}</p>
        </div>
      </section>
      <section className="legal-body">
        <div className="wrap legal-prose">{children}</div>
      </section>
    </div>
  );
}

export function LegalClinicClose() {
  return (
    <>
      <h2>Questions</h2>
      <p>
        If something on this page is unclear, call the clinic at{" "}
        <a href={BUSINESS.phoneHref}>{BUSINESS.phone}</a> or email{" "}
        <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>. We are at{" "}
        {BUSINESS.streetAddress}, {BUSINESS.addressLocality}, {BUSINESS.addressRegion}{" "}
        {BUSINESS.postalCode}.
      </p>
    </>
  );
}
