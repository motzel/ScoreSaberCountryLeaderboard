<script>
  import {getSongLeaderboardUrl} from '../../../scoresaber/scores'

  import Card from '../Song/LeaderboardCard.svelte'
  import Chart from '../Song/Chart.svelte'
  import ScoreSaberProvider from './Provider/ScoreSaber.svelte'
  import ScoreSaberPresenter from './Presenter/ScoreSaber.svelte'
  import {getLeaderboardMaxScore} from '../../../song'

  export let leaderboardId;
  export let leaderboardPage = {};
  export let type = 'live';

  let difficulty = null;
  let diffs = null;
  let chartData = null;
  let song = null;

  let currentPage = 0;
  let totalItems = 0;

  let songInfo = null;

  let hash = null;
  let maxScore = null;

  let initialized = false;

  async function refreshMaxScore(leaderboardId, hash, difficulty) {
    if (!leaderboardId || !hash || !difficulty) return;

    maxScore = await getLeaderboardMaxScore(leaderboardId, hash, difficulty);
  }

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

      hash = song && song.hash ? song.hash : null;

      initialized = true;
    }

    type = 'live';
  }

  function onDiffChange(event) {
    if (!event || !event.detail || !event.detail.leaderboardId || !event.detail.type) return;

    leaderboardId = event.detail.leaderboardId;
    currentPage = event.detail.page ? event.detail.page : 0;
    type = event.detail.type;
  }

  function onBrowse(event) {
    if (!event || !event.detail || !event.detail.hasOwnProperty('currentPage')) return;

    currentPage = event.detail.currentPage;
  }

  function onLeaderboardPageLoaded(event) {
    if (!event || !event.detail) return;

    leaderboardPage = event.detail;

    if (!leaderboardId) return;

    // update browser url
    const url = new URL(
     getSongLeaderboardUrl(leaderboardId, event.detail.pageNum),
    );

    history.replaceState(null, '', url.toString());
  }

  $: {
    refreshLeaderboardPage(leaderboardPage)
  }

  $: {
    refreshMaxScore(leaderboardId, hash, difficulty);
  }
</script>

{#if initialized}
<div class="columns">
  <div class="column">
    <div class="box has-shadow">
      <ScoreSaberProvider
       {leaderboardId}
       {diffs}
       scores={leaderboardPage && leaderboardPage.scores ? leaderboardPage.scores : []}
       pageNum={currentPage + 1}
       {totalItems}
       {maxScore}
       pauseLoading={false}
       on:leaderboard-page-loaded={onLeaderboardPageLoaded}
       let:data let:diffs let:totalItems let:error let:beforeChanged let:isPaused
      >
        <ScoreSaberPresenter
         {leaderboardId}
         bind:type
         {data}
         {diffs}
         {error}
         {currentPage}
         {totalItems}
         {beforeChanged}
         on:diff-change={onDiffChange}
         on:browse={onBrowse}
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
{/if}

<style>
  .chart {
    margin-top: 1.5rem;
  }
</style>