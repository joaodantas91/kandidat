import type { Profile } from '../storage/storage';
import { resolveLocation, resolveLinks, resolveWorkAuthorization, setFieldValue, splitName } from '../ats/fieldMapping';

export { splitName };

const FIRST_NAME_SELECTORS = [
  '#first_name',
  'input[name="first_name"]',
  'input[autocomplete="given-name"]',
];

const LAST_NAME_SELECTORS = [
  '#last_name',
  'input[name="last_name"]',
  'input[autocomplete="family-name"]',
];

const EMAIL_SELECTORS = [
  '#email',
  'input[autocomplete="email"]',
  'input[type="email"]',
  'input[name="email"]',
];

const PHONE_SELECTORS = [
  '#phone',
  'input[autocomplete="tel"]',
  'input[type="tel"]',
  'input[name="phone"]',
];

const LOCATION_SELECTORS = [
  'input[name="job_application[location]"]',
  '#location',
  'input[name="location"]',
  'input[autocomplete*="address" i]',
];

const QUESTION_FIELD = /(^|[\s_-])question_/i;
const LINKEDIN_TEXT = /linked\s*in/i;
const AUTH_TEXT = /(legally\s+authorized|sponsorship)/i;

const findInput = (root: ParentNode, selectors: readonly string[]) => {
  for (const selector of selectors) {
    const input = root.querySelector<HTMLInputElement>(selector);
    if (input) return input;
  }
  return null;
};

const labelText = (input: HTMLInputElement) => {
  const labels = input.labels;
  if (labels?.length) {
    return Array.from(labels)
      .map((label) => label.textContent ?? '')
      .join(' ');
  }
  return input.closest('label')?.textContent ?? '';
};

const LINKEDIN_SELECTORS = [
  '#linkedin',
  'input[name*="linkedin" i]',
  'input[autocomplete="linkedin"]',
];

const findLinkedInQuestion = (root: ParentNode) => {
  const direct = findInput(root, LINKEDIN_SELECTORS);
  if (direct) return direct;

  for (const input of root.querySelectorAll<HTMLInputElement>('input')) {
    if (!QUESTION_FIELD.test(`${input.name} ${input.id}`)) continue;

    const context = [
      labelText(input),
      input.getAttribute('aria-label'),
      input.getAttribute('placeholder'),
      input.getAttribute('title'),
    ].join(' ');

    if (LINKEDIN_TEXT.test(context)) return input;
  }

  return null;
};

const findAuthQuestion = (root: ParentNode) => {
  for (const input of root.querySelectorAll<HTMLInputElement>('input')) {
    if (!QUESTION_FIELD.test(`${input.name} ${input.id}`)) continue;

    const context = [
      labelText(input),
      input.getAttribute('aria-label'),
      input.getAttribute('placeholder'),
      input.getAttribute('title'),
    ].join(' ');

    if (AUTH_TEXT.test(context)) return input;
  }
  return null;
};

const fillField = (
  root: ParentNode,
  selectors: readonly string[],
  value: string | undefined,
) => {
  if (!value) return;

  const input = findInput(root, selectors);
  if (input && input.value.trim().length === 0) setFieldValue(input, value);
};

export const fillGreenhouse = (
  profile: Profile,
  root: ParentNode = document,
) => {
  const { firstName, lastName } = splitName(profile.name);

  fillField(root, FIRST_NAME_SELECTORS, firstName);
  fillField(root, LAST_NAME_SELECTORS, lastName);
  fillField(root, EMAIL_SELECTORS, profile.email);
  fillField(root, PHONE_SELECTORS, profile.phone);

  fillField(root, LOCATION_SELECTORS, resolveLocation(profile, 'short'));

  if (profile.linkedin) {
    const linkedin = findLinkedInQuestion(root);
    if (linkedin && linkedin.value.trim().length === 0) {
      setFieldValue(linkedin, profile.linkedin);
    }
  }

  const authInput = findAuthQuestion(root);
  if (authInput) {
    const wa = resolveWorkAuthorization(profile, labelText(authInput) || '');
    if (wa === 'yes' || wa === 'no') {
      setFieldValue(authInput, wa);
    }
  }

  const links = resolveLinks(profile);
  for (const [key, value] of Object.entries(links)) {
    const linkInput = root.querySelector<HTMLInputElement>(
      `input[name*="${key}"], input[id*="${key}"]`,
    );
    if (linkInput && linkInput.value.trim().length === 0) {
      setFieldValue(linkInput as HTMLInputElement, value);
    }
  }
};