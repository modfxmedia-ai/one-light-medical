import Link from "next/link";

import { JsonLd } from "@/components/json-ld";
import { ServiceMotion } from "@/components/service-motion";
import type { ServiceContent } from "@/content/services";
import { BUSINESS, SITE_URL } from "@/lib/site";
import { getPageSchema } from "@/lib/schema";

function pageSchema(service: ServiceContent) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}${service.path}#webpage`,
        url: `${SITE_URL}${service.path}`,
        name: service.seoName,
        description: service.seoDescription,
      },
      {
        "@type": "Service",
        name: service.h1,
        url: `${SITE_URL}${service.path}`,
        provider: { "@type": "MedicalClinic", name: BUSINESS.name },
        areaServed: `${BUSINESS.addressLocality}, ${BUSINESS.addressRegion}`,
      },
    ],
  };
}

export function ServicePage({ service }: { service: ServiceContent }) {
  const graphs = service.legacy ? getPageSchema(service.path) : [pageSchema(service)];

  return (
    <div className="svc-page">
      <JsonLd graphs={graphs} />

      <section className="svc-hero">
        <div className="wrap svc-hero-grid">
          <div className="svc-hero-copy">
            <p className="svc-kicker">
              {service.kicker} · {BUSINESS.addressLocality}, {BUSINESS.addressRegion}
            </p>
            <h1>{service.h1}</h1>
            <p className="svc-lead">{service.lead}</p>
            <p className="svc-actions">
              <Link href="/contact/" className="btn btn-gradient">
                Book An Appointment
              </Link>
              <Link href="#how-it-works" className="btn btn-ghost">
                How it works
              </Link>
            </p>
          </div>
          <figure className="svc-hero-figure">
            <img src={service.src} alt={service.alt} width={1080} height={1080} />
            <ul className="svc-tags">
              {service.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          </figure>
        </div>
      </section>

      <section className="svc-snapshot" aria-label="Clinic snapshot">
        <div className="wrap">
          <ServiceMotion stats={service.stats} />
        </div>
      </section>

      <section className="svc-explain">
        <div className="wrap svc-explain-grid">
          <div className="svc-prose">
            <p className="svc-kicker svc-kicker-brand">Understanding</p>
            <h2>{service.understandingTitle}</h2>
            {service.intro.map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
            {service.understanding.map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
          </div>
          <aside className="svc-facts">
            <dl>
              <div>
                <dt>Setting</dt>
                <dd>Amarillo clinic</dd>
              </div>
              <div>
                <dt>First step</dt>
                <dd>Candidacy exam</dd>
              </div>
              <div>
                <dt>Approach</dt>
                <dd>Non-surgical</dd>
              </div>
              <div>
                <dt>Team</dt>
                <dd>Named clinicians</dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>

      <section className="svc-qualify">
        <div className="wrap">
          <header className="svc-section-head">
            <p className="svc-kicker">Candidacy</p>
            <h2>Who this is for</h2>
          </header>
          <div className="svc-qualify-grid">
            <div>
              <p className="svc-kicker">This is probably you</p>
              <h3>{service.whoTitle}</h3>
              <ol>
                {service.who.map((item, index) => (
                  <li key={item}>
                    <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                    {item}
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <p className="svc-kicker">Often discussed for</p>
              <h3>{service.symptomsTitle}</h3>
              <ol>
                {service.symptoms.map((item, index) => (
                  <li key={item}>
                    <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                    {item}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section className="svc-plan">
        <div className="wrap">
          <header className="svc-section-head">
            <p className="svc-kicker svc-kicker-brand">The plan</p>
            <h2>{service.optionsTitle}</h2>
          </header>
          <ol className="svc-plan-list" data-count={service.options.length}>
            {service.options.map((item, index) => (
              <li key={item}>
                <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <p>{item}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="svc-how" id="how-it-works">
        <div className="wrap">
          <header className="svc-section-head">
            <p className="svc-kicker svc-kicker-brand">Just four steps</p>
            <h2>How it works</h2>
            <p>
              Between where you are now and a plan that fits your joints, your history, and your
              goals.
            </p>
          </header>
          <ol className="svc-rail">
            {service.steps.map((step, index) => (
              <li key={step.title}>
                <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <h3>{step.title}</h3>
                <p>{step.copy}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {service.extraTitle && service.extra ? (
        <section className="svc-extra">
          <div className="wrap svc-extra-grid">
            <div className="svc-extra-copy">
              <p className="svc-kicker svc-kicker-brand">Paired care</p>
              <h2>{service.extraTitle}</h2>
              {service.extra.map((paragraph) => (
                <p key={paragraph.slice(0, 40)}>{paragraph}</p>
              ))}
              {service.extraHref && service.extraLabel ? (
                <Link href={service.extraHref} className="btn btn-gradient">
                  {service.extraLabel}
                </Link>
              ) : null}
            </div>
            {service.extraImage && service.extraImageAlt ? (
              <figure className="svc-extra-figure">
                <img src={service.extraImage} alt={service.extraImageAlt} />
              </figure>
            ) : null}
          </div>
        </section>
      ) : null}

      <nav className="svc-related" aria-label="Related services">
        <div className="wrap">
          <header className="svc-section-head">
            <p className="svc-kicker svc-kicker-brand">Keep exploring</p>
            <h2>Related services</h2>
          </header>
          <ol>
            {service.related.map((item, index) => (
              <li key={item.href}>
                <Link href={item.href}>
                  <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/services/">
                <span aria-hidden="true">{String(service.related.length + 1).padStart(2, "0")}</span>
                All services
              </Link>
            </li>
          </ol>
        </div>
      </nav>

      <section className="svc-cta">
        <div className="wrap svc-cta-grid">
          <div>
            <h2>{service.closerTitle}</h2>
            <p>{service.closer}</p>
            <Link href="/contact/" className="btn btn-gradient">
              Book An Appointment
            </Link>
          </div>
          <div className="svc-cta-contact">
            <p className="svc-kicker">Call the clinic</p>
            <a href={BUSINESS.phoneHref}>{BUSINESS.phone}</a>
            <p>
              {BUSINESS.streetAddress}
              <br />
              {BUSINESS.addressLocality}, {BUSINESS.addressRegion} {BUSINESS.postalCode}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
