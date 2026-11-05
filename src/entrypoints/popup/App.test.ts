import type { Application, ApplicationStatus } from '../../core/storage/applications';
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
    status: 'Applied',
  },
  {
    company: 'Tech Corp',
    role: 'Senior Engineer',
    url: 'https://job-boards.greenhouse.io/tech/jobs/1',
    ats: 'greenhouse',
    appliedAt: '2024-02-20',
    status: 'Interviewing',
  },
  {
    company: 'Globex',
    role: 'Product Manager',
    url: 'https://myworkday.com/globex/apply',
    ats: 'workday',
    appliedAt: '2024-03-05',
    status: 'Rejected',
  },
];

const wait = () => new Promise((resolve) => setTimeout(resolve, 100));

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
    await wait();
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
    await wait();
    const settingsBtn = target.querySelector('.settings-btn') as HTMLButtonElement;
    settingsBtn.click();
    expect(browser.runtime.openOptionsPage).toHaveBeenCalled();
    unmount(comp);
  });

  it('renders search input and status filter', async () => {
    const target = document.createElement('div');
    document.body.appendChild(target);
    const comp = mount(App, { target });
    await wait();
    expect(target.querySelector<HTMLInputElement>('.search-input')).not.toBeNull();
    expect(target.querySelector<HTMLSelectElement>('.status-filter')).not.toBeNull();
    unmount(comp);
  });

  it('renders a status badge for every application', async () => {
    const target = document.createElement('div');
    document.body.appendChild(target);
    const comp = mount(App, { target });
    await wait();
    const badges = target.querySelectorAll('.status-tag');
    expect(badges).toHaveLength(3);
    expect(Array.from(badges).map((b) => b.textContent)).toEqual([
      'Applied',
      'Interviewing',
      'Rejected',
    ]);
    unmount(comp);
  });

  it('filters applications by company name', async () => {
    const target = document.createElement('div');
    document.body.appendChild(target);
    const comp = mount(App, { target });
    await wait();

    const input = target.querySelector<HTMLInputElement>('.search-input')!;
    input.value = 'acme';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await wait();

    const cards = target.querySelectorAll('.application-card');
    expect(cards).toHaveLength(1);
    expect(cards[0]?.textContent).toContain('Acme Corp');
    expect(target.textContent).not.toContain('Tech Corp');
    unmount(comp);
  });

  it('filters applications by platform', async () => {
    const target = document.createElement('div');
    document.body.appendChild(target);
    const comp = mount(App, { target });
    await wait();

    const input = target.querySelector<HTMLInputElement>('.search-input')!;
    input.value = 'greenhouse';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await wait();

    const cards = target.querySelectorAll('.application-card');
    expect(cards).toHaveLength(1);
    expect(cards[0]?.textContent).toContain('Tech Corp');
    unmount(comp);
  });

  it('shows empty state when no application matches the search', async () => {
    const target = document.createElement('div');
    document.body.appendChild(target);
    const comp = mount(App, { target });
    await wait();

    const input = target.querySelector<HTMLInputElement>('.search-input')!;
    input.value = 'nonexistent';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await wait();

    expect(target.querySelector('.application-card')).toBeNull();
    expect(target.querySelector('p')?.textContent).toContain('No applications match');
    unmount(comp);
  });

  it('filters applications by status', async () => {
    const target = document.createElement('div');
    document.body.appendChild(target);
    const comp = mount(App, { target });
    await wait();

    const select = target.querySelector<HTMLSelectElement>('.status-filter')!;
    select.value = 'Rejected';
    select.dispatchEvent(new Event('change', { bubbles: true }));
    await wait();

    const cards = target.querySelectorAll('.application-card');
    expect(cards).toHaveLength(1);
    expect(cards[0]?.textContent).toContain('Globex');
    unmount(comp);
  });

  it('adds a new application through the manual entry form', async () => {
    const target = document.createElement('div');
    document.body.appendChild(target);
    const comp = mount(App, { target });
    await wait();

    const form = target.querySelector<HTMLFormElement>('.add-form')!;
    const companyInput = form.querySelector('#input-company') as HTMLInputElement;
    companyInput.value = 'New Co';
    companyInput.dispatchEvent(new Event('input', { bubbles: true }));

    const roleInput = form.querySelector('#input-role') as HTMLInputElement;
    roleInput.value = 'Designer';
    roleInput.dispatchEvent(new Event('input', { bubbles: true }));

    const urlInput = form.querySelector('#input-url') as HTMLInputElement;
    urlInput.value = 'https://jobs.lever.co/newco/apply';
    urlInput.dispatchEvent(new Event('input', { bubbles: true }));

    form.dispatchEvent(new Event('submit', { cancelable: true }));
    await wait();

    const cards = target.querySelectorAll('.application-card');
    expect(cards).toHaveLength(4);
    expect(target.textContent).toContain('New Co');
    expect(target.textContent).toContain('Designer');

    const stored = await (await import('@/core/storage/applications')).getApplications();
    expect(stored.some((app) => app.company === 'New Co')).toBe(true);
    unmount(comp);
  });

  it('does not add a duplicate application by URL', async () => {
    const target = document.createElement('div');
    document.body.appendChild(target);
    const comp = mount(App, { target });
    await wait();

    const form = target.querySelector<HTMLFormElement>('.add-form')!;
    const companyInput = form.querySelector('#input-company') as HTMLInputElement;
    companyInput.value = 'Acme Duplicate';
    companyInput.dispatchEvent(new Event('input', { bubbles: true }));

    const roleInput = form.querySelector('#input-role') as HTMLInputElement;
    roleInput.value = 'Engineer';
    roleInput.dispatchEvent(new Event('input', { bubbles: true }));

    const urlInput = form.querySelector('#input-url') as HTMLInputElement;
    urlInput.value = 'https://jobs.lever.co/acme/apply';
    urlInput.dispatchEvent(new Event('input', { bubbles: true }));

    form.dispatchEvent(new Event('submit', { cancelable: true }));
    await wait();

    const cards = target.querySelectorAll('.application-card');
    expect(cards).toHaveLength(3);
    unmount(comp);
  });

  it('removes an application when the remove button is clicked', async () => {
    const target = document.createElement('div');
    document.body.appendChild(target);
    const comp = mount(App, { target });
    await wait();

    const url = 'https://jobs.lever.co/acme/apply';
    const removeBtn = target.querySelector<HTMLButtonElement>(
      `[data-url="${url}"].btn-destructive`,
    )!;
    removeBtn.click();
    await wait();

    expect(target.querySelector(`[data-url="${url}"]`)).toBeNull();
    const cards = target.querySelectorAll('.application-card');
    expect(cards).toHaveLength(2);
    unmount(comp);
  });

  it('updates application status through the status dropdown', async () => {
    const target = document.createElement('div');
    document.body.appendChild(target);
    const comp = mount(App, { target });
    await wait();

    const url = 'https://jobs.lever.co/acme/apply';
    const select = target.querySelector<HTMLSelectElement>(
      `[data-url="${url}"].status-select`,
    )!;
    select.value = 'Offered';
    select.dispatchEvent(new Event('change', { bubbles: true }));
    await wait();

    expect(target.textContent).toContain('Offered');

    const stored = await (await import('@/core/storage/applications')).getApplications();
    const app = stored.find((a) => a.url === url);
    expect(app?.status).toBe('Offered');
    unmount(comp);
  });
});
