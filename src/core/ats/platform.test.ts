import { beforeEach, describe, expect, it } from 'vitest';
import { detectAts } from './platform';

describe('detectAts()', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it.each([
    {
      platform: 'lever',
      url: 'https://jobs.lever.co/acme/123e4567-e89b-12d3-a456-426614174000/apply',
    },
    {
      platform: 'lever',
      url: 'https://jobs.lever.co/acme/123e4567-e89b-12d3-a456-426614174000',
    },
    {
      platform: 'greenhouse',
      url: 'https://job-boards.greenhouse.io/acme/jobs/456789',
    },
    {
      platform: 'greenhouse',
      url: 'https://boards.greenhouse.io/acme/jobs/456789',
    },
    {
      platform: 'workday',
      url: 'https://acme.myworkdayjobs.com/en-US/acme/job/Engineer_R-123',
    },
    {
      platform: 'workday',
      url: 'https://acme.wd1.myworkdayjobs.com/en-US/acme/job/Engineer_R-123',
    },
    {
      platform: 'workday',
      url: 'https://acme.myworkdaysite.com/recruiting/acme/job/Engineer_R-123',
    },
    {
      platform: 'workday',
      url: 'https://example.workday.com/...',
    },
  ])('detects $platform from $url', ({ platform, url }) => {
    expect(detectAts(url)?.platform).toBe(platform);
  });

  it.each([
    'https://example.com/jobs/123',
    'https://www.greenhouse.io/',
    'https://jobs.lever.co.evil.com/acme/123/apply',
    'https://evilmyworkdayjobs.com/acme/job/123',
    'https://myworkdayjobs.com.evil.com/acme/job/123',
    'not a url',
  ])('returns null for unrelated URL %s', (url) => {
    expect(detectAts(url)).toBeNull();
  });

  it.each([
    {
      platform: 'lever',
      markup: '<form id="application-form"></form>',
    },
    {
      platform: 'greenhouse',
      markup: '<form id="application_form"></form>',
    },
    {
      platform: 'workday',
      markup:
        '<input data-automation-id="legalNameSection_firstName" type="text" />',
    },
  ])('detects $platform from DOM markers on unknown hosts', ({ platform, markup }) => {
    document.body.innerHTML = markup;

    expect(detectAts('https://example.com/careers', document)?.platform).toBe(
      platform,
    );
  });

  it('returns null when neither URL nor DOM identify an ATS', () => {
    document.body.innerHTML = '<form><input name="email" /></form>';

    expect(detectAts('https://example.com/careers', document)).toBeNull();
  });

  it('returns an adapter whose matcher agrees with the detected URL', () => {
    const url = 'https://jobs.lever.co/acme/123e4567-e89b-12d3-a456-426614174000/apply';
    const adapter = detectAts(url);

    expect(adapter?.platform).toBe('lever');
    expect(adapter?.matches(new URL(url))).toBe(true);
  });
});
