<script lang="ts">
  import { onMount } from 'svelte';
  import { getProfile, setProfile, exportProfileJson, importProfileJson } from '@/core/storage/storage';
  import type { Profile } from '@/core/storage/storage';
  import { showToast } from '@/lib/toastStore';
  import IdentitySection from './profile/IdentitySection.svelte';
  import LocationSection from './profile/LocationSection.svelte';
  import LinksSection from './profile/LinksSection.svelte';
  import WorkAuthSection from './profile/WorkAuthSection.svelte';
  import CompensationSection from './profile/CompensationSection.svelte';
  import ExperienceSection from './profile/ExperienceSection.svelte';
  import { parseProfileFormData } from './profile/formUtils';

  let profile: Profile | null = $state(null);
  let isDirty: boolean = $state(true);
  let isSaving: boolean = $state(false);
  let importInput: HTMLInputElement | undefined;

  function markDirty() {
    isDirty = true;
  }

  async function loadProfileData() {
    profile = await getProfile();
    isDirty = false;
  }

  onMount(async () => {
    await loadProfileData();
  });

  async function handleReset() {
    await loadProfileData();
    showToast('Profile reloaded', 'info');
  }

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!(form instanceof HTMLFormElement)) {
      return;
    }

    isSaving = true;
    try {
      profile = parseProfileFormData(new FormData(form));
      await setProfile(profile);
      isDirty = false;
      showToast('Profile saved successfully', 'success');
    } finally {
      isSaving = false;
    }
  }

  async function handleExport() {
    try {
      const json = await exportProfileJson();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'kandidat-profile.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Profile exported', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Export failed', 'error');
    }
  }

  async function handleImportFiles(files: FileList | null) {
    const file = files?.item(0);
    if (!file) return;
    const text = await file.text();
    const result = await importProfileJson(text);
    if (result.success) {
      await loadProfileData();
      showToast('Profile imported successfully', 'success');
    } else {
      showToast(result.error ?? 'Import failed', 'error');
    }
  }
</script>

<form onsubmit={handleSubmit} class="profile-form">
  <IdentitySection {profile} onDirty={markDirty} />
  <LocationSection location={profile?.location} onDirty={markDirty} />
  <LinksSection links={profile?.links} onDirty={markDirty} />
  <WorkAuthSection workAuth={profile?.workAuthorization} onDirty={markDirty} />
  <CompensationSection compensation={profile?.compensation} onDirty={markDirty} />
  <ExperienceSection experience={profile?.experience} onDirty={markDirty} />

  <div class="form-actions">
    <button
      type="submit"
      class="btn btn-primary"
      disabled={!isDirty || isSaving}
    >
      {isSaving ? 'Saving...' : 'Save Profile'}
    </button>
    <button
      type="button"
      class="btn btn-secondary"
      onclick={handleExport}
    >
      Export Profile
    </button>
    <button
      type="button"
      class="btn btn-secondary"
      onclick={() => importInput?.click()}
    >
      Import Profile
    </button>
    <input
      type="file"
      accept=".json"
      bind:this={importInput}
      style="display: none"
      onchange={(event) => handleImportFiles((event.target as HTMLInputElement).files)}
    />
    <button
      type="button"
      class="reset-btn"
      onclick={handleReset}
    >
      Reset / Reload
    </button>
  </div>
</form>

<style>
  @import '/src/styles/tokens.css';
  @import '/src/styles/components.css';
</style>
