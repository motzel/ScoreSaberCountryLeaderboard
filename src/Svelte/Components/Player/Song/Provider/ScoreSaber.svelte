<script>
  import {createEventDispatcher} from 'svelte';
  const dispatch = createEventDispatcher();

  import {onMount} from 'svelte'
  import eventBus from '../../../../../utils/broadcast-channel-pubsub';
  import nodeSync from '../../../../../utils/multinode-sync';
  import {fetchSsProfilePage} from '../../../../../network/scoresaber/scores'
  import {PLAYS_PER_PAGE} from '../../../../../network/scoresaber/consts'
  import {_} from '../../../../stores/i18n';
  import {dateFromString} from '../../../../../utils/date'
  import {getScoresByPlayerId} from '../../../../../scoresaber/players'
  import {convertArrayToObjectByKey, isDateObject} from '../../../../../utils/js'
  import {enhanceScore, findTwitchVideo} from './utils'
  import {setRefreshedPlayerScores} from '../../../../../network/scoresaber/players'
  import {getSsplCountryRanks} from '../../../../../scoresaber/sspl-cache'
  import {getActiveCountry} from '../../../../../scoresaber/country'
  import {getLeaderboardMaxScore, getSongDiffInfo} from '../../../../../song'

  export let playerId = null;
  export let players = [];
  export let scores = [];
  export let pageNum = 1;
  export let totalItems = 0;
  export let type = 'recent';
  export let playerTwitchProfile = null;
  export let pauseLoading = false;
  export let recentPlay = null;

  let lastPageData = scores && scores.length
   ? {scores, pageNum, totalItems, pageQty: Math.ceil(totalItems / PLAYS_PER_PAGE), type, playerId, recentPlay}
   : null;

  let songs = [];
  let series = [];

  let playersScores = {};
  let country = null;

  let error = null;

  let initialized = false;

  let leaderboardsMaxScores = {};

  const enhanceScores = async pageData => {
    if (!(songs && series && songs.length && series.length && playersScores)) return;

    const createEnhanceScoresTag = pageData => pageData && pageData.pageNum && pageData.type && pageData.playerId
      ? pageData.playerId + '-' + pageData.type + '-' + pageData.pageNum
      : null;

    const currentEnhanceScoresTag = createEnhanceScoresTag(pageData);
    const currentLeaderboardsIdsToGetMaxScores = [];

    series = await Promise.all(series.map(async (songSeries, songIdx) => await Promise.all(songSeries.map(async (score, idx) => {
      if (!score) return score;

      const player = players[idx];
      const cachedScore = playersScores[idx] && playersScores[idx][score.leaderboardId];

      const song = songs[songIdx];
      if (playerTwitchProfile && song && song.diffInfo && song.hash && score.timeset && idx === 0) {
        const songInfo = await getSongDiffInfo(song.hash, song.diffInfo, true);
        if (songInfo && songInfo.length) {
          const video = await findTwitchVideo(playerTwitchProfile, dateFromString(score.timeset), songInfo.seconds);
          if (video) song.video = video;
        }
      }

      if (country && player && idx === 0) {
        const ssplCountryRanks = await getSsplCountryRanks();
        if (ssplCountryRanks && ssplCountryRanks[score.leaderboardId] && ssplCountryRanks[score.leaderboardId][player.playerId]) {
          score.ssplCountryRank = ssplCountryRanks[score.leaderboardId][player.playerId];
          score.country = country;
        }
      }

      const songDataAvailable = !!(score.leaderboardId && score.hash && score.diffInfo);
      let maxScore = songDataAvailable
        ? await getLeaderboardMaxScore(score.leaderboardId, score.hash, score.diffInfo.diff, [], true)
        : null;

      if (songDataAvailable && !maxScore) {
        if (leaderboardsMaxScores.hasOwnProperty(score.leaderboardId)) maxScore = leaderboardsMaxScores[score.leaderboardId];
        else {
          currentLeaderboardsIdsToGetMaxScores.push(async () => {
            return leaderboardsMaxScores[score.leaderboardId] = await getLeaderboardMaxScore(score.leaderboardId, score.hash, score.diffInfo.diff);
          })
        }
      }

      return await enhanceScore(score, cachedScore, maxScore, true);
    }))));

    if (currentLeaderboardsIdsToGetMaxScores && currentLeaderboardsIdsToGetMaxScores.length)
      Promise.all(currentLeaderboardsIdsToGetMaxScores.map(f => f())).then(all => {
        if (currentEnhanceScoresTag === createEnhanceScoresTag(lastPageData))
          enhanceScores(lastPageData)
      })

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
      const {lastUpdated, leaderboardId, mods, acc, pp, ppWeighted, rank, score, timeset, hash, diffInfo} = s;

      const series = [{leaderboardId, lastUpdated, mods, acc, pp, ppWeighted, rank, score, hash, diffInfo, playerId: pageData.playerId, timeset: dateFromString(timeset)}];

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

    enhanceScores(pageData);
  }

  async function fetchPage(playerId, typeToLoad, pageToLoad) {
    if (!playerId || !initialized || pauseLoading) return;

    if (!pageToLoad) pageToLoad = pageNum;

    // do not fetch again the same data
    if (!!lastPageData && lastPageData.pageNum === pageToLoad && lastPageData.type === typeToLoad && lastPageData.playerId
     === playerId && ((lastPageData.recentPlay === recentPlay) || (!!lastPageData.recentPlay && !!recentPlay && (lastPageData.recentPlay >= recentPlay)))
    ) return;

    error = null;

    try {
      const pageData = await fetchSsProfilePage(playerId, pageToLoad, typeToLoad);
      if (!pageData || !pageData.scores || isNaN(pageData.totalItems)) throw 'Download error';

      let newRecentPlay = null;
      if (pageData && pageData.type === 'recent' && pageData.pageNum === 1 && pageData.scores && pageData.scores.length && pageData.scores[0].timeset && isDateObject(pageData.scores[0].timeset)) {
        newRecentPlay = pageData.scores[0].timeset;

        eventBus.publish('recent-play-updated', {nodeId: nodeSync().getId(), playerId, recentPlay: newRecentPlay});
      }

      if (pageData) {
        eventBus.publish('player-profile-page-parsed', {nodeId: nodeSync().getId(), playerId, profilePage: pageData});
      }

      newRecentPlay = newRecentPlay ? newRecentPlay : recentPlay;
      lastPageData = {...pageData, recentPlay: newRecentPlay};
      recentPlay = newRecentPlay;
      pageNum = pageToLoad;
      type = typeToLoad;

      dispatch('scores-page-loaded', lastPageData);
    }
    catch(err) {
      error = $_.common.downloadError;

      return false;
    }

    return true;
  }

  let lastPlayersTag = null;
  async function updatePlayerId(players) {
    if ((!players || !players.length) && !playerId) return;

    const newPlayersTag = players.map(p => p.playerId).join(':');
    if (newPlayersTag === lastPlayersTag) {
      return;
    }

    lastPlayersTag = newPlayersTag;

    playerId = players && players.length ? players[0].playerId : playerId;

    await getPlayersScores(players);

    processFetched(lastPageData)

    if (players && players.length && players[0].playerId !== playerId)
      playerId = players[0].playerId;
  }

  async function beforePageChanged(page) {
    // page here is indexed from 0, so add 1 for SS page
    return await fetchPage(playerId, type, page + 1);
  }

  onMount(async () => {
    country = await getActiveCountry();
    await getPlayersScores(players);
    await getSsplCountryRanks();

    // if(lastPageData) processFetched(lastPageData);

    const updatePlayerScoresAndProcess = async () => {
      await getPlayersScores(players);
      processFetched(lastPageData);
    }
    const isPlayerCurrentlyDisplayed = playerId => {
      const currentlyShownPlayers = (players ? players : []).map(player => player.playerId);
      return currentlyShownPlayers.includes(playerId);
    }
    const unsubscriberDataRefreshed = eventBus.on('data-refreshed', async () => {
      await updatePlayerScoresAndProcess();
    });
    const unsubscriberScoresUpdated = eventBus.on('player-scores-updated', async ({playerId}) => {
      if (!isPlayerCurrentlyDisplayed(playerId)) return;

      await updatePlayerScoresAndProcess();
    })
    const unsubscriberBeatSaviorUpdated = eventBus.on('player-beat-savior-updated', async ({playerId}) => {
      if (!isPlayerCurrentlyDisplayed(playerId)) return;

      await updatePlayerScoresAndProcess();
    });

    initialized = true;

    return () => {
      unsubscriberScoresUpdated();
      unsubscriberDataRefreshed();
      unsubscriberBeatSaviorUpdated();
    }
  })

  $: if (lastPageData) {
    processFetched(lastPageData, playerTwitchProfile)
  }

  $: {
    updatePlayerId(players);
  }

  $: {
    fetchPage(playerId, type, undefined, recentPlay, initialized, pauseLoading)
  }
</script>

<slot {songs} {series} {totalItems} {error} isPaused={pauseLoading} {beforePageChanged}></slot>
