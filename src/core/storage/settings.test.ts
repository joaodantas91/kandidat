import { describe, it, expect, beforeEach } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import {
  DEFAULT_BLACKLIST_KEYWORDS,
  DEFAULT_SETTINGS,
  getSettings,
  setSettings,
  getBlacklistKeywords,
  setBlacklistKeywords,
  addBlacklistKeyword,
  removeBlacklistKeyword,
  resetSettings,
} from './settings';

describe('settings storage', () => {
  beforeEach(async () => {
    fakeBrowser.reset();
  });

  it('loads default settings with fallback when storage is empty', async () => {
    const settings = await getSettings();
    expect(settings).toEqual(DEFAULT_SETTINGS);
    expect(settings.blacklistKeywords).toEqual(DEFAULT_BLACKLIST_KEYWORDS);
    expect(settings.autoFilterEnabled).toBe(true);
  });

  it('loads default blacklist keywords with fallback', async () => {
    const keywords = await getBlacklistKeywords();
    expect(keywords).toEqual(DEFAULT_BLACKLIST_KEYWORDS);
  });

  it('adds a new keyword, trimming and lowercasing', async () => {
    const updated = await addBlacklistKeyword('  Remote-Only  ');
    expect(updated).toContain('remote-only');

    const stored = await getBlacklistKeywords();
    expect(stored).toContain('remote-only');
  });

  it('avoids adding duplicate keywords', async () => {
    const initial = await getBlacklistKeywords();
    const count = initial.length;

    const updated = await addBlacklistKeyword('bootcamp');
    expect(updated.length).toBe(count);
  });

  it('removes a keyword', async () => {
    await removeBlacklistKeyword('bootcamp');
    const updated = await getBlacklistKeywords();
    expect(updated).not.toContain('bootcamp');
  });

  it('persists customized settings', async () => {
    await setSettings({
      blacklistKeywords: ['spam', 'junk'],
      autoFilterEnabled: false,
    });

    const settings = await getSettings();
    expect(settings.blacklistKeywords).toEqual(['spam', 'junk']);
    expect(settings.autoFilterEnabled).toBe(false);
  });

  it('resets settings to defaults', async () => {
    await setBlacklistKeywords(['custom']);
    expect(await getBlacklistKeywords()).toEqual(['custom']);

    await resetSettings();
    const restored = await getSettings();
    expect(restored).toEqual(DEFAULT_SETTINGS);
  });
});
