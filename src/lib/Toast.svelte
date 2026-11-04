<script lang="ts">
  import { toasts, dismissToast } from '@/lib/toastStore';
</script>

<div class="toast-container" aria-live="polite" aria-atomic="true">
  {#each toasts as toast}
    <div
      class="toast toast-{toast.type}"
      role="alert"
      data-toast-id={toast.id}
    >
      <span class="toast-message">{toast.message}</span>
      <button
        class="toast-close"
        aria-label="Dismiss toast"
        onclick={(e) => {
          e.stopPropagation();
          dismissToast(toast.id);
        }}
      >
        ×
      </button>
    </div>
  {/each}
</div>

<style>
  .toast-container {
    pointer-events: none;
    position: fixed;
    top: 24px;
    right: 24px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    z-index: 1000;
  }

  .toast {
    pointer-events: auto;
    background: var(--background-subtle, #f2f2f7);
    border: 1px solid var(--border-color, #e0e0e0);
    border-radius: 6px;
    padding: 10px 16px;
    font-size: 13px;
    color: var(--foreground-primary, #18181b);
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 240px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
    animation: slideIn 0.3s ease-out;
  }

  .toast-info {
    border-left: 3px solid #3b82f6;
  }

  .toast-success {
    border-left: 3px solid #10b981;
  }

  .toast-error {
    border-left: 3px solid #ef4444;
  }

  .toast-close {
    background: transparent;
    border: none;
    color: #6b7280;
    cursor: pointer;
    padding: 0;
    font-size: 14px;
    line-height: 1;
    pointer-events: auto;
    flex-shrink: 0;
  }

  .toast-close:hover {
    color: var(--foreground-primary, #18181b);
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>