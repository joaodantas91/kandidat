<script lang="ts">
  import Home from '../home.svelte';
  import ProfileForm from '../ProfileForm.svelte';

  let tabs = $state([
    { label: 'Home', value: 1, component: Home },
    { label: 'Info', value: 2, component: ProfileForm },
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
        <a role="tab" href="#tab" onclick="{handleClick(tab.value)}">
          {tab.label}
        </a>
      </li>
    {/each}
  </ul>
</nav>

{#each tabs as tab}
  {#if activeTabValue == tab.value}
    <div class="box">
      {#if tab.label === 'Home'}
        <Home />
      {:else if tab.label === 'Info'}
        <ProfileForm />
      {/if}
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