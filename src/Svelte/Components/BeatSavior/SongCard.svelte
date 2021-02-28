<script>
  import {_, trans} from "../../stores/i18n";
  import {extractBeatSaviorTrackersData} from '../../../scoresaber/beatsavior'
  import HandAcc from './HandAcc.svelte'
  import Value from '../Common/Value.svelte'

  export let data;

  let bsData = null;

  function getBeatSaviorData(data) {
    if (!data || !data.trackers) return null;

    const bsData = extractBeatSaviorTrackersData(data.trackers);
    if (!bsData) return null;

    const finalData = {
      ...bsData,
      saberAColor: data.saberAColor,
      saberBColor: data.saberBColor,
    }

    return finalData;
  }

  $: bsData = getBeatSaviorData(data);
</script>

<div class="beat-savior">
  {#if bsData}
    <div class="acc">
      <HandAcc value={bsData.accLeft} cut={bsData.leftAverageCut} color={bsData.saberAColor} hand="left"/>
      <HandAcc value={bsData.accRight} cut={bsData.rightAverageCut} color={bsData.saberBColor} hand="right"/>
    </div>

    <div class="stats">
      <span title={$_.beatSavior.maxCombo} class="block">{#if !bsData.fc}<i class="fas fa-cube"></i> {/if}<strong class:full-combo={bsData.fc}>{#if bsData.fc}FC{:else}<Value value={bsData.maxCombo} digits={0} title={$_.beatSavior.maxCombo}/>{/if}</strong></span>

      {#if !bsData.fc}
        <span title={$_.beatSavior.misses} class="block"><i class="fas fa-times"></i> <strong><Value value={bsData.miss} digits={0} title={$_.beatSavior.misses}/></strong></span>
      {/if}

      <span title={$_.beatSavior.pauses} class="block"><i class="fas fa-pause-circle"></i> <strong><Value value={bsData.nbOfPause} digits={0} title={$_.beatSavior.pauses}/></strong></span>

      <span title={$_.beatSavior.bombHit} class="block"><i class="fas fa-bomb"></i> <strong><Value value={bsData.bombHit} digits={0} title={$_.beatSavior.bombHit}/></strong></span>

      <span title={$_.beatSavior.wallHit} class="block"><i class="fas fa-gopuram"></i> <strong><Value value={bsData.nbOfWallHit} digits={0} title={$_.beatSavior.wallHit}/></strong></span>
    </div>
  {/if}
</div>

<style>
    .beat-savior {
        text-align: center;
    }

    .acc {
        display: inline-flex;
        justify-content: space-between;
        align-items: center;
        margin: 1em 0;
    }

    .stats {
        display: flex;
        justify-content: space-around;
    }

    .stats .block {
        margin-bottom: 0;
    }

    .full-combo {
        color: darkorange!important;
    }
</style>