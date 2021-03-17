<script>
  import {formatNumber} from '../../../../utils/format'
  import Value from '../../Common/Value.svelte'

  const MAX_BLOCK_VALUE = 115;

  export let data = null;
</script>

{#if data && data.gridAcc && Array.isArray(data.gridAcc) && data.gridAcc.length === 12}
  <div class="grid">
    {#each data.gridAcc as gridVal}
      <span><Value value={gridVal} digits={2} title={Number.isFinite(gridVal) ? formatNumber(gridVal/MAX_BLOCK_VALUE*100)+'%' : ''}/></span>
    {/each}
  </div>
{/if}

<style>
    .grid {
        display: inline-grid;
        grid-template-columns: 1fr 1fr 1fr 1fr;
        grid-column-gap: .5em;
        grid-row-gap: .5em;
        font-size: .75em;
    }

    .grid > span {
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--dimmed);
        width: 3.5em;
        height: 3.5em;
    }
</style>