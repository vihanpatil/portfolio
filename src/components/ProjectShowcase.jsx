import { useState } from "react";

function getCategories(projects) {
  const categories = new Set();

  for (const project of projects) {
    for (const category of project.categories) {
      categories.add(category);
    }
  }

  return ["All", ...categories];
}

export default function ProjectShowcase({ projects }) {
  const categories = getCategories(projects);
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredProjects =
    activeCategory === "All"
      ? projects
      : projects.filter((project) => project.categories.includes(activeCategory));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const isActive = category === activeCategory;

          return (
            <button
              key={category}
              className={isActive ? "filter-pill filter-pill-active" : "filter-pill"}
              onClick={() => setActiveCategory(category)}
              type="button"
            >
              {category}
            </button>
          );
        })}
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        {filteredProjects.map((project) => (
          <article className="panel flex h-full flex-col gap-5 p-6 sm:p-7" key={project.name}>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-2xl font-semibold text-[var(--ink)]">{project.name}</h3>
                  {project.featured ? <span className="project-badge">Featured</span> : null}
                </div>
                <p className="text-sm font-medium text-[var(--accent-strong)]">{project.year}</p>
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                {project.categories.map((category) => (
                  <span
                    className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]"
                    key={category}
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>

            <p className="text-base leading-7 text-[var(--muted)]">{project.summary}</p>

            <div className="soft-panel">
              <span className="detail-label">Impact</span>
              <p className="detail-copy">{project.impact}</p>
            </div>

            <div className="mt-auto grid gap-4">
              <div className="flex flex-wrap gap-2">
                {project.stack.map((item) => (
                  <span className="tool-pill" key={item}>
                    {item}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-4">
                {project.links.map((link) => (
                  <a
                    className="text-sm font-semibold text-[var(--ink)] transition hover:text-[var(--accent-strong)]"
                    href={link.href}
                    key={`${project.name}-${link.label}`}
                    rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                  >
                    {link.label}
                    {" ->"}
                  </a>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

