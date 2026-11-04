<script lang="ts">
  import Applications from '../../lib/applications.svelte';

  let openOptionsPage = $state(false);

  function handleSettingsClick() {
    openOptionsPage = true;
    browser.runtime.openOptionsPage();
  }
</script>

<div class="popup">
  <header class="header">
    <h1 class="title">Kandidat</h1>
    <span class="status-dot" aria-label="Active"></span>
    <button class="settings-btn" onclick="{handleSettingsClick}">Settings</button>
  </header>

  <main class="content">
    <Applications />
  </main>
</div>

<style>
  .popup {
    min-width: 200px;
    min-height: 280px;
    font-family: system-ui, -apple-system, sans-serif;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--border-color, #e0e0e0);
  }

  .title {
    font-size: 18px;
    font-weight: 600;
    color: var(--foreground-primary, #18181b);
    margin: 0;
  }

  .header > *:last-child {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    color: var(--foreground-secondary, #86868b);
    font-size: 13px;
  }

  .header > :last-child:hover {
    color: var(--foreground-primary, #18181b);
  }

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #34c38f;
    margin-left: 8px;
    flex-shrink: 0;
    box-shadow: 0 0 0 1px var(--background-subtle, #e0e0e0);
  }

  .settings-btn {
    padding: 4px 8px;
    background: none;
    border: none;
    color: var(--foreground-secondary, #86868b);
    font-size: 12px;
    cursor: pointer;
    border-radius: 4px;
  }

  .settings-btn:hover {
    background: var(--background-subtle, #f2f2f7);
    color: var(--foreground-primary, #18181b);
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
  }
</style>