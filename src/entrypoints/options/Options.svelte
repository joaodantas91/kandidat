<script lang="ts">
  import { onMount } from 'svelte';
  import {
    getSettings,
    setSettings,
    addBlacklistKeyword,
    removeBlacklistKeyword,
    resetSettings,
    DEFAULT_BLACKLIST_KEYWORDS,
    type Settings,
  } from '@/core/storage/settings';
  import { showToast, dismissToast, toasts } from '@/lib/toastStore';
import ProfileManager from '@/entrypoints/options/ProfileManager.svelte';
import Toast from '@/lib/Toast.svelte';

  let activeTab: 'keywords' | 'profile' = $state('keywords');
  let keywords: string[] = $state([]);
  let autoFilterEnabled: boolean = $state(true);
  let newKeywordInput: string = $state('');
  let statusMessage: string = $state('');
  let statusTimeout: ReturnType<typeof setTimeout> | undefined;
  let toastId: string | undefined;

  function showStatus(msg: string) {
    statusMessage = msg;
    if (statusTimeout) clearTimeout(statusTimeout);
    statusTimeout = setTimeout(() => {
      statusMessage = '';
    }, 2500);
  }

  function showToastMessage(msg: string, type: 'info' | 'success' | 'error' = 'info') {
    toastId = showToast(msg, type);
  }

  onMount(async () => {
    const settings = await getSettings();
    keywords = settings.blacklistKeywords ?? [...DEFAULT_BLACKLIST_KEYWORDS];
    autoFilterEnabled = settings.autoFilterEnabled ?? true;
  });

  async function handleAddKeyword(event: SubmitEvent) {
    event.preventDefault();
    const trimmed = newKeywordInput.trim().toLowerCase();
    if (!trimmed) return;

    if (keywords.includes(trimmed)) {
      showStatus(`"${trimmed}" is already in the filter list`);
      return;
    }

    keywords = await addBlacklistKeyword(trimmed);
    newKeywordInput = '';
    showStatus(`Added "${trimmed}" to blacklist`);
  }

  async function handleRemoveKeyword(kw: string) {
    keywords = await removeBlacklistKeyword(kw);
    showStatus(`Removed "${kw}"`);
  }

  async function handleToggleAutoFilter() {
    autoFilterEnabled = !autoFilterEnabled;
    await setSettings({
      blacklistKeywords: $state.snapshot(keywords),
      autoFilterEnabled,
    });
    showStatus(
      autoFilterEnabled ? 'Auto-filter enabled' : 'Auto-filter disabled',
    );
  }

  async function handleResetDefaults() {
    const res = await resetSettings();
    keywords = [...res.blacklistKeywords];
    autoFilterEnabled = res.autoFilterEnabled ?? true;
    showToastMessage('Settings saved', 'success');
    showStatus('Reset keywords to defaults');
  }
</script>

<div class="options-container">
  <Toast />

  <header>
    <h1>Kandidat Options</h1>
    <p class="subtitle">Customize job feed filters & candidate profile</p>
  </header>

  <nav class="tabs" aria-label="Settings tabs">
    <button
      type="button"
      class="tab-btn"
      class:active={activeTab === 'keywords'}
      onclick={() => (activeTab = 'keywords')}
    >
      Keyword Filters ({keywords.length})
    </button>
    <button
      type="button"
      class="tab-btn"
      class:active={activeTab === 'profile'}
      onclick={() => (activeTab = 'profile')}
    >
      Profile Settings
    </button>
  </nav>

  {#if statusMessage}
    <div class="status-banner" role="status">
      {statusMessage}
    </div>
  {/if}

  <main class="tab-content">
    {#if activeTab === 'keywords'}
      <section class="section" aria-labelledby="keywords-heading">
        <h2 id="keywords-heading">LinkedIn Job Filter Keywords</h2>
        <p class="description">
          Posts and job postings containing any of these keywords will be
          automatically hidden from your LinkedIn feed and search results.
        </p>

        <div class="toggle-row">
          <label class="toggle-label" for="auto-filter-toggle">
            <input
              id="auto-filter-toggle"
              type="checkbox"
              checked={autoFilterEnabled}
              onchange={handleToggleAutoFilter}
            />
            <span>Enable LinkedIn job feed auto-filtering</span>
          </label>
        </div>

        <form class="add-keyword-form" onsubmit={handleAddKeyword}>
          <input
            type="text"
            placeholder="Add keyword or company..."
            bind:value={newKeywordInput}
            aria-label="New keyword to blacklist"
            class="input-field"
          />
          <button type="submit" class="btn-primary">Add Filter</button>
        </form>

        <div class="keywords-header">
          <span class="count"
            >{keywords.length} active keyword{keywords.length === 1
              ? ''
              : 's'}</span
          >
          <button type="button" class="reset-btn" onclick={handleResetDefaults}>
            Reset to Defaults
          </button>
        </div>

        {#if keywords.length === 0}
          <p class="empty-state">
            No blacklist keywords configured. Add one above.
          </p>
        {:else}
          <ul class="keywords-list" aria-label="Active blacklist keywords">
            {#each keywords as kw}
              <li class="keyword-tag">
                <span class="keyword-text">{kw}</span>
                <button
                  type="button"
                  class="remove-btn"
                  data-keyword={kw}
                  title={`Remove "${kw}"`}
                  aria-label={`Remove "${kw}"`}
                  onclick={() => handleRemoveKeyword(kw)}
                >
                  ✕
                </button>
              </li>
            {/each}
          </ul>
        {/if}
      </section>
    {:else if activeTab === 'profile'}
      <section class="section" aria-labelledby="profile-heading">
        <h2 id="profile-heading">Candidate Profile</h2>
        <p class="description">
          Saved profile details used for autofilling job application forms.
        </p>
        <ProfileManager />
      </section>
    {/if}
  </main>
</div><style>
  @import '/src/styles/tokens.css';
  @import '/src/styles/components.css';

  .options-container {
    max-width: 640px;
    margin: var(--space-8) auto;
    padding: var(--space-4);
    background: var(--color-bg-canvas);
    color: var(--color-text-primary);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-md);
    box-sizing: border-box;
  }

  header {
    margin-bottom: var(--space-5);
    border-bottom: 1px solid var(--color-border-subtle);
    padding-bottom: var(--space-3);
  }

  h1 {
    font-size: var(--font-xl);
    margin: 0 0 var(--space-3) 0;
  }

  .subtitle {
    font-size: var(--font-sm);
    color: var(--color-text-secondary);
    margin: 0;
  }

  .tabs {
    display: flex;
    gap: var(--space-2);
    margin-bottom: var(--space-5);
    border-bottom: 1px solid var(--color-border-subtle);
    padding-bottom: var(--space-2);
  }

  .tab-btn {
    background: transparent;
    border: 1px solid transparent;
    color: var(--color-text-secondary);
    padding: var(--space-2) var(--space-3);
    font-size: var(--font-sm);
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .tab-btn:hover {
    color: var(--color-text-primary);
    border-color: var(--color-border-default);
  }

  .tab-btn.active {
    background: var(--color-bg-elevated);
    color: var(--color-text-primary);
    border-color: var(--color-text-primary);
  }

  .status-banner {
    background: var(--color-bg-elevated);
    border: 1px solid var(--color-border-focus);
    color: var(--color-text-primary);
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-sm);
    font-size: var(--font-sm);
    margin-bottom: var(--space-6);
  }

  .section h2 {
    font-size: var(--font-lg);
    margin: 0 0 var(--space-3) 0;
  }

  .description {
    font-size: var(--font-sm);
    color: var(--color-text-muted);
    line-height: 1.5;
    margin: 0 0 var(--space-4) 0;
  }

  .toggle-row {
    margin-bottom: var(--space-4);
  }

  .toggle-label {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    cursor: pointer;
    font-size: var(--font-sm);
  }

  .toggle-label input[type='checkbox'] {
    cursor: pointer;
    accent-color: var(--color-text-primary);
  }

  .add-keyword-form {
    display: flex;
    gap: var(--space-2);
    margin-bottom: var(--space-4);
  }

  .add-keyword-form input {
    flex: 1;
    padding: var(--space-2) var(--space-3);
    font-size: var(--font-sm);
  }

  .add-keyword-form button {
    padding: var(--space-2) var(--space-3);
    font-size: var(--font-sm);
    white-space: nowrap;
  }

  .keywords-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-3);
  }

  .count {
    font-size: var(--font-xs);
    color: var(--color-text-secondary);
  }

  .reset-btn {
    font-size: var(--font-xs);
    background: transparent;
    border: 1px solid var(--color-border-default);
    color: var(--color-text-secondary);
    padding: var(--space-1) var(--space-2);
    cursor: pointer;
    transition: border-color 0.15s ease, color 0.15s ease;
  }

  .reset-btn:hover {
    border-color: #888;
    color: var(--color-text-primary);
  }

  .keywords-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .keyword-tag {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    background: var(--color-bg-elevated);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-sm);
    padding: var(--space-1) var(--space-2);
    font-size: var(--font-sm);
  }

  .keyword-text {
    word-break: break-word;
  }

  .remove-btn {
    background: transparent;
    border: none;
    color: var(--color-text-muted);
    cursor: pointer;
    padding: 0 var(--space-1);
    font-size: var(--font-xs);
    line-height: 1;
  }

  .remove-btn:hover {
    color: var(--color-destructive);
  }

  .empty-state {
    font-size: var(--font-sm);
    color: var(--color-text-muted);
    font-style: italic;
  }
</style>
