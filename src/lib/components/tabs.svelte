<script lang="ts">
  import Home from '../home.svelte';
  import ProfileForm from '../ProfileForm.svelte';

  let tabs = [
    { label: 'Home', value: 1, component: Home },
    { label: 'Info', value: 2, component: ProfileForm },
  ];

  let activeTabValue = tabs[0]?.value;
  const handleClick = (tabValue: (typeof tabs)[number]['value']) => () =>
    (activeTabValue = tabValue);
</script>

<ul>
  {#each tabs as tab}
    <li>
      <a role="tab" href="#tab" on:click={handleClick(tab.value)}>
        {tab.label}
      </a>
    </li>
  {/each}
</ul>

{#each tabs as tab}
  {#if activeTabValue == tab.value}
    <div class="box">
      <svelte:component this={tab.component} />
    </div>
  {/if}
{/each}

<style>
</style>
