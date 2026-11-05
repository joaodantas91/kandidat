import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { resolveIdentity, resolveLocation, resolveLinks, resolveWorkAuthorization, setFieldValue } from './fieldMapping';
import type { Profile } from '../storage/storage';

const baseProfile: Profile = {
  name: 'John Doe',
  firstName: 'John',
  middleName: 'Michael',
  lastName: 'Doe',
  preferredName: 'John',
  email: 'john@doe.com',
  phone: '9999999999',
  location: {
    addressLine1: '123 Main St',
    addressLine2: 'Apt 4',
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

describe('resolveIdentity', () => {
  it('uses explicit firstName and lastName from profile', () => {
    const result = resolveIdentity(baseProfile);
    expect(result.firstName).toBe('John');
    expect(result.lastName).toBe('Doe');
    expect(result.name).toBe('John Doe');
  });

  it('falls back to splitName when firstName/lastName not set', () => {
    const result = resolveIdentity({
      ...baseProfile,
      firstName: undefined,
      lastName: undefined,
    });
    expect(result.firstName).toBe('John');
    expect(result.lastName).toBe('Doe');
  });

  it('includes middleName when set', () => {
    const result = resolveIdentity(baseProfile);
    expect(result.middleName).toBe('Michael');
  });

  it('includes preferredName when set', () => {
    const result = resolveIdentity(baseProfile);
    expect(result.preferredName).toBe('John');
  });

  it('handles single name', () => {
    const result = resolveIdentity({ name: 'John', firstName: undefined, lastName: undefined, middleName: undefined, preferredName: undefined });
    expect(result.firstName).toBe('John');
    expect(result.lastName).toBe('');
  });
});

describe('resolveLocation', () => {
  it('short mode with all fields', () => {
    const result = resolveLocation(baseProfile, 'short');
    expect(result).toBe('San Francisco, CA, USA');
  });

  it('short mode with missing country', () => {
    const result = resolveLocation(
      { ...baseProfile, location: { ...baseProfile.location, country: undefined } },
      'short',
    );
    expect(result).toBe('San Francisco, CA');
  });

  it('short mode with missing state and city', () => {
    const result = resolveLocation(
      { ...baseProfile, location: { city: 'NYC', country: 'USA' } },
      'short',
    );
    expect(result).toBe('NYC, USA');
  });

  it('short mode with empty profile location', () => {
    const result = resolveLocation({} as Profile, 'short');
    expect(result).toBe('');
  });

  it('full mode with all fields', () => {
    const result = resolveLocation(baseProfile, 'full');
    expect(result).toBe('123 Main St, Apt 4, San Francisco, CA, 94105, USA');
  });

  it('full mode missing addressLine2', () => {
    const result = resolveLocation(
      {
        ...baseProfile,
        location: { ...baseProfile.location, addressLine2: undefined },
      },
      'full',
    );
    expect(result).toBe('123 Main St, San Francisco, CA, 94105, USA');
  });
});

describe('resolveLinks', () => {
  it('maps links from profile.links', () => {
    const result = resolveLinks(baseProfile);
    expect(result.linkedin).toBe('www.linkedin.com/in/johndoe');
    expect(result.github).toBe('github.com/johndoe');
    expect(result.portfolio).toBe('johndoe.dev');
    expect(result.website).toBe('johndoe.com');
    expect(result.twitter).toBe('@johndoe');
  });

  it('honors legacy profile.linkedin when profile.links missing', () => {
    const result = resolveLinks({
      ...baseProfile,
      links: undefined,
      linkedin: 'www.linkedin.com/in/johndoe',
    });
    expect(result.linkedin).toBe('www.linkedin.com/in/johndoe');
  });

  it('deduplicates when same key provided twice', () => {
    const result = resolveLinks({
      ...baseProfile,
      links: {
        ...baseProfile.links,
        linkedin: 'www.linkedin.com/in/johndoe2',
      },
    });
    const seen = new Set();
    expect(result.linkedin).toBe('www.linkedin.com/in/johndoe2');
  });

  it('returns empty strings for missing links', () => {
    const result = resolveLinks({ name: 'John', links: undefined });
    expect(result.linkedin).toBeUndefined();
    expect(result.github).toBeUndefined();
  });
});

describe('resolveWorkAuthorization', () => {
  const baseWaProfile: Profile = {
    ...baseProfile,
    workAuthorization: {
      authorizedToWork: true,
      sponsorshipRequired: 'none',
    },
  };

  it('returns yes for legally authorized question with authorizedToWork=true', () => {
    const result = resolveWorkAuthorization(
      baseWaProfile,
      'Are you legally authorized to work in the United States?',
    );
    expect(result).toBe('yes');
  });

  it('returns no for sponsorship question with sponsorshipRequired=none', () => {
    const result = resolveWorkAuthorization(
      baseWaProfile,
      'Will sponsorship be required now or in the future?',
    );
    expect(result).toBe('no');
  });

  it('returns no when authorizedToWork=false', () => {
    const result = resolveWorkAuthorization(
      { ...baseWaProfile, workAuthorization: { ...baseWaProfile.workAuthorization, authorizedToWork: false } },
      'Are you legally authorized to work in the United States?',
    );
    expect(result).toBe('no');
  });

  it('returns undefined when question is ambiguous', () => {
    const result = resolveWorkAuthorization(
      baseWaProfile,
      'What is your favorite color?',
    );
    expect(result).toBeUndefined();
  });

  it('returns undefined when workAuthorization not answered', () => {
    const result = resolveWorkAuthorization(
      { ...baseProfile, workAuthorization: undefined },
      'Are you legally authorized to work?',
    );
    expect(result).toBeUndefined();
  });

  it('returns no for sponsorshipRequired=now', () => {
    const result = resolveWorkAuthorization(
      {
        ...baseProfile,
        workAuthorization: {
          authorizedToWork: true,
          sponsorshipRequired: 'now',
        },
      },
      'sponsorship now or in the future',
    );
    expect(result).toBe('no');
  });

  it('returns undefined for sponsorshipRequired=future', () => {
    const result = resolveWorkAuthorization(
      {
        ...baseProfile,
        workAuthorization: {
          authorizedToWork: true,
          sponsorshipRequired: 'future',
        },
      },
      'sponsorship now or in the future',
    );
    expect(result).toBeUndefined();
  });
});

describe('setFieldValue', () => {
  let input: HTMLInputElement;
  let setSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    input = document.createElement('input');
    setSpy = vi.spyOn(HTMLInputElement.prototype, 'value', 'set');
  });

  afterEach(() => {
    setSpy.mockRestore();
  });

  it('sets the element value using native setter', () => {
    setFieldValue(input, 'test value');
    expect(setSpy).toHaveBeenCalledWith('test value');
    expect(input.value).toBe('test value');
  });

  it('dispatches input and change events', () => {
    const inputHandler = vi.fn();
    const changeHandler = vi.fn();
    input.addEventListener('input', inputHandler);
    input.addEventListener('change', changeHandler);

    setFieldValue(input, 'new value');

    expect(inputHandler).toHaveBeenCalled();
    expect(changeHandler).toHaveBeenCalled();
    expect(inputHandler.mock.calls[0]?.[0]?.bubbles).toBe(true);
    expect(changeHandler.mock.calls[0]?.[0]?.bubbles).toBe(true);
  });

  it('falls back to direct assignment when native setter unavailable', () => {
    const setPropSpy = vi.spyOn(Object.getPrototypeOf(input), 'value', 'set');
    setFieldValue(input, 'fallback value');
    expect(input.value).toBe('fallback value');
  });
});