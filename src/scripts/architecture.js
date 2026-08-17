/**
 * Interactive architecture map — click a stage to expand its detail.
 * One stage open at a time; buttons carry the state so it works from the
 * keyboard and reads correctly to a screen reader.
 */
export function initArchitecture(root) {
  const stages = [...root.querySelectorAll("[data-stage]")];
  if (!stages.length) return;

  function select(index) {
    stages.forEach((stage, i) => {
      const btn = stage.querySelector("button");
      const panel = stage.querySelector("[data-detail]");
      const active = i === index;
      btn.setAttribute("aria-expanded", String(active));
      stage.classList.toggle("is-active", active);
      panel.hidden = !active;
    });
  }

  stages.forEach((stage, i) => {
    const btn = stage.querySelector("button");
    btn.addEventListener("click", () => {
      const isOpen = btn.getAttribute("aria-expanded") === "true";
      select(isOpen ? -1 : i);
    });

    // Left/right arrows walk the pipeline.
    btn.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      const next = (i + (e.key === "ArrowRight" ? 1 : -1) + stages.length) % stages.length;
      stages[next].querySelector("button").focus();
    });
  });

  select(0);
}
