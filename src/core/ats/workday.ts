import type { Profile } from '../storage/storage';

export const WORKDAY_FIELD_SELECTORS = {
  firstName: '[data-automation-id="legalNameSection_firstName"]',
  lastName: '[data-automation-id="legalNameSection_lastName"]',
  email: '[data-automation-id="email"]',
  phone: '[data-automation-id="phone-number"]',
} as const;

export const splitName = (name: string) => {
  const [firstName = '', ...rest] = name.trim().split(/\s+/);
  return { firstName, lastName: rest.join(' ') };
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
  selector: string,
  value: string | undefined,
) => {
  if (!value) return;

  const input = root.querySelector<HTMLInputElement>(selector);
  if (input && input.value.trim().length === 0) setInputValue(input, value);
};

export const fillWorkday = (profile: Profile, root: ParentNode = document) => {
  const { firstName, lastName } = splitName(profile.name);

  fillField(root, WORKDAY_FIELD_SELECTORS.firstName, firstName);
  fillField(root, WORKDAY_FIELD_SELECTORS.lastName, lastName);
  fillField(root, WORKDAY_FIELD_SELECTORS.email, profile.email);
  fillField(root, WORKDAY_FIELD_SELECTORS.phone, profile.phone);
};
