import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { extractOpenQuestions, draftAndApplyAnswer, type OpenEndedQuestion } from './questions';

const leverFixture = readFileSync(
  resolve('tests/fixtures/lever-questions.html'),
  'utf8',
);

const greenhouseFixture = readFileSync(
  resolve('tests/fixtures/greenhouse-questions.html'),
  'utf8',
);

const input = (selector: string) =>
  document.querySelector<HTMLTextAreaElement>(selector);

const mountFixture = (html: string) => {
  const parsed = new DOMParser().parseFromString(html, 'text/html');
  document.body.innerHTML = parsed.body.innerHTML;
};

describe('extractOpenQuestions', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('extracts Lever open-ended questions from .application-question containers', () => {
    mountFixture(leverFixture);

    const questions = extractOpenQuestions(document, 'lever');

    expect(questions).toHaveLength(3);
    expect(questions[0]).toEqual(
      expect.objectContaining({
        id: 'question_1',
        label: 'Why do you want to work here?',
        element: expect.any(HTMLTextAreaElement),
      }),
    );
    expect(questions[1]).toEqual(
      expect.objectContaining({
        id: 'question_2',
        label: 'Describe a challenging project you\'ve worked on.',
        element: expect.any(HTMLTextAreaElement),
      }),
    );
    expect(questions[2]).toEqual(
      expect.objectContaining({
        id: 'question_3',
        label: 'What are your salary expectations?',
        element: expect.any(HTMLTextAreaElement),
      }),
    );
  });

  it('extracts Greenhouse open-ended questions from textareas[name*="answers"] and .field textareas', () => {
    mountFixture(greenhouseFixture);

    const questions = extractOpenQuestions(document, 'greenhouse');

    expect(questions).toHaveLength(3);
    const q = questions as [OpenEndedQuestion, OpenEndedQuestion, OpenEndedQuestion];
    expect(q[0].id).toBe('answers[question_1]');
    expect(q[0].label).toBe('What motivates you?');
    expect(q[1].id).toBe('answers[question_2]');
    expect(q[1].label).toBe('Describe your experience with JavaScript.');
    expect(q[2].id).toBe('answers[question_3]');
    expect(q[2].label).toBe('Why do you want this role?');
  });

  it('returns empty array for Workday', () => {
    mountFixture(greenhouseFixture);

    const questions = extractOpenQuestions(document, 'workday');

    expect(questions).toHaveLength(0);
  });
});

describe('draftAndApplyAnswer', () => {
  let answererFn: (q: string) => Promise<string>;

  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('drafts and applies answer via answererFn and sets element value', async () => {
    mountFixture(greenhouseFixture);

    const textarea = document.querySelector('textarea');
    if (!textarea) throw new Error('no textarea');

    answererFn = vi.fn(async (label) => `Answer for: ${label}`);

    const question: OpenEndedQuestion = {
      id: 'test-id',
      label: 'Test question label',
      element: textarea,
    };

    await draftAndApplyAnswer(question, answererFn);

    expect(answererFn).toHaveBeenCalledWith('Test question label');
    expect(textarea.value).toBe('Answer for: Test question label');
  });

  it('dispatches input and change events after setting value', async () => {
    mountFixture(greenhouseFixture);

    const textarea = document.querySelector('textarea');
    if (!textarea) throw new Error('no textarea');

    const inputHandler = vi.fn();
    const changeHandler = vi.fn();

    document.addEventListener('input', inputHandler);
    document.addEventListener('change', changeHandler);

    answererFn = vi.fn(async (_label) => 'Test answer');

    const question: OpenEndedQuestion = {
      id: 'test-id',
      label: 'Test',
      element: textarea,
    };

    await draftAndApplyAnswer(question, answererFn);

    expect(inputHandler).toHaveBeenCalled();
    expect(changeHandler).toHaveBeenCalled();

    document.removeEventListener('input', inputHandler);
    document.removeEventListener('change', changeHandler);
  });

  it('is a no-op when answererFn throws', async () => {
    mountFixture(greenhouseFixture);

    const textarea = document.querySelector('textarea');
    if (!textarea) throw new Error('no textarea');

    answererFn = vi.fn(async () => {
      throw new Error('answerer failed');
    });

    const question: OpenEndedQuestion = {
      id: 'test-id',
      label: 'Test',
      element: textarea,
    };

    await expect(draftAndApplyAnswer(question, answererFn)).rejects.toThrow(
      'answerer failed',
    );
    expect(textarea.value).toBe('');
  });
});