<script>
  import {onMount, createEventDispatcher} from 'svelte'
  const dispatch = createEventDispatcher();

  import eventBus from '../../../../utils/broadcast-channel-pubsub';
  import {fetchSsSongLeaderboardPage} from '../../../../network/scoresaber/scores'
  import {PLAYS_PER_PAGE} from '../../../../network/scoresaber/consts'
  import {_} from '../../../stores/i18n';
  import {convertArrayToObjectByKey} from '../../../../utils/js'
  import {enhanceScore} from '../../Song/Provider/utils'
  import {getSongScores} from '../../../../song'

  export let leaderboardId = null;
  export let scores = [];
  export let diffs = [];
  export let pageNum = 1;
  export let totalItems = 0;
  export let pauseLoading = false;
  export let maxScore;

  let lastPageData = scores && scores.length
   ? {scores, pageNum, totalItems, pageQty: Math.ceil(totalItems / PLAYS_PER_PAGE), leaderboardId}
   : null;

  let data = [];

  let playersScores = {};

  let error = null;

  let initialized = false;

  const enhanceScores = async () => {
    if (!(leaderboardId && data && data.length && playersScores)) return;

    data = await Promise.all(data.map(async score => {
      if (!score || !score.playerId) return score;

      const cachedScore = playersScores[score.playerId] ? playersScores[score.playerId] : null;

      return await enhanceScore(score, cachedScore, maxScore);
    }));
  }

  async function refreshPlayersScores(leaderboardId) {
    if (!leaderboardId) return;

    const leaderboard = await getSongScores(leaderboardId);
    playersScores = leaderboard && leaderboard.length ? convertArrayToObjectByKey(leaderboard, 'playerId') : {};

    enhanceScores();
  }

  function processFetched(pageData) {
    if (!pageData) {
      data = [];
      return;
    }

    totalItems = pageData.totalItems && !isNaN(pageData.totalItems) ? pageData.totalItems : totalItems;

    data = pageData.scores.map(score => ({...score, leaderboardId}));

    enhanceScores();
  }

  async function fetchPage(leaderboardId, pageToLoad) {
    if (!leaderboardId || !initialized || pauseLoading) return;

    if (!pageToLoad) pageToLoad = pageNum;

    // do not fetch again the same data
    if (!!lastPageData && lastPageData.pageNum === pageToLoad && lastPageData.leaderboardId === leaderboardId) return;

    error = null;

    try {
      const pageData = await fetchSsSongLeaderboardPage(leaderboardId, pageToLoad);
      if (!pageData || !pageData.scores || isNaN(pageData.totalItems)) throw 'Download error';

      lastPageData = pageData;
      pageNum = pageToLoad;

      dispatch('leaderboard-page-loaded', lastPageData);
    }
    catch(err) {
      error = $_.common.downloadError;

      return false;
    }

    return true;
  }

  async function beforePageChanged(page) {
    // page here is indexed from 0, so add 1 for SS page
    return await fetchPage(leaderboardId, page + 1);
  }

  onMount(async () => {
    await refreshPlayersScores(leaderboardId);

    if(lastPageData) processFetched(lastPageData);

    const unsubscriberDataRefreshed = eventBus.on('data-refreshed', async () => {
      refreshPlayersScores();
    });
    const unsubscriberScoresUpdated = eventBus.on('player-scores-updated', async () => {
      await refreshPlayersScores();
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
</script>

<slot {data} {diffs} {totalItems} {error} isPaused={pauseLoading} {beforePageChanged}></slot>
