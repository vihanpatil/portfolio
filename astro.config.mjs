import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

// Static output is deliberate: it's what keeps the existing Vercel project
// zero-config (auto-detected Astro preset, `astro build` → dist/).
export default defineConfig({
  output: "static",
  site: "https://vihanpatil.com",
  vite: {
    plugins: [tailwindcss()],
  },
});
