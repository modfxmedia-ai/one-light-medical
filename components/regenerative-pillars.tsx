import Link from "next/link";

/**
 * Three-pillar regenerative section, layout-adapted from the client's reference
 * (regenerativerevival.com) but written for One Light Medical: in-clinic
 * Amarillo care, no in-home or telehealth claims, no efficacy promises.
 * TODO: client review on all pillar copy.
 */

type Pillar = {
  id: string;
  index: string;
  kicker: string;
  accent: string;
  before: string;
  after: string;
  body: string;
  tags: readonly string[];
  points: readonly string[];
  note?: string;
  src: string;
  alt: string;
};

const PILLARS: readonly Pillar[] = [
  {
    id: "regenerative-stem-cell",
    index: "01",
    kicker: "Stem Cells",
    before: "Your ",
    accent: "joints",
    after: " should not have to wait on a surgery date",
    body: "Stem cell therapy is one option our clinicians may discuss for joint and soft-tissue concerns, after a candidacy exam, not as a first-line promise. The goal is an honest plan for mobility, not a sales pitch.",
    tags: ["Knee", "Hip", "Shoulder", "Back", "Elbow", "Neck", "Ankle", "Wrist"],
    points: [
      "Pain or reduced mobility in joints and soft tissue",
      "Patients weighing options before surgery",
      "Active adults whose joints are holding them back",
      "Care planned after a consult, not a one-size protocol",
    ],
    note: "Not every joint is a candidate. If yours is not, we will say so on the consult and help you understand the next step.",
    src: "/images/home/card-stem-cells.jpg",
    alt: "A clinician administering a regenerative injection at a patient's knee",
  },
  {
    id: "regenerative-whartons-jelly",
    index: "02",
    kicker: "Wharton's Jelly",
    before: "A ",
    accent: "tissue matrix",
    after: " used in some regenerative protocols",
    body: "Wharton's Jelly is an umbilical-cord tissue matrix used in some regenerative protocols for its growth factors. Your clinician will explain whether it belongs in your plan and why.",
    tags: ["Joints", "Soft tissue", "Recovery", "Mobility"],
    points: [
      "Discussed only when it fits the exam and imaging",
      "Paired with the rest of your regenerative plan",
      "Sourced and handled under clinic protocols",
      "No stand-alone outcome is promised from the product alone",
    ],
    src: "/images/home/card-whartons-jelly.jpg",
    alt: "A clinician administering an injection during a regenerative treatment",
  },
  {
    id: "why-exosomes",
    index: "03",
    kicker: "Exosome Therapy",
    before: "",
    accent: "Signaling",
    after: " support as part of a broader plan",
    body: "Exosomes are signaling vesicles studied for cell-to-cell communication. We present them as one part of regenerative care at One Light Medical, not as a stand-alone treatment promise.",
    tags: ["Cellular signaling", "Recovery", "Resilience", "Soft tissue"],
    points: [
      "Considered alongside stem cell and tissue-matrix options",
      "Aimed at supporting the body's own signaling, not replacing a workup",
      "Reviewed against your history and goals in clinic",
      "Always optional, the consult decides, not the webpage",
    ],
    note: "This is clinician-led regenerative care in Amarillo, not a mail-order protocol or a subscription.",
    src: "/images/home/card-exosomes.webp",
    alt: "A person holding their shoulder, representing joint discomfort regenerative care can address",
  },
];

export function RegenerativePillars({ titleAs = "h2" }: { titleAs?: "h1" | "h2" }) {
  const Title = titleAs;
  const PillarTitle = titleAs === "h1" ? "h2" : "h3";

  return (
    <section className="regen" id="regen">
      <header className="regen-head wrap">
        <div>
          <p className="regen-eyebrow">What we do: three pillars</p>
          <Title>Regenerative Medicine</Title>
        </div>
        <span className="regen-bars" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      </header>

      {PILLARS.map((pillar) => (
        <article className="regen-pillar wrap" key={pillar.id} id={pillar.id}>
          <figure className="regen-figure">
            <img src={pillar.src} alt={pillar.alt} width={1080} height={1080} />
            <span className="regen-index" aria-hidden="true">
              {pillar.index}
            </span>
            <ul className="regen-tags">
              {pillar.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          </figure>

          <div className="regen-copy">
            <span className="regen-watermark" aria-hidden="true">
              {pillar.index.replace(/^0/, "")}
            </span>
            <p className="regen-kicker">{pillar.kicker}</p>
            <PillarTitle>
              {pillar.before}
              <em>{pillar.accent}</em>
              {pillar.after}
            </PillarTitle>
            <p className="regen-body">{pillar.body}</p>
            <ul className="regen-points">
              {pillar.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
            {pillar.note ? <p className="regen-note">{pillar.note}</p> : null}
            <Link href="/contact/" className="btn btn-gradient regen-cta">
              Get Started
              <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </article>
      ))}
    </section>
  );
}
