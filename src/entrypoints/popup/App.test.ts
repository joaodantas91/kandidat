import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, unmount } from 'svelte';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import { setProfile } from '@/core/storage/storage';
import App from './App.svelte';

const wait = () => new Promise((resolve) => setTimeout(resolve, 100));

describe('popup entrypoint', () => {
  beforeEach(async () => {
    fakeBrowser.reset();
    document.body.innerHTML = '';
    browser.runtime.openOptionsPage = vi.fn();
  });

  it('renders header, title, and options link', async () => {
    const target = document.createElement('div');
    document.body.appendChild(target);
    const comp = mount(App, { target });
    await wait();
    expect(target.querySelector('h1')?.textContent).toContain('Kandidat');
    expect(target.querySelector('.settings-btn')).not.toBeNull();
    unmount(comp);
  });

  it('renders profile status card when no profile is set up', async () => {
    const target = document.createElement('div');
    document.body.appendChild(target);
    const comp = mount(App, { target });
    await wait();
    expect(target.querySelector('.profile-status')).not.toBeNull();
    expect(target.textContent).toContain('No profile set up');
    expect(target.querySelector('.open-options-btn')).not.toBeNull();
    unmount(comp);
  });

  it('renders active profile name and email when a profile exists', async () => {
    await setProfile({
      name: 'John Doe',
      email: 'john@example.com',
      schemaVersion: 2,
    });

    const target = document.createElement('div');
    document.body.appendChild(target);
    const comp = mount(App, { target });
    await wait();
    expect(target.textContent).toContain('John Doe');
    expect(target.textContent).toContain('john@example.com');
    expect(target.querySelector('.profile-name')?.textContent).toContain('John Doe');
    unmount(comp);
  });

  it('clicking Options calls browser.runtime.openOptionsPage', async () => {
    const target = document.createElement('div');
    document.body.appendChild(target);
    const comp = mount(App, { target });
    await wait();
    const settingsBtn = target.querySelector('.settings-btn') as HTMLButtonElement;
    settingsBtn.click();
    expect(browser.runtime.openOptionsPage).toHaveBeenCalled();
    unmount(comp);
  });

  it('does not render tracker elements', async () => {
    const target = document.createElement('div');
    document.body.appendChild(target);
    const comp = mount(App, { target });
    await wait();
    expect(target.querySelector('.applications-list')).toBeNull();
    expect(target.querySelector('.search-input')).toBeNull();
    expect(target.querySelector('.status-filter')).toBeNull();
    expect(target.querySelector('.application-card')).toBeNull();
    expect(target.querySelector('.add-form')).toBeNull();
    expect(target.textContent).not.toContain('Application Tracker');
    unmount(comp);
  });
});
