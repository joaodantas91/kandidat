import { describe, it, expect, beforeEach } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import {
  PROFILE_SCHEMA_VERSION,
  ProfileValidationError,
  deriveFullName,
  getProfile,
  profile,
  normalizeProfile,
  setProfile,
  updateProfile,
  onChangeProfile,
} from './storage';

describe('storage schema version', () => {
  it('has PROFILE_SCHEMA_VERSION = 2', () => {
    expect(PROFILE_SCHEMA_VERSION).toBe(2);
  });
});

describe('ProfileValidationError', () => {
  it('creates an error with a message', () => {
    const err = new ProfileValidationError('empty name');
    expect(err.name).toBe('ProfileValidationError');
    expect(err.message).toBe('empty name');
  });
});

describe('deriveFullName', () => {
  it('returns name when provided', () => {
    expect(deriveFullName({ name: 'John Doe' })).toBe('John Doe');
  });

  it('splits full name when no name provided', () => {
    expect(deriveFullName({ firstName: 'John', lastName: 'Doe' })).toBe('John Doe');
  });

  it('handles single name', () => {
    expect(deriveFullName({ name: 'John' })).toBe('John');
  });
});

describe('normalizeProfile', () => {
  it('trims strings', () => {
    const result = normalizeProfile({ name: '  John Doe  ', email: '  john@test.com  ' });
    expect(result.name).toBe('John Doe');
    expect(result.email).toBe('john@test.com');
  });

  it('drops empty/null values', () => {
    const result = normalizeProfile({ name: 'John', email: '', phone: null });
    expect(result.name).toBe('John');
    expect(result.email).toBeUndefined();
    expect(result.phone).toBeUndefined();
  });

  it('maps org -> experience.currentCompany', () => {
    const result = normalizeProfile({ name: 'John', org: 'Acme Corp' });
    expect(result.experience?.currentCompany).toBe('Acme Corp');
    expect(result.org).toBeUndefined();
  });

  it('maps linkedin -> links.linkedin', () => {
    const result = normalizeProfile({ name: 'John', linkedin: 'https://linkedin.com/in/john' });
    expect(result.links?.linkedin).toBe('https://linkedin.com/in/john');
    expect(result.linkedin).toBeUndefined();
  });

  it('preserves experience.currentCompany org sync', () => {
    const result = normalizeProfile({ name: 'John', experience: { currentCompany: 'Acme' } });
    expect(result.org).toBe('Acme');
  });

  it('ensures canonical name exists', () => {
    const result = normalizeProfile({ firstName: 'John', lastName: 'Doe' });
    expect(result.name).toBe('John Doe');
  });
});

describe('getProfile', () => {
  it('returns null for empty storage', async () => {
    fakeBrowser.reset();
    const profile = await getProfile();
    expect(profile).toBeNull();
  });

  it('returns normalized profile with legacy 4 fields', async () => {
    fakeBrowser.reset();
    await setProfile({ name: 'John Doe', email: 'john@test.com', phone: '123', org: 'Acme' });
    const profile = await getProfile();
    expect(profile).not.toBeNull();
    expect(profile?.name).toBe('John Doe');
    expect(profile?.experience?.currentCompany).toBe('Acme');
    expect(profile?.links?.linkedin).toBeUndefined();
  });
});

describe('setProfile', () => {
  it('validates name is non-empty and throws ProfileValidationError', async () => {
    fakeBrowser.reset();
    await expect(setProfile({ name: '', email: 'john@test.com' })).rejects.toThrow(
      ProfileValidationError,
    );
  });

  it('normalizes and stores profile with schemaVersion = 2', async () => {
    fakeBrowser.reset();
    await setProfile({ name: 'John Doe', email: 'john@test.com' });
    const value = await profile.getValue();
    expect(value?.schemaVersion).toBe(2);
  });
});

describe('updateProfile', () => {
  it('merges patch with existing profile', async () => {
    fakeBrowser.reset();
    await setProfile({ name: 'John Doe', email: 'john@test.com', phone: '123' });
    await updateProfile({ phone: '456' });
    const profile = await getProfile();
    expect(profile?.phone).toBe('456');
    expect(profile?.email).toBe('john@test.com');
  });

  it('validates name after merge and throws if empty', async () => {
    fakeBrowser.reset();
    await setProfile({ name: 'John Doe', email: 'john@test.com' });
    await expect(updateProfile({ name: '' })).rejects.toThrow(ProfileValidationError);
  });

  it('preserves unknown top-level keys', async () => {
    fakeBrowser.reset();
    await setProfile({ name: 'John', extraKey: 'preserved' } as any);
    await updateProfile({ phone: '123' });
    const profile = await getProfile();
    expect((profile as any)?.extraKey).toBe('preserved');
  });
});

describe('legacy alias sync', () => {
  it('syncs org <-> experience.currentCompany on normalize', () => {
    expect(normalizeProfile({ org: 'Acme' }).experience?.currentCompany).toBe('Acme');
    expect(normalizeProfile({ experience: { currentCompany: 'Acme' } }).org).toBe('Acme');
  });

  it('syncs linkedin <-> links.linkedin on normalize', () => {
    expect(normalizeProfile({ linkedin: 'https://li.com' }).links?.linkedin).toBe('https://li.com');
    expect(normalizeProfile({ links: { linkedin: 'https://li.com' } }).linkedin).toBe('https://li.com');
  });
});