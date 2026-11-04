<script lang="ts">
  import Home from '../home.svelte';
  import ProfileForm from '../ProfileForm.svelte';
  import Applications from '../applications.svelte';
  import { onMount } from 'svelte';

  let tabs = $state([
    { label: 'Home', value: 1, component: Home },
    { label: 'Info', value: 2, component: ProfileForm },
    { label: 'Applications', value: 3, component: Applications },
  ]);

  let activeTabValue = $derived(tabs[0]?.value);
  const handleClick = (tabValue: (typeof tabs)[number]['value']) => () => {
    activeTabValue = tabValue;
  };
</script>

<nav>
  <ul>
    {#each tabs as tab}
      <li>
        <a role="tab" href="#tab" on:click={handleClick(tab.value)}>
          {tab.label}
        </a>
      </li>
    {/each}
  </ul>
</nav>

{#each tabs as tab}
  {#if activeTabValue == tab.value}
    <div class="box">
      <svelte:component this={tab.component} />
    </div>
  {/if}
{/each}

<style>
  .box {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    gap: 8px;
  }
</style>
