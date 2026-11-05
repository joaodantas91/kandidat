import { describe, it, expect, beforeEach } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import {
  getApplications,
  setApplications,
  addApplication,
  removeApplication,
  clearApplications,
} from './applications';

describe('applications storage', () => {
  beforeEach(async () => {
    fakeBrowser.reset();
  });

  it('loads empty array when storage is empty', async () => {
    const applications = await getApplications();
    expect(applications).toEqual([]);
  });

  it('persists and returns applications', async () => {
    await setApplications([
      {
        company: 'Acme',
        role: 'Software Engineer',
        url: 'https://jobs.lever.co/acme/apply',
        ats: 'lever',
        appliedAt: '2024-01-15',
        status: 'Applied',
      },
    ]);

    const applications = await getApplications();
    expect(applications).toHaveLength(1);
    expect(applications[0]?.company).toBe('Acme');
    expect(applications[0]?.role).toBe('Software Engineer');
    expect(applications[0]?.ats).toBe('lever');
  });

  it('deduplicates by URL when adding a new application', async () => {
    await addApplication(
      'Acme',
      'Software Engineer',
      'https://jobs.lever.co/acme/apply',
      'lever',
      '2024-01-15',
    );

    await addApplication(
      'Tech Corp',
      'Senior Engineer',
      'https://jobs.lever.co/acme/apply',
      'lever',
      '2024-02-20',
    );

    const applications = await getApplications();
    expect(applications).toHaveLength(1);
    expect(applications[0]?.company).toBe('Acme');
    expect(applications[0]?.role).toBe('Software Engineer');
  });

  it('adds a new unique application without deduplication', async () => {
    await addApplication(
      'Acme',
      'Software Engineer',
      'https://jobs.lever.co/acme/apply',
      'lever',
      '2024-01-15',
    );

    await addApplication(
      'Tech Corp',
      'Senior Engineer',
      'https://job-boards.greenhouse.io/company/jobs/1',
      'greenhouse',
      '2024-02-20',
    );

    const applications = await getApplications();
    expect(applications).toHaveLength(2);
  });

  it('removes an application by URL', async () => {
    await addApplication(
      'Acme',
      'Software Engineer',
      'https://jobs.lever.co/acme/apply',
      'lever',
      '2024-01-15',
    );

    await removeApplication('https://jobs.lever.co/acme/apply');

    const applications = await getApplications();
    expect(applications).toHaveLength(0);
  });

  it('clears all applications', async () => {
    await addApplication(
      'Acme',
      'Software Engineer',
      'https://jobs.lever.co/acme/apply',
      'lever',
      '2024-01-15',
    );

    await clearApplications();

    const applications = await getApplications();
    expect(applications).toHaveLength(0);
  });

  it('uses current date as appliedAt when not provided', async () => {
    const today = new Date().toISOString().split('T')[0]!;
    await addApplication(
      'Acme',
      'Software Engineer',
      'https://jobs.lever.co/acme/apply',
      'lever',
      today,
    );

    const applications = await getApplications();
    expect(applications[0]?.appliedAt).toBe(today);
  });
});