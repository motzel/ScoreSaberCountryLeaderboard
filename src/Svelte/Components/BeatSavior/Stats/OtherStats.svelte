<script>
  import {_} from "../../../stores/i18n";

  import Value from '../../Common/Value.svelte'

  export let data = null;

  export let dataIsAvg = false;
</script>

{#if data}
  <div class="stats" class:avg={dataIsAvg}>
    {#if !dataIsAvg}
          <span title={$_.beatSavior.maxCombo} class="block">{#if !data.fc}<i class="fas fa-cube"></i> {/if}<strong class:full-combo={data.fc}>{#if data.fc}FC{:else}<Value value={data.maxCombo} digits={0} title={$_.beatSavior.maxCombo}/>{/if}</strong></span>
    {:else if Number.isFinite(data.fc)}
      <span class="block"><strong class="full-combo">FC</strong> <Value value={data.fc*100} digits={2} suffix="%"/></span>
    {/if}

    {#if !data.fc || dataIsAvg}
          <span title={$_.beatSavior.misses} class="block"><i class="fas fa-times"></i> <strong><Value value={data.miss} digits={dataIsAvg ? 2 : 0} title={$_.beatSavior.misses}/></strong></span>
    {/if}

    <span title={$_.beatSavior.pauses} class="block"><i class="fas fa-pause-circle"></i> <strong><Value value={data.nbOfPause} digits={dataIsAvg ? 2 : 0} title={$_.beatSavior.pauses}/></strong></span>

    <span title={$_.beatSavior.bombHit} class="block"><i class="fas fa-bomb"></i> <strong><Value value={data.bombHit} digits={dataIsAvg ? 2 : 0} title={$_.beatSavior.bombHit}/></strong></span>

    <span title={$_.beatSavior.wallHit} class="block"><i class="fas fa-gopuram"></i> <strong><Value value={data.nbOfWallHit} digits={dataIsAvg ? 2 : 0} title={$_.beatSavior.wallHit}/></strong></span>
  </div>
{/if}

<style>
    .stats {
        display: flex;
        justify-content: space-around;
    }

    .stats.avg {
        font-size: 0.75em;
    }

    .stats .block {
        margin-bottom: 0;
    }

    .full-combo {
        color: darkorange !important;
    }
</style>