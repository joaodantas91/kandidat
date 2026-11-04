import { detectAts } from './platform';

export type JobContext = {
  readonly company: string;
  readonly title: string;
  readonly description: string;
};

const extractCompany = (
  platform: 'lever' | 'greenhouse' | 'workday',
  root: ParentNode,
): string => {
  switch (platform) {
    case 'lever': {
      const el = root.querySelector<HTMLElement>('.employer-name');
      return (el?.textContent ?? '').trim();
    }
    case 'greenhouse': {
      const el = root.querySelector<HTMLElement>('.company-name');
      return (el?.textContent ?? '').trim();
    }
    case 'workday': {
      const el = root.querySelector<HTMLElement>(
        '[data-automation-id="companyName"]',
      );
      return (el?.textContent ?? '').trim();
    }
  }
};

const extractTitle = (
  platform: 'lever' | 'greenhouse' | 'workday',
  root: ParentNode,
): string => {
  switch (platform) {
    case 'lever': {
      const el = root.querySelector<HTMLElement>('.job-title');
      return (el?.textContent ?? '').trim();
    }
    case 'greenhouse': {
      const el = root.querySelector<HTMLElement>('h1');
      return (el?.textContent ?? '').trim();
    }
    case 'workday': {
      const el = root.querySelector<HTMLElement>(
        '[data-automation-id="jobTitle"]',
      );
      return (el?.textContent ?? '').trim();
    }
  }
};

const extractDescription = (
  platform: 'lever' | 'greenhouse' | 'workday',
  root: ParentNode,
): string => {
  switch (platform) {
    case 'lever': {
      const el = root.querySelector<HTMLElement>('.job-description');
      return (el?.textContent ?? '').trim();
    }
    case 'greenhouse': {
      const el = root.querySelector<HTMLElement>('.description');
      return (el?.textContent ?? '').trim();
    }
    case 'workday': {
      const el = root.querySelector<HTMLElement>(
        '[data-automation-id="jobDescription"]',
      );
      return (el?.textContent ?? '').trim();
    }
  }
};

export const extractJobContext = (
  url: URL,
  root?: ParentNode,
): JobContext | null => {
  const adapter = detectAts(url, root);
  if (!adapter) return null;

  const rootNode = root ?? (typeof document !== 'undefined' ? document : undefined);
  if (!rootNode) return null;

  return {
    company: extractCompany(adapter.platform, rootNode),
    title: extractTitle(adapter.platform, rootNode),
    description: extractDescription(adapter.platform, rootNode),
  };
};