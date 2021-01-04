<script>
  import {createEventDispatcher} from 'svelte';
  const dispatch = createEventDispatcher();

  import {onMount} from 'svelte'
  import {fetchSsSongLeaderboardPage} from '../../../../network/scoresaber/scores'
  import {PLAYS_PER_PAGE} from '../../../../network/scoresaber/consts'
  import {_} from '../../../stores/i18n';
  import {dateFromString} from '../../../../utils/date'
  import {getScoresByPlayerId} from '../../../../scoresaber/players'
  import {convertArrayToObjectByKey} from '../../../../utils/js'
  import {setRefreshedPlayerScores} from '../../../../network/scoresaber/players'

  export let leaderboardId = null;
  export let scores = [];
  export let diffs = [];
  export let pageNum = 1;
  export let totalItems = 0;
  export let pauseLoading = false;

  let lastPageData = scores && scores.length
   ? {scores, pageNum, totalItems, pageQty: Math.ceil(totalItems / PLAYS_PER_PAGE), leaderboardId}
   : null;

  let data = [];

  let playersScores = {};

  let error = null;

  let initialized = false;

  const enhanceScores = async () => {
    if (!(songs && series && songs.length && series.length && playersScores)) return;

    series = await Promise.all(series.map(async (songSeries, songIdx) => await Promise.all(songSeries.map(async (score, idx) => {
      if (!score) return score;

      const player = players[idx];
      const cachedScore = playersScores[idx] && playersScores[idx][score.leaderboardId];

      score.acc = score.percent ? score.percent * 100 : null;

      const song = songs[songIdx];

      return cachedScore ? await enhanceScore(score, cachedScore) : score;
    }))));

    if (series && series.length && players && players.length) {
      const data = series
       .map(s => s && s[0] && s[0].rank ? {leaderboardId: s[0].leaderboardId, rank: s[0].rank} : null)
       .filter(s => s);
      setRefreshedPlayerScores(players[0].playerId, data, true, false);
    }

    // force refresh songs
    songs = songs;
  }

  const getPlayersScores = async players => {
    if (!players || !players.length) return;

    playersScores = (await Promise.all(
     players.map(async player => getScoresByPlayerId(player.playerId))
    )).map(playerScores => convertArrayToObjectByKey(playerScores, 'leaderboardId'))
  }

  function processFetched(pageData) {
    if (!pageData) {
      data = [];
      return;
    }

    totalItems = pageData.totalItems && !isNaN(pageData.totalItems) ? pageData.totalItems : totalItems;


    data = pageData.scores;

    // TODO
    // enhanceScores();
  }

  async function fetchPage(leaderboardId, pageToLoad) {
    if (!leaderboardId || !initialized || pauseLoading) return;

    if (!pageToLoad) pageToLoad = pageNum;

    // do not fetch again the same data
    if (!!lastPageData && lastPageData.pageNum === pageToLoad && lastPageData.leaderboardId === leaderboardId) return;

    error = null;

    try {
      const pageData = await fetchSsSongLeaderboardPage(leaderboardId, pageToLoad);
      console.warn('pageData', pageData)
      if (!pageData || !pageData.scores || isNaN(pageData.totalItems)) throw 'Download error';

      lastPageData = pageData;
      pageNum = pageToLoad;

      dispatch('scores-page-loaded', lastPageData);
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
    if(lastPageData) processFetched(lastPageData);

    initialized = true;
  })


  $: if (lastPageData) {
    processFetched(lastPageData)
  }

  $: {
    fetchPage(leaderboardId, undefined, initialized, pauseLoading)
  }
</script>

<slot {data} {diffs} {totalItems} {error} isPaused={pauseLoading} {beforePageChanged}></slot>
