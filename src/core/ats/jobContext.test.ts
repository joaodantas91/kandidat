import { describe, expect, it } from 'vitest';
import { extractJobContext, type JobContext } from './jobContext';
import { URL } from 'node:url';

const leverFixture = `
<!doctype html>
<html lang="en">
  <body>
    <h1 class="job-title">Software Engineer</h1>
    <div class="employer-name">Acme Corp</div>
    <div class="job-description">
      We are looking for a talented Software Engineer to join our team.
    </div>
  </body>
</html>
`;

const greenhouseFixture = `
<!doctype html>
<html lang="en">
  <body>
    <h1>Senior Developer</h1>
    <div class="company-name">Greenhouse IO</div>
    <div class="description">
      We are hiring a Senior Developer to build amazing software.
    </div>
  </body>
</html>
`;

const workdayFixture = `
<!doctype html>
<html lang="en">
  <body>
    <span data-automation-id="jobTitle">Principal Engineer</span>
    <span data-automation-id="companyName">Workday Inc</span>
    <div data-automation-id="jobDescription">
      We are seeking a Principal Engineer to lead our platform team.
    </div>
  </body>
</html>
`;

const leverUrl = new URL('https://jobs.lever.co/engineering');
const greenhouseUrl = new URL('https://job-boards.greenhouse.io/test');
const workdayUrl = new URL('https://www.myworkdayjobs.com/test');

function mountFixture(fixture: string, url: URL, root?: ParentNode): ParentNode {
  const parsed = new DOMParser().parseFromString(fixture, 'text/html');
  if (root) {
    (root as HTMLElement).innerHTML = parsed.body.innerHTML;
  } else {
    document.body.innerHTML = parsed.body.innerHTML;
  }
  return root ?? document.body as ParentNode;
}

describe('extractJobContext', () => {
  it('extracts job context from Lever job page', () => {
    const root = mountFixture(leverFixture, leverUrl);
    const result = extractJobContext(leverUrl, root) as JobContext;

    expect(result).toEqual({
      company: 'Acme Corp',
      title: 'Software Engineer',
      description: 'We are looking for a talented Software Engineer to join our team.',
    });
  });

  it('extracts job context from Greenhouse job page', () => {
    const root = mountFixture(greenhouseFixture, greenhouseUrl);
    const result = extractJobContext(greenhouseUrl, root) as JobContext;

    expect(result).toEqual({
      company: 'Greenhouse IO',
      title: 'Senior Developer',
      description: 'We are hiring a Senior Developer to build amazing software.',
    });
  });

  it('extracts job context from Workday job page', () => {
    const root = mountFixture(workdayFixture, workdayUrl);
    const result = extractJobContext(workdayUrl, root) as JobContext;

    expect(result).toEqual({
      company: 'Workday Inc',
      title: 'Principal Engineer',
      description:
        'We are seeking a Principal Engineer to lead our platform team.',
    });
  });

  it('returns null when no ATS is detected', () => {
    document.body.innerHTML = '<p>No ATS here</p>';
    const result = extractJobContext(new URL('https://unknown.site'), document.body);

    expect(result).toBeNull();
  });

  it('returns normalized (trimmed) values', () => {
    const fixture = `
      <!doctype html>
      <html lang="en">
        <body>
          <h1 class="job-title">  Title with Spaces  </h1>
          <div class="employer-name">  Company   </div>
          <div class="job-description">  Description   </div>
        </body>
      </html>
    `;
    const root = mountFixture(fixture, leverUrl);
    const result = extractJobContext(leverUrl, root) as JobContext;

    expect(result).toEqual({
      company: 'Company',
      title: 'Title with Spaces',
      description: 'Description',
    });
  });

  it('uses root when provided', () => {
    document.body.innerHTML = '<p>irrelevant</p>';
    const customRoot = document.createElement('div');
    customRoot.innerHTML = leverFixture;
    const result = extractJobContext(leverUrl, customRoot as ParentNode) as JobContext;

    expect(result).toEqual({
      company: 'Acme Corp',
      title: 'Software Engineer',
      description: 'We are looking for a talented Software Engineer to join our team.',
    });
  });
});