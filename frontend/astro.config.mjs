// @ts-check
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';

// https://astro.build/config
export default defineConfig({
  site: 'https://anpalopg.github.io',
  base: '/proyecto-videojuego',
  output: 'static',
  integrations: [preact({ compat: true })],
});
