/** Mobile nav toggle + scrollspy for the desktop nav. */
export function initNav() {
  const toggle = document.getElementById("nav-toggle");
  const panel = document.getElementById("nav-mobile");

  if (toggle && panel) {
    const setOpen = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      panel.hidden = !open;
    };

    toggle.addEventListener("click", () => {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    panel.addEventListener("click", (e) => {
      if (e.target.closest("a")) setOpen(false);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        toggle.focus();
      }
    });

    // Leaving the mobile breakpoint should never strand a hidden panel open.
    const wide = window.matchMedia("(min-width: 860px)");
    wide.addEventListener("change", (e) => {
      if (e.matches) setOpen(false);
    });
  }

  // Scrollspy — marks the section currently occupying the upper viewport.
  const links = [...document.querySelectorAll(".nav-link")];
  const sections = links
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if (!sections.length || !("IntersectionObserver" in window)) return;

  const spy = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const id = `#${entry.target.id}`;
        links.forEach((l) => l.classList.toggle("is-active", l.getAttribute("href") === id));
      }
    },
    { rootMargin: "-20% 0px -70% 0px" }
  );

  sections.forEach((s) => spy.observe(s));
}
