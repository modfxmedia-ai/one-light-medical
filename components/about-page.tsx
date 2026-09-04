import Link from "next/link";

import { JsonLd } from "@/components/json-ld";
import erinPhoto from "@/images/dr-erin.png";
import { BUSINESS } from "@/lib/site";
import { getPageSchema } from "@/lib/schema";

const FACTS = [
  { label: "Amarillo clinic", detail: "Time Square Blvd" },
  { label: "Regenerative-led", detail: "Three pillars" },
  { label: "Named clinicians", detail: "Dr. Nelson and Erin Nelson, FNP-C" },
] as const;

const TEAM = [
  {
    name: "Dr. Nelson",
    role: "Founder",
    src: "/images/team/josh-nelson.jpg",
    alt: "Dr. Josh Nelson of One Light Medical",
    photoClass: "",
    copy: "Celebrating his 30th year in practice, Dr. Josh Nelson is more passionate about life and wellness than ever before. His steadfast desire is to improve the lives of his patients, in both their quality of life and their healthcare experience. As a native of Amarillo, he has always been familiar with the West Texas way of life. He is a father of four amazing children and one incredibly energetic granddaughter. Dr. Nelson completed his undergraduate study at Wayland Baptist University in Plainview, Texas and he received his doctorate degree in 1992 from Parker College of Chiropractic in Dallas. He established a thriving practice in Mansfield, TX, which he eventually sold before moving to Amarillo to create an exciting new medically integrated practice called One Light Medical.",
  },
  {
    name: "Erin Nelson",
    role: "Nurse Practitioner, FNP-C",
    src: erinPhoto.src,
    alt: "Erin Nelson, FNP-C, of One Light Medical",
    photoClass: "about-bio-erin",
    copy: "Erin Nelson, FNP-C, is a board-certified nurse practitioner whose healthcare philosophy fits perfectly with the mission of One Light Medical. Over twenty years of clinical experience influencing her success as a healthcare provider, Erin is passionate about helping her patients optimize their overall function and wellness. Erin earned her Master of Science in Nursing degree from Mississippi University for Women in 2014. In 2018, she completed advanced injection and regenerative medicine training in Denver. Her passion is finding natural solutions to decreasing and eliminating patients' pain while promoting their bodies' own natural ability to heal themselves.",
  },
] as const;

const VALUES = [
  {
    title: "Regenerative first",
    copy: "We lead with regenerative medicine for joint and soft-tissue concerns, then pair it with complementary care when it belongs in the plan.",
  },
  {
    title: "Honest candidacy",
    copy: "Not every joint is a candidate. If a treatment is not a fit, we will say so on the consult rather than oversell a protocol.",
  },
  {
    title: "Clinic-based care",
    copy: "Care happens here in Amarillo, with a team you can name, not a mail-order subscription or a one-size protocol.",
  },
] as const;

export function AboutPage() {
  return (
    <div className="about">
      <JsonLd graphs={getPageSchema("/about-us/")} />

      <section className="about-hero">
        <div className="wrap about-hero-grid">
          <div className="about-hero-copy">
            <p className="about-kicker">
              The clinic · {BUSINESS.addressLocality}, {BUSINESS.addressRegion}
            </p>
            <h1>About Us</h1>
            <p className="about-lead">
              One Light Medical is an Amarillo clinic that leads with regenerative medicine,
              compassionate non-surgical care, and a team that stays with you from the first consult
              through ongoing visits.
            </p>
            <p className="about-actions">
              <Link href="/contact/" className="btn btn-gradient">
                Book An Appointment
              </Link>
              <Link href="/services/" className="btn btn-ghost">
                View Our Services
              </Link>
            </p>
          </div>
          <figure className="about-hero-figure">
            <img
              src="/images/home/why-experienced-team.webp"
              alt="One Light Medical practitioners in the clinic"
              width={808}
              height={515}
            />
            <ul className="about-tags">
              <li>Regenerative</li>
              <li>Amarillo clinic</li>
              <li>Named team</li>
            </ul>
          </figure>
        </div>
      </section>

      <section className="about-snapshot" aria-label="Clinic snapshot">
        <div className="wrap">
          <ul className="about-facts">
            {FACTS.map((fact) => (
              <li key={fact.label}>
                <strong>{fact.label}</strong>
                <span>{fact.detail}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="about-welcome">
        <div className="wrap about-welcome-grid">
          <div className="about-prose">
            <p className="about-kicker about-kicker-brand">Our focus</p>
            <h2>Welcome to One Light Medical</h2>
            <p>
              At One Light Medical, we&rsquo;re committed to providing compassionate, non-surgical
              care that truly makes a difference. Our focus is on helping you achieve lasting pain
              relief, improved mobility, and a better quality of life through advanced,
              patient-centered treatments.
            </p>
            <p>
              Regenerative options such as stem cell, Wharton&rsquo;s Jelly, and exosome therapy are
              discussed after a candidacy exam, not as a first-line promise. Complementary care such
              as SoftWave, spinal decompression, and medically guided weight loss with red light
              therapy can sit alongside that plan when your clinician recommends it.
            </p>
          </div>
          <aside className="about-notes">
            <dl>
              <div>
                <dt>Setting</dt>
                <dd>
                  {BUSINESS.streetAddress}
                  <br />
                  {BUSINESS.addressLocality}, {BUSINESS.addressRegion} {BUSINESS.postalCode}
                </dd>
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

      <section className="about-people">
        <div className="wrap">
          <header className="about-section-head">
            <p className="about-kicker about-kicker-brand">The people</p>
            <h2>Meet the people behind your care</h2>
          </header>
          <ul className="about-bios">
            {TEAM.map((member) => (
              <li key={member.name}>
                <article className="about-bio">
                  <figure>
                    <img
                      className={member.photoClass}
                      src={member.src}
                      alt={member.alt}
                      width={640}
                      height={720}
                    />
                    <figcaption>
                      <p className="about-role">{member.role}</p>
                      <h3>{member.name}</h3>
                    </figcaption>
                  </figure>
                  <p>{member.copy}</p>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="about-expect">
        <div className="wrap">
          <header className="about-section-head">
            <p className="about-kicker about-kicker-brand">How we work</p>
            <h2>What you can expect</h2>
          </header>
          <ol className="about-values">
            {VALUES.map((value, index) => (
              <li key={value.title}>
                <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <h3>{value.title}</h3>
                <p>{value.copy}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="about-cta">
        <div className="wrap about-cta-grid">
          <div>
            <h2>Your journey to wellness starts here</h2>
            <p>
              At One Light Medical, we&rsquo;re more than just a healthcare provider, we&rsquo;re
              your partners in wellness. We&rsquo;re here to support you at every step, from initial
              consultation to ongoing care, with a focus on treatments that enhance your quality of
              life.
            </p>
            <Link href="/contact/" className="btn btn-gradient">
              Book An Appointment
            </Link>
          </div>
          <div className="about-cta-contact">
            <p className="about-kicker">Call the clinic</p>
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
