import type { AtsAdapter } from './types';

const LEVER_HOST = 'jobs.lever.co';
const GREENHOUSE_HOSTS = ['job-boards.greenhouse.io', 'boards.greenhouse.io'];
const WORKDAY_HOST_PATTERN = /(^|\.)(myworkdayjobs|myworkdaysite)\.com$/i;

const LEVER_DOM_SELECTORS = [
  '#application-form',
  'form[action*="lever.co"]',
  '[data-qa="application-form"]',
];

const GREENHOUSE_DOM_SELECTORS = [
  '#application_form',
  '#main_application_form',
  'form[action*="greenhouse.io"]',
];

const WORKDAY_DOM_SELECTORS = [
  '[data-automation-id="applyFlowPage"]',
  '[data-automation-id="jobApplication"]',
  '[data-automation-id="legalNameSection_firstName"]',
];

const hasAny = (root: ParentNode | undefined, selectors: readonly string[]) =>
  Boolean(root && selectors.some((selector) => root.querySelector(selector)));

const ADAPTERS: readonly AtsAdapter[] = [
  {
    platform: 'lever',
    matches: (url, root) =>
      url.hostname === LEVER_HOST || hasAny(root, LEVER_DOM_SELECTORS),
  },
  {
    platform: 'greenhouse',
    matches: (url, root) =>
      GREENHOUSE_HOSTS.includes(url.hostname) ||
      hasAny(root, GREENHOUSE_DOM_SELECTORS),
  },
  {
    platform: 'workday',
    matches: (url, root) =>
      WORKDAY_HOST_PATTERN.test(url.hostname) ||
      hasAny(root, WORKDAY_DOM_SELECTORS),
  },
];

const parseUrl = (input: string | URL) => {
  try {
    return new URL(input instanceof URL ? input.href : input);
  } catch {
    return null;
  }
};

export const detectAts = (
  input: string | URL = typeof location === 'undefined' ? '' : location.href,
  root?: ParentNode,
): AtsAdapter | null => {
  const url = parseUrl(input);
  if (!url) return null;

  const dom = root ?? (typeof document === 'undefined' ? undefined : document);
  return ADAPTERS.find((adapter) => adapter.matches(url, dom)) ?? null;
};
