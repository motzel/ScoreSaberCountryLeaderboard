<script>
  import {onMount, createEventDispatcher} from 'svelte'
  const dispatch = createEventDispatcher();

  import {_} from "../../stores/i18n";
  import eventBus from '../../../utils/broadcast-channel-pubsub';
  import {getLeaderboardMaxScore} from '../../../song'

  import ScoreSaberProvider from './Provider/ScoreSaber.svelte'
  import ScoreSaberPresenter from './Presenter/ScoreSaber.svelte'
  import {isEmpty} from '../../../utils/js'
  import {SCORES_PER_PAGE} from '../../../network/scoresaber/consts'
  import {getConfig, getMainPlayerId} from '../../../plugin-config'

  export let leaderboardId;
  export let startAtRank = 1;
  export let highlight = [];
  export let leaderboardPage = {};
  export let type = 'live';
  export let onlySelectedDiff = false;
  export let showDifferences = true;
  export let showBgCover = true;
  export let bgLeft = "0rem";
  export let bgTop = "0rem";
  export let bgWidth = "0rem";
  export let bgHeight = "0rem";

  let typeAtStart = type;

  let difficulty = null;
  let diffs = leaderboardPage && leaderboardPage['diffs'] ? leaderboardPage['diffs'] : [];

  let currentPage = Math.floor((startAtRank - 1) / SCORES_PER_PAGE);
  let totalItems = 0;

  let hash = null;
  let maxScore = null;

  const originalBgTop = bgTop;
  let mainPlayerId = null;

  let initialized = false;

  async function refreshMaxScore(leaderboardId, hash, difficulty) {
    if (!leaderboardId || !hash || !difficulty) return;

    maxScore = await getLeaderboardMaxScore(leaderboardId, hash, difficulty);
  }

  function refreshLeaderboardPage(leaderboardPage) {
    if (isEmpty(leaderboardPage)) return;

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

    if (typeAtStart === 'cached') typeAtStart = null;
    else type = 'live';
  }

  function onDiffChange(event) {
    if (!event || !event.detail || !event.detail.leaderboardId || !event.detail.type) return;

    leaderboardId = event.detail.leaderboardId;
    currentPage = event.detail.page ? event.detail.page : 0;
    type = event.detail.type;

    dispatch('diff-change', event.detail);
  }

  function onBrowse(event) {
    if (!event || !event.detail || !event.detail.hasOwnProperty('currentPage')) return;

    currentPage = event.detail.currentPage;
  }

  function onLeaderboardPageLoaded(event) {
    if (!event || !event.detail) return;

    leaderboardPage = event.detail;
  }

  async function refreshConfig() {
    const config = await getConfig('songLeaderboard');
    showBgCover = showBgCover && !!(config && config.showBgCover !== false);
    showDifferences = showDifferences && !!(config && config.showDiff);
  }

  function refreshBgOffsets(diffs, mainPlayerId, leaderboardId) {
    const shouldDecreaseTopOffset = !((diffs && (diffs.length > 1 || (diffs.length === 1 && diffs[0].id !== leaderboardId))) || mainPlayerId);
    if (!shouldDecreaseTopOffset) {
      bgTop = originalBgTop;
      return;
    }

    const matches = originalBgTop.match(/^([\d-.]+)(.*)$/);
    if (matches) {
      if (['rem', 'em'].includes(matches[2])) {
        bgTop = (parseFloat(matches[1]) + 2) + matches[2];
      }
    }
  }

  onMount(async () => {
    await refreshConfig();

    mainPlayerId = await getMainPlayerId();

    const configChangedUnsubscriber = eventBus.on('config-changed', refreshConfig);

    if (leaderboardId && isEmpty(leaderboardPage)) {
      initialized = true;
    }

    return configChangedUnsubscriber;
  })

  $: {
    refreshBgOffsets(diffs, mainPlayerId, leaderboardId);
  }

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
    song={leaderboardPage && leaderboardPage.song ? leaderboardPage.song : {}}
    pageNum={currentPage + 1}
    {totalItems}
    {maxScore}
    {highlight}
    pauseLoading={false}
    on:leaderboard-page-loaded={onLeaderboardPageLoaded}
    let:data let:diffs let:totalItems let:error let:beforeChanged let:isPaused let:isLoading let:initialized let:hash
  >
    <ScoreSaberPresenter
      {leaderboardId}
      {initialized}
      bind:type
      {data}
      {hash}
      {diffs}
      {error}
      {currentPage}
      {totalItems}
      {onlySelectedDiff}
      {showDifferences}
      {showBgCover}
      {bgLeft} {bgTop} {bgWidth} {bgHeight}
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