import type { Profile } from '../storage/storage';

type Autofill = {
  root?: ParentNode;
  profile: Profile;
};

const NAME_SELECTORS = [
  'input[autocomplete="name"]',
  'input[autocomplete="given-name"]',
  'input[name="full_name"]',
  'input[name="name"]',
  '#name',
];

const EMAIL_SELECTORS = [
  'input[autocomplete="email"]',
  'input[type="email"]',
  'input[name="email"]',
  'input[name="candidate_email"]',
  '#email',
];

const PHONE_SELECTORS = [
  'input[autocomplete="tel"]',
  'input[type="tel"]',
  'input[name="phone"]',
  'input[name="tel"]',
  'input[name="mobile"]',
  '#phone',
];

const LINKEDIN_SELECTORS = [
  'input[autocomplete="linkedin"]',
  'input[name*="linkedin" i]',
  'input[placeholder*="linkedin" i]',
  '#linkedin',
];

type FieldRule = {
  field: keyof Profile;
  selectors: readonly string[];
};

export const FIELD_RULES: readonly FieldRule[] = [
  { field: 'name', selectors: NAME_SELECTORS },
  { field: 'email', selectors: EMAIL_SELECTORS },
  { field: 'phone', selectors: PHONE_SELECTORS },
  { field: 'linkedin', selectors: LINKEDIN_SELECTORS },
];

function findInput(root: ParentNode, selectors: readonly string[]) {
  for (const selector of selectors) {
    const input = root.querySelector<HTMLInputElement>(selector);
    if (input) return input;
  }

  return null;
}

export const autofill = ({ root = document, profile }: Autofill) => {
  for (const { field, selectors } of FIELD_RULES) {
    if (!profile[field]) continue;

    const input = findInput(root, selectors);
    if (input) input.value = profile[field];
  }
};
