<script>
  import {onMount} from 'svelte'
  import {fetchSsScores} from '../../../../network/scoresaber/scores'
  import {PLAYS_PER_PAGE} from '../../../../network/scoresaber/consts'
  import {_} from '../../../stores/i18n';
  import {dateFromString} from '../../../../utils/date'
  import {getScoresByPlayerId} from '../../../../scoresaber/players'
  import {convertArrayToObjectByKey} from '../../../../utils/js'
  import {enhanceScore} from './utils'
  import {setRefreshedPlayerScores} from '../../../../network/scoresaber/players'
  import {getSsplCountryRanks} from '../../../../scoresaber/sspl-cache'
  import {getActiveCountry} from '../../../../scoresaber/country'

  export let players = [];
  export let scores = [];
  export let pageNum = 1;
  export let totalItems = 0;
  export let type = 'recent';

  let playerId = players && players.length ? players[0].id : null;
  let lastPageData = scores && scores.length
   ? {scores, pageNum, totalItems, pageQty: Math.ceil(totalItems / PLAYS_PER_PAGE), type, playerId}
   : null;

  let songs = [];
  let series = [];

  let playersScores = {};
  let country = null;

  let error = null;
  let isLoading = false;

  let initialized = false;

  const enhanceScores = async () => {
    if (!(songs && series && songs.length && series.length && playersScores)) return;

    // TODO: get it from the config; onMount(), refresh if config changes
    // const ssConfig = await getConfig('ssSong');
    // const showDiff = !!ssConfig?.showDiff;
    // const showWhatIfPp = !!ssConfig?.showWhatIfPp;
    const showDiff = true;

    series = await Promise.all(series.map(async songSeries => await Promise.all(songSeries.map(async (score, idx) => {
      if (!score) return score;

      const player = players[idx];
      const cachedScore = playersScores[idx] && playersScores[idx][score.leaderboardId];

      score.acc = score.percent ? score.percent * 100 : null;

      if (country && player && idx === 0) {
        const ssplCountryRanks = await getSsplCountryRanks();
        if (ssplCountryRanks && ssplCountryRanks[score.leaderboardId] && ssplCountryRanks[score.leaderboardId][player.playerId]) {
          score.ssplCountryRank = ssplCountryRanks[score.leaderboardId][player.playerId];
          score.country = country;
        }
      }

      return cachedScore ? await enhanceScore(score, cachedScore, showDiff) : score;
    }))));

    if (series && series.length && players && players.length) {
      const data = series
       .map(s => s && s[0] ? {leaderboardId: s[0].leaderboardId, rank: s[0].rank} : null)
       .filter(s => s);
      setRefreshedPlayerScores(players[0].playerId, data);
    }
  }

  const getPlayersScores = async players => {
    if (!players || !players.length) return;

    playersScores = (await Promise.all(
     players.map(async player => getScoresByPlayerId(player.playerId))
    )).map(playerScores => convertArrayToObjectByKey(playerScores, 'leaderboardId'))
  }

  async function processFetched(pageData) {
    if (!pageData || !players || !players.length) {
      songs = [];
      series = [];
      return;
    }

    totalItems = pageData.totalItems && !isNaN(pageData.totalItems) ? pageData.totalItems : totalItems;

    const pageSongs = pageData.scores.map(s => {
      const {diffInfo, hash, leaderboardId, levelAuthorName:levelAuthor, songDiff:diff, songImg:img, songName: name, songAuthorName:songAuthor} = s;

      return {diffInfo, diff, hash, leaderboardId, levelAuthor, name, songAuthor, img};
    });

    const pageSeries = pageData.scores.map(s => {
      const {lastUpdated, leaderboardId, mods, percent, pp, ppWeighted, rank, score, timeset} = s;

      const series = [{leaderboardId, lastUpdated, mods, percent, pp, ppWeighted, rank, score, timeset: dateFromString(timeset)}];

      // get other players data from cache
      if (players && players.length > 1) {
        players.slice(1).map((player, idx) => {
          series.push(playersScores[idx + 1] && playersScores[idx + 1][leaderboardId] ? playersScores[idx + 1][leaderboardId] : null);
        })
      }

      return series;
    });

    songs = pageSongs;
    series = pageSeries;

    enhanceScores();
  }

  async function fetchPage(playerId, pageNum, type) {
    if (!playerId || !initialized) return;

    // do not fetch again the same data
    if (lastPageData && lastPageData.pageNum === pageNum && lastPageData.type === type && (lastPageData.playerId === null || lastPageData.playerId === playerId)) return;

    isLoading = true;

    error = null;

    try {
      const pageData = await fetchSsScores(playerId, pageNum, type);
      if (!pageData || !pageData.scores || isNaN(pageData.totalItems)) throw 'Download error';

      lastPageData = pageData;
    }
    catch(err) {
      // TODO: revert to previous page/type on error

      error = $_.common.downloadError;
    }

    isLoading = false;
  }

  async function updatePlayerId(players) {
    await getPlayersScores(players);

    processFetched(lastPageData)

    if (players && players.length && players[0].playerId !== playerId)
      playerId = players[0].playerId;
  }

  onMount(async () => {
    country = await getActiveCountry();
    await getPlayersScores(players);
    await getSsplCountryRanks();

    if(lastPageData) await processFetched(lastPageData);

    initialized = true;
  })


  $: if (lastPageData) {
    processFetched(lastPageData)
  }

  $: {
    updatePlayerId(players);
  }

  $: {
    fetchPage(playerId, pageNum, type)
  }
</script>

<slot {songs} {series} {totalItems} {isLoading} {error}></slot>
