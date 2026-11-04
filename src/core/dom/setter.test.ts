import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setElementValue, setInputValue, splitName } from './setter';

describe('splitName()', () => {
  it('splits a full name into first and last name', () => {
    expect(splitName('John Doe')).toEqual({
      firstName: 'John',
      lastName: 'Doe',
    });
  });

  it('keeps the remaining name parts in the last name', () => {
    expect(splitName('  John Ronald Reuel Tolkien  ')).toEqual({
      firstName: 'John',
      lastName: 'Ronald Reuel Tolkien',
    });
  });

  it('handles a single name', () => {
    expect(splitName('John')).toEqual({ firstName: 'John', lastName: '' });
  });
});

describe('setInputValue()', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('sets the value and dispatches bubbling input and change events', () => {
    const input = document.createElement('input');
    document.body.appendChild(input);
    const handler = vi.fn();
    document.addEventListener('input', handler);
    document.addEventListener('change', handler);

    setInputValue(input, 'Jane Doe');

    expect(input.value).toBe('Jane Doe');
    expect(handler).toHaveBeenCalledTimes(2);
    for (const call of handler.mock.calls) {
      expect(call[0].bubbles).toBe(true);
    }

    document.removeEventListener('input', handler);
    document.removeEventListener('change', handler);
  });

  it('uses the native input value setter', () => {
    const input = document.createElement('input');
    document.body.appendChild(input);
    const setter = vi.spyOn(HTMLInputElement.prototype, 'value', 'set');

    setInputValue(input, 'Jane Doe');

    expect(setter).toHaveBeenCalled();
    setter.mockRestore();
  });
});

describe('setElementValue()', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('sets a textarea value through its native setter', () => {
    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);
    const setter = vi.spyOn(HTMLTextAreaElement.prototype, 'value', 'set');

    setElementValue(textarea, 'A long answer');

    expect(textarea.value).toBe('A long answer');
    expect(setter).toHaveBeenCalled();
    setter.mockRestore();
  });

  it('sets a select value through its native setter', () => {
    const select = document.createElement('select');
    for (const value of ['a', 'b']) {
      const option = document.createElement('option');
      option.value = value;
      select.appendChild(option);
    }
    document.body.appendChild(select);
    const setter = vi.spyOn(HTMLSelectElement.prototype, 'value', 'set');

    setElementValue(select, 'b');

    expect(select.value).toBe('b');
    expect(setter).toHaveBeenCalled();
    setter.mockRestore();
  });
});
