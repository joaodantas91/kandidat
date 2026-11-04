import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fillGreenhouse, splitName } from './greenhouse';
import type { Profile } from '../storage/storage';

const fixture = readFileSync(
  resolve('tests/fixtures/greenhouse-form.html'),
  'utf8',
);

const profile: Profile = {
  name: 'John Doe',
  email: 'john@doe.com',
  phone: '999999',
  linkedin: 'www.linkedin.com/in/john-doe',
  location: {
    addressLine1: '123 Main St',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94105',
    country: 'USA',
  },
  links: {
    linkedin: 'www.linkedin.com/in/johndoe',
    github: 'github.com/johndoe',
    portfolio: 'johndoe.dev',
    website: 'johndoe.com',
    twitter: '@johndoe',
  },
  workAuthorization: {
    authorizedToWork: true,
    sponsorshipRequired: 'none',
  },
};

const input = (selector: string) =>
  document.querySelector<HTMLInputElement>(selector);

const mountFixture = () => {
  const parsed = new DOMParser().parseFromString(fixture, 'text/html');
  document.body.innerHTML = parsed.body.innerHTML;
};

describe('splitName', () => {
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

describe('fillGreenhouse', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('fills the identity fields from the saved profile', () => {
    mountFixture();

    fillGreenhouse(profile, document);

    expect(input('#first_name')?.value).toBe('John');
    expect(input('#last_name')?.value).toBe('Doe');
    expect(input('#email')?.value).toBe(profile.email);
    expect(input('#phone')?.value).toBe(profile.phone);
    expect(input('#question_123')?.value).toBe(profile.linkedin);
  });

  it('fills location in short format', () => {
    mountFixture();

    fillGreenhouse(profile, document);

    const locationInput = input('input[name="job_application[location]"]') ||
      input('#location') ||
      input('input[name="location"]');
    expect(locationInput?.value).toBe('San Francisco, CA, USA');
  });

  it('fills GitHub, Portfolio, Website, Twitter links from profile', () => {
    mountFixture();

    fillGreenhouse(profile, document);

    expect(input('[id*="github"]')?.value).toBe(profile.links?.github || '');
    expect(input('[id*="portfolio"]')?.value).toBe(profile.links?.portfolio || '');
    expect(input('[id*="website"]')?.value).toBe(profile.links?.website || '');
    expect(input('[id*="twitter"]')?.value).toBe(profile.links?.twitter || '');
  });

  it('leaves unrecognized custom question fields untouched', () => {
    mountFixture();

    fillGreenhouse(profile, document);

    expect(input('#question_456')?.value).toBe('');
  });

  it('does not overwrite values already entered by the user', () => {
    mountFixture();
    const email = input('#email');
    if (email) email.value = 'typed@example.com';

    fillGreenhouse(profile, document);

    expect(email?.value).toBe('typed@example.com');
  });

  it('skips optional profile fields that are not set', () => {
    mountFixture();

    fillGreenhouse({ name: 'John Doe' }, document);

    expect(input('#first_name')?.value).toBe('John');
    expect(input('#last_name')?.value).toBe('Doe');
    expect(input('#email')?.value).toBe('');
    expect(input('#phone')?.value).toBe('');
    expect(input('#question_123')?.value).toBe('');
  });

  it('uses the native input value setter', () => {
    mountFixture();
    const setter = vi.spyOn(HTMLInputElement.prototype, 'value', 'set');

    fillGreenhouse(profile, document);

    expect(setter).toHaveBeenCalled();
    setter.mockRestore();
  });

  it.each(['input', 'change'])(
    'dispatches bubbling %s events for filled fields',
    (eventName) => {
      mountFixture();
      const handler = vi.fn();
      document.addEventListener(eventName, handler);

      fillGreenhouse(profile, document);

      expect(handler).toHaveBeenCalled();
      for (const call of handler.mock.calls) {
        expect(call[0].bubbles).toBe(true);
      }

      document.removeEventListener(eventName, handler);
    },
  );

  it('can fill a scoped root element', () => {
    document.body.innerHTML = `
      <form id="application_form">
        <input id="first_name" />
        <input id="last_name" />
      </form>
    `;
    const form = document.querySelector('#application_form');
    if (!form) throw new Error('fixture form missing');

    fillGreenhouse({ name: 'Jane Roe' }, form);

    expect(input('#first_name')?.value).toBe('Jane');
    expect(input('#last_name')?.value).toBe('Roe');
  });

  it('fills work authorization yes from question label', () => {
    mountFixture();

    fillGreenhouse(profile, document);

    const authInput = input('#question_auth');
    expect(authInput?.value).toBe('yes');
  });

  it('fills work authorization no from question label', () => {
    const profileNoAuth = {
      ...profile,
      workAuthorization: {
        authorizedToWork: false,
        sponsorshipRequired: 'none',
      },
    };

    mountFixture();
    fillGreenhouse(profileNoAuth, document);

    const authInput = input('#question_auth');
    expect(authInput?.value).toBe('no');
  });

  it('does not fill unrelated question_* fields', () => {
    mountFixture();

    fillGreenhouse(profile, document);

    expect(input('#question_456')?.value).toBe('');
  });
});