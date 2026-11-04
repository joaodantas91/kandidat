import { defineConfig } from 'wxt';

const ATS_MATCHES = [
  '*://*.lever.co/*',
  '*://*.greenhouse.io/*',
  '*://*.myworkdayjobs.com/*',
  '*://*.myworkdaysite.com/*',
  '*://*.workday.com/*',
  '*://*.linkedin.com/*',
];

// See https://wxt.dev/api/reference/wxt/interfaces/inlineconfig.html
export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-svelte'],
  manifest: {
    permissions: ['storage'],
  },
  hooks: {
    'entrypoints:found': (_wxt, entrypoints) => {
      const sources = entrypoints.filter(
        ({ inputPath }) => !/\.test\.[jt]sx?$/.test(inputPath),
      );
      entrypoints.splice(0, entrypoints.length, ...sources);
    },
    'build:manifestGenerated': (_wxt, manifest) => {
      for (const contentScript of manifest.content_scripts ?? []) {
        contentScript.matches = ATS_MATCHES;
      }
    },
  },
  webExt: {
    chromiumArgs: [
      '--user-data-dir=./.wxt/chrome-data',
      '--ozone-platform-hint=auto',
    ],
  },
});
