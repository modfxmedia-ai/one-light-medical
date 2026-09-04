/**
 * Verifies the home page preview lock: every link that would navigate to a page
 * that is still unstyled is non-interactive, while the hrefs, the disclosure
 * widgets and the carousel control are all left intact.
 *
 * Links that stay live: tel: and mailto:; Home (/); About Us; Our Services;
 * Contact (/contact/), including Book An Appointment; and Testimonials.
 *
 * Usage: node scripts/check-lock.mjs <url>
 */

import { launch } from "./cdp.mjs";

const [url = "http://localhost:3000/"] = process.argv.slice(2);

const browser = await launch();
await browser.open(url, { settle: 2000 });

const { result } = await browser.send("Runtime.evaluate", {
  returnByValue: true,
  expression: `(() => {
    const inert = (el) => getComputedStyle(el).pointerEvents === "none";
    const href = (a) => a.getAttribute("href") ?? "";
    const exempt = (a) =>
      /^(tel:|mailto:)/.test(href(a)) ||
      href(a).startsWith("https://www.facebook.com/") ||
      href(a).startsWith("https://www.youtube.com/") ||
      href(a).startsWith("https://www.google.com/maps/") ||
      href(a) === "/" ||
      href(a) === "/about-us/" ||
      href(a) === "/contact/" ||
      href(a) === "/services/" ||
      href(a).startsWith("/services/") ||
      href(a) === "/stem-cell/" ||
      href(a) === "/whartons-jelly/" ||
      href(a) === "/why-exosomes/" ||
      href(a) === "/knee-pain/" ||
      href(a) === "/neuropathy/" ||
      href(a) === "/spinal-decompression/" ||
      href(a) === "/softwave-trt-treatment/" ||
      href(a) === "/weight-loss/" ||
      href(a) === "/red-light-therapy/" ||
      href(a) === "/blog/" ||
      href(a) === "/regenerative/" ||
      href(a) === "/privacy-policy/" ||
      href(a) === "/terms-and-conditions/" ||
      href(a) === "/patient-paperwork/" ||
      href(a) === "/#Testimonials" ||
      href(a) === "/#regen";

    const links = [...document.querySelectorAll("a")];
    const locked = links.filter((a) => !exempt(a));
    const live = links.filter(exempt);

    return {
      lockedLinks: locked.length,
      lockedLeaks: locked.filter((a) => !inert(a)).map(href),
      exemptLinks: live.length,
      exemptLocked: live
        .filter((a) => inert(a) && !a.closest("details:not([open])"))
        .map(href),
      contactLinks: links.filter((a) => href(a) === "/contact/").length,
      hrefsPresent: links.filter((a) => a.getAttribute("href")).length,
      totalLinks: links.length,
      summaries: document.querySelectorAll("summary").length,
      summariesLocked: [...document.querySelectorAll("summary")].filter(inert).length,
      dots: document.querySelectorAll(".deck-dots button").length,
      dotsLocked: [...document.querySelectorAll(".deck-dots button")].filter(inert).length,
      cards: document.querySelectorAll(".svc-card").length,
      cardsLocked: [...document.querySelectorAll(".svc-card")].filter(inert).length,
    };
  })()`,
});

/* Computed pointer-events is the mechanism, not the outcome. This clicks the
   header's Contact entry the way a visitor would -- a real mouse event at the
   link's own centre -- and checks the browser actually went there. It is the only
   way to catch a link that is interactive but covered by something, or one whose
   href is right while the route 404s. */
const { result: box } = await browser.send("Runtime.evaluate", {
  returnByValue: true,
  expression: `(() => {
    /* The header renders its nav twice -- once inside the mobile <details> and
       once for desktop -- and only one is displayed at any width. The first in
       the DOM is the mobile copy, so pick whichever one is actually laid out. */
    const link = [
      ...document.querySelectorAll('.site-header .primary-nav a[href="/contact/"]'),
    ].find((a) => a.getClientRects().length > 0);
    if (!link) return null;
    link.scrollIntoView({ block: "center", behavior: "instant" });
    const r = link.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    // Whatever is on top at that point is what the click will actually reach.
    const hit = document.elementFromPoint(x, y);
    const name = (el) =>
      el
        ? el.tagName.toLowerCase() +
          (typeof el.className === "string" && el.className.trim()
            ? "." + el.className.trim().split(/\\s+/).join(".")
            : "")
        : "nothing";
    return { x, y, topmost: hit === link || link.contains(hit), hit: name(hit) };
  })()`,
});

let navigated = null;
if (box.value?.topmost) {
  const { x, y } = box.value;
  for (const type of ["mousePressed", "mouseReleased"]) {
    await browser.send("Input.dispatchMouseEvent", {
      type,
      x,
      y,
      button: "left",
      clickCount: 1,
    });
  }
  await new Promise((r) => setTimeout(r, 2500));
  const { result: where } = await browser.send("Runtime.evaluate", {
    returnByValue: true,
    expression: "JSON.stringify({ path: location.pathname, h1: document.querySelector('h1')?.textContent })",
  });
  navigated = JSON.parse(where.value);
}

const s = result.value;
const problems = [];

if (!box.value) problems.push("no Contact entry in the header nav");
else if (!box.value.topmost) problems.push(`header Contact link is covered by ${box.value.hit}`);
else if (navigated?.path !== "/contact/") {
  problems.push(`clicking header Contact went to ${navigated?.path} instead of /contact/`);
} else if (navigated.h1 !== "Contact") {
  problems.push(`/contact/ rendered an unexpected h1: ${navigated.h1}`);
}

s.headerContactClick = navigated ? `${navigated.path} (h1 "${navigated.h1}")` : "not attempted";

if (s.lockedLeaks.length) problems.push(`links that should be locked are live: ${s.lockedLeaks}`);
if (s.exemptLocked.length) problems.push(`links that should be live are locked: ${s.exemptLocked}`);
if (!s.contactLinks) problems.push("no /contact/ links found at all");
if (s.hrefsPresent !== s.totalLinks) problems.push("some links lost their href");
if (s.summariesLocked) problems.push(`${s.summariesLocked} summary element(s) locked`);
if (s.dotsLocked) problems.push(`${s.dotsLocked} testimonial dot(s) locked`);
if (s.cardsLocked) problems.push(`${s.cardsLocked} service card(s) locked`);

console.log(s);
console.log(problems.length ? `\n${problems.join("\n")}` : "\nlock is as intended");

await browser.close();
process.exit(problems.length ? 1 : 0);
