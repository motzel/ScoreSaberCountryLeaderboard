<script>
  import Card from '../Song/LeaderboardCard.svelte'
  import Chart from '../Song/Chart.svelte'
  import ScoreSaberProvider from './Provider/ScoreSaber.svelte'
  import ScoreSaberPresenter from './Presenter/ScoreSaber.svelte'
  import {getSongLeaderboardUrl} from '../../../scoresaber/scores'

  export let leaderboardId;
  export let leaderboardPage = {};

  const getProp = (prop, defaultValue = null) => leaderboardPage && leaderboardPage[prop] ? leaderboardPage[prop] : defaultValue;

  const difficulty = getProp('currentDiff');
  const diffs = getProp('diffs');
  const chartData = getProp('diffChart');
  const song = getProp('song');

  let currentPage = leaderboardPage && leaderboardPage.pageNum ? leaderboardPage.pageNum - 1 : 0;
  let totalItems = getProp('totalItems', 0);

  const songInfo = song ? {metadata: song} : null;

  function onScoreBrowse() {
    if (!leaderboardId) return;

    // update browser url
    const url = new URL(
     getSongLeaderboardUrl(leaderboardId, currentPage + 1)
    );

    history.replaceState(null, '', url.toString());
  }
</script>

<div class="columns">
  <div class="column">
    <div class="box has-shadow">
      <ScoreSaberProvider
       {leaderboardId}
       {diffs}
       scores={leaderboardPage && leaderboardPage.scores ? leaderboardPage.scores : []}
       pageNum={currentPage + 1}
       {totalItems}
       pauseLoading={false}
       let:data let:diffs let:totalItems let:error let:beforePageChanged let:isPaused
      >
        <ScoreSaberPresenter
         {leaderboardId}
         {data}
         {diffs}
         {error}
         bind:currentPage
         {totalItems}
         {beforePageChanged}
         on:browse={onScoreBrowse}
         {isPaused}
        />
      </ScoreSaberProvider>
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