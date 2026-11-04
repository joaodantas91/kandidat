<script lang="ts">
  import { onMount } from 'svelte';
  import { getProfile, setProfile, type Profile } from '@/core/storage/storage';

  let profile: Profile | null = null;

  onMount(async () => {
    profile = await getProfile();
  });

  function getTextField<T extends keyof Profile>(
    data: FormData,
    field: T,
  ): string | null {
    const value = data.get(field);
    return typeof value === 'string' && value.trim() ? value.trim() : null;
  }

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!(form instanceof HTMLFormElement)) {
      return;
    }
    const data = new FormData(form);
    const name = getTextField(data, 'name');
    if (!name) {
      return;
    }

    const email = getTextField(data, 'email');
    const phone = getTextField(data, 'phone');
    const linkedin = getTextField(data, 'linkedin');

    const updatedProfile: Profile = {
      name,
      ...(email && { email }),
      ...(phone && { phone }),
      ...(linkedin && { linkedin }),
    };

    await setProfile(updatedProfile);
    profile = updatedProfile;
  }
</script>

<form on:submit={handleSubmit}>
  <div>
    <label for="name"> Name </label>
    <input id="name" name="name" type="text" value={profile?.name ?? ''} required />
  </div>
  <div>
    <label for="email"> Email </label>
    <input id="email" name="email" type="email" value={profile?.email ?? ''} />
  </div>
  <div>
    <label for="phone"> Phone </label>
    <input id="phone" name="phone" type="tel" value={profile?.phone ?? ''} />
  </div>
  <div>
    <label for="linkedin"> Linkedin </label>
    <input id="linkedin" name="linkedin" type="url" value={profile?.linkedin ?? ''} />
  </div>
  <button type="submit">Submit</button>
</form>

<style>
  form {
    div {
      margin-bottom: 8px;
    }
    label {
      display: block;
    }
  }
</style>
