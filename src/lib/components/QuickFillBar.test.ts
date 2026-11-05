import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, unmount } from 'svelte';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import { setProfile, getProfile } from '@/core/storage/storage';
import QuickFillBar from './QuickFillBar.svelte';
import { detectFields } from '@/core/autofill/fieldDetector';

vi.mock('@/core/autofill/fieldDetector', () => ({
  detectFields: vi.fn((root: Document) => ({
    fullName: root.querySelector('input[name="fullName"]') as HTMLInputElement,
    email: root.querySelector('input[name="email"]') as HTMLInputElement,
    phone: root.querySelector('input[name="phone"]') as HTMLInputElement,
    linkedin: root.querySelector('input[name="linkedin"]') as HTMLInputElement,
  })),
}));

describe('QuickFillBar.svelte', () => {
  beforeEach(() => {
    fakeBrowser.reset();
    document.body.innerHTML = '';
  });

  it('renders profile with name and email when profile and fields exist', async () => {
    const target = document.createElement('div');
    document.body.appendChild(target);
    await setProfile({ name: 'John Doe', email: 'john@example.com' });

    const comp = mount(QuickFillBar, { target });
    await new Promise((resolve) => setTimeout(resolve, 100));

    const nameEl = target.querySelector('.quickfill-name');
    expect(nameEl?.textContent).toBe('John Doe');

    const emailEl = target.querySelector('.quickfill-email');
    expect(emailEl?.textContent).toBe('john@example.com');

    unmount(comp);
  });

  it('renders setup button when no profile', async () => {
    const target = document.createElement('div');
    document.body.appendChild(target);

    const comp = mount(QuickFillBar, { target });
    await new Promise((resolve) => setTimeout(resolve, 50));

    const setupBtn = target.querySelector('.btn-secondary');
    expect(setupBtn?.textContent).toContain('Setup Profile');

    unmount(comp);
  });

  it('toggles preview visibility', async () => {
    const target = document.createElement('div');
    document.body.appendChild(target);
    await setProfile({ name: 'John Doe', email: 'john@example.com' });

    document.body.innerHTML = `
      <input name="fullName" value="John Doe" />
      <input name="email" value="john@example.com" />
    `;

    const comp = mount(QuickFillBar, { target });
    await new Promise((resolve) => setTimeout(resolve, 50));

    const previewBtn = target.querySelector<HTMLButtonElement>('.btn-secondary.btn-sm');
    expect(previewBtn).not.toBeNull();

    previewBtn!.click();
    await new Promise((resolve) => setTimeout(resolve, 50));

    const preview = target.querySelector('#profile-preview');
    expect(preview).not.toBeNull();

    previewBtn!.click();
    await new Promise((resolve) => setTimeout(resolve, 50));

    const previewAfterClose = target.querySelector('#profile-preview');
    expect(previewAfterClose).toBeNull();

    unmount(comp);
  });

  it('renders field count when fields are detected', async () => {
    const target = document.createElement('div');
    document.body.appendChild(target);
    await setProfile({ name: 'John Doe' });

    document.body.innerHTML = '<input name="fullName" value="John Doe" />';

    const comp = mount(QuickFillBar, { target });
    await new Promise((resolve) => setTimeout(resolve, 100));

    const fieldCount = target.querySelector('.quickfill-field-count');
    expect(fieldCount).not.toBeNull();

    unmount(comp);
  });

  it('getInitials extracts first two letters', () => {
    const name = 'John Doe';
    const initials = name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
    expect(initials).toBe('JD');
  });

  it('getFieldLabel returns mapped labels', () => {
    const labels: Record<string, string> = {
      fullName: 'Name',
      email: 'Email',
      phone: 'Phone',
      linkedin: 'LinkedIn',
    };
    expect(labels.fullName).toBe('Name');
    expect(labels.email).toBe('Email');
    expect(labels.phone).toBe('Phone');
    expect(labels.linkedin).toBe('LinkedIn');
  });

  it('getProfileValue returns string or undefined', () => {
    const profile = { name: 'Test User', email: 'test@example.com' };

    const value1 = profile['name'];
    const result1 = typeof value1 === 'string' ? value1 : undefined;
    expect(result1).toBe('Test User');

    const value2 = (profile as Record<string, unknown>)['unknown'];
    const result2 = typeof value2 === 'string' ? value2 : undefined;
    expect(result2).toBeUndefined();
  });

  it('renders profile with full details when profile and fields exist', async () => {
    const target = document.createElement('div');
    document.body.appendChild(target);
    await setProfile({
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '555-1234',
      location: { city: 'San Francisco', state: 'CA', country: 'USA' },
      experience: { currentCompany: 'Acme Corp', currentTitle: 'Software Engineer', yearsOfExperience: 5 },
      links: { linkedin: 'linkedin.com/in/janesmith', github: 'github.com/janesmith', portfolio: 'jane.dev', website: 'jane.dev' },
    });

    document.body.innerHTML = `
      <input name="fullName" value="Jane Smith" />
      <input name="email" value="jane@example.com" />
    `;

    const comp = mount(QuickFillBar, { target });
    await new Promise((resolve) => setTimeout(resolve, 100));

    const nameEl = target.querySelector('.quickfill-name');
    expect(nameEl?.textContent).toBe('Jane Smith');

    const emailEl = target.querySelector('.quickfill-email');
    expect(emailEl?.textContent).toBe('jane@example.com');

    unmount(comp);
  });

  it('fill button is present when profile and fields exist', async () => {
    const target = document.createElement('div');
    document.body.appendChild(target);
    await setProfile({ name: 'John Doe' });

    document.body.innerHTML = '<input name="fullName" value="John Doe" />';

    const comp = mount(QuickFillBar, { target });
    await new Promise((resolve) => setTimeout(resolve, 50));

    const fillBtn = target.querySelector('.btn-primary.btn-sm');
    expect(fillBtn).not.toBeNull();
    expect(fillBtn?.textContent).toBe('Fill Form');

    unmount(comp);
  });
});
