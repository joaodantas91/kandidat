<script lang="ts">
  import type { WorkAuthorization } from '@/core/storage/storage';

  interface Props {
    workAuth?: WorkAuthorization | null;
    authorizedToWork?: boolean;
    sponsorshipRequired?: WorkAuthorization['sponsorshipRequired'];
    workPermitType?: string;
    citizenship?: string;
    willingToRelocate?: boolean;
    willingToTravel?: boolean;
    onDirty?: () => void;
  }

  let {
    workAuth,
    authorizedToWork = $bindable(false),
    sponsorshipRequired = $bindable(undefined),
    workPermitType = $bindable(''),
    citizenship = $bindable(''),
    willingToRelocate = $bindable(false),
    willingToTravel = $bindable(false),
    onDirty,
  }: Props = $props();
</script>

<fieldset class="profile-fieldset" aria-labelledby="workAuth-legend">
  <legend id="workAuth-legend" class="legend">Work Authorization</legend>
  <div class="form-grid">
    <div class="form-group checkbox-row grid-full">
      <input
        id="authorizedToWork"
        type="checkbox"
        name="authorizedToWork"
        checked={workAuth?.authorizedToWork ?? authorizedToWork}
        onchange={(e) => {
          const val = (e.currentTarget as HTMLInputElement).checked;
          if (workAuth) workAuth.authorizedToWork = val;
          authorizedToWork = val;
          onDirty?.();
        }}
        class="input-field"
      />
      <label for="authorizedToWork">Authorized to Work</label>
    </div>

    <div class="form-group">
      <label for="sponsorshipRequired">Sponsorship Required</label>
      <select
        id="sponsorshipRequired"
        name="sponsorshipRequired"
        value={workAuth?.sponsorshipRequired ?? sponsorshipRequired ?? ''}
        onchange={(e) => {
          const raw = (e.currentTarget as HTMLSelectElement).value;
          const val =
            raw === 'none' || raw === 'now' || raw === 'future' || raw === 'now_or_future'
              ? raw
              : undefined;
          if (workAuth) workAuth.sponsorshipRequired = val;
          sponsorshipRequired = val;
          onDirty?.();
        }}
        class="input-field"
      >
        <option value="">None / Unspecified</option>
        <option value="none">None</option>
        <option value="now">Now</option>
        <option value="future">Future</option>
        <option value="now_or_future">Now or Future</option>
      </select>
    </div>

    <div class="form-group">
      <label for="workPermitType">Work Permit Type</label>
      <input
        id="workPermitType"
        name="workPermitType"
        type="text"
        value={workAuth?.workPermitType ?? workPermitType}
        oninput={(e) => {
          const val = (e.currentTarget as HTMLInputElement).value;
          if (workAuth) workAuth.workPermitType = val;
          workPermitType = val;
          onDirty?.();
        }}
        class="input-field"
      />
    </div>

    <div class="form-group">
      <label for="citizenship">Citizenship</label>
      <input
        id="citizenship"
        name="citizenship"
        type="text"
        value={workAuth?.citizenship ?? citizenship}
        oninput={(e) => {
          const val = (e.currentTarget as HTMLInputElement).value;
          if (workAuth) workAuth.citizenship = val;
          citizenship = val;
          onDirty?.();
        }}
        class="input-field"
      />
    </div>

    <div class="form-group checkbox-row grid-full">
      <input
        id="willingToRelocate"
        type="checkbox"
        name="willingToRelocate"
        checked={workAuth?.willingToRelocate ?? willingToRelocate}
        onchange={(e) => {
          const val = (e.currentTarget as HTMLInputElement).checked;
          if (workAuth) workAuth.willingToRelocate = val;
          willingToRelocate = val;
          onDirty?.();
        }}
        class="input-field"
      />
      <label for="willingToRelocate">Willing to Relocate</label>
    </div>

    <div class="form-group checkbox-row grid-full">
      <input
        id="willingToTravel"
        type="checkbox"
        name="willingToTravel"
        checked={workAuth?.willingToTravel ?? willingToTravel}
        onchange={(e) => {
          const val = (e.currentTarget as HTMLInputElement).checked;
          if (workAuth) workAuth.willingToTravel = val;
          willingToTravel = val;
          onDirty?.();
        }}
        class="input-field"
      />
      <label for="willingToTravel">Willing to Travel</label>
    </div>
  </div>
</fieldset>

<style>
  @import '/src/styles/tokens.css';
</style>
