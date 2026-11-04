import { beforeEach, describe, expect, it } from 'vitest';
import { detectConfirmation, isLeverConfirmation, isGreenhouseConfirmation, isWorkdayConfirmation, extractConfirmationData } from './confirmation';

describe('ATS submission confirmation detection', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    Object.defineProperty(global, 'location', {
      value: { pathname: '', href: 'https://example.com' },
      configurable: true,
    });
  });

  describe('isLeverConfirmation', () => {
    it('returns true on /thanks path', () => {
      Object.defineProperty(global, 'location', {
        value: { pathname: '/thanks', href: 'https://jobs.lever.co/org/apply/thanks' },
        configurable: true,
      });
      expect(isLeverConfirmation()).toBe(true);
    });

    it('returns true when [data-qa="msg-submit-success"] exists', () => {
      document.body.innerHTML = '<div data-qa="msg-submit-success">Application submitted</div>';
      expect(isLeverConfirmation()).toBe(true);
    });

    it('returns false when neither condition is met', () => {
      Object.defineProperty(global, 'location', {
        value: { pathname: '/apply', href: 'https://jobs.lever.co/org/apply' },
        configurable: true,
      });
      expect(isLeverConfirmation()).toBe(false);
    });
  });

  describe('isGreenhouseConfirmation', () => {
    it('returns true with #application_confirmation and thank you text', () => {
      document.body.innerHTML = '<div id="application_confirmation">Thank you for applying</div>';
      expect(isGreenhouseConfirmation()).toBe(true);
    });

    it('returns false when #application_confirmation has different text', () => {
      document.body.innerHTML = '<div id="application_confirmation">Good luck!</div>';
      expect(isGreenhouseConfirmation()).toBe(false);
    });

    it('returns false when #application_confirmation does not exist', () => {
      document.body.innerHTML = '<form></form>';
      expect(isGreenhouseConfirmation()).toBe(false);
    });
  });

  describe('isWorkdayConfirmation', () => {
    it('returns true when [data-automation-id="applyFlowCongratsPage"] exists', () => {
      document.body.innerHTML = '<div data-automation-id="applyFlowCongratsPage">Congratulations</div>';
      expect(isWorkdayConfirmation()).toBe(true);
    });

    it('returns false when the element does not exist', () => {
      document.body.innerHTML = '<form></form>';
      expect(isWorkdayConfirmation()).toBe(false);
    });
  });

  describe('detectConfirmation', () => {
    it('returns "lever" on /thanks path', () => {
      Object.defineProperty(global, 'location', {
        value: { pathname: '/thanks', href: 'https://jobs.lever.co/org/apply/thanks' },
        configurable: true,
      });
      expect(detectConfirmation()).toBe('lever');
    });

    it('returns "lever" when [data-qa="msg-submit-success"] exists', () => {
      document.body.innerHTML = '<div data-qa="msg-submit-success">Submitted</div>';
      expect(detectConfirmation()).toBe('lever');
    });

    it('returns "greenhouse" when #application_confirmation exists', () => {
      document.body.innerHTML = '<div id="application_confirmation">Thank you for applying</div>';
      expect(detectConfirmation()).toBe('greenhouse');
    });

    it('returns "workday" when [data-automation-id="applyFlowCongratsPage"] exists', () => {
      document.body.innerHTML = '<div data-automation-id="applyFlowCongratsPage">Success</div>';
      expect(detectConfirmation()).toBe('workday');
    });

    it('returns null when no confirmation detected', () => {
      document.body.innerHTML = '<form></form>';
      expect(detectConfirmation()).toBeNull();
    });
  });

  describe('extractConfirmationData', () => {
    it('extracts application data from Lever confirmation', () => {
      Object.defineProperty(global, 'location', {
        value: { pathname: '/thanks', href: 'https://jobs.lever.co/acme/apply' },
        configurable: true,
      });
      document.body.innerHTML = '<h1>Acme</h1><p>Software Engineer position';

      const data = extractConfirmationData();
      expect(data).not.toBeNull();
      if (data) {
        expect(data.ats).toBe('lever');
        expect(data.url).toContain('acme/apply');
      }
    });

    it('extracts application data from Greenhouse confirmation', () => {
      document.body.innerHTML = '<div id="application_confirmation">Thank you for applying</div><h1>Acme</h1><p>Software Engineer</p>';

      const data = extractConfirmationData();
      expect(data).not.toBeNull();
      if (data) {
        expect(data.ats).toBe('greenhouse');
      }
    });

    it('extracts application data from Workday confirmation', () => {
      document.body.innerHTML = '<h1>Acme</h1><p>Engineer</p><div data-automation-id="applyFlowCongratsPage"></div>';

      const data = extractConfirmationData();
      expect(data).not.toBeNull();
      if (data) {
        expect(data.ats).toBe('workday');
      }
    });
  });
});