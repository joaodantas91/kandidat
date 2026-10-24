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

    if (name) setProfile({ name });
  }
</script>

<form on:submit={handleSubmit}>
  <label>
    Name
    <input name="name" type="text" />
  </label>
  <button type="submit">Submit</button>
</form>
