import type { Application } from '../../core/storage/applications';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, unmount } from 'svelte';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import { setApplications } from '@/core/storage/applications';
import App from './App.svelte';

const mockApplications: Application[] = [
  {
    company: 'Acme Corp',
    role: 'Software Engineer',
    url: 'https://jobs.lever.co/acme/apply',
    ats: 'lever',
    appliedAt: '2024-01-15',
  },
];

describe('popup entrypoint', () => {
  beforeEach(async () => {
    fakeBrowser.reset();
    document.body.innerHTML = '';
    await setApplications(mockApplications);
    browser.runtime.openOptionsPage = vi.fn();
  });

  it('renders header, title, and Applications list', async () => {
    const target = document.createElement('div');
    document.body.appendChild(target);
    const comp = mount(App, { target });
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(target.querySelector('h1')?.textContent).toContain('Kandidat');
    expect(target.querySelector('.status-dot')).not.toBeNull();
    expect(target.querySelector('.settings-btn')).not.toBeNull();
    expect(target.querySelector('.applications-list') || target.querySelector('p')).not.toBeNull();
    unmount(comp);
  });

  it('clicking Settings calls browser.runtime.openOptionsPage', async () => {
    const target = document.createElement('div');
    document.body.appendChild(target);
    const comp = mount(App, { target });
    await new Promise((resolve) => setTimeout(resolve, 100));
    const settingsBtn = target.querySelector('.settings-btn') as HTMLButtonElement;
    settingsBtn.click();
    expect(browser.runtime.openOptionsPage).toHaveBeenCalled();
    unmount(comp);
  });
});