<script lang="ts">
  async function handleClick() {
    try {
      const [tab] = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (tab?.id) {
        await browser.tabs.sendMessage(tab.id, 'AUTO_FILL');
      }
    } catch (error) {
      console.error('Failed to trigger autofill:', error);
    }
  }
</script>

<button type="button" on:click={handleClick}>Fill</button>

<style>
  button {
    width: 75px;
    height: 50px;
    font-size: 18px;
  }
</style>
