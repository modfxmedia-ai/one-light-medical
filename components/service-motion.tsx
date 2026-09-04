"use client";

import { useEffect, useRef, useState } from "react";

import type { ServiceStat } from "@/content/services";

const RUN_MS = 1400;
const ease = (t: number) => 1 - (1 - t) ** 3;

/**
 * Count-up clinic snapshot figures. Final numbers stay in the HTML for
 * crawlers and reduced-motion visitors.
 */
export function ServiceMotion({ stats }: { stats: readonly ServiceStat[] }) {
  const listRef = useRef<HTMLUListElement>(null);
  const [progress, setProgress] = useState(1);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (list.getBoundingClientRect().top < window.innerHeight) return;

    setProgress(0);

    let frame = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        const start = performance.now();
        const step = (now: number) => {
          const t = Math.min((now - start) / RUN_MS, 1);
          setProgress(ease(t));
          if (t < 1) frame = requestAnimationFrame(step);
        };
        frame = requestAnimationFrame(step);
      },
      { threshold: 0, rootMargin: "0px 0px -18% 0px" },
    );
    observer.observe(list);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <ul className="svc-stats" ref={listRef}>
      {stats.map((stat) => {
        const shown = Math.round(stat.value * progress);
        return (
          <li key={stat.label}>
            <strong>
              {shown}
              {stat.suffix}
            </strong>
            <span>{stat.label}</span>
            <i style={{ transform: `translateX(-50%) scaleX(${progress})` }} />
          </li>
        );
      })}
    </ul>
  );
}
