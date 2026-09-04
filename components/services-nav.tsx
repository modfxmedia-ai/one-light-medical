"use client";

import { useEffect, useState } from "react";

type NavItem = {
  id: string;
  label: string;
};

export function ServicesNav({
  items,
  className = "hub-rail",
  label = "Jump to a service",
}: {
  items: readonly NavItem[];
  className?: string;
  label?: string;
}) {
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const nodes = items
      .map((item) => document.getElementById(item.id))
      .filter((node): node is HTMLElement => Boolean(node));
    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActive(visible.target.id);
      },
      { rootMargin: "-28% 0px -55% 0px", threshold: [0.15, 0.35, 0.6] },
    );

    for (const node of nodes) observer.observe(node);
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav className={className} aria-label={label}>
      <div className="wrap">
        {items.map((item) => (
          <a key={item.id} href={`#${item.id}`} className={item.id === active ? "is-on" : undefined}>
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
