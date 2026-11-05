import { storage } from '#imports';

export type ApplicationStatus = 'Applied' | 'Interviewing' | 'Rejected' | 'Offered';

export type Application = {
  company: string;
  role: string;
  url: string;
  ats: 'lever' | 'greenhouse' | 'workday';
  appliedAt: string;
  status: ApplicationStatus;
};

export const ALL_STATUSES: ApplicationStatus[] = [
  'Applied',
  'Interviewing',
  'Rejected',
  'Offered',
];

const APPLICATIONS_KEY = 'local:applications';

const apps = storage.defineItem<Application[]>(APPLICATIONS_KEY, {
  fallback: [],
});

export const getApplications = async (): Promise<Application[]> => {
  return (await apps.getValue()).map((app) => ({
    ...app,
    status: (app.status ?? 'Applied') as ApplicationStatus,
  }));
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
  status: ApplicationStatus = 'Applied',
) => {
  const current = await getApplications();

  if (current.some((app) => app.url === url)) return;

  const updated = [...current, { company, role, url, ats, appliedAt, status }];

  await setApplications(updated);
};

export const removeApplication = async (url: string) => {
  const current = await getApplications();
  const updated = current.filter((app) => app.url !== url);
  await setApplications(updated);
};

export const updateApplicationStatus = async (
  url: string,
  status: ApplicationStatus,
) => {
  const current = await getApplications();
  const updated = current.map((app) =>
    app.url === url ? { ...app, status } : app,
  );
  await setApplications(updated);
};

export const clearApplications = async () => {
  await setApplications([]);
};
