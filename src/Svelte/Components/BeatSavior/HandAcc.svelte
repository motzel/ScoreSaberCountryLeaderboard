<script>
  import Donut from './Donut.svelte'
  import {_} from "../../stores/i18n";
  import {formatNumber} from '../../../utils/format'

  const MAX_BLOCK_VALUE = 115;
  const DEFAULT_LEFT_COLOR = 'rgba(255,0,0,1)';
  const DEFAULT_RIGHT_COLOR = 'rgba(0,0,255,1)';

  export let value;
  export let cut;
  export let color;
  export let hand = "left";

  function getRgba(color) {
    const keys = ['r', 'g', 'b', 'a']

    const isOk = color && keys.reduce((ok, key) => ok && Number.isFinite(color[key]) && color[key] >= 0 && color[key] <= 1, true);
    if (!isOk) return hand === 'left' ? DEFAULT_LEFT_COLOR : DEFAULT_RIGHT_COLOR;

    return 'rgba(' + keys.reduce((prev, key) => prev.concat(key !== 'a' ? Math.round(color[key] * 255) : color[key]), []) + ')';
  }

  $: accValue = Number.isFinite(value) && value >= 0 && value <= 115 ? value : 0;
  $: percentage = accValue / MAX_BLOCK_VALUE;
  $: rgba = getRgba(color);
  $: cutsRounded = cut && Array.isArray(cut) ? cut.map(c => Number.isFinite(c) ? formatNumber(c) : 0) : null;
</script>

<section class={hand}>
  {#if cutsRounded && hand === 'left'}
    <div class="cuts">
      {#each cutsRounded as c, idx}
        <span title={idx === 0 ? $_.beatSavior.beforeCut : (idx === 1 ? $_.beatSavior.accuracy : $_.beatSavior.afterCut)}>{c}</span>
      {/each}
    </div>
  {/if}

  <div class="donut">
    <Donut value={value} {percentage} color={rgba}/>
  </div>

  {#if cutsRounded && hand === 'right'}
    <div class="cuts">
      {#each cutsRounded as c, idx}
        <span title={idx === 0 ? $_.beatSavior.beforeCut : (idx === 1 ? $_.beatSavior.accuracy : $_.beatSavior.afterCut)}>{c}</span>
      {/each}
    </div>
  {/if}
</section>


<style>
    section {
        display: inline-flex;
    }

    .cuts {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        font-size: .875em;
        text-align: center;
    }

    .donut {
        width: 4.5em;
        margin: 0 .5em;
    }
</style>