<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { getProfile, type Profile, type ProfileLinks } from '@/core/storage/storage';
  import { fillApplication } from '@/core/ats';
  import { detectFields, FIELD_KEYS, type DetectedFields } from '@/core/autofill/fieldDetector';
  import { showToast } from '@/lib/toastStore';

  let profile: Profile | null = $state(null);
  let isLoading: boolean = $state(true);
  let isFilling: boolean = $state(false);
  let detectedFields: DetectedFields = $state({});
  let showPreview: boolean = $state(false);
  let totalDetected: number = $state(0);
  let fieldCheckInterval: ReturnType<typeof setInterval> | null = null;

  async function loadProfile() {
    try {
      const p = await getProfile();
      profile = p;
    } catch {
      profile = null;
    } finally {
      isLoading = false;
    }
  }

  function checkFields() {
    const detected = detectFields(document);
    const count = Object.keys(detected).length;
    detectedFields = detected;
    totalDetected = count;
  }

  onMount(async () => {
    await loadProfile();
    checkFields();
    fieldCheckInterval = setInterval(checkFields, 2000);
  });

  onDestroy(() => {
    if (fieldCheckInterval) clearInterval(fieldCheckInterval);
  });

  async function handleFill() {
    if (!profile || isFilling) return;

    isFilling = true;
    showPreview = false;
    try {
      fillApplication(profile, new URL(location.href));
      showToast('Profile filled', 'success');
    } catch {
      showToast('Failed to fill profile', 'error');
    } finally {
      isFilling = false;
    }
  }

  function getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  function getFieldLabel(key: string): string {
    const labels: Record<string, string> = {
      fullName: 'Name',
      email: 'Email',
      phone: 'Phone',
      linkedin: 'LinkedIn',
    };
    return labels[key] || key;
  }

  function getProfileValue(key: keyof Profile): string | undefined {
    if (!profile) return undefined;
    const value = profile[key];
    return typeof value === 'string' ? value : undefined;
  }

  function getProfileLink(key: keyof ProfileLinks): string | undefined {
    if (!profile?.links) return undefined;
    return profile.links[key as keyof ProfileLinks];
  }

  function handleOutsideClick(event: MouseEvent) {
    const target = event.target as Node;
    const bar = document.querySelector('.quickfill-bar');
    if (bar && !bar.contains(target)) {
      showPreview = false;
    }
  }

  onMount(() => {
    document.addEventListener('click', handleOutsideClick);
  });

  onDestroy(() => {
    document.removeEventListener('click', handleOutsideClick);
  });
</script>

<div class="quickfill-bar" role="region" aria-label="Quick fill profile">
  {#if isLoading}
    <div class="quickfill-loading" aria-busy="true">
      <span class="spinner"></span>
    </div>
  {:else if profile && totalDetected > 0}
    <div class="quickfill-content">
      <div class="quickfill-avatar" aria-hidden="true">
        {getInitials(profile.name)}
      </div>
      <div class="quickfill-info">
        <span class="quickfill-name">{profile.name}</span>
        {#if profile.email}
          <span class="quickfill-email">{profile.email}</span>
        {/if}
        <span class="quickfill-field-count">
          {totalDetected} field{totalDetected === 1 ? '' : 's'} detected
        </span>
      </div>
      <div class="quickfill-actions">
        <button
          type="button"
          class="btn-secondary btn-sm"
          onclick={() => (showPreview = !showPreview)}
          aria-expanded={showPreview}
          aria-controls="profile-preview"
          title="Preview profile data"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </button>
        <button
          type="button"
          class="btn-primary btn-sm"
          onclick={handleFill}
          disabled={isFilling}
          aria-busy={isFilling}
        >
          {isFilling ? 'Filling...' : 'Fill Form'}
        </button>
      </div>
    </div>

    {#if showPreview}
      <div id="profile-preview" class="quickfill-preview" role="menu" aria-label="Profile preview">
        <div class="preview-section">
          <span class="preview-label">Identity</span>
          {#if getProfileValue('firstName') || getProfileValue('lastName')}
            <div class="preview-row">
              <span class="preview-key">First Name</span>
              <span class="preview-value">{getProfileValue('firstName') ?? '—'}</span>
            </div>
            <div class="preview-row">
              <span class="preview-key">Last Name</span>
              <span class="preview-value">{getProfileValue('lastName') ?? '—'}</span>
            </div>
          {:else}
            <div class="preview-row">
              <span class="preview-key">Full Name</span>
              <span class="preview-value">{profile.name}</span>
            </div>
          {/if}
          {#if getProfileValue('email')}
            <div class="preview-row">
              <span class="preview-key">Email</span>
              <span class="preview-value">{getProfileValue('email')}</span>
            </div>
          {/if}
          {#if getProfileValue('phone')}
            <div class="preview-row">
              <span class="preview-key">Phone</span>
              <span class="preview-value">{getProfileValue('phone')}</span>
            </div>
          {/if}
        </div>

        {#if getProfileLink('linkedin') || getProfileLink('github') || getProfileLink('portfolio') || getProfileLink('website')}
          <div class="preview-divider"></div>
          <div class="preview-section">
            <span class="preview-label">Links</span>
            {#if getProfileLink('linkedin')}
              <div class="preview-row">
                <span class="preview-key">LinkedIn</span>
                <span class="preview-value">{getProfileLink('linkedin')}</span>
              </div>
            {/if}
            {#if getProfileLink('github')}
              <div class="preview-row">
                <span class="preview-key">GitHub</span>
                <span class="preview-value">{getProfileLink('github')}</span>
              </div>
            {/if}
            {#if getProfileLink('portfolio')}
              <div class="preview-row">
                <span class="preview-key">Portfolio</span>
                <span class="preview-value">{getProfileLink('portfolio')}</span>
              </div>
            {/if}
            {#if getProfileLink('website')}
              <div class="preview-row">
                <span class="preview-key">Website</span>
                <span class="preview-value">{getProfileLink('website')}</span>
              </div>
            {/if}
          </div>
        {/if}

        {#if profile.location?.city || profile.location?.state || profile.location?.country}
          <div class="preview-divider"></div>
          <div class="preview-section">
            <span class="preview-label">Location</span>
            <div class="preview-row">
              <span class="preview-key">City</span>
              <span class="preview-value">{profile.location?.city ?? '—'}</span>
            </div>
            {#if profile.location?.state}
              <div class="preview-row">
                <span class="preview-key">State</span>
                <span class="preview-value">{profile.location.state}</span>
              </div>
            {/if}
            {#if profile.location?.country}
              <div class="preview-row">
                <span class="preview-key">Country</span>
                <span class="preview-value">{profile.location.country}</span>
              </div>
            {/if}
          </div>
        {/if}

        {#if profile.experience?.currentCompany || profile.experience?.currentTitle}
          <div class="preview-divider"></div>
          <div class="preview-section">
            <span class="preview-label">Experience</span>
            {#if profile.experience?.currentCompany}
              <div class="preview-row">
                <span class="preview-key">Company</span>
                <span class="preview-value">{profile.experience.currentCompany}</span>
              </div>
            {/if}
            {#if profile.experience?.currentTitle}
              <div class="preview-row">
                <span class="preview-key">Title</span>
                <span class="preview-value">{profile.experience.currentTitle}</span>
              </div>
            {/if}
            {#if profile.experience?.yearsOfExperience}
              <div class="preview-row">
                <span class="preview-key">Years</span>
                <span class="preview-value">{profile.experience.yearsOfExperience}</span>
              </div>
            {/if}
          </div>
        {/if}
      </div>
    {/if}
  {:else if profile}
    <div class="quickfill-empty">
      <span class="quickfill-no-fields">No form fields detected</span>
    </div>
  {:else}
    <div class="quickfill-empty">
      <button
        type="button"
        class="btn-secondary btn-sm"
        onclick={() => browser.runtime.openOptionsPage()}
      >
        Setup Profile
      </button>
    </div>
  {/if}
</div>

<style>
  @import '/src/styles/tokens.css';
  @import '/src/styles/components.css';

  .quickfill-bar {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    background: var(--color-bg-surface);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-lg);
    box-shadow:
      0 10px 25px rgba(0, 0, 0, 0.25),
      0 2px 6px rgba(0, 0, 0, 0.15);
    min-width: 280px;
    max-width: 360px;
    box-sizing: border-box;
    position: relative;
  }

  .quickfill-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-2);
  }

  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid var(--color-border-default);
    border-top-color: var(--color-accent);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .quickfill-content {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    width: 100%;
  }

  .quickfill-avatar {
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    border-radius: var(--radius-md);
    background: var(--color-bg-elevated);
    border: 1px solid var(--color-border-default);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--font-xs);
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .quickfill-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .quickfill-name {
    font-size: var(--font-sm);
    font-weight: 500;
    color: var(--color-text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .quickfill-email {
    font-size: var(--font-xs);
    color: var(--color-text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .quickfill-field-count {
    font-size: var(--font-xs);
    color: var(--color-text-muted);
  }

  .quickfill-actions {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    flex-shrink: 0;
  }

  .quickfill-actions .btn-secondary {
    padding: var(--space-1) var(--space-2);
  }

  .quickfill-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: var(--space-1) 0;
  }

  .quickfill-empty .btn-secondary {
    padding: var(--space-1) var(--space-3);
  }

  .quickfill-no-fields {
    font-size: var(--font-xs);
    color: var(--color-text-muted);
    padding: var(--space-1) 0;
  }

  .quickfill-preview {
    position: absolute;
    bottom: calc(100% + var(--space-2));
    left: 0;
    right: 0;
    background: var(--color-bg-surface);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-md);
    padding: var(--space-3);
    box-shadow:
      0 10px 25px rgba(0, 0, 0, 0.25),
      0 2px 6px rgba(0, 0, 0, 0.15);
    max-height: 300px;
    overflow-y: auto;
    z-index: 10;
    animation: slideUp 0.15s ease;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .preview-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .preview-label {
    font-size: var(--font-xs);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-text-secondary);
    padding-bottom: var(--space-1);
    border-bottom: 1px solid var(--color-border-subtle);
  }

  .preview-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-1) 0;
  }

  .preview-key {
    font-size: var(--font-xs);
    color: var(--color-text-muted);
    flex-shrink: 0;
  }

  .preview-value {
    font-size: var(--font-xs);
    color: var(--color-text-primary);
    text-align: right;
    max-width: 60%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-all;
  }

  .preview-divider {
    height: 1px;
    background: var(--color-border-subtle);
    margin: var(--space-1) 0;
  }
</style>