import { describe, it, expect, beforeEach, vi } from 'vitest';
import { autofill, FIELD_RULES } from './autofill';
import type { Profile } from '../storage/storage';

describe('autofill()', () => {
  const profile: Profile = {
    name: 'John Doe',
    phone: '999999',
    email: 'john@doe.com',
    linkedin: 'www.linkedin.com/john-doe',
  };

  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it.each([
    { field: 'name', id: 'name', expected: profile.name },
    { field: 'email', id: 'email', expected: profile.email },
    { field: 'phone', id: 'phone', expected: profile.phone },
    { field: 'linkedin', id: 'linkedin', expected: profile.linkedin },
  ])('fills $field when input has [id="$id"]', ({ id, expected }) => {
    const input = document.createElement('input');
    input.setAttribute('id', id);
    document.body.appendChild(input);

    autofill({ profile, root: document });

    expect(document.querySelector<HTMLInputElement>(`#${id}`)?.value).toBe(
      expected,
    );
  });

  it.each([
    { field: 'name', autocomplete: 'name', expected: profile.name },
    { field: 'email', autocomplete: 'email', expected: profile.email },
    { field: 'phone', autocomplete: 'tel', expected: profile.phone },
    { field: 'linkedin', autocomplete: 'linkedin', expected: profile.linkedin },
  ])(
    'fills $field when input has [autocomplete="$autocomplete"]',
    ({ autocomplete, expected }) => {
      const input = document.createElement('input');
      input.setAttribute('autocomplete', autocomplete);
      document.body.appendChild(input);

      autofill({ profile, root: document });

      const selectedInput = document.querySelector<HTMLInputElement>(
        `[autocomplete="${autocomplete}"]`,
      );

      expect(selectedInput?.value).toBe(expected);
    },
  );

  it.each([
    { field: 'name', name: 'name', expected: profile.name },
    { field: 'email', name: 'email', expected: profile.email },
    { field: 'phone', name: 'phone', expected: profile.phone },
    { field: 'linkedin', name: 'linkedin', expected: profile.linkedin },
  ])('fills $field when input has [name="$name"]', ({ name, expected }) => {
    const input = document.createElement('input');
    input.setAttribute('name', name);
    document.body.appendChild(input);

    autofill({ profile, root: document });

    const selectedInput = document.querySelector<HTMLInputElement>(
      `[name="${name}"]`,
    );

    expect(selectedInput?.value).toBe(expected);
  });

  it('calls prototype native value setter when filling input', () => {
    const input = document.createElement('input');
    input.setAttribute('name', 'name');
    document.body.appendChild(input);

    const handlerSpy = vi.spyOn(HTMLInputElement.prototype, 'value', 'set');

    autofill({ profile, root: document });

    expect(handlerSpy).toHaveBeenCalled();
    handlerSpy.mockRestore();
  });

  it.each([
    {
      event: 'change',
    },
    {
      event: 'input',
    },
  ])('dispatches bubbling $event event when filling input', ({ event }) => {
    const input = document.createElement('input');
    input.setAttribute('name', 'name');
    document.body.appendChild(input);

    const handlerSpy = vi.fn();

    document.addEventListener(event, handlerSpy);

    autofill({ profile, root: document });

    expect(handlerSpy).toHaveBeenCalled();

    document.removeEventListener(event, handlerSpy);
  });
});
