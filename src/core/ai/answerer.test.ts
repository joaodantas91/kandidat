import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_BASE_URL,
  DEFAULT_MODEL,
  LiteLLMError,
  answerQuestion,
  buildMessages,
  type FetchLike,
} from './answerer';

function jsonResponse(payload: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
}

function completion(content: string | null) {
  return {
    choices: [{ message: { content } }],
  };
}

function createFetch(response: Response) {
  return vi.fn<FetchLike>(async () => response);
}

describe('buildMessages()', () => {
  it('includes the question, job description and candidate experience', () => {
    const messages = buildMessages({
      question: 'Why do you want this role?',
      jobDescription: 'Build browser extensions.',
      experience: 'Five years of TypeScript.',
    });

    expect(messages).toHaveLength(2);
    expect(messages[0]?.role).toBe('system');
    expect(messages[1]?.role).toBe('user');
    expect(messages[1]?.content).toContain(
      'Job description:\nBuild browser extensions.',
    );
    expect(messages[1]?.content).toContain(
      'Candidate experience:\nFive years of TypeScript.',
    );
    expect(messages[1]?.content).toContain(
      'Question:\nWhy do you want this role?',
    );
  });

  it('omits optional context sections when they are missing', () => {
    const messages = buildMessages({ question: '  Are you available?  ' });

    expect(messages[1]?.content).toBe('Question:\nAre you available?');
  });

  it('rejects a blank question', () => {
    expect(() => buildMessages({ question: '   ' })).toThrow(
      'A question is required.',
    );
  });
});

describe('answerQuestion()', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('posts to the LiteLLM chat completions endpoint with the expected payload', async () => {
    const fetchMock = createFetch(jsonResponse(completion('Yes, I am.')));

    await answerQuestion(
      {
        question: 'Are you available?',
        experience: 'Five years of TypeScript.',
      },
      { fetch: fetchMock },
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, init] = fetchMock.mock.calls[0] ?? [];
    const body = JSON.parse(String(init?.body));

    expect(url).toBe(`${DEFAULT_BASE_URL}/chat/completions`);
    expect(init?.method).toBe('POST');
    expect(init?.headers).toEqual({ 'Content-Type': 'application/json' });
    expect(body.model).toBe(DEFAULT_MODEL);
    expect(body.temperature).toBe(0.2);
    expect(body.messages).toHaveLength(2);
    expect(body.messages[1].content).toContain('Are you available?');
    expect(body.messages[1].content).toContain('Five years of TypeScript.');
  });

  it('returns the trimmed assistant answer', async () => {
    const fetchMock = createFetch(
      jsonResponse(completion('  I have five years of experience.  ')),
    );

    const answer = await answerQuestion(
      { question: 'Tell me about yourself.' },
      { fetch: fetchMock },
    );

    expect(answer).toBe('I have five years of experience.');
  });

  it('supports a custom base URL, model, token limit and API key', async () => {
    const fetchMock = createFetch(jsonResponse(completion('Sure.')));

    await answerQuestion(
      { question: 'Can you start now?' },
      {
        baseUrl: 'http://localhost:8080/v1/',
        model: 'gpt-4o',
        apiKey: 'secret-key',
        temperature: 0.7,
        maxTokens: 128,
        fetch: fetchMock,
      },
    );

    const [url, init] = fetchMock.mock.calls[0] ?? [];
    const body = JSON.parse(String(init?.body));

    expect(url).toBe('http://localhost:8080/v1/chat/completions');
    expect(init?.headers).toEqual({
      'Content-Type': 'application/json',
      Authorization: 'Bearer secret-key',
    });
    expect(body.model).toBe('gpt-4o');
    expect(body.temperature).toBe(0.7);
    expect(body.max_tokens).toBe(128);
  });

  it('forwards the abort signal', async () => {
    const fetchMock = createFetch(jsonResponse(completion('Sure.')));
    const controller = new AbortController();

    await answerQuestion(
      { question: 'Can you start now?' },
      { fetch: fetchMock, signal: controller.signal },
    );

    expect(fetchMock.mock.calls[0]?.[1]?.signal).toBe(controller.signal);
  });

  it('uses the global fetch implementation when none is supplied', async () => {
    const fetchMock = createFetch(
      jsonResponse(completion('From global fetch.')),
    );
    vi.stubGlobal('fetch', fetchMock);

    const answer = await answerQuestion({ question: 'Ready?' });

    expect(answer).toBe('From global fetch.');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('throws a LiteLLMError with the JSON error message for failed requests', async () => {
    const fetchMock = createFetch(
      jsonResponse(
        { error: { message: 'Invalid model name.' } },
        { status: 400 },
      ),
    );

    const result = answerQuestion({ question: 'Ready?' }, { fetch: fetchMock });

    await expect(result).rejects.toBeInstanceOf(LiteLLMError);
    await expect(result).rejects.toMatchObject({
      status: 400,
      message: 'LiteLLM request failed with status 400: Invalid model name.',
    });
  });

  it('falls back to the plain response body for failed requests', async () => {
    const fetchMock = createFetch(
      new Response('upstream unavailable', { status: 503 }),
    );

    await expect(
      answerQuestion({ question: 'Ready?' }, { fetch: fetchMock }),
    ).rejects.toThrow(
      'LiteLLM request failed with status 503: upstream unavailable',
    );
  });

  it('throws when the response is not valid JSON', async () => {
    const fetchMock = createFetch(new Response('not json', { status: 200 }));

    await expect(
      answerQuestion({ question: 'Ready?' }, { fetch: fetchMock }),
    ).rejects.toThrow('LiteLLM returned a response that is not valid JSON.');
  });

  it('throws when the response has no assistant content', async () => {
    const fetchMock = createFetch(jsonResponse({ choices: [] }));

    await expect(
      answerQuestion({ question: 'Ready?' }, { fetch: fetchMock }),
    ).rejects.toThrow('LiteLLM response did not include an answer.');
  });

  it('throws when the assistant content is blank', async () => {
    const fetchMock = createFetch(jsonResponse(completion('   ')));

    await expect(
      answerQuestion({ question: 'Ready?' }, { fetch: fetchMock }),
    ).rejects.toThrow('LiteLLM response did not include an answer.');
  });

  it('propagates fetch failures', async () => {
    const fetchMock = vi.fn<FetchLike>(async () => {
      throw new Error('connection refused');
    });

    await expect(
      answerQuestion({ question: 'Ready?' }, { fetch: fetchMock }),
    ).rejects.toThrow('connection refused');
  });
});
