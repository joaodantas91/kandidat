import { storage } from '#imports';

export type Application = {
  company: string;
  role: string;
  url: string;
  ats: 'lever' | 'greenhouse' | 'workday';
  appliedAt: string;
};

const APPLICATIONS_KEY = 'local:applications';

const apps = storage.defineItem<Application[]>(APPLICATIONS_KEY, {
  fallback: [],
});

export const getApplications = async (): Promise<Application[]> => {
  return await apps.getValue();
};

export const setApplications = async (applications: Application[]) => {
  await apps.setValue(applications);
};

export const addApplication = async (
  company: string,
  role: string,
  url: string,
  ats: 'lever' | 'greenhouse' | 'workday',
  appliedAt: string,
) => {
  const current = await getApplications();

  if (current.some((app) => app.url === url)) return;

  const updated = [...current, { company, role, url, ats, appliedAt }];

  await setApplications(updated);
};

export const removeApplication = async (url: string) => {
  const current = await getApplications();
  const updated = current.filter((app) => app.url !== url);
  await setApplications(updated);
};

export const clearApplications = async () => {
  await setApplications([]);
};