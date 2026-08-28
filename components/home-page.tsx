import Link from "next/link";
import { Fragment, type CSSProperties } from "react";

import { JsonLd } from "@/components/json-ld";
import { TestimonialDeck } from "@/components/testimonial-deck";
import faqs from "@/content/faqs.json";
import testimonials from "@/content/testimonials.json";
import { getPageSchema } from "@/lib/schema";

// The FAQ copy is ours, so it gets the markup that describes it. Everything the
// legacy pages carried is emitted untouched by getPageSchema alongside this.
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.items.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
};

const REASONS = [
  {
    title: "Comprehensive Pain Relief",
    copy: "Our tailored treatments target a range of conditions, from knee pain to neuropathy, ensuring effective and personalized care.",
    src: "/images/cards/comprehensive-care.webp",
  },
  {
    title: "Non-Surgical Solutions",
    copy: "We specialize in non-invasive therapies like Softwave TRT and spinal decompression, helping you avoid surgery and lengthy recovery times.",
    src: "/images/cards/non-surgical.webp",
  },
  {
    title: "Experienced & Compassionate Team",
    copy: "Our skilled practitioners prioritize your well-being, offering dedicated support and advanced care to help you heal and thrive.",
    src: "/images/cards/care-team.webp",
  },
] as const;

// `grow` is the card's share of the track at rest, matching the widths in the
// Figma frame. Hover and keyboard focus override it (see .svc-track in CSS).
const SERVICES = [
  {
    href: "/auto-injury/",
    title: "Auto Injury Relief",
    copy: "Recover faster from auto-related injuries with targeted therapies.",
    src: "/images/cards/auto-injury.webp",
    grow: 1.37,
  },
  {
    href: "/knee-pain/",
    title: "Knee Pain Care",
    copy: "Experience relief from knee pain with specialized treatments that reduce discomfort and promote healing without surgery.",
    src: "/images/cards/knee-pain.webp",
    grow: 2,
    featured: true,
  },
  {
    href: "/neuropathy/",
    title: "Neuropathy Care",
    copy: "Alleviate nerve pain and improve sensation.",
    src: "/images/cards/neuropathy.webp",
    grow: 1,
  },
  {
    href: "/spinal-decompression/",
    title: "Spinal Decompression",
    copy: "Relieve pressure on spinal discs and ease back pain.",
    src: "/images/cards/spinal-decompression.webp",
    grow: 1,
  },
] as const;

// Figma balances each caption by hand, so the breaks are part of the design
// rather than a consequence of the box width. They collapse on mobile.
const OUTCOMES = [
  {
    value: 85,
    note: [
      "Target Outcome: Up to 85% of",
      "patients report significant pain",
      "reduction without surgery.",
    ],
  },
  {
    value: 90,
    note: [
      "Target Outcome: 90% faster",
      "recovery times using advanced",
      "SoftWave and Red Light",
      "therapies.",
    ],
  },
  {
    value: 78,
    note: [
      "Target Outcome: 78% of our",
      "active patients are 50+ managing",
      "degenerative joint changes and",
      "arthritis.",
    ],
  },
  {
    value: 100,
    note: [
      "Target Outcome: 100%",
      "customized treatment plans",
      "combining IV therapy, weight loss,",
      "and regenerative medicine.",
    ],
  },
] as const;

export function HomePage() {
  return (
    <>
      <JsonLd graphs={[...getPageSchema("/"), faqSchema]} />
      <div className="home">
        <section className="hero">
          <img
            className="hero-art"
            src="/images/homepage-hero.webp"
            alt=""
            width={2880}
            height={1530}
          />
          <div className="hero-copy">
            <h1>
              <span className="hero-lead">Find Lasting</span>
              Relief for Joints,
              <br className="br-lg" /> Pain, and Wellness
            </h1>
            <p>
              At One Light Medical, we provide non-surgical solutions for joint pain, neuropathy, and
              weight loss to help you regain mobility, reduce pain, and reclaim your best life.
            </p>
            <hr className="hero-rule" />
            <p className="hero-actions">
              <Link href="/contact/" className="btn btn-gradient">
                Book An Appointment
              </Link>
              <Link href="/about-us/" className="btn btn-ghost">
                Learn More
              </Link>
            </p>
          </div>
        </section>

        <div className="light-band">
          <section className="commitment" id="services">
            <div className="wrap commitment-head">
              <h2>
                At One Light Medical, we&rsquo;re
                <br className="br-lg" /> committed to providing
                <br className="br-lg" /> compassionate, non-surgical care
                <br className="br-lg" /> that truly makes a difference.
              </h2>
              <p>Trust us to provide the care, expertise, and encouragement you need to thrive.</p>
            </div>

            {/* Widest card stays open by default; hovering or tabbing hands the
                expansion to whichever card the visitor is on. */}
            <ul className="svc-track">
              {SERVICES.map((service) => (
                <li
                  className="svc-card"
                  key={service.href}
                  style={{ "--grow": service.grow } as CSSProperties}
                  data-featured={"featured" in service ? "true" : undefined}
                >
                  <img src={service.src} alt="" width={900} height={1240} />
                  <Link href={service.href}>
                    <span className="svc-badge" aria-hidden="true" />
                    <span className="svc-body">
                      <span className="svc-title">{service.title}</span>
                      <span className="svc-copy">{service.copy}</span>
                      <span className="svc-more">Learn More</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="why">
            <div className="wrap">
              <h2>Why One Light Medical Is the Right Choice for Your Pain Relief Journey</h2>
              <div className="reason-grid">
                {REASONS.map((reason) => (
                  <article className="reason" key={reason.title}>
                    <img src={reason.src} alt="" width={1200} height={780} />
                    <div>
                      <h3>{reason.title}</h3>
                      <p>{reason.copy}</p>
                    </div>
                  </article>
                ))}
              </div>
              <p className="why-actions">
                <Link href="/contact/" className="btn btn-gradient">
                  Book An Appointment
                </Link>
                <Link href="/#services" className="btn btn-aqua">
                  View All Services
                </Link>
              </p>
            </div>
          </section>
        </div>

        <section className="restore">
          <img
            className="restore-art"
            src="/images/restore-banner.webp"
            alt=""
            width={2132}
            height={738}
          />
          <img className="restore-mark" src="/images/logos/white-logo.png" alt="" aria-hidden="true" />
          <div className="restore-copy">
            <h2>
              Restore, Revive, Reclaim
              <br className="br-lg" /> Your Health
            </h2>
            <p>
              At One Light Medical, we specialize in non-surgical, natural treatments that provide
              lasting relief and promote whole-body wellness. Our advanced therapies go beyond
              masking symptoms, targeting the root causes of pain to support real healing and
              improved mobility. With a compassionate team dedicated to your well-being, we’re here
              to help you regain control over your health and live a pain-free, vibrant life.
            </p>
            <p className="restore-actions">
              <Link href="/contact/" className="btn btn-gradient">
                Book An Appointment
              </Link>
              <Link href="/about-us/" className="btn btn-ghost">
                Learn More
              </Link>
            </p>
          </div>
        </section>

        <section className="outcomes">
          {/* One shared stroke gradient for all four dials -- SVG can't inherit a
              CSS gradient onto a stroke, so it lives in a def the dials point at. */}
          <svg className="outcomes-defs" aria-hidden="true" focusable="false">
            <defs>
              <linearGradient id="dial-stroke" x1="0.1" y1="0.92" x2="0.86" y2="0.08">
                <stop offset="0" stopColor="#0c1c46" />
                <stop offset="0.55" stopColor="#233b93" />
                <stop offset="1" stopColor="#3450b8" />
              </linearGradient>
            </defs>
          </svg>

          <div className="wrap outcomes-head">
            <h2>
              Restoring Mobility &amp; Quality of
              <br className="br-lg" /> Life Through Integrated Care
            </h2>
            <p>
              By combining non-surgical regenerative therapies with functional wellness, we help
              adults over
              <br className="br-lg" /> 50 address the root cause of chronic joint pain and regain
              active independence.
            </p>
          </div>

          <ul className="dial-row">
            {OUTCOMES.map((outcome) => (
              <li className="dial" key={outcome.value}>
                {/* Two semicircular arcs rather than a <circle>, so the sweep
                    provably starts at 12 o'clock and runs clockwise. pathLength
                    normalises the circumference to 100, letting the dash array be
                    the percentage itself. Rotating a <circle> instead would drag
                    the stroke gradient round with it. */}
                <svg className="dial-arc" viewBox="0 0 100 100" aria-hidden="true">
                  <circle className="dial-track" cx="50" cy="50" r="47.5" />
                  <path
                    className="dial-progress"
                    d="M50 2.5A47.5 47.5 0 0 1 50 97.5A47.5 47.5 0 0 1 50 2.5"
                    pathLength={100}
                    strokeDasharray={`${outcome.value} 100`}
                  />
                </svg>
                <div className="dial-face">
                  <span className="dial-value">{outcome.value}%</span>
                  <span className="dial-note">
                    {outcome.note.map((line, index) => (
                      <Fragment key={line}>
                        {index > 0 && <br className="br-lg" />}
                        {index > 0 ? ` ${line}` : line}
                      </Fragment>
                    ))}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="testimonials" id="Testimonials">
          <div className="wrap testimonials-head">
            <h2>
              What They’re Talking
              <br className="br-lg" /> About Our Center?
            </h2>
            <p>
              Dozens of stories, in their own words, wheelchairs left behind, migraines gone,
              medications reduced, lives reclaimed.
            </p>
          </div>
          <TestimonialDeck items={testimonials.items} />
        </section>

        <section className="faq">
          <div className="wrap">
            <h2>Frequently Asked Questions</h2>
            {/* Native disclosure widgets: the answers stay in the document for
                crawlers and assistive tech whether or not a row is open. */}
            <ul className="faq-list">
              {faqs.items.map((faq, index) => (
                <li key={faq.q}>
                  <details className="faq-item" open={index === 0}>
                    <summary>
                      <span className="faq-q">{faq.q}</span>
                      <span className="faq-mark" aria-hidden="true" />
                    </summary>
                    <p>{faq.a}</p>
                  </details>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="closer">
          <img className="closer-art" src="/images/closer-couple.webp" alt="" width={1969} height={799} />
          <div className="closer-panel">
            <h2>
              Ready to Take the Next Step Toward
              <br className="br-lg" /> a Healthier You?
            </h2>
            <p>
              We provide an integrative approach to our chiropractic services to get you back on the
              path of a pain free life. Get started transforming your health today with One Light
              Medical
            </p>
            <Link href="/contact/" className="btn closer-btn">
              Book An Appointment
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
