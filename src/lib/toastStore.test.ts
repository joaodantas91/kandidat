import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { showToast, dismissToast, toasts } from '@/lib/toastStore';

const DEFAULT_DURATION = 3000;

describe('toastStore', () => {
  beforeEach(() => {
    toasts.length = 0;
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('showToast adds a toast to the store', () => {
    const id = showToast('Test message');
    expect(toasts.length).toBe(1);
    expect(toasts[0]!.message).toBe('Test message');
    expect(toasts[0]!.type).toBe('info');
    expect(toasts[0]!.id).toBe(id);
  });

  it('showToast uses default type info', () => {
    const id = showToast('Default type');
    expect(toasts.length).toBe(1);
    expect(toasts[0]!.type).toBe('info');
  });

  it('showToast accepts custom type', () => {
    const id = showToast('Error message', 'error');
    expect(toasts.length).toBe(1);
    expect(toasts[0]!.type).toBe('error');

    const id2 = showToast('Success message', 'success');
    expect(toasts.length).toBe(2);
    expect(toasts[1]!.type).toBe('success');
  });

  it('showToast uses custom duration', async () => {
    const id = showToast('Short message', 'info', 100);
    expect(toasts.length).toBe(1);
    await vi.advanceTimersByTimeAsync(150);
    expect(toasts.length).toBe(0);
  });

  it('dismissToast manually removes a toast', () => {
    const id = showToast('To be dismissed');
    dismissToast(id);
    expect(toasts.length).toBe(0);
  });

  it('dismissToast does nothing for non-existent id', () => {
    const id = showToast('To stay');
    dismissToast('non-existent-id');
    expect(toasts.length).toBe(1);
  });

  it('multiple toasts can exist independently', () => {
    const id1 = showToast('First toast');
    const id2 = showToast('Second toast');
    expect(toasts.length).toBe(2);

    dismissToast(id1);
    expect(toasts.length).toBe(1);
    expect(toasts[0]!.message).toBe('Second toast');
  });

  it('toasts have unique IDs', () => {
    const id1 = showToast('First');
    const id2 = showToast('Second');
    expect(id1).not.toBe(id2);
  });
});