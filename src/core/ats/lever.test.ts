import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fillLever, type LeverProfile } from './lever';

const fixture = readFileSync(resolve('tests/fixtures/lever-form.html'), 'utf8');

const profile: LeverProfile = {
  name: 'John Doe',
  email: 'john@doe.com',
  phone: '999999',
  org: 'Acme Inc',
  linkedin: 'www.linkedin.com/in/john-doe',
};

const input = (selector: string) =>
  document.querySelector<HTMLInputElement>(selector);

const mountFixture = () => {
  const parsed = new DOMParser().parseFromString(fixture, 'text/html');
  document.body.innerHTML = parsed.body.innerHTML;
};

describe('fillLever()', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('fills the Lever identity fields from the saved profile', () => {
    mountFixture();

    fillLever(profile, document);

    expect(input('#name')?.value).toBe(profile.name);
    expect(input('#email')?.value).toBe(profile.email);
    expect(input('#phone')?.value).toBe(profile.phone);
    expect(input('#org')?.value).toBe(profile.org);
    expect(input('input[name="urls[LinkedIn]"]')?.value).toBe(profile.linkedin);
  });

  it('leaves custom application questions untouched', () => {
    mountFixture();

    fillLever(profile, document);

    expect(input('#question_1')?.value).toBe('');
    expect(input('#question_2')?.value).toBe('');
  });

  it('does not overwrite values already entered by the user', () => {
    mountFixture();
    const email = input('#email');
    if (email) email.value = 'typed@example.com';

    fillLever(profile, document);

    expect(email?.value).toBe('typed@example.com');
  });

  it('skips optional profile fields that are not set', () => {
    mountFixture();

    fillLever({ name: 'John Doe' }, document);

    expect(input('#name')?.value).toBe('John Doe');
    expect(input('#email')?.value).toBe('');
    expect(input('#phone')?.value).toBe('');
    expect(input('#org')?.value).toBe('');
    expect(input('input[name="urls[LinkedIn]"]')?.value).toBe('');
  });

  it('falls back to company when org is not set', () => {
    mountFixture();

    fillLever({ name: 'John Doe', company: 'Acme Inc' }, document);

    expect(input('#org')?.value).toBe('Acme Inc');
  });

  it('uses the native input value setter', () => {
    mountFixture();
    const setter = vi.spyOn(HTMLInputElement.prototype, 'value', 'set');

    fillLever(profile, document);

    expect(setter).toHaveBeenCalled();
    setter.mockRestore();
  });

  it.each(['input', 'change'])(
    'dispatches bubbling %s events for filled fields',
    (eventName) => {
      mountFixture();
      const handler = vi.fn();
      document.addEventListener(eventName, handler);

      fillLever(profile, document);

      expect(handler).toHaveBeenCalled();
      for (const call of handler.mock.calls) {
        expect(call[0].bubbles).toBe(true);
      }

      document.removeEventListener(eventName, handler);
    },
  );

  it('can fill a scoped root element', () => {
    document.body.innerHTML = `
      <form id="application-form">
        <input id="name" />
        <input id="email" />
      </form>
    `;
    const form = document.querySelector('#application-form');
    if (!form) throw new Error('fixture form missing');

    fillLever({ name: 'Jane Roe', email: 'jane@example.com' }, form);

    expect(input('#name')?.value).toBe('Jane Roe');
    expect(input('#email')?.value).toBe('jane@example.com');
  });
});
