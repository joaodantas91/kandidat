import { setElementValue } from '../dom/setter';

export type OpenEndedQuestion = {
  id: string;
  label: string;
  element: HTMLTextAreaElement;
};

const getLabelText = (textarea: HTMLTextAreaElement): string => {
  if (textarea.labels?.[0]) {
    return textarea.labels[0].textContent ?? '';
  }
  const closestLabel = textarea.closest('label')?.textContent ?? '';
  if (closestLabel) return closestLabel.trim();
  const siblingLabel = textarea.parentElement?.querySelector('label')?.textContent ?? '';
  return siblingLabel.trim();
};

export const extractOpenQuestions = (
  root: ParentNode,
  platform: 'lever' | 'greenhouse' | 'workday',
): OpenEndedQuestion[] => {
  switch (platform) {
    case 'lever': {
      const questions: OpenEndedQuestion[] = [];
      const containers = root.querySelectorAll('.application-question');
      for (const container of containers) {
        const textarea = container.querySelector('textarea');
        if (textarea) {
          questions.push({
            id: textarea.name || textarea.id || '',
            label: getLabelText(textarea).trim(),
            element: textarea,
          });
        }
      }
      return questions;
    }
    case 'greenhouse': {
      const questions: OpenEndedQuestion[] = [];
      const seen = new Set<string>();

      const answerTextareas = (
        root.querySelectorAll('textarea[name*="answers"]') as unknown as HTMLTextAreaElement[]
      );
      for (const ta of answerTextareas) {
        const id = ta.name || ta.id || '';
        if (seen.has(id)) continue;
        seen.add(id);
        questions.push({
          id,
          label: getLabelText(ta).trim(),
          element: ta,
        });
      }

      const fieldTextareas = (
        root.querySelectorAll('.field textarea') as unknown as HTMLTextAreaElement[]
      );
      for (const ta of fieldTextareas) {
        const id = ta.name || ta.id || '';
        if (seen.has(id)) continue;
        seen.add(id);
        questions.push({
          id,
          label: getLabelText(ta).trim(),
          element: ta,
        });
      }

      return questions;
    }
    case 'workday':
      return [];
  }
};

export const draftAndApplyAnswer = async (
  question: OpenEndedQuestion,
  answererFn: (q: string) => Promise<string>,
): Promise<void> => {
  const answer = await answererFn(question.label);
  setElementValue(question.element, answer);
};