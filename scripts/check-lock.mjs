/**
 * Verifies the home page preview lock: every link that would navigate is
 * non-interactive, while the hrefs, the disclosure widgets and the carousel
 * control are all left intact.
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
    const links = [...document.querySelectorAll("a")];
    const nav = links.filter((a) => !/^(tel:|mailto:)/.test(a.getAttribute("href") ?? ""));
    const contact = links.filter((a) => /^(tel:|mailto:)/.test(a.getAttribute("href") ?? ""));
    const live = (list) => list.filter((el) => !inert(el)).length;

    return {
      navLinks: nav.length,
      navLocked: nav.filter(inert).length,
      navStillLive: nav.filter((a) => !inert(a)).map((a) => a.getAttribute("href")),
      hrefsPresent: links.filter((a) => a.getAttribute("href")).length,
      contactLinks: contact.length,
      contactLive: live(contact),
      summaries: document.querySelectorAll("summary").length,
      summariesLive: live([...document.querySelectorAll("summary")]),
      dots: document.querySelectorAll(".deck-dots button").length,
      dotsLive: live([...document.querySelectorAll(".deck-dots button")]),
      cards: document.querySelectorAll(".svc-card").length,
      cardsHoverable: live([...document.querySelectorAll(".svc-card")]),
    };
  })()`,
});

console.log(result.value);

await browser.close();
process.exit(0);
