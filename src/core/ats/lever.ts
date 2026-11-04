import type { Profile } from '../storage/storage';

export type LeverProfile = Profile & {
  company?: string;
};

const NAME_SELECTORS = [
  '#name',
  'input[name="name"]',
  'input[autocomplete="name"]',
];

const EMAIL_SELECTORS = [
  '#email',
  'input[name="email"]',
  'input[type="email"]',
  'input[autocomplete="email"]',
];

const PHONE_SELECTORS = [
  '#phone',
  'input[name="phone"]',
  'input[type="tel"]',
  'input[autocomplete="tel"]',
];

const ORG_SELECTORS = ['#org', 'input[name="org"]', 'input[name="company"]'];

const LINKEDIN_SELECTORS = [
  '[id="urls[LinkedIn]"]',
  'input[name="urls[LinkedIn]"]',
  'input[id="linkedin"]',
  'input[name="linkedin"]',
  'input[autocomplete="linkedin"]',
];

const findInput = (root: ParentNode, selectors: readonly string[]) => {
  for (const selector of selectors) {
    const input = root.querySelector<HTMLInputElement>(selector);
    if (input) return input;
  }

  return null;
};

const setInputValue = (input: HTMLInputElement, value: string) => {
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    'value',
  )?.set;

  if (nativeInputValueSetter) {
    nativeInputValueSetter.call(input, value);
  } else {
    input.value = value;
  }

  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
};

const fillField = (
  root: ParentNode,
  selectors: readonly string[],
  value: string | undefined,
) => {
  if (!value) return;

  const input = findInput(root, selectors);
  if (input && input.value.trim().length === 0) setInputValue(input, value);
};

export const fillLever = (
  profile: LeverProfile,
  root: ParentNode = document,
) => {
  const form = root.querySelector<HTMLElement>('#application-form') ?? root;

  fillField(form, NAME_SELECTORS, profile.name);
  fillField(form, EMAIL_SELECTORS, profile.email);
  fillField(form, PHONE_SELECTORS, profile.phone);
  fillField(form, ORG_SELECTORS, profile.org ?? profile.company);
  fillField(form, LINKEDIN_SELECTORS, profile.linkedin);
};
