<script>
  import Card from '../Song/LeaderboardCard.svelte'
  import Chart from '../Song/Chart.svelte'

  export let leaderboardId;
  export let leaderboardPage = {};

  const getProp = prop => leaderboardPage && leaderboardPage[prop] ? leaderboardPage[prop] : null;

  const difficulty = getProp('currentDiff');
  const chartData = getProp('diffChart');
  const song = getProp('song');

  const songInfo = song ? {metadata: song} : null;
</script>

<div class="columns">
  <div class="column">
    <div class="box has-shadow">
      MAIN
    </div>
  </div>

  <div class="column is-one-third-desktop">
    <Card {leaderboardId} {difficulty} {songInfo} {...song} />

    {#if chartData && chartData.length}
    <div class="box has-shadow chart">
      <Chart data={chartData} />
    </div>
    {/if}
  </div>
</div>

<style>
  .chart {
    margin-top: 1.5rem;
  }
</style>