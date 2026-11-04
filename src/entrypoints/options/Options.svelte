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
          />
          <button type="submit">Add Filter</button>
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
</div>

<style>
  .options-container {
    max-width: 640px;
    margin: 32px auto;
    padding: 24px;
    background: var(--black, #111);
    color: var(--white, #eaeaea);
    border: 1px solid #333;
    border-radius: 8px;
    box-sizing: border-box;
  }

  header {
    margin-bottom: 20px;
    border-bottom: 1px solid #282828;
    padding-bottom: 12px;
  }

  h1 {
    font-size: 20px;
    margin: 0 0 6px 0;
  }

  .subtitle {
    font-size: 12px;
    color: #888;
    margin: 0;
  }

  .tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 20px;
    border-bottom: 1px solid #282828;
    padding-bottom: 8px;
  }

  .tab-btn {
    background: transparent;
    border: 1px solid transparent;
    color: #888;
    padding: 6px 12px;
    font-size: 12px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .tab-btn:hover {
    color: var(--white, #eaeaea);
    border-color: #444;
  }

  .tab-btn.active {
    background: #222;
    color: var(--white, #eaeaea);
    border-color: var(--white, #eaeaea);
  }

  .status-banner {
    background: #1c2e1c;
    border: 1px solid #3d7e3d;
    color: #85e885;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 11px;
    margin-bottom: 16px;
  }

  .section h2 {
    font-size: 16px;
    margin: 0 0 8px 0;
  }

  .description {
    font-size: 12px;
    color: #999;
    line-height: 1.5;
    margin: 0 0 16px 0;
  }

  .toggle-row {
    margin-bottom: 16px;
  }

  .toggle-label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-size: 12px;
  }

  .toggle-label input[type='checkbox'] {
    cursor: pointer;
    accent-color: var(--white, #eaeaea);
  }

  .add-keyword-form {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
  }

  .add-keyword-form input {
    flex: 1;
    padding: 6px 10px;
    font-size: 12px;
  }

  .add-keyword-form button {
    padding: 6px 12px;
    font-size: 12px;
    white-space: nowrap;
  }

  .keywords-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .count {
    font-size: 11px;
    color: #888;
  }

  .reset-btn {
    font-size: 11px;
    background: transparent;
    border: 1px solid #444;
    color: #aaa;
    padding: 3px 8px;
    cursor: pointer;
  }

  .reset-btn:hover {
    border-color: #888;
    color: var(--white, #eaeaea);
  }

  .keywords-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .keyword-tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #1c1c1c;
    border: 1px solid #333;
    border-radius: 4px;
    padding: 4px 8px;
    font-size: 12px;
  }

  .keyword-text {
    word-break: break-word;
  }

  .remove-btn {
    background: transparent;
    border: none;
    color: #777;
    cursor: pointer;
    padding: 0 2px;
    font-size: 11px;
    line-height: 1;
  }

  .remove-btn:hover {
    color: #ff6b6b;
  }

  .empty-state {
    font-size: 12px;
    color: #666;
    font-style: italic;
  }

  .profile-wrapper {
    background: #181818;
    padding: 16px;
    border-radius: 6px;
    border: 1px solid #282828;
  }
</style>
