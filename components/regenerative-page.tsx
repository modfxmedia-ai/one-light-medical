import Link from "next/link";

import { JsonLd } from "@/components/json-ld";
import { RegenBars, RegenOrbit, RegenRings, RegenTimeline } from "@/components/regen-motion";
import { ServicesNav } from "@/components/services-nav";
import { BUSINESS, SITE_URL } from "@/lib/site";

type Pillar = {
  id: string;
  href: string;
  kicker: string;
  title: string;
  copy: string;
  points: readonly string[];
  note?: string;
  src: string;
  alt: string;
  graph: readonly { label: string; weight: number }[];
};

const PILLARS: readonly Pillar[] = [
  {
    id: "stem-cell",
    href: "/stem-cell/",
    kicker: "Pillar 01",
    title: "Stem Cells",
    copy: "A regenerative option we may discuss for joint and soft-tissue concerns, after a candidacy exam rather than as a first-line promise.",
    points: [
      "Pain or reduced mobility in joints and soft tissue",
      "Patients weighing options before surgery",
      "Care planned after a consult, not a one-size protocol",
    ],
    note: "Not every joint is a candidate. If yours is not, we will say so on the consult and help you understand the next step.",
    src: "/images/home/card-stem-cells.jpg",
    alt: "A clinician administering a regenerative injection at a patient's knee",
    graph: [
      { label: "Joints", weight: 1 },
      { label: "Soft tissue", weight: 0.82 },
      { label: "Before surgery", weight: 0.7 },
    ],
  },
  {
    id: "whartons-jelly",
    href: "/whartons-jelly/",
    kicker: "Pillar 02",
    title: "Wharton's Jelly",
    copy: "An umbilical-cord tissue matrix used in some regenerative protocols. Your clinician will explain whether it belongs in your plan.",
    points: [
      "Discussed only when it fits the exam and imaging",
      "Paired with the rest of your regenerative plan",
      "No stand-alone outcome is promised from the product alone",
    ],
    src: "/images/home/card-whartons-jelly.jpg",
    alt: "A clinician administering an injection during a regenerative treatment",
    graph: [
      { label: "Exam first", weight: 1 },
      { label: "Imaging fit", weight: 0.78 },
      { label: "Paired plan", weight: 0.86 },
    ],
  },
  {
    id: "exosomes",
    href: "/why-exosomes/",
    kicker: "Pillar 03",
    title: "Why Exosomes",
    copy: "Signaling support we may include as part of a broader regenerative plan, not as a stand-alone treatment promise.",
    points: [
      "Considered alongside stem cell and tissue-matrix options",
      "Reviewed against your history and goals in clinic",
      "Always optional. The consult decides, not the webpage",
    ],
    note: "This is clinician-led care in Amarillo, not a mail-order protocol or a subscription.",
    src: "/images/home/card-exosomes.webp",
    alt: "A person holding their shoulder, representing joint discomfort regenerative care can address",
    graph: [
      { label: "Alongside", weight: 0.88 },
      { label: "History", weight: 1 },
      { label: "Optional", weight: 0.64 },
    ],
  },
];

const STEPS = [
  {
    title: "Share what you are dealing with",
    copy: "Tell us where it hurts, how long it has been going on, and what you have already tried.",
  },
  {
    title: "Candidacy exam in Amarillo",
    copy: "A clinician reviews your history and exam findings before anyone talks about a product or protocol.",
  },
  {
    title: "A plan, not a one-size offer",
    copy: "If a treatment belongs in your plan, we will say why. If it does not, we will say that too.",
  },
] as const;

const JUMP = PILLARS.map((item) => ({ id: item.id, label: item.title }));

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
    <div className="rg">
      <JsonLd graphs={[pageSchema]} />

      <section className="rg-hero">
        <div className="wrap rg-hero-grid">
          <div>
            <p className="rg-kicker">
              Three pillars · {BUSINESS.addressLocality}, {BUSINESS.addressRegion}
            </p>
            <h1>Regenerative Medicine</h1>
            <p className="rg-lead">
              Stem cell, Wharton&rsquo;s Jelly, and exosome options are discussed in clinic after a
              candidacy exam. Nothing here is promised from a product name alone.
            </p>
            <p className="rg-actions">
              <Link href="/contact/" className="btn btn-gradient">
                Book An Appointment
              </Link>
              <a href="#pillars" className="btn btn-ghost">
                See the three pillars
              </a>
            </p>
          </div>
          <div className="rg-hero-figure">
            <img
              src="/images/hero-regenerative-placeholder.png"
              alt="Cellular illustration representing regenerative medicine"
              width={808}
              height={515}
            />
            <RegenOrbit />
          </div>
        </div>
      </section>

      <section className="rg-graphs" id="pillars">
        <div className="wrap">
          <p className="rg-kicker">Equal weight in the conversation</p>
          <h2>Three pillars. One consult decides.</h2>
          <p className="rg-graphs-lead">
            The rings fill as you read. They are not success rates. They mark that each option
            sits at the same table until the exam says otherwise.
          </p>
          <RegenRings />
        </div>
      </section>

      <ServicesNav items={JUMP} className="rg-rail" label="Jump to a regenerative pillar" />

      {PILLARS.map((item, index) => (
        <section
          className={`rg-block${index % 2 ? " is-flip is-alt" : ""}${index === 2 ? " is-dark" : ""}`}
          id={item.id}
          key={item.id}
        >
          <div className="wrap rg-block-grid">
            <figure>
              <img src={item.src} alt={item.alt} width={640} height={800} />
            </figure>
            <div>
              <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <p className="rg-kicker rg-kicker-brand">{item.kicker}</p>
              <h2>{item.title}</h2>
              <p>{item.copy}</p>
              <RegenBars items={item.graph} />
              <ul>
                {item.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              {item.note ? <p className="rg-note">{item.note}</p> : null}
              <Link href={item.href}>Learn more</Link>
            </div>
          </div>
        </section>
      ))}

      <section className="rg-steps">
        <div className="wrap">
          <p className="rg-kicker rg-kicker-brand">In clinic</p>
          <h2>How a consult works</h2>
          <RegenTimeline steps={STEPS} />
        </div>
      </section>

      <section className="rg-cta">
        <div className="wrap rg-cta-grid">
          <div>
            <h2>Ready to talk this through in clinic?</h2>
            <p>
              Book a consult at One Light Medical in Amarillo. We will help you understand which
              regenerative options, if any, belong in a plan for your joints and your goals.
            </p>
            <Link href="/contact/" className="btn btn-gradient">
              Book An Appointment
            </Link>
          </div>
          <div className="rg-cta-contact">
            <p className="rg-kicker">Call the clinic</p>
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
