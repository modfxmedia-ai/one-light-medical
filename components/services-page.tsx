import Link from "next/link";

import { JsonLd } from "@/components/json-ld";
import { ServicesNav } from "@/components/services-nav";
import { BUSINESS, SITE_URL } from "@/lib/site";

type ServiceBlock = {
  id: string;
  href: string;
  kicker: string;
  title: string;
  copy: string;
  points: readonly string[];
  src: string;
  alt: string;
  tone?: "dark";
  extras?: readonly { href: string; label: string }[];
};

const SERVICES: readonly ServiceBlock[] = [
  {
    id: "stem-cell",
    href: "/stem-cell/",
    kicker: "Regenerative",
    title: "Stem Cells",
    copy: "A regenerative option we may discuss for joint and soft-tissue concerns, after a candidacy exam rather than as a first-line promise.",
    points: [
      "Pain or reduced mobility in joints and soft tissue",
      "Patients weighing options before surgery",
      "Care planned after a consult, not a one-size protocol",
    ],
    src: "/images/home/card-stem-cells.jpg",
    alt: "A clinician administering a regenerative injection at a patient's knee",
  },
  {
    id: "whartons-jelly",
    href: "/whartons-jelly/",
    kicker: "Regenerative",
    title: "Wharton's Jelly",
    copy: "An umbilical-cord tissue matrix used in some regenerative protocols. Your clinician will explain whether it belongs in your plan.",
    points: [
      "Discussed only when it fits the exam and imaging",
      "Paired with the rest of your regenerative plan",
      "No stand-alone outcome is promised from the product alone",
    ],
    src: "/images/home/card-whartons-jelly.jpg",
    alt: "A clinician administering an injection during a regenerative treatment",
  },
  {
    id: "exosomes",
    href: "/why-exosomes/",
    kicker: "Regenerative",
    title: "Why Exosomes",
    copy: "Signaling support we may include as part of a broader regenerative plan, not as a stand-alone treatment promise.",
    points: [
      "Considered alongside stem cell and tissue-matrix options",
      "Reviewed against your history and goals in clinic",
      "Always optional. The consult decides, not the webpage",
    ],
    src: "/images/home/card-exosomes.webp",
    alt: "A person holding their shoulder, representing joint discomfort regenerative care can address",
    tone: "dark",
  },
  {
    id: "knee-pain",
    href: "/knee-pain/",
    kicker: "Joints",
    title: "Knee Pain Care",
    copy: "Holistic, non-surgical care aimed at easing knee discomfort and helping you move more comfortably again.",
    points: ["Chronic knee pain and stiffness", "Limited mobility", "Plans built around your exam"],
    src: "/images/cards/knee-pain.webp",
    alt: "A patient holding their knee",
  },
  {
    id: "neuropathy",
    href: "/neuropathy/",
    kicker: "Nerves",
    title: "Neuropathy",
    copy: "Peripheral neuropathy care in Amarillo focused on comfort, circulation, and nerve function after a thorough workup.",
    points: ["Numbness and tingling", "Burning or shooting discomfort", "Clinic-guided next steps"],
    src: "/images/cards/neuropathy.webp",
    alt: "Hands representing neuropathy symptoms",
  },
  {
    id: "spinal-decompression",
    href: "/spinal-decompression/",
    kicker: "Spine",
    title: "Spinal Decompression",
    copy: "Gentle stretching that may help relieve pressure on spinal discs and ease certain kinds of back and nerve pain.",
    points: ["Bulging or herniated discs", "Pinched-nerve symptoms", "Non-surgical spine care"],
    src: "/images/home/card-spinal-decompression.webp",
    alt: "A practitioner assessing a patient's spine",
  },
  {
    id: "softwave",
    href: "/softwave-trt-treatment/",
    kicker: "Tissue",
    title: "SoftWave Therapy",
    copy: "Non-invasive acoustic wave therapy used to stimulate natural tissue healing and reduce joint discomfort.",
    points: ["Stubborn joint issues", "Soft-tissue irritation", "No downtime from surgery"],
    src: "/images/home/card-softwave-therapy.webp",
    alt: "Close-up of a practitioner's hands",
  },
  {
    id: "weight-loss",
    href: "/weight-loss/",
    kicker: "Metabolism",
    title: "Weight Loss & Red Light Therapy",
    copy: "Medically guided weight loss paired with targeted red light to support metabolism, ease inflammation, and help you move more comfortably.",
    points: ["Supervised weight-loss plans", "Red light for recovery and comfort", "Fits beside regenerative care"],
    src: "/images/home/card-red-light-therapy.webp",
    alt: "A red light therapy bed used alongside medically guided weight-loss care",
    extras: [
      { href: "/weight-loss/", label: "Weight Loss" },
      { href: "/red-light-therapy/", label: "Red Light Therapy" },
    ],
  },
];

const JUMP = SERVICES.map((item) => ({
  id: item.id,
  label: item.id === "weight-loss" ? "Weight Loss" : item.title,
}));

const pageSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": `${SITE_URL}/services/#webpage`,
  url: `${SITE_URL}/services/`,
  name: "Our Services | Regenerative Medicine in Amarillo, TX",
  description:
    "Stem cell, Wharton's Jelly, exosome, SoftWave, spinal decompression, neuropathy, knee pain, and weight loss with red light therapy at One Light Medical.",
};

export function ServicesPage() {
  return (
    <div className="hub">
      <JsonLd graphs={[pageSchema]} />

      <section className="hub-hero">
        <div className="wrap hub-hero-grid">
          <div className="hub-hero-copy">
            <p className="hub-kicker">
              What we offer · {BUSINESS.addressLocality}, {BUSINESS.addressRegion}
            </p>
            <h1>Our Services</h1>
            <p className="hub-lead">
              <span>Regenerative</span> medicine leads the clinic. Each option below is discussed
              after a consult in Amarillo, not promised from a webpage.
            </p>
            <p className="hub-actions">
              <Link href="/contact/" className="btn btn-gradient">
                Book An Appointment
              </Link>
              <a href="#stem-cell" className="btn btn-ghost">
                Browse care options
              </a>
            </p>
          </div>
          <figure className="hub-hero-figure">
            <img
              src="/images/home/why-experienced-team.webp"
              alt="One Light Medical practitioners in the clinic"
              width={808}
              height={515}
            />
            <ul className="hub-tags">
              <li>Regenerative</li>
              <li>Amarillo clinic</li>
              <li>Named team</li>
            </ul>
          </figure>
        </div>
      </section>

      <section className="hub-snapshot" aria-label="Clinic snapshot">
        <div className="wrap">
          <ul className="hub-facts">
            <li>
              <strong>8</strong>
              <span>Care options</span>
            </li>
            <li>
              <strong>1</strong>
              <span>Amarillo clinic</span>
            </li>
            <li>
              <strong>1</strong>
              <span>Named team</span>
            </li>
          </ul>
        </div>
      </section>

      <ServicesNav items={JUMP} />

      {SERVICES.map((item, index) => (
        <section
          className={`hub-block${index % 2 ? " is-flip is-alt" : ""}${item.tone === "dark" ? " is-dark" : ""}`}
          id={item.id}
          key={item.id}
        >
          <div className="wrap hub-block-grid">
            <figure>
              <img src={item.src} alt={item.alt} width={640} height={480} />
            </figure>
            <div>
              <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <p className="hub-kicker hub-kicker-brand">{item.kicker}</p>
              <h2>{item.title}</h2>
              <p>{item.copy}</p>
              <ul>
                {item.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              {item.extras ? (
                <p className="hub-pair">
                  {item.extras.map((extra) => (
                    <Link key={extra.href} href={extra.href}>
                      {extra.label}
                    </Link>
                  ))}
                </p>
              ) : (
                <Link href={item.href}>Learn more</Link>
              )}
            </div>
          </div>
        </section>
      ))}

      <section className="hub-cta">
        <div className="wrap hub-cta-grid">
          <div>
            <h2>Not sure where to start?</h2>
            <p>
              Tell us what you are dealing with. We will help you understand which options, if any,
              belong in a plan for your joints and your goals.
            </p>
            <Link href="/contact/" className="btn btn-gradient">
              Book An Appointment
            </Link>
          </div>
          <div className="hub-cta-contact">
            <p className="hub-kicker">Call the clinic</p>
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
