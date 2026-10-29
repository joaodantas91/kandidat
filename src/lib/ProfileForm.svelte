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
  <div>
    <label for="name"> Name </label>
    <input name="name" type="text" required />
  </div>
  <div>
    <label for="email"> Email </label>
    <input name="email" type="email" />
  </div>
  <div>
    <label for="phone"> Phone </label>
    <input name="phone" type="tel" />
  </div>
  <div>
    <label for="linkedin"> Linkedin </label>
    <input name="linkedin" type="url" />
  </div>
  <button type="submit">Submit</button>
</form>

<style>
</style>
