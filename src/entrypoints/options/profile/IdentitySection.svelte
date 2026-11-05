<script lang="ts">
  import type { Profile } from '@/core/storage/storage';

  interface Props {
    profile?: Partial<Profile> | null;
    name?: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    preferredName?: string;
    pronouns?: string;
    email?: string;
    alternateEmail?: string;
    phone?: string;
    alternatePhone?: string;
    onDirty?: () => void;
  }

  let {
    profile,
    name = $bindable(''),
    firstName = $bindable(''),
    middleName = $bindable(''),
    lastName = $bindable(''),
    preferredName = $bindable(''),
    pronouns = $bindable(''),
    email = $bindable(''),
    alternateEmail = $bindable(''),
    phone = $bindable(''),
    alternatePhone = $bindable(''),
    onDirty,
  }: Props = $props();
</script>

<fieldset class="profile-fieldset" aria-labelledby="identity-legend">
  <legend id="identity-legend" class="legend">Identity</legend>
  <div class="form-grid">
    <div class="form-group grid-full">
      <label for="name">Name *</label>
      <input
        id="name"
        name="name"
        type="text"
        value={profile?.name ?? name}
        oninput={(e) => {
          const val = (e.currentTarget as HTMLInputElement).value;
          if (profile) profile.name = val;
          name = val;
          onDirty?.();
        }}
        required
        class="input-field"
      />
    </div>

    <div class="form-group">
      <label for="firstName">First Name</label>
      <input
        id="firstName"
        name="firstName"
        type="text"
        value={profile?.firstName ?? firstName}
        oninput={(e) => {
          const val = (e.currentTarget as HTMLInputElement).value;
          if (profile) profile.firstName = val;
          firstName = val;
          onDirty?.();
        }}
        class="input-field"
      />
    </div>

    <div class="form-group">
      <label for="middleName">Middle Name</label>
      <input
        id="middleName"
        name="middleName"
        type="text"
        value={profile?.middleName ?? middleName}
        oninput={(e) => {
          const val = (e.currentTarget as HTMLInputElement).value;
          if (profile) profile.middleName = val;
          middleName = val;
          onDirty?.();
        }}
        class="input-field"
      />
    </div>

    <div class="form-group">
      <label for="lastName">Last Name</label>
      <input
        id="lastName"
        name="lastName"
        type="text"
        value={profile?.lastName ?? lastName}
        oninput={(e) => {
          const val = (e.currentTarget as HTMLInputElement).value;
          if (profile) profile.lastName = val;
          lastName = val;
          onDirty?.();
        }}
        class="input-field"
      />
    </div>

    <div class="form-group">
      <label for="preferredName">Preferred Name</label>
      <input
        id="preferredName"
        name="preferredName"
        type="text"
        value={profile?.preferredName ?? preferredName}
        oninput={(e) => {
          const val = (e.currentTarget as HTMLInputElement).value;
          if (profile) profile.preferredName = val;
          preferredName = val;
          onDirty?.();
        }}
        class="input-field"
      />
    </div>

    <div class="form-group">
      <label for="pronouns">Pronouns</label>
      <input
        id="pronouns"
        name="pronouns"
        type="text"
        value={profile?.pronouns ?? pronouns}
        oninput={(e) => {
          const val = (e.currentTarget as HTMLInputElement).value;
          if (profile) profile.pronouns = val;
          pronouns = val;
          onDirty?.();
        }}
        class="input-field"
      />
    </div>
  </div>
</fieldset>

<fieldset class="profile-fieldset" aria-labelledby="contact-legend">
  <legend id="contact-legend" class="legend">Contact</legend>
  <div class="form-grid">
    <div class="form-group">
      <label for="email">Email</label>
      <input
        id="email"
        name="email"
        type="email"
        value={profile?.email ?? email}
        oninput={(e) => {
          const val = (e.currentTarget as HTMLInputElement).value;
          if (profile) profile.email = val;
          email = val;
          onDirty?.();
        }}
        class="input-field"
      />
    </div>

    <div class="form-group">
      <label for="alternateEmail">Alternate Email</label>
      <input
        id="alternateEmail"
        name="alternateEmail"
        type="email"
        value={profile?.alternateEmail ?? alternateEmail}
        oninput={(e) => {
          const val = (e.currentTarget as HTMLInputElement).value;
          if (profile) profile.alternateEmail = val;
          alternateEmail = val;
          onDirty?.();
        }}
        class="input-field"
      />
    </div>

    <div class="form-group">
      <label for="phone">Phone</label>
      <input
        id="phone"
        name="phone"
        type="tel"
        value={profile?.phone ?? phone}
        oninput={(e) => {
          const val = (e.currentTarget as HTMLInputElement).value;
          if (profile) profile.phone = val;
          phone = val;
          onDirty?.();
        }}
        class="input-field"
      />
    </div>

    <div class="form-group">
      <label for="alternatePhone">Alternate Phone</label>
      <input
        id="alternatePhone"
        name="alternatePhone"
        type="tel"
        value={profile?.alternatePhone ?? alternatePhone}
        oninput={(e) => {
          const val = (e.currentTarget as HTMLInputElement).value;
          if (profile) profile.alternatePhone = val;
          alternatePhone = val;
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
