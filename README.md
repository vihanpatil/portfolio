# vihanpatil.com

Personal engineering portfolio. Astro, static output, deployed on Vercel.

## Run it

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # -> dist/
```

## Stack

- **Astro 5**, `output: "static"` — deliberate. The Vercel project is
  dashboard-configured with the auto-detected Astro preset (`astro build` →
  `dist/`), so there is no `vercel.json` to keep in sync. Adding an adapter
  or switching to SSR would require changing the Vercel project settings.
- **Tailwind 4** via `@tailwindcss/vite`, used alongside a hand-rolled token
  system in `src/styles/tokens.css`.
- **No UI framework.** Every interactive piece is vanilla JS against the
  DOM or a canvas. Total page JS is ~5.5 KB gzipped.
- Self-hosted variable fonts (Fraunces, Manrope, JetBrains Mono) via
  `@fontsource-variable`, latin-subset, with only the display face preloaded.

## Layout

```
src/
  data/portfolio.js     all site content — copy, timeline, projects
  lib/github.js         build-time GitHub fetch (never throws)
  styles/tokens.css     palette, type scale, spacing, motion tokens
  styles/global.css     base + shared component classes
  scripts/              field, reveal, nav, coverage, match, architecture, lightbox
  components/           Hero, Timeline, ProjectWindows, GitHubPanel, SectionHead
```

## Design system

Obsidian base (`#0B0B0F`) with a scarce amber accent. All text colours are
verified against WCAG AA — see the ratios annotated in `tokens.css`.
`--ink-3` is **non-text decoration only** (3.65:1); assigning it to copy is a
contrast failure.

Motion is token-driven. `prefers-reduced-motion` zeroes `--parallax` and
collapses all durations at the token level, so consumers inherit the static
state without a JS branch. Scroll reveals are opt-in: content is visible by
default and JS adds `.reveal-on` to arm the animation, so a failed script or
a throttled IntersectionObserver can never leave the page blank.

## GitHub integration

`src/lib/github.js` fetches repos at build time and never throws — a failure
logs a warning and renders a designed fallback panel instead of breaking the
build. Freshness comes from redeploying, not ISR (which would cost the
zero-config static pipeline).

Set `GITHUB_TOKEN` in the Vercel project to raise the rate limit or to read a
profile that is not publicly visible.

## Project demos

Flagship projects each get a real "window" rather than a description card:

| Project | Window |
| --- | --- |
| HealthWise | Lazy YouTube lightbox + interactive retrieval pipeline |
| SwathKeeper | Live coverage-path planner on canvas (drag obstacles to re-plan) |
| FinScreen | Interactive EDGAR ingest→label pipeline map |
| Blockchain Analytics | Interactive ingestion-architecture map |
| MatchDesk | Client-side requirement-coverage scorer |

The coverage planner runs the real algorithm: columns split into contiguous
free runs, traversed in alternating direction, with A* joining the runs so
transits route around obstacles instead of through them.
