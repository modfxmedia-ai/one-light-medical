"use client";

import { useEffect, useState } from "react";

export type Testimonial = {
  name: string;
  date: string;
  iso: string;
  quote: string;
};

const ADVANCE_MS = 7000;

/**
 * The stack of tilted slabs is fixed decoration, as in the Figma frame. Only the
 * pale front card changes: the outgoing review tips back into the deck while the
 * incoming one straightens up out of it, which is the whole flip.
 *
 * Every review stays in the markup, so all four are crawlable and the animation
 * is nothing but a state swap and two CSS transitions.
 */
export function TestimonialDeck({ items }: { items: Testimonial[] }) {
  const [current, setCurrent] = useState(0);
  const [held, setHeld] = useState(false);

  useEffect(() => {
    if (held || items.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(
      () => setCurrent((index) => (index + 1) % items.length),
      ADVANCE_MS,
    );
    return () => window.clearInterval(timer);
  }, [held, items.length]);

  return (
    <div
      className="deck-stage"
      onPointerEnter={() => setHeld(true)}
      onPointerLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={() => setHeld(false)}
    >
      <div className="deck">
        <span className="deck-slab" data-depth="2" aria-hidden="true" />
        <span className="deck-slab" data-depth="1" aria-hidden="true" />
        {items.map((item, index) => (
          <article
            className="deck-card"
            key={item.iso}
            data-current={index === current ? "true" : undefined}
            aria-hidden={index === current ? undefined : "true"}
          >
            <svg className="deck-bubble" viewBox="0 0 24 25" aria-hidden="true" focusable="false">
              {/* Overlapping discs, because the Figma mark is a scalloped
                  speech bubble rather than a smooth rounded one. */}
              <g fill="currentColor">
                <circle cx="8.2" cy="8.4" r="5" />
                <circle cx="14.4" cy="7.7" r="5.3" />
                <circle cx="18.5" cy="12" r="4.6" />
                <circle cx="12" cy="13" r="5.8" />
                <circle cx="6.7" cy="12.6" r="4.5" />
                <circle cx="4.7" cy="20.7" r="2.3" />
              </g>
            </svg>
            <p className="deck-name">{item.name}</p>
            <blockquote className="deck-quote">
              <p>{item.quote}</p>
            </blockquote>
            <p className="deck-date">
              <time dateTime={item.iso}>{item.date}</time>
            </p>
          </article>
        ))}
      </div>

      <ol className="deck-dots">
        {items.map((item, index) => (
          <li key={item.iso}>
            <button
              type="button"
              aria-label={`Show the review from ${item.name}`}
              aria-current={index === current ? "true" : undefined}
              onClick={() => setCurrent(index)}
            />
          </li>
        ))}
      </ol>
    </div>
  );
}
