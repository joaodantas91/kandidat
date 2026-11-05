export type Confirmation = {
  company: string;
  role: string;
  url: string;
  ats: 'lever' | 'greenhouse' | 'workday';
  appliedAt: string;
};

const LEVER_THANKS_PATH = '/thanks';
const LEVER_SUBMIT_SUCCESS = '[data-qa="msg-submit-success"]';

const GREENHOUSE_CONFIRMATION = '#application_confirmation';

const WORKDAY_CONGRATS_PAGE = '[data-automation-id="applyFlowCongratsPage"]';

export const isLeverConfirmation = (url: string = typeof location !== 'undefined' ? location.href : '', root: Document = document): boolean => {
  const path = typeof location !== 'undefined' ? location.pathname : '';
  const submitSuccess = root.querySelector(LEVER_SUBMIT_SUCCESS) !== null;
  return path === LEVER_THANKS_PATH || submitSuccess;
};

export const isGreenhouseConfirmation = (root: Document = document): boolean => {
  const confirmation = root.querySelector(GREENHOUSE_CONFIRMATION);
  if (!confirmation) return false;
  const text = confirmation.textContent ?? '';
  return /thank you for applying/i.test(text);
};

export const isWorkdayConfirmation = (root: Document = document): boolean => {
  return root.querySelector(WORKDAY_CONGRATS_PAGE) !== null;
};

export const detectConfirmation = (): 'lever' | 'greenhouse' | 'workday' | null => {
  if (isLeverConfirmation()) return 'lever';
  if (isGreenhouseConfirmation()) return 'greenhouse';
  if (isWorkdayConfirmation()) return 'workday';
  return null;
};

export const extractConfirmationData = (): Confirmation | null => {
  const platform = detectConfirmation();
  if (!platform) return null;

  const url = typeof location !== 'undefined' ? location.href : '';

  const now = new Date().toISOString();

  const extractText = (selector: string): string => {
    const el = document.querySelector(selector);
    return el ? (el.textContent ?? '').trim() : '';
  };

  let company = extractText('h1') || extractText('title') || '';
  let role = extractText('h2') || '';

  if (!company) {
    company = role || 'Unknown Company';
  }
  if (!role) {
    role = company || 'Unknown Role';
  }

  return {
    company,
    role,
    url,
    ats: platform,
    appliedAt: now,
  };
};