import { describe, it, expect, beforeEach } from 'vitest';
import { mount, unmount } from 'svelte';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import Options from './Options.svelte';
import {
  DEFAULT_BLACKLIST_KEYWORDS,
  getSettings,
  setSettings,
} from '@/core/storage/settings';

describe('Options.svelte', () => {
  let target: HTMLElement;

  beforeEach(() => {
    fakeBrowser.reset();
    document.body.innerHTML = '';
    target = document.createElement('div');
    document.body.appendChild(target);
  });

  it('renders header, navigation tabs, and default keywords', async () => {
    const comp = mount(Options, { target });
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(target.querySelector('h1')?.textContent).toContain(
      'Kandidat Options',
    );
    expect(target.querySelector('.keywords-list')).not.toBeNull();

    const tags = Array.from(target.querySelectorAll('.keyword-text')).map(
      (el) => el.textContent?.trim(),
    );
    expect(tags).toEqual(DEFAULT_BLACKLIST_KEYWORDS);

    unmount(comp);
  });

  it('adds a new keyword through form submission', async () => {
    const comp = mount(Options, { target });
    await new Promise((resolve) => setTimeout(resolve, 50));

    const input = target.querySelector<HTMLInputElement>(
      '.add-keyword-form input',
    )!;
    input.value = 'test-unwanted-job';
    input.dispatchEvent(new Event('input'));

    const form = target.querySelector<HTMLFormElement>('.add-keyword-form')!;
    form.dispatchEvent(new Event('submit', { cancelable: true }));

    await new Promise((resolve) => setTimeout(resolve, 50));

    const stored = await getSettings();
    expect(stored.blacklistKeywords).toContain('test-unwanted-job');

    const tags = Array.from(target.querySelectorAll('.keyword-text')).map(
      (el) => el.textContent?.trim(),
    );
    expect(tags).toContain('test-unwanted-job');

    unmount(comp);
  });

  it('removes a keyword when remove button is clicked', async () => {
    const comp = mount(Options, { target });
    await new Promise((resolve) => setTimeout(resolve, 50));

    const removeBtn = target.querySelector<HTMLButtonElement>(
      'button[data-keyword="bootcamp"]',
    )!;
    removeBtn.click();

    await new Promise((resolve) => setTimeout(resolve, 50));

    const stored = await getSettings();
    expect(stored.blacklistKeywords).not.toContain('bootcamp');

    unmount(comp);
  });

  it('switches between tabs', async () => {
    const comp = mount(Options, { target });
    await new Promise((resolve) => setTimeout(resolve, 50));

    const tabButtons = target.querySelectorAll<HTMLButtonElement>('.tab-btn');
    const profileTabBtn = tabButtons[1]!;
    profileTabBtn.click();

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(target.querySelector('#profile-heading')).not.toBeNull();
    expect(target.querySelector('input#name')).not.toBeNull();

    unmount(comp);
  });

  it('toggles auto-filter setting', async () => {
    const comp = mount(Options, { target });
    await new Promise((resolve) => setTimeout(resolve, 50));

    const toggle = target.querySelector<HTMLInputElement>(
      '#auto-filter-toggle',
    )!;
    expect(toggle.checked).toBe(true);

    toggle.click();
    await new Promise((resolve) => setTimeout(resolve, 50));

    const settings = await getSettings();
    expect(settings.autoFilterEnabled).toBe(false);

    unmount(comp);
  });

  it('resets keywords to defaults', async () => {
    const comp = mount(Options, { target });
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Remove one keyword first
    const removeBtn = target.querySelector<HTMLButtonElement>(
      'button[data-keyword="bootcamp"]',
    )!;
    removeBtn.click();
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect((await getSettings()).blacklistKeywords).not.toContain('bootcamp');

    // Click reset button
    const resetBtn = target.querySelector<HTMLButtonElement>('.reset-btn')!;
    resetBtn.click();
    await new Promise((resolve) => setTimeout(resolve, 50));

    const restored = await getSettings();
    expect(restored.blacklistKeywords).toContain('bootcamp');

    unmount(comp);
  });
});
