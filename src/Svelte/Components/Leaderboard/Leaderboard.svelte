<script>
  import {onMount} from 'svelte'
  import {getSongLeaderboardUrl} from '../../../scoresaber/scores'

  import Card from '../Song/LeaderboardCard.svelte'
  import Chart from '../Song/Chart.svelte'
  import ScoreSaberProvider from './Provider/ScoreSaber.svelte'
  import ScoreSaberPresenter from './Presenter/ScoreSaber.svelte'

  export let leaderboardId;
  export let leaderboardPage = {};

  let difficulty = null;
  let diffs = null;
  let chartData = null;
  let song = null;

  let currentPage = 0;
  let totalItems = 0;

  let songInfo = null;

  function refreshLeaderboardPage(leaderboardPage) {
    const getProp = (prop, defaultValue = null) => leaderboardPage && leaderboardPage[prop] ? leaderboardPage[prop] : defaultValue;

    const newDifficulty = getProp('currentDiff');

    if (difficulty !== newDifficulty) {
      difficulty = newDifficulty;
      diffs = getProp('diffs');
      chartData = getProp('diffChart');
      song = getProp('song');

      currentPage = leaderboardPage && leaderboardPage.pageNum ? leaderboardPage.pageNum - 1 : 0;
      totalItems = getProp('totalItems', 0);

      songInfo = song ? {metadata: song} : null;
    }
  }

  function onDiffChange(event) {
    if (!event || !event.detail || !event.detail.leaderboardId) return;

    leaderboardId = event.detail.leaderboardId;
    currentPage = event.detail.page ? event.detail.page : 0;
  }

  function onLeaderboardPageLoaded(event) {
    if (!event || !event.detail) return;

    leaderboardPage = event.detail;

    if (!leaderboardId) return;

    // update browser url
    const url = new URL(
     getSongLeaderboardUrl(leaderboardId, event.detail.pageNum)
    );

    history.replaceState(null, '', url.toString());
  }

  $: {
    refreshLeaderboardPage(leaderboardPage)
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
       on:leaderboard-page-loaded={onLeaderboardPageLoaded}
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
         on:diff-change={onDiffChange}
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