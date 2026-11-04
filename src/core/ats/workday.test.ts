import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fillWorkday, splitName } from './workday';
import type { Profile } from '../storage/storage';

const fixture = readFileSync(
  resolve('tests/fixtures/workday-my-information.html'),
  'utf8',
);

const profile: Profile = {
  name: 'John Doe',
  email: 'john@doe.com',
  phone: '999999',
};

const input = (selector: string) =>
  document.querySelector<HTMLInputElement>(selector);

const mountFixture = () => {
  const parsed = new DOMParser().parseFromString(fixture, 'text/html');
  document.body.innerHTML = parsed.body.innerHTML;
};

describe('splitName()', () => {
  it('splits a full name into first and last name', () => {
    expect(splitName('John Doe')).toEqual({
      firstName: 'John',
      lastName: 'Doe',
    });
  });

  it('keeps the remaining name parts in the last name', () => {
    expect(splitName('  John Ronald Reuel Tolkien  ')).toEqual({
      firstName: 'John',
      lastName: 'Ronald Reuel Tolkien',
    });
  });

  it('handles a single name', () => {
    expect(splitName('John')).toEqual({ firstName: 'John', lastName: '' });
  });
});

describe('fillWorkday()', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('fills the My Information fields from the saved profile', () => {
    mountFixture();

    fillWorkday(profile, document);

    expect(
      input('[data-automation-id="legalNameSection_firstName"]')?.value,
    ).toBe('John');
    expect(
      input('[data-automation-id="legalNameSection_lastName"]')?.value,
    ).toBe('Doe');
    expect(input('[data-automation-id="email"]')?.value).toBe(profile.email);
    expect(input('[data-automation-id="phone-number"]')?.value).toBe(
      profile.phone,
    );
  });

  it('leaves fields from other Workday steps untouched', () => {
    mountFixture();

    fillWorkday(profile, document);

    expect(
      input('[data-automation-id="legalNameSection_middleName"]')?.value,
    ).toBe('');
    expect(
      input('[data-automation-id="addressSection_addressLine1"]')?.value,
    ).toBe('');
  });

  it('does not overwrite values already entered by the user', () => {
    mountFixture();
    const current = {
      firstName: 'Jane',
      lastName: 'Roe',
      email: 'typed@example.com',
      phone: '123',
    };

    input('[data-automation-id="legalNameSection_firstName"]')!.value =
      current.firstName;
    input('[data-automation-id="legalNameSection_lastName"]')!.value =
      current.lastName;
    input('[data-automation-id="email"]')!.value = current.email;
    input('[data-automation-id="phone-number"]')!.value = current.phone;

    fillWorkday(profile, document);

    expect(
      input('[data-automation-id="legalNameSection_firstName"]')?.value,
    ).toBe(current.firstName);
    expect(
      input('[data-automation-id="legalNameSection_lastName"]')?.value,
    ).toBe(current.lastName);
    expect(input('[data-automation-id="email"]')?.value).toBe(current.email);
    expect(input('[data-automation-id="phone-number"]')?.value).toBe(
      current.phone,
    );
  });

  it('skips optional profile fields that are not set', () => {
    mountFixture();

    fillWorkday({ name: 'John Doe' }, document);

    expect(
      input('[data-automation-id="legalNameSection_firstName"]')?.value,
    ).toBe('John');
    expect(
      input('[data-automation-id="legalNameSection_lastName"]')?.value,
    ).toBe('Doe');
    expect(input('[data-automation-id="email"]')?.value).toBe('');
    expect(input('[data-automation-id="phone-number"]')?.value).toBe('');
  });

  it('no-ops when the My Information step is absent', () => {
    document.body.innerHTML = `
      <form data-automation-id="applyFlowPage">
        <input
          data-automation-id="workExperienceSection_jobTitle"
          type="text"
        />
      </form>
    `;
    const handler = vi.fn();
    document.addEventListener('input', handler);

    fillWorkday(profile, document);

    expect(
      input('[data-automation-id="workExperienceSection_jobTitle"]')?.value,
    ).toBe('');
    expect(handler).not.toHaveBeenCalled();

    document.removeEventListener('input', handler);
  });

  it('uses the native input value setter', () => {
    mountFixture();
    const setter = vi.spyOn(HTMLInputElement.prototype, 'value', 'set');

    fillWorkday(profile, document);

    expect(setter).toHaveBeenCalled();
    setter.mockRestore();
  });

  it.each(['input', 'change'])(
    'dispatches bubbling %s events for filled fields',
    (eventName) => {
      mountFixture();
      const handler = vi.fn();
      document.addEventListener(eventName, handler);

      fillWorkday(profile, document);

      expect(handler).toHaveBeenCalled();
      for (const call of handler.mock.calls) {
        expect(call[0].bubbles).toBe(true);
      }

      document.removeEventListener(eventName, handler);
    },
  );

  it('does not submit the form or click navigation buttons', () => {
    mountFixture();
    const submitHandler = vi.fn();
    const clickHandler = vi.fn();

    document.querySelector('form')?.addEventListener('submit', submitHandler);
    document
      .querySelectorAll('button')
      .forEach((button) => button.addEventListener('click', clickHandler));

    fillWorkday(profile, document);

    expect(submitHandler).not.toHaveBeenCalled();
    expect(clickHandler).not.toHaveBeenCalled();
  });

  it('can fill a scoped root element', () => {
    document.body.innerHTML = `
      <form id="my-information">
        <input data-automation-id="legalNameSection_firstName" />
        <input data-automation-id="legalNameSection_lastName" />
      </form>
    `;
    const form = document.querySelector('#my-information');
    if (!form) throw new Error('fixture form missing');

    fillWorkday({ name: 'Jane Roe' }, form);

    expect(
      input('[data-automation-id="legalNameSection_firstName"]')?.value,
    ).toBe('Jane');
    expect(
      input('[data-automation-id="legalNameSection_lastName"]')?.value,
    ).toBe('Roe');
  });
});
