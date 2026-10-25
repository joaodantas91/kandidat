<script lang="ts">
  import { setProfile, type Profile } from '@/core/storage/storage';

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

    const profile: Profile = {
      name,
      ...(email && { email }),
      ...(phone && { phone }),
      ...(linkedin && { linkedin }),
    };

    setProfile(profile);
  }
</script>

<form on:submit={handleSubmit}>
  <label>
    Name
    <input name="name" type="text" required />
  </label>

  <label>
    Email
    <input name="email" type="email" />
  </label>

  <label>
    Phone
    <input name="phone" type="tel" />
  </label>

  <label>
    Linkedin
    <input name="linkedin" type="url" />
  </label>
  <button type="submit">Submit</button>
</form>

<style>
  form {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  label {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
</style>
