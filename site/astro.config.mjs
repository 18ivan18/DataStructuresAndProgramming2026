import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import { satteri } from '@astrojs/markdown-satteri';
import { katexPlugin } from './src/lib/katex-plugin.ts';

// GitHub Pages serves the site under /<repo>/; internal links go through import.meta.env.BASE_URL.
// Production builds get their own Vite cache. Sharing node_modules/.vite with a running dev server
// lets a build overwrite the dev server's pre-bundled React with the production one, and every
// island then fails in dev with "_jsxDEV is not a function".
const building = process.argv.includes('build');

export default defineConfig({
  site: 'https://18ivan18.github.io',
  base: '/DataStructuresAndProgramming2026',
  integrations: [react(), mdx()],
  vite: { cacheDir: building ? 'node_modules/.vite-build' : 'node_modules/.vite' },
  markdown: {
    processor: satteri({ features: { math: true }, mdastPlugins: [katexPlugin] }),
  },
});
