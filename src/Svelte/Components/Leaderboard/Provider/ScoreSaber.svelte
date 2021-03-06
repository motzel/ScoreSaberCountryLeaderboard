<script>
  import {onMount, createEventDispatcher, tick} from 'svelte'
  const dispatch = createEventDispatcher();

  import eventBus from '../../../../utils/broadcast-channel-pubsub';
  import {fetchSsSongLeaderboardPage} from '../../../../network/scoresaber/scores'
  import {PLAYS_PER_PAGE} from '../../../../network/scoresaber/consts'
  import {_} from '../../../stores/i18n';
  import {convertArrayToObjectByKey} from '../../../../utils/js'
  import {enhanceScore} from '../../Player/Song/Provider/utils'
  import {getSongScores} from '../../../../song'
  import {getMainPlayerId} from '../../../../plugin-config'

  export let leaderboardId = null;
  export let scores = [];
  export let song = {};
  export let diffs = [];
  export let pageNum = 1;
  export let totalItems = 0;
  export let pauseLoading = false;
  export let maxScore;
  export let highlight = [];

  let lastPageData = scores && scores.length
    ? {scores, pageNum, totalItems, pageQty: Math.ceil(totalItems / PLAYS_PER_PAGE), leaderboardId}
    : null;

  let data = [];

  let mainPlayerId = null;
  let playersScores = {};

  let error = null;

  let isLoading = false;
  let initialized = false;

  let hash = song && song.hash ? song.hash : null;

  let lastEnhanced = null;

  const enhanceScores = async () => {
    if (!(leaderboardId && data && data.length && playersScores && data[0].leaderboardId === leaderboardId && lastPageData && lastPageData.leaderboardId === leaderboardId)) return;

    const createEnhanceTag = () => maxScore + '::' + leaderboardId + '::' + lastPageData.pageNum + '::' + Object.values(playersScores).map(s => s.score && s.playerId ? s.playerId + '/' + s.score : '').join('::');
    const enhanceTag = createEnhanceTag();
    if (lastEnhanced === enhanceTag) return;

    lastEnhanced = enhanceTag;

    data = await Promise.all(data.map(async score => {
      if (!score || !score.playerId) return score;

      const cachedScore = playersScores[score.playerId] && playersScores[score.playerId].leaderboardId === score.leaderboardId ? playersScores[score.playerId] : null;

      return await enhanceScore(score, cachedScore, maxScore);
    }));
  }

  async function refreshPlayersScores(leaderboardId) {
    if (!leaderboardId) return;

    const leaderboard = await getSongScores(leaderboardId);
    playersScores = leaderboard && leaderboard.length ? convertArrayToObjectByKey(leaderboard, 'playerId') : {};

    enhanceScores();
  }

  async function processFetched(pageData) {
    if (!pageData) {
      data = [];
      return;
    }

    totalItems = pageData.totalItems && !isNaN(pageData.totalItems) ? pageData.totalItems : totalItems;

    data = pageData.scores.map(score => ({
      ...score,
      leaderboardId: pageData.leaderboardId,
      highlight: score && score.playerId && (score.playerId === mainPlayerId || (highlight && highlight.includes(score.playerId)))
    }));

    await tick();

    enhanceScores();
  }

  async function fetchPage(leaderboardId, pageToLoad) {
    if (!leaderboardId || !initialized || pauseLoading) return;

    if (!pageToLoad) pageToLoad = pageNum;

    // do not fetch again the same data
    if (!!lastPageData && lastPageData.pageNum === pageToLoad && lastPageData.leaderboardId === leaderboardId) return true;

    error = null;

    try {
      isLoading = true;

      const pageData = await fetchSsSongLeaderboardPage(leaderboardId, pageToLoad);
      if (!pageData || !pageData.scores || isNaN(pageData.totalItems)) throw 'Download error';

      lastPageData = {...pageData};
      pageNum = pageToLoad;
      hash = pageData && pageData.song && pageData.song.hash ? pageData.song.hash : hash;

      isLoading = false;

      dispatch('leaderboard-page-loaded', lastPageData);
    }
    catch(err) {
      isLoading = false;

      error = $_.common.downloadError;

      return false;
    }

    return true;
  }

  async function beforeChanged(newDiff) {
    if (newDiff.type !== 'live') return true;

    // page here is indexed from 0, so add 1 for SS page
    return await fetchPage(newDiff.leaderboardId, newDiff.page + 1);
  }

  onMount(async () => {
    mainPlayerId = await getMainPlayerId();

    await refreshPlayersScores(leaderboardId);

    if(lastPageData) await processFetched(lastPageData);

    const unsubscriberDataRefreshed = eventBus.on('data-refreshed', async () => {
      refreshPlayersScores(leaderboardId);
    });
    const unsubscriberScoresUpdated = eventBus.on('player-scores-updated', async () => {
      await refreshPlayersScores(leaderboardId);
    });


    initialized = true;

    return () => {
      unsubscriberDataRefreshed();
      unsubscriberScoresUpdated();
    }
  })

  $: if (lastPageData) {
    processFetched(lastPageData)
  }

  $: {
    fetchPage(leaderboardId, undefined, initialized, pauseLoading)
  }

  $: {
    refreshPlayersScores(leaderboardId)
  }

  $: {
    enhanceScores(leaderboardId, lastPageData, playersScores, maxScore);
  }
</script>

<slot {data} {diffs} {totalItems} {error} {isLoading} isPaused={pauseLoading} {beforeChanged} {hash} {initialized}></slot>
