<script>
  import {createEventDispatcher, onMount} from 'svelte';
  import {_} from '../../stores/i18n'
  import {getMainPlayerId} from '../../../plugin-config'

  import Button from '../Common/Button.svelte'

  const dispatch = createEventDispatcher();

  export let diffs;
  export let leaderboardId;
  export let type = 'live';
  export let beforeDiffChanged;

  let mainPlayerId = null;

  let currentlyLoadedDiff = null;

  let initialized = false;

  async function onDiffChange(diffId, newType) {
    const newDiff = {leaderboardId: diffId, page: 0, type: newType};

    if (beforeDiffChanged) {
      currentlyLoadedDiff = diffId;

      const shouldContinue = await beforeDiffChanged(newDiff);

      currentlyLoadedDiff = null;

      if (!shouldContinue) return;
    }

    type = newType;

    dispatch('diff-change', newDiff)
  }

  onMount(async () => {
    mainPlayerId = await getMainPlayerId();

    initialized = true;
  })
</script>

{#if initialized && ((diffs && (diffs.length > 1 || (diffs.length === 1 && diffs[0].id !== leaderboardId))) || mainPlayerId) }
  <header>
    <div class="left"></div>

    <div class="switch-types">
     {#if diffs && diffs.length}
      {#each diffs as diff (diff.id)}
        <Button iconFa={currentlyLoadedDiff === diff.id ? "fas fa-spinner fa-spin" : null}
         label={diff.name} color="#dbdbdb" bgColor={diff.color} on:click={() => onDiffChange(diff.id, 'live')}
                 notSelected={diff.id !== leaderboardId || type !== 'live'}/>
      {/each}
     {/if}
     {#if mainPlayerId}<Button iconFa="fas fa-database" type="danger" label={$_.plugin.cachedButton} on:click={() => onDiffChange(leaderboardId, 'cached')} notSelected={type !== 'cached'}/>{/if}
    </div>

    <div class="right"></div>
  </header>
{/if}

<style>
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .switch-types {
    display: flex;
    font-size: .75rem;
    text-align: center;
  }

  :global(.switch-types button) {
    font-weight: 500;
    margin-right: .125rem!important;
  }
</style>