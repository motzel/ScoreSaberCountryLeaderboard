<script>
  import {_} from "../../../stores/i18n";

  import Hands from './Hands.svelte'
  import Grid from './Grid.svelte'
  import OtherStats from './OtherStats.svelte'
  import Chart from './Chart.svelte'

  export let data = null;
  export let showAcc = true;
  export let showStats = true;
  export let showGrid = true;
  export let showChart = true;
  export let switchable = true;

  export let dataIsAvg = false;

  let currentlyDisplayed = 'acc';
</script>

{#if data}
  <div class="beat-savior" class:switchable={switchable}>
    {#if switchable}
      <div class="switch">
        <i class="fa fa-exchange-alt"
           title={currentlyDisplayed === 'acc' ? $_.beatSavior.switchToGridView : (currentlyDisplayed === 'grid' ? $_.beatSavior.switchToChartView : $_.beatSavior.switchToAccView)}
           on:click={() => currentlyDisplayed = currentlyDisplayed === 'acc' ? 'grid' : (currentlyDisplayed === 'grid' ? 'chart' : 'acc')}
        ></i>
      </div>

      <div class:not-visible={currentlyDisplayed !== 'acc'} class="acc">
        <Hands {data} />
        <OtherStats {data} {dataIsAvg} />
      </div>

      <div class:not-visible={currentlyDisplayed !== 'grid'}>
        <Grid {data} />
      </div>

      <div class:not-visible={currentlyDisplayed !== 'chart'} class="chart">
        <Chart {data} />
      </div>
    {:else}
    {#if showAcc}<Hands {data} />{/if}

    {#if showGrid}<Grid {data} />{/if}

    {#if showChart}<Chart {data} />{/if}

    {#if showStats}<OtherStats {data} {dataIsAvg} />{/if}
    {/if}
  </div>
{/if}

<style>
    .switch {
        position: relative;
        z-index: 1;
    }

    .switch i.fa {
        position: absolute;
        top: 0;
        right: 0;
        cursor: pointer;
    }

    .beat-savior {
        text-align: center;
    }

    .beat-savior > :global(*) {
        margin: .5em 0;
    }

    .beat-savior > :global(*:last-child) {
        margin-bottom: 0;
    }

    .beat-savior.switchable {
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: 1fr;
        overflow: hidden;
    }

    .beat-savior.switchable > * {
        grid-area: 1 / 1 / 1 / 1;
    }

    .beat-savior.switchable > div {
        transition: opacity 500ms ease-in-out, transform 500ms ease-in-out;
        opacity: 1;
        will-change: transform, opacity;
    }
    .beat-savior.switchable > div.not-visible {
        opacity: 0;
        transform: translate(-100%, 0);
        max-height: 4.5em;
    }
    .beat-savior.switchable > div.acc {
        margin-top: calc(2.0em + .38px);
    }
    .beat-savior.switchable > div.acc :global(.acc) {
        margin-bottom: 1em;
    }
    .beat-savior.switchable > div.chart {
        margin-top: 1em;
    }
</style>