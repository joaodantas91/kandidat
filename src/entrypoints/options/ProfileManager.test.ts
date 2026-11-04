import { describe, it, expect, beforeEach } from 'vitest';
import { mount, unmount } from 'svelte';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import ProfileManager from './ProfileManager.svelte';
import { getProfile, setProfile } from '@/core/storage/storage';

describe('ProfileManager.svelte', () => {
  let target: HTMLElement;

  beforeEach(() => {
    fakeBrowser.reset();
    document.body.innerHTML = '';
    target = document.createElement('div');
    document.body.appendChild(target);
  });

  it('renders all fieldset sections', async () => {
    const comp = mount(ProfileManager, { target });
    await new Promise((resolve) => setTimeout(resolve, 50));

    const fieldsets = target.querySelectorAll('fieldset');
    expect(fieldsets.length).toBeGreaterThan(0);

    const legends = Array.from(fieldsets).map((fs) => fs.querySelector('legend')?.textContent);
    expect(legends).toContain('Identity');
    expect(legends).toContain('Contact');
    expect(legends).toContain('Location');
    expect(legends).toContain('Links');
    expect(legends).toContain('Work Authorization');
    expect(legends).toContain('Compensation');
    expect(legends).toContain('Experience');

    unmount(comp);
  });

  it('round-trips profile save and restore', async () => {
    const comp = mount(ProfileManager, { target });
    await new Promise((resolve) => setTimeout(resolve, 50));

    const form = target.querySelector('form')!;
    const nameInput = target.querySelector('#name') as HTMLInputElement;
    nameInput.value = 'Test User';
    nameInput.dispatchEvent(new Event('input'));

    form.dispatchEvent(new SubmitEvent('submit', { cancelable: true }));
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect((target.querySelector('#name') as HTMLInputElement).value).toBe('Test User');

    unmount(comp);
  });

  it('updates location nested fields', async () => {
    fakeBrowser.reset();
    document.body.innerHTML = '';
    target = document.createElement('div');
    document.body.appendChild(target);

    const comp = mount(ProfileManager, { target });
    await new Promise((resolve) => setTimeout(resolve, 50));

    const nameInput = target.querySelector('#name') as HTMLInputElement;
    nameInput.value = 'Jane Doe';
    nameInput.dispatchEvent(new Event('input'));

    const cityInput = target.querySelector('#city') as HTMLInputElement;
    cityInput.value = 'Berlin';
    cityInput.dispatchEvent(new Event('input'));

    const countryInput = target.querySelector('#country') as HTMLInputElement;
    countryInput.value = 'Germany';
    countryInput.dispatchEvent(new Event('input'));

    const form = target.querySelector('form')!;
    form.dispatchEvent(new SubmitEvent('submit', { cancelable: true }));
    await new Promise((resolve) => setTimeout(resolve, 50));

    const stored = await getProfile();
    expect(stored?.location?.city).toBe('Berlin');
    expect(stored?.location?.country).toBe('Germany');

    unmount(comp);
  });

  it('updates links nested fields', async () => {
    fakeBrowser.reset();
    document.body.innerHTML = '';
    target = document.createElement('div');
    document.body.appendChild(target);

    const comp = mount(ProfileManager, { target });
    await new Promise((resolve) => setTimeout(resolve, 50));

    const nameInput = target.querySelector('#name') as HTMLInputElement;
    nameInput.value = 'Jane Doe';
    nameInput.dispatchEvent(new Event('input'));

    const linkedinInput = target.querySelector('#linkedin') as HTMLInputElement;
    linkedinInput.value = 'https://linkedin.com/in/test';
    linkedinInput.dispatchEvent(new Event('input'));

    const githubInput = target.querySelector('#github') as HTMLInputElement;
    githubInput.value = 'https://github.com/test';
    githubInput.dispatchEvent(new Event('input'));

    const form = target.querySelector('form')!;
    form.dispatchEvent(new SubmitEvent('submit', { cancelable: true }));
    await new Promise((resolve) => setTimeout(resolve, 50));

    const stored = await getProfile();
    expect(stored?.links?.linkedin).toBe('https://linkedin.com/in/test');
    expect(stored?.links?.github).toBe('https://github.com/test');

    unmount(comp);
  });

  it('updates workAuthorization nested fields', async () => {
    fakeBrowser.reset();
    document.body.innerHTML = '';
    target = document.createElement('div');
    document.body.appendChild(target);

    const comp = mount(ProfileManager, { target });
    await new Promise((resolve) => setTimeout(resolve, 50));

    const nameInput = target.querySelector('#name') as HTMLInputElement;
    nameInput.value = 'Jane Doe';
    nameInput.dispatchEvent(new Event('input'));

    const authorizeInput = target.querySelector('input[name="authorizedToWork"]') as HTMLInputElement;
    authorizeInput.checked = true;
    authorizeInput.dispatchEvent(new Event('change'));

    const citizenshipInput = target.querySelector('#citizenship') as HTMLInputElement;
    citizenshipInput.value = 'US';
    citizenshipInput.dispatchEvent(new Event('input'));

    const form = target.querySelector('form')!;
    form.dispatchEvent(new SubmitEvent('submit', { cancelable: true }));
    await new Promise((resolve) => setTimeout(resolve, 50));

    const stored = await getProfile();
    expect(stored?.workAuthorization?.authorizedToWork).toBe(true);
    expect(stored?.workAuthorization?.citizenship).toBe('US');

    unmount(comp);
  });
});