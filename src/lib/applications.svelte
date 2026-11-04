<script lang="ts">
  import { onMount } from 'svelte';
  import { getApplications } from '../core/storage/applications';
  import type { Application } from '../core/storage/applications';

  let applications: Application[] = $state([]);
  let loading = $state(true);

  onMount(async () => {
    applications = await getApplications();
    loading = false;
  });
</script>

{#if loading}
  <p>Loading applications...</p>
{:else}
  {#if applications.length === 0}
    <p>No applications submitted yet.</p>
  {:else}
    <div class="applications-list">
      {#each applications as app (app.url)}
        <div class="application-card">
          <div class="company-role">
            <span class="company">{app.company}</span>
            <span class="role">{app.role}</span>
          </div>
          <div class="ats-badge">{app.ats}</div>
          <div class="applied-date">Applied {new Date(app.appliedAt).toLocaleDateString()}</div>
          <a href="{app.url}" class="url-link" target="_blank" rel="noopener">View application</a>
          <button class="remove-btn">Remove</button>
        </div>
      {/each}
    </div>
  {/if}
{/if}

<style>
  .applications-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .application-card {
    background: var(--background-primary, #fff);
    border: 1px solid var(--border-color, #e0e0e0);
    border-radius: 8px;
    padding: 12px 16px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .company-role {
    display: flex;
    align-items: baseline;
    gap: 4px;
    font-weight: 500;
  }

  .ats-badge {
    background: #e8e8e8;
    color: #333;
    font-size: 12px;
    padding: 2px 6px;
    border-radius: 4px;
    align-self: flex-start;
  }

  .applied-date {
    font-size: 12px;
    color: #666;
    margin-top: 4px;
  }

  .url-link {
    margin-top: 4px;
    color: #0066cc;
    text-decoration: none;
    font-size: 14px;
    align-self: flex-end;
  }

  .url-link:hover {
    text-decoration: underline;
  }

  .remove-btn {
    margin-top: 4px;
    background: none;
    border: none;
    color: #666;
    font-size: 12px;
    cursor: pointer;
    align-self: flex-end;
  }

  .remove-btn:hover {
    color: #ff4757;
  }

  p {
    margin: 0;
    color: #666;
  }
</style>