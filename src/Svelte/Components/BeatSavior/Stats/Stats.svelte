<script>
  import {fly} from 'svelte/transition'

  import Hands from './Hands.svelte'
  import Grid from './Grid.svelte'
  import OtherStats from './OtherStats.svelte'

  export let data = null;
  export let showAcc = true;
  export let showStats = true;
  export let showGrid = false;

  export let dataIsAvg = false;
</script>

{#if data}
  <div class="beat-savior">
    {#if showAcc}<Hands {data} />{/if}

    {#if showGrid}<Grid {data} />{/if}

    {#if showStats}<OtherStats {data} {dataIsAvg} />{/if}
  </div>
{/if}

<style>
    .beat-savior {
        text-align: center;
    }

    .beat-savior > :global(*) {
        margin: .5em 0;
    }

    .beat-savior > :global(*:last-child) {
        margin-bottom: 0;
    }
</style>