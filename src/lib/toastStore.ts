type Toast = {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error';
};

let toasts: Toast[] = [];

export function showToast(
  message: string,
  type: 'info' | 'success' | 'error' = 'info',
  duration = 3000,
): string {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const toast: Toast = { id, message, type };
  toasts.push(toast);

  setTimeout(() => {
    dismissToast(id);
  }, duration);

  return id;
}

export function dismissToast(id: string) {
  const index = toasts.findIndex((t) => t.id === id);
  if (index > -1) {
    toasts.splice(index, 1);
  }
}

export { toasts };