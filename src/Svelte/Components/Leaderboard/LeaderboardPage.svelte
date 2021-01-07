<script>
  import {getSongLeaderboardUrl} from '../../../scoresaber/scores'

  import Card from './Card.svelte'
  import Chart from '../Song/Chart.svelte'
  import Leaderboard from './Leaderboard.svelte'

  export let leaderboardId;
  export let startAtRank = 1;
  export let leaderboardPage = {};
  export let type = 'live';

  let difficulty = null;
  let chartData = null;
  let song = null;

  let songInfo = null;

  function refreshLeaderboardPage(leaderboardPage) {
    if (!leaderboardPage) return;

    const getProp = (prop, defaultValue = null) => leaderboardPage && leaderboardPage[prop] ? leaderboardPage[prop] : defaultValue;

    const newDifficulty = getProp('currentDiff');
    if (difficulty !== newDifficulty) {
      difficulty = newDifficulty;
      chartData = getProp('diffChart')
      song = getProp('song');
      songInfo = song ? {metadata: song} : null;
    }

    if (!leaderboardId) return;

    // update browser url
    const url = new URL(
     getSongLeaderboardUrl(leaderboardId, leaderboardPage.pageNum),
    );

    history.replaceState(null, '', url.toString());
  }

  $: {
    refreshLeaderboardPage(leaderboardPage);
  }
</script>

<div class="columns">
  <div class="column">
    <div class="box has-shadow">
      <Leaderboard bind:leaderboardId bind:leaderboardPage {type} {startAtRank} />
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