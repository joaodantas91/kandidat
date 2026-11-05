<script lang="ts">
  import type { ProfileLocation } from '@/core/storage/storage';

  interface Props {
    location?: ProfileLocation | null;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    countryCode?: string;
    onDirty?: () => void;
  }

  let {
    location,
    addressLine1 = $bindable(''),
    addressLine2 = $bindable(''),
    city = $bindable(''),
    state = $bindable(''),
    postalCode = $bindable(''),
    country = $bindable(''),
    countryCode = $bindable(''),
    onDirty,
  }: Props = $props();
</script>

<fieldset class="profile-fieldset" aria-labelledby="location-legend">
  <legend id="location-legend" class="legend">Location</legend>
  <div class="form-grid">
    <div class="form-group grid-full">
      <label for="addressLine1">Address Line 1</label>
      <input
        id="addressLine1"
        name="addressLine1"
        type="text"
        value={location?.addressLine1 ?? addressLine1}
        oninput={(e) => {
          const val = (e.currentTarget as HTMLInputElement).value;
          if (location) location.addressLine1 = val;
          addressLine1 = val;
          onDirty?.();
        }}
        class="input-field"
      />
    </div>

    <div class="form-group grid-full">
      <label for="addressLine2">Address Line 2</label>
      <input
        id="addressLine2"
        name="addressLine2"
        type="text"
        value={location?.addressLine2 ?? addressLine2}
        oninput={(e) => {
          const val = (e.currentTarget as HTMLInputElement).value;
          if (location) location.addressLine2 = val;
          addressLine2 = val;
          onDirty?.();
        }}
        class="input-field"
      />
    </div>

    <div class="form-group">
      <label for="city">City</label>
      <input
        id="city"
        name="city"
        type="text"
        value={location?.city ?? city}
        oninput={(e) => {
          const val = (e.currentTarget as HTMLInputElement).value;
          if (location) location.city = val;
          city = val;
          onDirty?.();
        }}
        class="input-field"
      />
    </div>

    <div class="form-group">
      <label for="state">State / Province</label>
      <input
        id="state"
        name="state"
        type="text"
        value={location?.state ?? state}
        oninput={(e) => {
          const val = (e.currentTarget as HTMLInputElement).value;
          if (location) location.state = val;
          state = val;
          onDirty?.();
        }}
        class="input-field"
      />
    </div>

    <div class="form-group">
      <label for="postalCode">Postal Code</label>
      <input
        id="postalCode"
        name="postalCode"
        type="text"
        value={location?.postalCode ?? postalCode}
        oninput={(e) => {
          const val = (e.currentTarget as HTMLInputElement).value;
          if (location) location.postalCode = val;
          postalCode = val;
          onDirty?.();
        }}
        class="input-field"
      />
    </div>

    <div class="form-group">
      <label for="country">Country</label>
      <input
        id="country"
        name="country"
        type="text"
        value={location?.country ?? country}
        oninput={(e) => {
          const val = (e.currentTarget as HTMLInputElement).value;
          if (location) location.country = val;
          country = val;
          onDirty?.();
        }}
        class="input-field"
      />
    </div>

    <div class="form-group">
      <label for="countryCode">Country Code (ISO)</label>
      <input
        id="countryCode"
        name="countryCode"
        type="text"
        value={location?.countryCode ?? countryCode}
        oninput={(e) => {
          const val = (e.currentTarget as HTMLInputElement).value;
          if (location) location.countryCode = val;
          countryCode = val;
          onDirty?.();
        }}
        class="input-field"
      />
    </div>
  </div>
</fieldset>

<style>
  @import '/src/styles/tokens.css';
</style>
