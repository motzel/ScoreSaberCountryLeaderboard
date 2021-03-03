<script>
  import {extractBeatSaviorTrackersData} from '../../../scoresaber/beatsavior'
  import Stats from './Stats.svelte'

  export let data;
  export let showAcc = true;
  export let showStats = true;

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

{#if bsData}
  <Stats data={bsData} {showAcc} {showStats} />
{/if}

<style>
</style>