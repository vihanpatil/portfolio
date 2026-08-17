/**
 * ResumeMatch — runs the scoring mechanic client-side on sample data so the
 * widget works with no API key and no backend.
 *
 * Each posting requirement carries the signals that satisfy it. A candidate
 * profile lists its signals. Coverage is per-requirement — full, partial, or
 * missing — which is the point: a single percentage tells you nothing about
 * WHICH requirement you failed.
 */

const REQUIREMENTS = [
  { id: "lang", label: "Python or TypeScript, production experience", signals: ["python", "typescript"], weight: 3 },
  { id: "ml", label: "Applied ML / LLM systems", signals: ["rag", "llm", "pytorch"], weight: 3 },
  { id: "backend", label: "Backend services & APIs", signals: ["node", "express", "fastapi"], weight: 2 },
  { id: "cloud", label: "Cloud deployment (AWS/GCP)", signals: ["aws", "gcp", "docker"], weight: 2 },
  { id: "cv", label: "Computer vision a plus", signals: ["opencv", "detection"], weight: 1 },
  { id: "scale", label: "Performance / latency work", signals: ["profiling", "throughput"], weight: 2 },
];

const CANDIDATES = [
  {
    id: "vihan",
    name: "This resume",
    signals: ["python", "typescript", "rag", "llm", "node", "express", "aws", "docker", "opencv", "detection", "throughput"],
  },
  {
    id: "backend",
    name: "Backend generalist",
    signals: ["typescript", "node", "express", "aws", "docker", "throughput"],
  },
  {
    id: "research",
    name: "Research-only",
    signals: ["python", "rag", "llm", "pytorch"],
  },
];

export function initMatch(root) {
  const list = root.querySelector("[data-requirements]");
  const scoreEl = root.querySelector("[data-score]");
  const barEl = root.querySelector("[data-bar]");
  const tabs = [...root.querySelectorAll("[data-candidate]")];
  if (!list || !scoreEl) return;

  function evaluate(candidate) {
    let earned = 0;
    let total = 0;
    const rows = REQUIREMENTS.map((req) => {
      const hits = req.signals.filter((s) => candidate.signals.includes(s));
      const ratio = hits.length / req.signals.length;
      const state = ratio === 0 ? "missing" : ratio < 1 ? "partial" : "covered";
      // Partial credit is halved — "mentions it once" isn't "has done it".
      earned += req.weight * (state === "covered" ? 1 : state === "partial" ? 0.5 : 0);
      total += req.weight;
      return { ...req, state, hits };
    });
    return { rows, pct: Math.round((earned / total) * 100) };
  }

  function render(candidate) {
    const { rows, pct } = evaluate(candidate);

    list.replaceChildren(
      ...rows.map((row) => {
        const li = document.createElement("li");
        li.className = `req req-${row.state}`;

        const mark = document.createElement("span");
        mark.className = "req-mark";
        mark.setAttribute("aria-hidden", "true");
        mark.textContent = row.state === "covered" ? "●" : row.state === "partial" ? "◐" : "○";

        const label = document.createElement("span");
        label.className = "req-label";
        label.textContent = row.label;

        const state = document.createElement("span");
        state.className = "req-state";
        state.textContent =
          row.state === "covered" ? "Covered" : row.state === "partial" ? "Partial" : "Missing";

        const evidence = document.createElement("span");
        evidence.className = "req-evidence";
        evidence.textContent = row.hits.length ? row.hits.join(" · ") : "no matching signal";

        li.append(mark, label, state, evidence);
        return li;
      })
    );

    scoreEl.textContent = `${pct}%`;
    if (barEl) barEl.style.setProperty("--fill", `${pct}%`);
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => {
        t.classList.toggle("is-active", t === tab);
        t.setAttribute("aria-selected", String(t === tab));
      });
      const candidate = CANDIDATES.find((c) => c.id === tab.dataset.candidate);
      if (candidate) render(candidate);
    });
  });

  render(CANDIDATES[0]);
}
