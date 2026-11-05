<script lang="ts">
  import { onMount } from 'svelte';
  import {
    getApplications,
    addApplication,
    removeApplication,
    updateApplicationStatus,
    type Application,
    type ApplicationStatus,
    ALL_STATUSES,
  } from '../core/storage/applications';
  import { showToast } from '@/lib/toastStore';

  let applications: Application[] = $state([]);
  let loading = $state(true);
  let searchQuery = $state('');
  let statusFilter: 'All' | ApplicationStatus = $state('All');

  let newCompany = $state('');
  let newRole = $state('');
  let newUrl = $state('');
  let newAts: 'lever' | 'greenhouse' | 'workday' = $state('lever');
  let newStatus: ApplicationStatus = $state('Applied');

  const filteredApplications = $derived(
    applications
      .filter((app) => {
        const query = searchQuery.toLowerCase();
        return (
          app.company.toLowerCase().includes(query) ||
          app.ats.toLowerCase().includes(query)
        );
      })
      .filter((app) => statusFilter === 'All' || app.status === statusFilter),
  );

  onMount(async () => {
    applications = await getApplications();
    loading = false;
  });

  async function handleAddApplication(event: SubmitEvent) {
    event.preventDefault();
    if (!newCompany.trim() || !newRole.trim() || !newUrl.trim()) return;

    const before = applications.length;
    await addApplication(
      newCompany.trim(),
      newRole.trim(),
      newUrl.trim(),
      newAts,
      new Date().toISOString().split('T')[0]!,
      newStatus,
    );
    applications = await getApplications();
    newCompany = '';
    newRole = '';
    newUrl = '';
    newStatus = 'Applied';

    if (applications.length === before) {
      showToast('Application already exists', 'info');
    } else {
      showToast('Application added', 'success');
    }
  }

  async function handleRemove(url: string) {
    await removeApplication(url);
    applications = await getApplications();
    showToast('Application removed', 'info');
  }

  function handleStatusChange(app: Application, event: Event) {
    const status = (event.target as HTMLSelectElement).value as ApplicationStatus;
    void updateApplicationStatus(app.url, status);
    showToast(`Status updated to ${status}`, 'success');
  }
</script>

<div class="applications-dashboard">
  <header class="dashboard-header">
    <h2 class="dashboard-title">Application Tracker</h2>

    <div class="filter-row">
      <label for="search-input" class="visually-hidden">Search applications</label>
      <input
        id="search-input"
        type="text"
        class="input-field search-input"
        placeholder="Filter by company or platform..."
        bind:value={searchQuery}
        aria-label="Search applications by company or platform"
      />
      <label for="status-filter" class="visually-hidden">Filter by status</label>
      <select
        id="status-filter"
        class="input-field status-filter"
        bind:value={statusFilter}
        onchange={(event) => {
          statusFilter = (event.target as HTMLSelectElement)
            .value as 'All' | ApplicationStatus;
        }}
        aria-label="Filter applications by status"
      >
        <option value="All">All statuses</option>
        {#each ALL_STATUSES as status}
          <option value={status}>{status}</option>
        {/each}
      </select>
    </div>
  </header>

  <section class="manual-entry">
    <h3 class="manual-entry-title">Add application manually</h3>
    <form class="add-form" onsubmit={handleAddApplication}>
      <div class="form-row">
        <label for="input-company">Company</label>
        <input
          id="input-company"
          type="text"
          class="input-field"
          bind:value={newCompany}
          placeholder="Company name"
          required
        />
      </div>
      <div class="form-row">
        <label for="input-role">Role</label>
        <input
          id="input-role"
          type="text"
          class="input-field"
          bind:value={newRole}
          placeholder="Job title"
          required
        />
      </div>
      <div class="form-row">
        <label for="input-url">Application URL</label>
        <input
          id="input-url"
          type="url"
          class="input-field"
          bind:value={newUrl}
          placeholder="https://..."
          required
        />
      </div>
      <div class="form-row">
        <label for="input-ats">Platform</label>
        <select id="input-ats" class="input-field" bind:value={newAts}>
          <option value="lever">Lever</option>
          <option value="greenhouse">Greenhouse</option>
          <option value="workday">Workday</option>
        </select>
      </div>
      <div class="form-row">
        <label for="input-status">Status</label>
        <select id="input-status" class="input-field" bind:value={newStatus}>
          {#each ALL_STATUSES as status}
            <option value={status}>{status}</option>
          {/each}
        </select>
      </div>
      <div class="form-actions">
        <button type="submit" class="btn-primary">Add Application</button>
      </div>
    </form>
  </section>

  {#if loading}
    <p>Loading applications...</p>
  {:else if filteredApplications.length === 0}
    <p class="empty-state">No applications match the current filters.</p>
  {:else}
    <ul class="applications-list" aria-label="Tracked applications">
      {#each filteredApplications as app (app.url)}
        <li class="card application-card">
          <div class="card-header">
            <div class="company-role">
              <span class="company">{app.company}</span>
              <span class="role">{app.role}</span>
            </div>
            <span class="tag ats-tag">{app.ats}</span>
          </div>
          <div class="card-meta">
            <span class="applied-date">Applied {new Date(app.appliedAt).toLocaleDateString()}</span>
            <span class="status-tag status-{app.status.toLowerCase()}">{app.status}</span>
          </div>
          <a
            href={app.url}
            class="url-link"
            target="_blank"
            rel="noopener"
            aria-label="View application for {app.company}"
          >
            View application
          </a>
          <div class="card-actions">
            <select
              class="input-field status-select"
              data-url={app.url}
              bind:value={app.status}
              onchange={(event) => handleStatusChange(app, event)}
              aria-label={`Update status for ${app.company}`}
            >
              {#each ALL_STATUSES as status}
                <option value={status}>{status}</option>
              {/each}
            </select>
            <button
              type="button"
              class="btn-destructive btn-sm"
              data-url={app.url}
              onclick={() => handleRemove(app.url)}
              aria-label="Remove {app.company}"
            >
              Remove
            </button>
          </div>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  @import '/src/styles/tokens.css';
  @import '/src/styles/components.css';

  .applications-dashboard {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    color: var(--color-text-primary);
  }

  .dashboard-header {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .dashboard-title {
    font-size: var(--font-lg);
    margin: 0;
  }

  .filter-row {
    display: flex;
    gap: var(--space-2);
    align-items: center;
    flex-wrap: wrap;
  }

  .search-input {
    flex: 1;
    min-width: 200px;
  }

  .status-filter {
    min-width: 150px;
  }

  .manual-entry {
    background: var(--color-bg-surface);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-md);
    padding: var(--space-4);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .manual-entry-title {
    font-size: var(--font-md);
    margin: 0;
  }

  .add-form {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .form-row {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .form-row label {
    font-size: var(--font-xs);
    color: var(--color-text-secondary);
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
  }

  .applications-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .application-card {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    flex-wrap: wrap;
  }

  .company-role {
    display: flex;
    align-items: baseline;
    gap: var(--space-1);
  }

  .company {
    font-weight: 600;
  }

  .role {
    color: var(--color-text-secondary);
    font-size: var(--font-sm);
  }

  .card-meta {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--font-xs);
    color: var(--color-text-muted);
  }

  .applied-date {
    white-space: nowrap;
  }

  .url-link {
    font-size: var(--font-sm);
    color: var(--color-accent);
    text-decoration: none;
    align-self: flex-start;
    margin-top: var(--space-1);
  }

  .url-link:hover {
    text-decoration: underline;
  }

  .card-actions {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin-top: var(--space-1);
  }

  .status-select {
    width: 140px;
  }

  .status-tag {
    font-size: var(--font-xs);
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-sm);
    border: 1px solid var(--color-border-default);
    background: var(--color-bg-elevated);
  }

  .status-tag.applied {
    color: var(--color-text-primary);
  }

  .status-tag.interviewing {
    color: var(--color-accent);
  }

  .status-tag.rejected {
    color: var(--color-destructive);
  }

  .status-tag.offered {
    color: var(--color-text-primary);
  }

  .empty-state {
    font-size: var(--font-sm);
    color: var(--color-text-muted);
    font-style: italic;
    margin: 0;
  }

  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    border: 0;
    white-space: nowrap;
  }

  p {
    margin: 0;
    color: var(--color-text-secondary);
  }
</style>
