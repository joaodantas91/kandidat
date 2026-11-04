export const FIELD_KEYS = ['fullName', 'email', 'phone', 'linkedin'] as const;

export type FieldKey = (typeof FIELD_KEYS)[number];

export type FieldElement =
  HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

export type DetectedFields = Partial<Record<FieldKey, FieldElement>>;

type FieldRule = {
  key: FieldKey;
  autocomplete?: readonly string[];
  inputTypes?: readonly string[];
  identifier: RegExp;
  context: RegExp;
  exclude?: RegExp;
};

const FIELD_RULES: readonly FieldRule[] = [
  {
    key: 'fullName',
    autocomplete: ['name'],
    identifier:
      /^(full name|name|nome|nome completo|candidate name|applicant name|your name)$/,
    context:
      /\b(full name|name|nome|nome completo|candidate name|applicant name)\b/,
    exclude:
      /\b(user name|username|company|organization|organisation|file|first name|last name|given name|family name|surname|middle name|maiden|nickname|display name|card|account|project|product)\b/,
  },
  {
    key: 'email',
    autocomplete: ['email'],
    inputTypes: ['email'],
    identifier:
      /^(e mail|email|email address|candidate email|contact email|correio eletronico)$/,
    context:
      /\b(e mail|email|email address|candidate email|contact email|correio eletronico)\b/,
  },
  {
    key: 'phone',
    autocomplete: ['tel', 'tel-national'],
    inputTypes: ['tel'],
    identifier:
      /^(phone|phone number|telephone|tel|mobile|mobile phone|cell|cell phone|celular|telefone|fone|whats app|whatsapp)$/,
    context:
      /\b(phone|phone number|telephone|tel|mobile|mobile phone|cell|cell phone|celular|telefone|fone|whats app|whatsapp)\b/,
    exclude: /\b(fax|extension|ext)\b/,
  },
  {
    key: 'linkedin',
    autocomplete: ['linkedin'],
    identifier:
      /^(linked in|linkedin|linkedin url|linkedin profile|linkedin profile url)$/,
    context: /\b(linked in|linkedin|linkedin url|linkedin profile)\b/,
  },
];

const UNSUPPORTED_INPUT_TYPES = new Set([
  'button',
  'checkbox',
  'color',
  'file',
  'hidden',
  'image',
  'password',
  'radio',
  'range',
  'reset',
  'search',
  'submit',
]);

const normalize = (value: string | null | undefined) =>
  (value ?? '')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const labelText = (element: FieldElement) => {
  const labels = 'labels' in element ? element.labels : null;
  if (labels?.length) {
    return Array.from(labels)
      .map((label) => label.textContent ?? '')
      .join(' ');
  }

  return element.closest('label')?.textContent ?? '';
};

const isEligible = (element: FieldElement) => {
  if (element.hidden || element.getAttribute('aria-hidden') === 'true') {
    return false;
  }

  if ('disabled' in element && element.disabled) return false;

  if (element instanceof HTMLInputElement) {
    const type = (element.type || 'text').toLowerCase();
    return !UNSUPPORTED_INPUT_TYPES.has(type);
  }

  return true;
};

const scoreElement = (element: FieldElement, rule: FieldRule) => {
  const autocompleteTokens = (element.getAttribute('autocomplete') ?? '')
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  const autocomplete = normalize(autocompleteTokens.join(' '));
  const identifiers = [element.getAttribute('name'), element.id]
    .map(normalize)
    .filter(Boolean);
  const context = normalize(
    [
      element.getAttribute('placeholder'),
      element.getAttribute('aria-label'),
      element.getAttribute('title'),
      labelText(element),
    ].join(' '),
  );
  const searchable = [autocomplete, ...identifiers, context].join(' ');

  if (rule.exclude?.test(searchable)) return 0;

  if (rule.autocomplete?.some((token) => autocompleteTokens.includes(token))) {
    return 100;
  }

  if (
    element instanceof HTMLInputElement &&
    rule.inputTypes?.includes((element.type || 'text').toLowerCase())
  ) {
    return 95;
  }

  if (identifiers.some((identifier) => rule.identifier.test(identifier))) {
    return 80;
  }

  if (rule.context.test(identifiers.join(' '))) return 70;

  if (rule.context.test(context)) return 60;

  return 0;
};

export const detectFields = (root: ParentNode = document): DetectedFields => {
  const best: Partial<
    Record<FieldKey, { score: number; element: FieldElement }>
  > = {};

  for (const element of root.querySelectorAll<FieldElement>(
    'input, textarea, select',
  )) {
    if (!isEligible(element)) continue;

    for (const rule of FIELD_RULES) {
      const score = scoreElement(element, rule);
      if (score === 0) continue;

      const current = best[rule.key];
      if (!current || score > current.score) {
        best[rule.key] = { score, element };
      }
    }
  }

  const detected: DetectedFields = {};

  for (const key of FIELD_KEYS) {
    const match = best[key];
    if (match) detected[key] = match.element;
  }

  return detected;
};

export const detectFieldMap = detectFields;
