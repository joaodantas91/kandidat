import { configDefaults, defineConfig } from 'vitest/config';
import { WxtVitest } from 'wxt/testing/vitest-plugin';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [WxtVitest(), svelte()],
  resolve: {
    conditions: ['browser'],
  },
  test: {
    environment: 'happy-dom',
    exclude: [...configDefaults.exclude, '.worktrees/**'],
  },
});
