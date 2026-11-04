import { defineConfig } from 'wxt';

// See https://wxt.dev/api/reference/wxt/interfaces/inlineconfig.html
export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-svelte'],
  manifest: {
    permissions: ['storage'],
    options_ui: {
      open_in_tab: true,
    },
  },
  hooks: {
    'entrypoints:found': (_wxt, entrypoints) => {
      const sources = entrypoints.filter(
        ({ inputPath }) => !/\.test\.[jt]sx?$/.test(inputPath),
      );
      entrypoints.splice(0, entrypoints.length, ...sources);
    },
  },
  webExt: {
    chromiumArgs: [
      '--user-data-dir=./.wxt/chrome-data',
      '--ozone-platform-hint=auto',
    ],
  },
});
