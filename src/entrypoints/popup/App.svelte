<script lang="ts">
  import { onMount } from 'svelte';
  import { getProfile } from '@/core/storage/storage';
  import Toast from '@/lib/Toast.svelte';

  let openOptionsPage = $state(false);
  let profileName = $state('');
  let profileEmail = $state('');
  let hasProfile = $state(false);

  function handleSettingsClick() {
    openOptionsPage = true;
    browser.runtime.openOptionsPage();
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
    <button class="settings-btn" onclick="{handleSettingsClick}">Options</button>
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
        <p class="profile-hint">Active candidate profile. Edit in Options.</p>
      {:else}
        <div class="profile-info empty">
          <span class="profile-name">No profile set up</span>
        </div>
        <p class="profile-hint">Create a profile to enable autofill.</p>
      {/if}
      <button class="btn-secondary open-options-btn" onclick="{handleSettingsClick}">
        Open Options Settings
      </button>
    </section>

    <section class="card quickfill-status">
      <h2 class="section-title">Quick Fill</h2>
      <p class="quickfill-hint">
        Fill job application forms with your active profile directly on the page.
      </p>
      <div class="quickfill-actions">
        <button class="btn-secondary" onclick="{handleSettingsClick}">
          Setup Profile
        </button>
      </div>
    </section>
  </main>
</div>

<style>
  @import '/src/styles/tokens.css';

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

  .profile-hint {
    font-size: var(--font-xs);
    color: var(--color-text-muted);
    margin: 0;
  }

  .quickfill-hint {
    font-size: var(--font-sm);
    color: var(--color-text-secondary);
    margin: 0;
  }

  .quickfill-actions {
    display: flex;
    gap: var(--space-2);
  }

  .btn-secondary {
    background: transparent;
    border: 1px solid var(--color-border-default);
    color: var(--color-text-primary);
    padding: var(--space-2) var(--space-3);
    font-size: var(--font-sm);
    border-radius: var(--radius-sm);
    cursor: pointer;
  }

  .btn-secondary:hover {
    border-color: var(--color-border-hover);
  }
</style>
