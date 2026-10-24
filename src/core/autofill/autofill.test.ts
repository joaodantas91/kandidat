import { describe, it, expect, beforeEach } from 'vitest';
import { autofill } from './autofill';

describe('autofill()', () => {
  beforeEach(() => {
    document.body.innerHTML = '<input id="name" />';
  });

  it("fills the input with id '#name' with the candidate profile name", () => {
    autofill({
      profile: {
        name: 'John Doe',
      },
      root: document,
    });

    const input = document.querySelector<HTMLInputElement>('#name');
    expect(input?.value).toBe('John Doe');
  });
});
