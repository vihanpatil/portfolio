/**
 * Scroll reveals — used sparingly and with varied direction/timing.
 *
 * Fail-safe by construction: the hidden state only exists while <html> has
 * .reveal-on, which this function adds and is responsible for honouring.
 * If anything goes wrong the content stays visible, because visible is the
 * CSS default. A watchdog also force-reveals everything if the observer
 * hasn't dealt with an element in time — IntersectionObserver callbacks are
 * suppressed while a tab is backgrounded, and a user returning to a blank
 * page is not an acceptable outcome.
 */
const WATCHDOG_MS = 2500;

export function initReveals() {
  const nodes = document.querySelectorAll("[data-reveal]");
  if (!nodes.length) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const revealAll = () => nodes.forEach((n) => n.classList.add("is-in"));

  // No observer or no motion wanted: never arm the hidden state at all.
  if (reduce || !("IntersectionObserver" in window)) return;

  document.documentElement.classList.add("reveal-on");

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-in");
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.15 }
  );

  nodes.forEach((node) => observer.observe(node));

  // If the page was never actually visible (prerender, background tab,
  // headless), the observer may not have fired at all. Reveal on return.
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      setTimeout(() => {
        nodes.forEach((n) => {
          const r = n.getBoundingClientRect();
          if (r.top < window.innerHeight && r.bottom > 0) n.classList.add("is-in");
        });
      }, 50);
    }
  });

  // Last resort: anything still hidden above the fold gets shown.
  setTimeout(() => {
    let stuck = 0;
    nodes.forEach((n) => {
      if (n.classList.contains("is-in")) return;
      const r = n.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) {
        n.classList.add("is-in");
        stuck += 1;
      }
    });
    if (stuck) observer.disconnect(), revealAll();
  }, WATCHDOG_MS);
}
