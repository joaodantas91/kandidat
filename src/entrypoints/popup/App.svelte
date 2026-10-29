<script lang="ts">
  import Tabs from '../../lib/components/tabs.svelte';
  import ProfileForm from '../../lib/ProfileForm.svelte';
</script>

<main>
  <Tabs />
</main>

<style>
  main {
    min-width: 320px;
    min-height: 320px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 16px;
  }
</style>
