"use client";

import { useEffect, useRef, useState } from "react";

const RUN_MS = 1600;
const ease = (t: number) => 1 - (1 - t) ** 3;

function useDraw(startVisible = false) {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(1);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (startVisible && node.getBoundingClientRect().top < window.innerHeight) return;

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
      { threshold: 0.25, rootMargin: "0px 0px -12% 0px" },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [startVisible]);

  return { ref, progress };
}

const RINGS = [
  { id: "stem-cell", label: "Stem Cells", index: "01", color: "var(--cyan)" },
  { id: "whartons-jelly", label: "Wharton's Jelly", index: "02", color: "var(--teal)" },
  { id: "exosomes", label: "Why Exosomes", index: "03", color: "var(--sky)" },
] as const;

export function RegenOrbit() {
  return (
    <div className="rg-orbit" aria-hidden="true">
      <svg viewBox="0 0 320 320">
        <circle className="rg-orbit-ring" cx="160" cy="160" r="62" />
        <circle className="rg-orbit-ring is-mid" cx="160" cy="160" r="96" />
        <circle className="rg-orbit-ring is-outer" cx="160" cy="160" r="132" />
        <g className="rg-orbit-spin is-slow">
          <circle cx="160" cy="28" r="5" fill="var(--cyan)" />
        </g>
        <g className="rg-orbit-spin is-mid">
          <circle cx="256" cy="160" r="5" fill="var(--teal)" />
        </g>
        <g className="rg-orbit-spin">
          <circle cx="68" cy="232" r="5" fill="var(--sky)" />
        </g>
        <circle cx="160" cy="160" r="18" fill="var(--cyan)" />
        <circle cx="160" cy="160" r="8" fill="var(--navy-950)" />
      </svg>
      <ol>
        <li>Stem Cells</li>
        <li>Wharton&rsquo;s Jelly</li>
        <li>Exosomes</li>
      </ol>
    </div>
  );
}

export function RegenRings() {
  const { ref, progress } = useDraw();
  const radius = 46;
  const circ = 2 * Math.PI * radius;

  return (
    <div className="rg-rings" ref={ref}>
      {RINGS.map((ring) => {
        const offset = circ * (1 - progress);
        return (
          <a key={ring.id} href={`#${ring.id}`} className="rg-ring">
            <svg viewBox="0 0 120 120" aria-hidden="true">
              <circle className="rg-ring-track" cx="60" cy="60" r={radius} />
              <circle
                className="rg-ring-value"
                cx="60"
                cy="60"
                r={radius}
                stroke={ring.color}
                strokeDasharray={circ}
                strokeDashoffset={offset}
              />
            </svg>
            <strong>{ring.index}</strong>
            <span>{ring.label}</span>
          </a>
        );
      })}
    </div>
  );
}

export function RegenBars({
  items,
}: {
  items: readonly { label: string; weight: number }[];
}) {
  const { ref, progress } = useDraw();

  return (
    <ul className="rg-bars" ref={ref}>
      {items.map((item) => (
        <li key={item.label}>
          <span>{item.label}</span>
          <i>
            <b style={{ transform: `scaleX(${progress * item.weight})` }} />
          </i>
        </li>
      ))}
    </ul>
  );
}

export function RegenTimeline({
  steps,
}: {
  steps: readonly { title: string; copy: string }[];
}) {
  const { ref, progress } = useDraw();

  return (
    <ol className="rg-timeline" ref={ref}>
      <i className="rg-timeline-line" aria-hidden="true">
        <b style={{ transform: `scaleY(${progress})` }} />
      </i>
      {steps.map((step, index) => (
        <li key={step.title} style={{ opacity: 0.35 + progress * 0.65 }}>
          <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
          <div>
            <h3>{step.title}</h3>
            <p>{step.copy}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

