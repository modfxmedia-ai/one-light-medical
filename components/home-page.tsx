import Link from "next/link";

import { JsonLd } from "@/components/json-ld";
import { OutcomeDials } from "@/components/outcome-dials";
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
    copy: "Our tailored treatments target a range of conditions, from knee and hip pain to complex joint degeneration.",
    src: "/images/home/why-comprehensive-pain-relief.webp",
    alt: "An older couple sitting close together and smiling",
  },
  {
    title: "Non-Surgical Solutions",
    copy: "We specialize in non-invasive therapies like Stem cell therapy, SoftWave, and spinal decompression",
    src: "/images/home/why-non-surgical-solutions.webp",
    alt: "A clinician examining a patient's knee",
  },
  {
    title: "Experienced & Compassionate Team",
    copy: "Our skilled practitioners prioritize your well-being, offering dedicated support and advanced care to help you heal and thrive.",
    src: "/images/home/why-experienced-team.webp",
    alt: "Two One Light Medical practitioners in the clinic",
  },
] as const;

/* The frame draws these four cards at equal widths, so that is the resting
   state. The hover and focus expansion in .svc-track is kept from the previous
   build: it changes nothing at rest and gives the copy room to be read. */
const SERVICES = [
  {
    href: "/knee-pain/",
    title: "Stem Cell Therapy for Joint Pain",
    copy: "Advanced cellular treatments to target the root cause of joint pain and restore long-term mobility.",
    src: "/images/home/card-stem-cell-therapy.webp",
    alt: "A clinician preparing an injection at a patient's knee",
  },
  {
    href: "/red-light-therapy/",
    // Figma reads "argeted"; the missing capital T is a typo in the design.
    copy: "Targeted light energy to boost cellular function, lower inflammation, and support joint recovery.",
    title: "Red Light Therapy",
    src: "/images/home/card-red-light-therapy.webp",
    alt: "A red light therapy bed in treatment",
  },
  {
    href: "/spinal-decompression/",
    title: "Spinal Decompression",
    copy: "Relieve pressure on spinal discs and ease back pain",
    src: "/images/home/card-spinal-decompression.webp",
    alt: "A practitioner's hands assessing a patient's spine",
  },
  {
    href: "/softwave-trt-treatment/",
    title: "SoftWave Therapy",
    copy: "Non-invasive acoustic wave therapy to stimulate natural tissue healing and reduce joint discomfort.",
    src: "/images/home/card-softwave-therapy.webp",
    alt: "Close-up of a practitioner's hands cupped together",
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
            src="/images/home/hero-stem-cell.webp"
            alt=""
            width={1700}
            height={1187}
          />
          <div className="hero-copy">
            <h1>
              <span className="hero-lead">Find Lasting</span>
              Stem Cell Therapy
              <br className="br-lg" /> for Joint Pain
            </h1>
            <p>
              At One Light Medical, we provide advanced, non-surgical stem cell therapies to target
              root-cause joint pain, restore mobility, and help you reclaim an active, pain-free life
              without surgery.
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
          <img
            className="light-band-art"
            src="/images/home/services-backdrop.webp"
            alt=""
            width={2907}
            height={1937}
          />

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

            {/* Equal at rest, per the frame; hovering or tabbing hands the
                expansion to whichever card the visitor is on. */}
            <ul className="svc-track">
              {SERVICES.map((service) => (
                <li className="svc-card" key={service.href}>
                  <img src={service.src} alt={service.alt} width={663} height={930} />
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
                    <img src={reason.src} alt={reason.alt} width={808} height={515} />
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

        <section className="iv-therapy">
          <img
            className="iv-art"
            src="/images/home/iv-therapy-backdrop.webp"
            alt=""
            width={2880}
            height={1182}
          />
          <div className="iv-panel">
            <h2>
              IV Therapy to Support
              <br className="br-lg" /> Cellular Healing
            </h2>
            <p>
              While our primary focus is restoring joint function through advanced regenerative
              medicine, optimal healing requires a strong internal foundation. Our specialized IV
              Hydration &amp; Nutrient Therapy delivers essential vitamins, antioxidants, and
              hydration directly into your bloodstream.
            </p>
            <p className="iv-actions">
              <Link href="/contact/" className="btn btn-gradient">
                Book An Appointment
              </Link>
              <Link href="/about-us/" className="btn btn-ghost">
                Learn More
              </Link>
            </p>
          </div>
        </section>

        <section className="restore">
          <img
            className="restore-art"
            src="/images/home/restore-right.webp"
            alt=""
            width={1712}
            height={985}
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
              By combining advanced stem cell therapy with targeted regenerative treatments like
              spinal decompression and red light therapy, we help patients eliminate chronic joint
              pain, repair damaged tissue, and regain long-term mobility.
            </p>
          </div>

          <OutcomeDials items={OUTCOMES} />
        </section>

        <section className="testimonials" id="Testimonials">
          {/* The heading is passed in rather than placed above the deck so it sits
              inside the pinned panel and holds with the card as it turns over. */}
          <TestimonialDeck items={testimonials.items}>
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
          </TestimonialDeck>
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
          <img
            className="closer-art"
            src="/images/home/closer-backdrop.webp"
            alt=""
            width={2880}
            height={1000}
          />
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
