export type FormField =
  | HTMLInputElement
  | HTMLTextAreaElement
  | HTMLSelectElement;

const getNativeSetter = (
  element: FormField,
): ((value: string) => void) | undefined => {
  if (element instanceof HTMLInputElement) {
    return Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value',
    )?.set;
  }
  if (element instanceof HTMLTextAreaElement) {
    return Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      'value',
    )?.set;
  }
  return Object.getOwnPropertyDescriptor(
    window.HTMLSelectElement.prototype,
    'value',
  )?.set;
};

export const setElementValue = (element: FormField, value: string) => {
  const nativeValueSetter = getNativeSetter(element);

  if (nativeValueSetter) {
    nativeValueSetter.call(element, value);
  } else {
    element.value = value;
  }

  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
};

export const setInputValue = (input: HTMLInputElement, value: string) =>
  setElementValue(input, value);

export const splitName = (name: string) => {
  const [firstName = '', ...rest] = name.trim().split(/\s+/);
  return { firstName, lastName: rest.join(' ') };
};
