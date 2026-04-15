# Portfolio Template

A professional portfolio starter built with Astro, React, and Tailwind CSS v4, ready for static deployment on Cloudflare Pages.

## Stack

- Astro 5
- React 19
- Tailwind CSS 4 with the Vite plugin
- Static output for Cloudflare Pages

## Local development

```bash
npm install
npm run dev
```

Open the dev server URL shown in the terminal.

## Build

```bash
npm run build
```

The production output is generated in `dist/`.

## Deploy to Cloudflare Pages

Create a new Pages project and use:

- Build command: `npm run build`
- Build output directory: `dist`

Cloudflare's Astro Pages guide documents the same static build settings.

## Customize content

Update your profile content in:

- `src/data/portfolio.js`

Main page structure and sections live in:

- `src/pages/index.astro`

Global look and feel lives in:

- `src/styles/global.css`

## Notes

- The included social and contact links are placeholders. Replace them before publishing.
- The site is mostly static, with a small React-powered project filter for interaction.
