import type { Profile } from '../storage/storage';
import { setElementValue } from '../dom/setter';

export type FormField = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

type Autofill = {
  root?: ParentNode;
  profile: Profile;
};

const NAME_SELECTORS = [
  'input[autocomplete="name"]',
  'input[autocomplete="given-name"]',
  'input[name="full_name"]',
  'input[name="name"]',
  'textarea[name="name"]',
  '#name',
];

const EMAIL_SELECTORS = [
  'input[autocomplete="email"]',
  'input[type="email"]',
  'input[name="email"]',
  'input[name="candidate_email"]',
  'textarea[name="email"]',
  '#email',
];

const PHONE_SELECTORS = [
  'input[autocomplete="tel"]',
  'input[type="tel"]',
  'input[name="phone"]',
  'input[name="tel"]',
  'input[name="mobile"]',
  'textarea[name="phone"]',
  '#phone',
];

const LINKEDIN_SELECTORS = [
  'input[autocomplete="linkedin"]',
  'input[name*="linkedin" i]',
  'textarea[name*="linkedin" i]',
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

function findFormField(root: ParentNode, selectors: readonly string[]): FormField | null {
  for (const selector of selectors) {
    const element = root.querySelector<FormField>(selector);
    if (element) return element;
  }

  return null;
}

export const autofill = ({ root = document, profile }: Autofill) => {
  for (const { field, selectors } of FIELD_RULES) {
    const fieldValue = profile[field];
    if (!fieldValue) continue;

    const element = findFormField(root, selectors);
    if (element && typeof fieldValue === 'string' && element.value.trim().length === 0) {
      setElementValue(element, fieldValue);
    }
  }
};
