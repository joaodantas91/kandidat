import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { detectFieldMap, detectFields } from './fieldDetector';

const simpleFormFixture = readFileSync(
  resolve('tests/fixtures/simple-form.html'),
  'utf8',
);

const mount = (html: string) => {
  const parsed = new DOMParser().parseFromString(html, 'text/html');
  document.body.innerHTML = parsed.body.innerHTML;
};

describe('detectFields()', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('detects candidate profile fields from the simple form fixture', () => {
    expect(existsSync(resolve('tests/fixtures/simple-form.html'))).toBe(true);
    mount(simpleFormFixture);

    const fields = detectFields(document);

    expect(fields.fullName).toBe(document.querySelector('#name'));
    expect(fields.email).toBe(
      document.querySelector('input[autocomplete="email"]'),
    );
    expect(fields.phone).toBe(document.querySelector('[name="mobile"]'));
    expect(fields.linkedin).toBe(document.querySelector('#test'));
  });

  it('returns only keys that were found', () => {
    document.body.innerHTML = '<input name="email" />';

    expect(detectFields(document)).toEqual({
      email: document.body.firstElementChild,
    });
    expect(detectFields(document).phone).toBeUndefined();
  });

  it('scans inputs, textareas and selects in a single pass', () => {
    document.body.innerHTML = `
      <input name="name" />
      <textarea name="email"></textarea>
      <select name="phone"></select>
    `;

    const querySelectorAll = vi.spyOn(document, 'querySelectorAll');

    const fields = detectFields(document);

    expect(querySelectorAll).toHaveBeenCalledTimes(1);
    expect(querySelectorAll).toHaveBeenCalledWith('input, textarea, select');
    expect(fields.fullName?.tagName).toBe('INPUT');
    expect(fields.email?.tagName).toBe('TEXTAREA');
    expect(fields.phone?.tagName).toBe('SELECT');

    querySelectorAll.mockRestore();
  });

  it('detects camelCase identifiers such as fullName', () => {
    document.body.innerHTML = '<input id="fullName" />';

    expect(detectFields(document).fullName).toBe(
      document.querySelector('#fullName'),
    );
  });

  it('uses autocomplete tokens, including section-prefixed values', () => {
    document.body.innerHTML = `
      <input autocomplete="section-candidate email" />
      <input autocomplete="tel" />
      <input autocomplete="linkedin" />
    `;

    const fields = detectFields(document);

    expect(fields.email?.getAttribute('autocomplete')).toBe(
      'section-candidate email',
    );
    expect(fields.phone?.getAttribute('autocomplete')).toBe('tel');
    expect(fields.linkedin?.getAttribute('autocomplete')).toBe('linkedin');
  });

  it('prefers stronger signals over weak placeholder matches', () => {
    document.body.innerHTML = `
      <input id="placeholder-match" placeholder="Email" />
      <input id="typed-match" type="email" />
    `;

    expect(detectFields(document).email?.id).toBe('typed-match');
  });

  it('detects fields through an associated label', () => {
    document.body.innerHTML = `
      <label for="profile">LinkedIn profile</label>
      <input id="profile" />
    `;

    expect(detectFields(document).linkedin?.id).toBe('profile');
  });

  it('supports common Portuguese field names', () => {
    document.body.innerHTML = `
      <input name="nome_completo" />
      <input name="telefone" />
      <textarea name="linkedin"></textarea>
    `;

    const fields = detectFields(document);

    expect(fields.fullName?.getAttribute('name')).toBe('nome_completo');
    expect(fields.phone?.getAttribute('name')).toBe('telefone');
    expect(fields.linkedin?.tagName).toBe('TEXTAREA');
  });

  it('ignores hidden, disabled and non-fillable inputs', () => {
    document.body.innerHTML = `
      <input type="hidden" name="email" />
      <input type="submit" name="phone" />
      <input type="password" name="linkedin" />
      <input type="search" name="name" />
      <input name="fullName" disabled />
      <input name="email" hidden />
    `;

    expect(detectFields(document)).toEqual({});
  });

  it('does not mistake username, company or first-name fields for full name', () => {
    document.body.innerHTML = `
      <input name="username" />
      <input name="company_name" />
      <input name="first_name" />
      <input name="given-name" autocomplete="given-name" />
      <input name="full_name" />
    `;

    expect(detectFields(document).fullName?.getAttribute('name')).toBe(
      'full_name',
    );
  });

  it('scopes detection to the provided root element', () => {
    document.body.innerHTML = `
      <input id="outside" name="email" />
      <form id="candidate-form">
        <input id="inside" name="email" />
      </form>
    `;

    const form = document.querySelector<HTMLFormElement>('#candidate-form');
    expect(form).not.toBeNull();

    expect(detectFields(form as HTMLFormElement).email?.id).toBe('inside');
  });

  it('exposes detectFieldMap as the same detector', () => {
    expect(detectFieldMap).toBe(detectFields);
  });
});
