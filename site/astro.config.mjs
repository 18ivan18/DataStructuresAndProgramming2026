import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';

// GitHub Pages serves the site under /<repo>/; internal links go through import.meta.env.BASE_URL.
export default defineConfig({
  site: 'https://18ivan18.github.io',
  base: '/DataStructuresAndProgramming2026',
  integrations: [react(), mdx()],
});
