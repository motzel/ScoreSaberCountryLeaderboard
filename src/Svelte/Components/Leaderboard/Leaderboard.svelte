<script>
  import {onMount, createEventDispatcher} from 'svelte'
  const dispatch = createEventDispatcher();

  import {_} from "../../stores/i18n";
  import {getLeaderboardMaxScore} from '../../../song'

  import ScoreSaberProvider from './Provider/ScoreSaber.svelte'
  import ScoreSaberPresenter from './Presenter/ScoreSaber.svelte'
  import {isEmpty} from '../../../utils/js'
  import {SCORES_PER_PAGE} from '../../../network/scoresaber/consts'

  export let leaderboardId;
  export let startAtRank = 1;
  export let highlight = [];
  export let leaderboardPage = {};
  export let type = 'live';
  export let onlySelectedDiff = false;

  let difficulty = null;
  let diffs = null;

  let currentPage = Math.floor((startAtRank - 1) / SCORES_PER_PAGE);
  let totalItems = 0;

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
      diffs = getProp('diffs', [])
       .filter(diff => !onlySelectedDiff || diff.id === leaderboardId)
       .map(diff => onlySelectedDiff ? {...diff, name: $_.plugin.liveButton} : diff);

      currentPage = leaderboardPage && leaderboardPage.pageNum ? leaderboardPage.pageNum - 1 : 0;
      totalItems = getProp('totalItems', 0);

      const song = getProp('song');
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
  }

  onMount(async () => {
    if (leaderboardId && isEmpty(leaderboardPage)) {
      initialized = true;
    }
  })

  $: {
    refreshLeaderboardPage(leaderboardPage)
  }

  $: {
    refreshMaxScore(leaderboardId, hash, difficulty);
  }
</script>

{#if initialized}
  <ScoreSaberProvider
    {leaderboardId}
    {diffs}
    scores={leaderboardPage && leaderboardPage.scores ? leaderboardPage.scores : []}
    pageNum={currentPage + 1}
    {totalItems}
    {maxScore}
    {highlight}
    pauseLoading={false}
    on:leaderboard-page-loaded={onLeaderboardPageLoaded}
    let:data let:diffs let:totalItems let:error let:beforeChanged let:isPaused let:isLoading let:initialized
  >
    <ScoreSaberPresenter
      {leaderboardId}
      {initialized}
      bind:type
      {data}
      {diffs}
      {error}
      {currentPage}
      {totalItems}
      {onlySelectedDiff}
      {isLoading}
      {beforeChanged}
      on:diff-change={onDiffChange}
      on:browse={onBrowse}
      {isPaused}
    />
  </ScoreSaberProvider>
{/if}

<style>
</style>