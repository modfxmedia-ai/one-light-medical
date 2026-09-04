"use client";

import Link from "next/link";
import { useRef } from "react";

import { ServicesMenu } from "@/components/services-menu";
import { BUSINESS, SERVICE_NAV } from "@/lib/site";

const PILL_NAV = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about-us/" },
  { label: "Regenerative", href: "/regenerative/" },
  { label: "Our Services", href: "/services/" },
  { label: "Blog", href: "/blog/" },
  { label: "Testimonials", href: "/#Testimonials" },
  { label: "Contact Us", href: "/contact/" },
] as const;

export function SiteHeader() {
  const mobileMenu = useRef<HTMLDetailsElement>(null);

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="site-logo">
          <img src="/images/logos/white-logo.png" alt={BUSINESS.name} width={220} height={132} />
        </Link>

        <details
          className="site-nav-toggle"
          ref={mobileMenu}
          onClickCapture={(event) => {
            if ((event.target as HTMLElement).closest("a") && mobileMenu.current) {
              mobileMenu.current.open = false;
            }
          }}
        >
          {/* Both labels are present and CSS shows one, so the control names its
              own action in either state without needing script to swap the text. */}
          <summary>
            <span data-label="closed">Menu</span>
            <span data-label="open">Close</span>
          </summary>
          <Nav />
          <a className="header-phone" href={BUSINESS.phoneHref}>
            <PhoneIcon />
            {BUSINESS.phone}
          </a>
          <Link href="/contact/" className="btn btn-gradient">
            Book An Appointment
          </Link>
        </details>

        <Nav />

        <div className="header-actions">
          <a className="header-phone" href={BUSINESS.phoneHref}>
            <PhoneIcon />
            {BUSINESS.phone}
          </a>
          <Link href="/contact/" className="btn btn-gradient">
            Book An Appointment
          </Link>
        </div>
      </div>
    </header>
  );
}

function Nav() {
  return (
    <nav className="site-nav" aria-label="Primary">
      <ul className="primary-nav">
        {PILL_NAV.map((item) =>
          item.label === "Our Services" ? (
            <li key={item.href}>
              <ServicesMenu href={item.href} label={item.label}>
                <ul>
                  {SERVICE_NAV.map((service) => (
                    <li key={service.href}>
                      <Link href={service.href}>{service.label}</Link>
                    </li>
                  ))}
                </ul>
              </ServicesMenu>
            </li>
          ) : item.label === "Contact Us" ? (
            <li key={item.href}>
              <ServicesMenu href={item.href} label={item.label}>
                <ul>
                  <li>
                    <Link href="/patient-paperwork/">Patient Paperwork</Link>
                  </li>
                </ul>
              </ServicesMenu>
            </li>
          ) : (
            <li key={item.href}>
              <Link href={item.href}>{item.label}</Link>
            </li>
          ),
        )}
      </ul>
    </nav>
  );
}

function PhoneIcon() {
  return (
    <span className="phone-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="17" height="17" fill="none">
        <path
          d="M7.2 3.8c.4-.4 1-.5 1.5-.3l2.2 1c.5.2.8.7.8 1.2v2.1c0 .4-.2.8-.5 1L9.8 10.3c.9 1.8 2.3 3.2 4.1 4.1l1.5-1.4c.3-.3.7-.5 1.1-.5h2.1c.5 0 1 .3 1.2.8l1 2.2c.2.5.1 1.1-.3 1.5l-1.2 1.2c-.4.4-1 .6-1.6.5C11.4 19.1 4.9 12.6 4.3 6.4c-.1-.6.1-1.2.5-1.6L7.2 3.8Z"
          fill="currentColor"
        />
      </svg>
    </span>
  );
}
