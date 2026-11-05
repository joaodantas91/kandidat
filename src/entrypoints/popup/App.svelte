<script lang="ts">
  import { onMount } from 'svelte';
  import { getProfile } from '@/core/storage/storage';
  import { showToast } from '@/lib/toastStore';
  import Toast from '@/lib/Toast.svelte';

  type AutofillMessage = { type: 'KANDIDAT_TRIGGER_AUTOFILL' };

  let openOptionsPage = $state(false);
  let profileName = $state('');
  let profileEmail = $state('');
  let hasProfile = $state(false);

  function handleSettingsClick() {
    openOptionsPage = true;
    browser.runtime.openOptionsPage();
  }

  async function handleTriggerAutofill() {
    try {
      const message: AutofillMessage = { type: 'KANDIDAT_TRIGGER_AUTOFILL' };
      await browser.runtime.sendMessage(message);
    } catch {
      // No content script listener; autofill still handled locally by content script.
    }
    showToast('Autofill triggered', 'success');
  }

  async function loadProfile() {
    try {
      const profile = await getProfile();
      if (profile) {
        profileName = profile.name;
        profileEmail = profile.email ?? '';
        hasProfile = true;
      }
    } catch {
      hasProfile = false;
    }
  }

  onMount(loadProfile);
</script>

<div class="popup">
  <header class="header">
    <div class="brand">
      <span class="logo">K</span>
      <h1 class="title">Kandidat</h1>
    </div>
    <button class="settings-btn" type="button" onclick="{handleSettingsClick}">
      Settings
    </button>
  </header>

  <Toast />

  <main class="content">
    <section class="card profile-status">
      <h2 class="section-title">Profile</h2>
      {#if hasProfile}
        <div class="profile-info">
          <span class="profile-name">{profileName}</span>
          {#if profileEmail}
            <span class="profile-email">{profileEmail}</span>
          {/if}
        </div>
        <div class="profile-status-row">
          <span class="status-badge">
            <span class="status-dot" aria-hidden="true"></span>
            Profile Ready
          </span>
        <button class="edit-link" type="button" onclick="{handleSettingsClick}">
          Edit profile
        </button>
        </div>
      {:else}
        <div class="profile-info empty">
          <span class="profile-name">No profile configured</span>
        </div>
        <button class="btn btn-secondary" type="button" onclick="{handleSettingsClick}">
          Create Profile
        </button>
      {/if}
    </section>

    <section class="card quickfill-status">
      <h2 class="section-title">Quick Fill</h2>
      {#if hasProfile}
        <p class="quickfill-hint">Autofill application form on the active page.</p>
        <button class="btn btn-primary" type="button" onclick="{handleTriggerAutofill}">
          Fill Current Form
        </button>
      {:else}
        <p class="quickfill-hint">Create profile to enable</p>
        <button class="btn btn-secondary" type="button" disabled>
          Fill Current Form
        </button>
      {/if}
    </section>
  </main>
</div>

<style>
  @import '/src/styles/tokens.css';
  @import '/src/styles/components.css';

  .popup {
    min-width: 320px;
    min-height: 420px;
    font-family: system-ui, -apple-system, sans-serif;
    background: var(--color-bg-canvas);
    color: var(--color-text-primary);
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-4);
    border-bottom: 1px solid var(--color-border-subtle);
  }

  .brand {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .logo {
    width: 28px;
    height: 28px;
    border-radius: var(--radius-sm);
    background: var(--color-bg-surface);
    border: 1px solid var(--color-border-default);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: var(--font-lg);
    color: var(--color-text-primary);
  }

  .title {
    font-size: var(--font-md);
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0;
  }

  .settings-btn {
    background: transparent;
    border: 1px solid var(--color-border-default);
    color: var(--color-text-secondary);
    padding: var(--space-1) var(--space-3);
    font-size: var(--font-xs);
    border-radius: var(--radius-sm);
    cursor: pointer;
  }

  .settings-btn:hover {
    border-color: var(--color-border-hover);
    color: var(--color-text-primary);
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    padding: var(--space-4);
    flex: 1;
  }

  .card {
    background: var(--color-bg-surface);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-md);
    padding: var(--space-4);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .section-title {
    font-size: var(--font-sm);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-text-secondary);
    margin: 0;
  }

  .profile-info {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .profile-name {
    font-size: var(--font-md);
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .profile-email {
    font-size: var(--font-sm);
    color: var(--color-text-secondary);
  }

  .profile-status-row {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    flex-wrap: wrap;
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    background: var(--color-bg-elevated);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-sm);
    padding: var(--space-1) var(--space-2);
    font-size: var(--font-sm);
    color: var(--color-text-secondary);
  }

  .status-dot {
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--color-text-primary);
  }

  .edit-link {
    background: transparent;
    border: none;
    color: var(--color-text-secondary);
    font-size: var(--font-sm);
    cursor: pointer;
    padding: 0;
    text-decoration: underline;
  }

  .edit-link:hover {
    color: var(--color-text-primary);
  }

  .quickfill-hint {
    font-size: var(--font-sm);
    color: var(--color-text-secondary);
    margin: 0;
  }
</style>
