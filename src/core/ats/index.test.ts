import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Profile } from '../storage/storage';

const mocks = vi.hoisted(() => ({
  fillLever: vi.fn(),
  fillGreenhouse: vi.fn(),
  fillWorkday: vi.fn(),
  autofill: vi.fn(),
}));

vi.mock('./lever', () => ({ fillLever: mocks.fillLever }));
vi.mock('./greenhouse', () => ({ fillGreenhouse: mocks.fillGreenhouse }));
vi.mock('./workday', () => ({ fillWorkday: mocks.fillWorkday }));
vi.mock('../autofill/autofill', () => ({ autofill: mocks.autofill }));

import { fillApplication } from './index';

const profile: Profile = {
  name: 'John Doe',
  email: 'john@doe.com',
  phone: '999999',
  linkedin: 'https://linkedin.com/in/john-doe',
};

const platformCases = [
  {
    platform: 'lever',
    url: 'https://jobs.lever.co/acme/123e4567-e89b-12d3-a456-426614174000/apply',
    filler: mocks.fillLever,
  },
  {
    platform: 'greenhouse',
    url: 'https://job-boards.greenhouse.io/acme/jobs/456789',
    filler: mocks.fillGreenhouse,
  },
  {
    platform: 'workday',
    url: 'https://acme.myworkdayjobs.com/en-US/acme/job/Engineer_R-123',
    filler: mocks.fillWorkday,
  },
] as const;

describe('fillApplication()', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  it.each(platformCases)(
    'dispatches $platform URLs to the matching adapter',
    ({ url, filler }) => {
      fillApplication(profile, new URL(url), document);

      expect(filler).toHaveBeenCalledWith(profile, document);
      for (const { filler: other } of platformCases) {
        if (other !== filler) expect(other).not.toHaveBeenCalled();
      }
      expect(mocks.autofill).not.toHaveBeenCalled();
    },
  );

  it('falls back to core autofill on unsupported pages', () => {
    fillApplication(profile, new URL('https://example.com/jobs/1'), document);

    expect(mocks.autofill).toHaveBeenCalledWith({ profile, root: document });
    expect(mocks.fillLever).not.toHaveBeenCalled();
    expect(mocks.fillGreenhouse).not.toHaveBeenCalled();
    expect(mocks.fillWorkday).not.toHaveBeenCalled();
  });

  it('isolates adapter errors and still falls back', () => {
    mocks.fillLever.mockImplementationOnce(() => {
      throw new Error('adapter exploded');
    });
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() =>
      fillApplication(
        profile,
        new URL('https://jobs.lever.co/acme/123/apply'),
        document,
      ),
    ).not.toThrow();
    expect(mocks.autofill).toHaveBeenCalledWith({ profile, root: document });

    consoleError.mockRestore();
  });
});
