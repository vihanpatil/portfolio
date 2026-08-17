/**
 * Build-time GitHub fetch.
 *
 * Deliberately static: Astro `output: "static"` is what keeps the existing
 * Vercel pipeline zero-config. ISR would buy ~an hour of freshness in
 * exchange for an adapter and a serverless build, which isn't a trade worth
 * making for a repo list — a redeploy refreshes this.
 *
 * This NEVER throws. A failed fetch degrades to `{ ok: false }` and the
 * component renders a designed fallback instead of breaking the build.
 */

const API = "https://api.github.com";
const FRESH_DAYS = 30;

async function get(path, signal) {
  const res = await fetch(`${API}${path}`, {
    signal,
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "vihanpatil-portfolio-build",
      // GITHUB_TOKEN is optional. Set it in Vercel to raise the rate limit
      // or to read a profile that isn't publicly visible.
      ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
    },
  });
  if (!res.ok) {
    const err = new Error(`GitHub ${path} → ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

function daysSince(iso) {
  return (Date.now() - new Date(iso).getTime()) / 86400000;
}

export async function getGitHub(handle, { pin = [], exclude = [] } = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const [user, repos] = await Promise.all([
      get(`/users/${handle}`, controller.signal),
      get(`/users/${handle}/repos?per_page=100&sort=pushed`, controller.signal),
    ]);

    // Forks are dropped by default (usually someone else's code), but repos
    // backing a featured project are pinned through regardless — HealthWise
    // is a fork of the capstone team repo and still belongs here.
    // `exclude` keeps low-signal repos (empty scratch repos, this site's own
    // source) out of the panel without touching them on GitHub.
    const pinned = new Set(pin);
    const excluded = new Set(exclude);
    const owned = repos
      .filter((r) => (!r.fork || pinned.has(r.name)) && !r.archived && !excluded.has(r.name))
      .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at));

    const languages = [...new Set(owned.map((r) => r.language).filter(Boolean))];

    return {
      ok: true,
      handle,
      url: user.html_url,
      name: user.name || handle,
      bio: user.bio || null,
      publicRepos: user.public_repos,
      followers: user.followers,
      languages: languages.slice(0, 8),
      repos: owned.slice(0, 6).map((r) => ({
        name: r.name,
        url: r.html_url,
        description: r.description,
        language: r.language,
        stars: r.stargazers_count,
        pushedAt: r.pushed_at,
        // Drives the "current work, not a six-month-old snapshot" treatment.
        fresh: daysSince(r.pushed_at) <= FRESH_DAYS,
      })),
    };
  } catch (error) {
    // Loud in the build log, silent on the page.
    console.warn(
      `\n[github] Live data unavailable for "${handle}": ${error.message}\n` +
        `[github] Rendering static fallback. If the profile is private or\n` +
        `[github] restricted, set GITHUB_TOKEN in the Vercel project to read it.\n`
    );
    return { ok: false, handle, url: `https://github.com/${handle}`, reason: error.message };
  } finally {
    clearTimeout(timeout);
  }
}
