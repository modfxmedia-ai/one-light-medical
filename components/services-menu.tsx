"use client";

import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";

const CLOSE_GRACE_MS = 320;
const FADE_MS = 180;

function isDesktop() {
  return window.matchMedia("(min-width: 1101px)").matches;
}

export function ServicesMenu({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDetailsElement>(null);
  const leave = useRef(0);

  useEffect(() => () => window.clearTimeout(leave.current), []);

  const open = () => {
    if (!isDesktop()) return;
    window.clearTimeout(leave.current);
    const node = ref.current;
    if (!node) return;
    node.classList.remove("is-leaving");
    node.open = true;
  };

  const scheduleClose = () => {
    if (!isDesktop()) return;
    window.clearTimeout(leave.current);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      leave.current = window.setTimeout(() => {
        const node = ref.current;
        if (node) node.open = false;
      }, CLOSE_GRACE_MS);
      return;
    }

    leave.current = window.setTimeout(() => {
      const node = ref.current;
      if (!node) return;
      node.classList.add("is-leaving");
      leave.current = window.setTimeout(() => {
        node.open = false;
        node.classList.remove("is-leaving");
      }, FADE_MS);
    }, CLOSE_GRACE_MS);
  };

  const close = () => {
    window.clearTimeout(leave.current);
    const node = ref.current;
    if (!node) return;
    node.open = false;
    node.classList.remove("is-leaving");
    const mobileMenu = node.closest<HTMLDetailsElement>(".site-nav-toggle");
    if (mobileMenu) mobileMenu.open = false;
  };

  return (
    <details
      className="services-menu"
      ref={ref}
      onMouseEnter={open}
      onMouseLeave={scheduleClose}
      onFocusCapture={open}
      onClickCapture={(event) => {
        if ((event.target as HTMLElement).closest("a")) close();
      }}
      onBlurCapture={(event) => {
        if (!ref.current?.contains(event.relatedTarget as Node | null)) scheduleClose();
      }}
    >
      <summary>
        <Link className="services-menu-link" href={href}>
          {label}
        </Link>
        <span className="services-menu-label">{label}</span>
      </summary>
      {children}
    </details>
  );
}
