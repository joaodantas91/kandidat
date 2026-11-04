import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import type { Profile } from '@/core/storage/storage';

const mocks = vi.hoisted(() => ({
  fillApplication: vi.fn(),
  getProfile: vi.fn(),
}));

vi.mock('@/core/ats', () => ({ fillApplication: mocks.fillApplication }));
vi.mock('@/core/storage/storage', () => ({ getProfile: mocks.getProfile }));

import content from './content';
import { ATS_MATCHES } from './floating.content';

const profile: Profile = {
  name: 'John Doe',
  email: 'john@doe.com',
};

describe('content entrypoint', () => {
  beforeEach(() => {
    fakeBrowser.reset();
    vi.clearAllMocks();
  });

  it('scopes matches to the supported ATS hosts', () => {
    expect(content.matches).toEqual(ATS_MATCHES);
    expect(content.matches).not.toContain('<all_urls>');
  });

  it('routes AUTO_FILL messages through fillApplication', async () => {
    mocks.getProfile.mockResolvedValue(profile);
    content.main({} as any);

    await fakeBrowser.runtime.sendMessage('AUTO_FILL');

    expect(mocks.fillApplication).toHaveBeenCalledWith(
      profile,
      expect.any(URL),
    );
  });

  it('does nothing when no profile is saved', async () => {
    mocks.getProfile.mockResolvedValue(null);
    content.main({} as any);

    await fakeBrowser.runtime.sendMessage('AUTO_FILL');

    expect(mocks.fillApplication).not.toHaveBeenCalled();
  });

  it('swallows autofill failures', async () => {
    mocks.getProfile.mockRejectedValue(new Error('storage offline'));
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    content.main({} as any);

    await fakeBrowser.runtime.sendMessage('AUTO_FILL');

    expect(mocks.fillApplication).not.toHaveBeenCalled();
    expect(consoleError).toHaveBeenCalled();

    consoleError.mockRestore();
  });
});
