import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Detecta se a compilação é do GitHub Actions (GitHub Pages) ou Vercel / Local
const isGitHubPages = process.env.GITHUB_ACTIONS === "true";

export default defineConfig({
  plugins: [react()],
  base: isGitHubPages ? "/Front-30-/" : "/",
});
