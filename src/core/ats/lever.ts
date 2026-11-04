import type { Profile } from '../storage/storage';
import { resolveLocation, resolveLinks, resolveWorkAuthorization, setFieldValue, resolveIdentity } from './fieldMapping';

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

const LOCATION_SELECTORS = [
  '#location',
  'input[name="location"]',
  'input[autocomplete*="address" i]',
];

const LINK_SELECTORS = {
  linkedin: 'input[name="urls[LinkedIn]"]',
  github: 'input[name="urls[GitHub]"]',
  portfolio: 'input[name="urls[Portfolio]"]',
  website: 'input[name="urls[Website]"]',
  twitter: 'input[name="urls[Twitter]"]',
  other: 'input[name="urls[Other]"]',
};

const findInput = (root: ParentNode, selectors: readonly string[]) => {
  for (const selector of selectors) {
    const input = root.querySelector<HTMLInputElement>(selector);
    if (input) return input;
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

export const fillLever = (
  profile: LeverProfile,
  root: ParentNode = document,
) => {
  const form = root.querySelector<HTMLElement>('#application-form') ?? root;

  const { firstName, lastName } = resolveIdentity(profile);

  fillField(form, NAME_SELECTORS, profile.name);
  fillField(form, EMAIL_SELECTORS, profile.email);
  fillField(form, PHONE_SELECTORS, profile.phone);
  fillField(form, ORG_SELECTORS, profile.org ?? profile.company);

  fillField(form, LOCATION_SELECTORS, resolveLocation(profile, 'short'));

  fillField(form, LINKEDIN_SELECTORS, profile.linkedin);

  for (const [key, selector] of Object.entries(LINK_SELECTORS)) {
    const input = findInput(form, [selector]);
    if (input && input.value.trim().length === 0) {
      setFieldValue(input, resolveLinks(profile)[key] || '');
    }
  }

  const allCards = root.querySelectorAll<HTMLElement>('card');
  for (const card of allCards) {
    const cardText = card.textContent || '';
    const wa = resolveWorkAuthorization(profile, cardText);
    if (wa === 'yes' || wa === 'no') {
      const yesRadio = card.querySelector<
        HTMLInputElement
      >('input[type="radio"][value="yes"]');
      const noRadio = card.querySelector<
        HTMLInputElement
      >('input[type="radio"][value="no"]');
      const inputYes = card.querySelector<HTMLInputElement>('input[value="yes"]');
      const inputNo = card.querySelector<HTMLInputElement>('input[value="no"]');
      if (wa === 'yes') {
        if (yesRadio) setFieldValue(yesRadio, 'yes');
        if (inputYes) setFieldValue(inputYes, 'yes');
      } else if (wa === 'no') {
        if (noRadio) setFieldValue(noRadio, 'no');
        if (inputNo) setFieldValue(inputNo, 'no');
      }
    }
  }
};