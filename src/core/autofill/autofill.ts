import type { Profile } from '../storage/storage';

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

function getNativeValueSetter(element: FormField): ((value: string) => void) | undefined {
  if (element instanceof HTMLInputElement) {
    return Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
  }
  if (element instanceof HTMLTextAreaElement) {
    return Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
  }
  if (element instanceof HTMLSelectElement) {
    return Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value')?.set;
  }
  return undefined;
}

function setFieldValue(
  element: FormField,
  value: NonNullable<Profile[keyof Profile]>,
) {
  const nativeValueSetter = getNativeValueSetter(element);

  if (nativeValueSetter) {
    nativeValueSetter.call(element, value);
  } else {
    element.value = value;
  }

  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
}

export const autofill = ({ root = document, profile }: Autofill) => {
  for (const { field, selectors } of FIELD_RULES) {
    const fieldValue = profile[field];
    if (!fieldValue) continue;

    const element = findFormField(root, selectors);
    if (element && element.value.trim().length === 0) {
      setFieldValue(element, fieldValue);
    }
  }
};
