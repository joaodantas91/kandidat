export const DEFAULT_BASE_URL = 'http://localhost:4000/v1';
export const DEFAULT_MODEL = 'gpt-4o-mini';

export type ChatRole = 'system' | 'user' | 'assistant';

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export type FetchLike = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

export type AnswererOptions = {
  baseUrl?: string;
  model?: string;
  apiKey?: string;
  temperature?: number;
  maxTokens?: number;
  signal?: AbortSignal;
  fetch?: FetchLike;
};

export type AnswerQuestionInput = {
  question: string;
  jobDescription?: string;
  experience?: string;
};

type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
  error?: unknown;
};

const SYSTEM_PROMPT = [
  'You are Kandidat, an assistant that answers job application questions for candidates.',
  'Use only the candidate experience and job description provided by the user.',
  'If the context does not contain the answer, say that the information is not available instead of inventing it.',
  'Answer in the first person, concisely and professionally.',
].join(' ');

export class LiteLLMError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'LiteLLMError';
    this.status = status;
  }
}

export function buildMessages(input: AnswerQuestionInput): ChatMessage[] {
  const question = input.question?.trim();

  if (!question) {
    throw new Error('A question is required.');
  }

  const sections: string[] = [];
  const jobDescription = input.jobDescription?.trim();
  const experience = input.experience?.trim();

  if (jobDescription) {
    sections.push(`Job description:\n${jobDescription}`);
  }

  if (experience) {
    sections.push(`Candidate experience:\n${experience}`);
  }

  sections.push(`Question:\n${question}`);

  return [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: sections.join('\n\n') },
  ];
}

function resolveFetch(fetchImpl?: FetchLike): FetchLike {
  if (fetchImpl) return fetchImpl;

  if (typeof globalThis.fetch !== 'function') {
    throw new LiteLLMError('No fetch implementation is available.');
  }

  return globalThis.fetch.bind(globalThis);
}

function extractErrorMessage(payload: unknown): string | undefined {
  if (!payload || typeof payload !== 'object') return undefined;

  const error = (payload as { error?: unknown }).error;

  if (typeof error === 'string') return error;

  if (error && typeof error === 'object') {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string') return message;
  }

  return undefined;
}

async function readErrorDetail(response: Response): Promise<string> {
  try {
    const text = await response.text();
    if (!text) return '';

    try {
      return extractErrorMessage(JSON.parse(text)) ?? text;
    } catch {
      return text;
    }
  } catch {
    return '';
  }
}

export async function answerQuestion(
  input: AnswerQuestionInput,
  options: AnswererOptions = {},
): Promise<string> {
  const messages = buildMessages(input);
  const baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, '');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options.apiKey) {
    headers.Authorization = `Bearer ${options.apiKey}`;
  }

  const body: Record<string, unknown> = {
    model: options.model ?? DEFAULT_MODEL,
    messages,
    temperature: options.temperature ?? 0.2,
  };

  if (options.maxTokens !== undefined) {
    body.max_tokens = options.maxTokens;
  }

  const response = await resolveFetch(options.fetch)(
    `${baseUrl}/chat/completions`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: options.signal,
    },
  );

  if (!response.ok) {
    const detail = await readErrorDetail(response);
    const suffix = detail ? `: ${detail}` : '';
    throw new LiteLLMError(
      `LiteLLM request failed with status ${response.status}${suffix}`,
      response.status,
    );
  }

  let payload: ChatCompletionResponse;

  try {
    payload = (await response.json()) as ChatCompletionResponse;
  } catch {
    throw new LiteLLMError(
      'LiteLLM returned a response that is not valid JSON.',
      response.status,
    );
  }

  const content = payload.choices?.[0]?.message?.content;

  if (typeof content !== 'string' || !content.trim()) {
    const detail = extractErrorMessage(payload);
    throw new LiteLLMError(
      detail ?? 'LiteLLM response did not include an answer.',
      response.status,
    );
  }

  return content.trim();
}
