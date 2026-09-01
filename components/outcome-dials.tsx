"use client";

import { Fragment, useEffect, useRef, useState } from "react";

export type Outcome = {
  value: number;
  note: readonly string[];
};

const RUN_MS = 1600;

/* Ease-out cubic: the sweep and the count should decelerate into their final
   value rather than stop dead, which is what makes them read as one movement. */
const ease = (t: number) => 1 - (1 - t) ** 3;

/**
 * The rings fill and the numbers count up once the section is scrolled into view.
 *
 * The server renders the finished state -- full sweep, final number -- so the
 * figures are in the HTML for crawlers and for anyone without JavaScript. The
 * animation only arms itself if the section is still below the fold on mount,
 * which is the case at every viewport this design supports. That ordering is
 * what stops the reset to zero from ever being visible: by the time progress is
 * pushed back to 0 the section is off-screen, and it is only released once the
 * observer says the user has arrived.
 */
export function OutcomeDials({ items }: { items: readonly Outcome[] }) {
  const listRef = useRef<HTMLUListElement>(null);
  // 1 = settled on the real values, which is also what the server sends.
  const [progress, setProgress] = useState(1);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Already on screen: showing the fill would mean flashing the reset first.
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
      /* Fire as soon as the row reaches the lower fifth of the viewport, rather
         than on a fraction of the element. A fraction is unreliable here: the row
         stacks on narrow screens and grows taller than the viewport, so a
         threshold of a third of it may never be satisfiable at once and the
         animation would simply never start. */
      { threshold: 0, rootMargin: "0px 0px -20% 0px" },
    );
    observer.observe(list);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <ul className="dial-row" ref={listRef}>
      {items.map((outcome) => {
        const shown = Math.round(outcome.value * progress);
        return (
          <li className="dial" key={outcome.value}>
            {/* Two semicircular arcs rather than a <circle>, so the sweep
                provably starts at 12 o'clock and runs clockwise. pathLength
                normalises the circumference to 100, letting the dash array be
                the percentage itself. Rotating a <circle> instead would drag
                the stroke gradient round with it. */}
            <svg className="dial-arc" viewBox="0 0 100 100" aria-hidden="true">
              <circle className="dial-track" cx="50" cy="50" r="47.5" />
              <path
                className="dial-progress"
                d="M50 2.5A47.5 47.5 0 0 1 50 97.5A47.5 47.5 0 0 1 50 2.5"
                pathLength={100}
                strokeDasharray={`${outcome.value * progress} 100`}
              />
            </svg>
            <div className="dial-face">
              {/* The caption names the real figure, so the ticking number is
                  decoration as far as a screen reader is concerned. Announcing
                  every frame of it would be noise. */}
              <span className="dial-value" aria-hidden="true">
                {shown}%
              </span>
              <span className="dial-note">
                {outcome.note.map((line, index) => (
                  <Fragment key={line}>
                    {index > 0 && <br className="br-lg" />}
                    {index > 0 ? ` ${line}` : line}
                  </Fragment>
                ))}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
