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
    browser.runtime.sendMessage = vi.fn();
  });

  it('renders header, title, and a single settings button', async () => {
    const target = document.createElement('div');
    document.body.appendChild(target);
    const comp = mount(App, { target });
    await wait();
    expect(target.querySelector('h1')?.textContent).toContain('Kandidat');
    expect(target.querySelectorAll('.settings-btn').length).toBe(1);
    expect(target.querySelector('.settings-btn')?.textContent).toContain('Settings');
    unmount(comp);
  });

  it('renders profile status card when no profile is set up', async () => {
    const target = document.createElement('div');
    document.body.appendChild(target);
    const comp = mount(App, { target });
    await wait();
    expect(target.querySelector('.profile-status')).not.toBeNull();
    expect(target.textContent).toContain('No profile configured');
    expect(target.querySelector('.open-options-btn')).toBeNull();
    const createBtn = target.querySelector('.btn-secondary');
    expect(createBtn).not.toBeNull();
    expect(createBtn?.textContent).toContain('Create Profile');
    unmount(comp);
  });

  it('renders active profile name, email, ready badge, and edit link when a profile exists', async () => {
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
    expect(target.textContent).toContain('Profile Ready');
    expect(target.querySelector('.status-dot')).not.toBeNull();
    expect(target.textContent).toContain('Edit profile');
    expect(target.querySelector('.open-options-btn')).toBeNull();
    unmount(comp);
  });

  it('renders actionable Fill Current Form button in Quick Fill when profile exists', async () => {
    await setProfile({
      name: 'John Doe',
      email: 'john@example.com',
      schemaVersion: 2,
    });

    const target = document.createElement('div');
    document.body.appendChild(target);
    const comp = mount(App, { target });
    await wait();
    expect(target.textContent).toContain('Autofill application form on the active page.');
    const fillBtn = target.querySelector('.quickfill-status .btn-primary');
    expect(fillBtn).not.toBeNull();
    expect(fillBtn?.textContent).toContain('Fill Current Form');
    expect(fillBtn?.getAttribute('disabled')).toBeNull();
    unmount(comp);
  });

  it('renders disabled Fill Current Form button in Quick Fill when no profile', async () => {
    const target = document.createElement('div');
    document.body.appendChild(target);
    const comp = mount(App, { target });
    await wait();
    expect(target.textContent).toContain('Create profile to enable');
    const fillBtn = target.querySelector('.quickfill-status .btn-secondary');
    expect(fillBtn).not.toBeNull();
    expect(fillBtn?.textContent).toContain('Fill Current Form');
    expect(fillBtn?.getAttribute('disabled')).not.toBeNull();
    unmount(comp);
  });

  it('clicking Settings calls browser.runtime.openOptionsPage', async () => {
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
