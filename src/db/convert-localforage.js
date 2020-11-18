import {dateFromString} from '../utils/date'
import {arrayUnique, convertArrayToObjectByKey} from '../utils/js'
import {extractDiffAndType} from '../song'
import log from '../utils/logger'
import {setThemeInFastCache} from '../store'

const getActiveCountry = cache => cache?.config?.users?.country ?? null;
const getPlayers = cache => cache?.users ?? null;
const getPlayerGroups = cache => cache?.groups ?? null;
const getMainPlayerId = cache => cache?.config?.main  ?? null;

const ADDITIONAL_COUNTRY_PLAYERS_IDS = {pl: ['76561198967371424', '76561198093469724', '76561198204804992']};
const getAdditionalPlayers = (country) => ADDITIONAL_COUNTRY_PLAYERS_IDS[country] ?? [];

const isCountryPlayer = (u, country) => u && u.id && !!u.ssplCountryRank && !!u.ssplCountryRank[country] && (getAdditionalPlayers(country).includes(u.id) || u.country.toLowerCase() === country.toLowerCase());

const getFriendsIds = (cache, withMain = false) => {
  const groups = getPlayerGroups(cache) ?? {};

  return arrayUnique(
    Object.keys(groups)
      .reduce((cum, groupId) => cum.concat(groups[groupId].players), [])
      .concat(withMain ? [getMainPlayerId(cache)] : [])
      .filter(playerId => playerId)
  );
}
const getActiveCountryPlayers = (cache, country, withMain = true) => {
  const players = getPlayers(cache) ?? {};
  const mainPlayerId = withMain ? getMainPlayerId(cache) : null;
  return Object.values(players).filter(p => (p && p.id && mainPlayerId && p.id === mainPlayerId) || isCountryPlayer(p, country))
}
const getActiveCountryPlayersIds = (cache, country, withMain = true) => (getActiveCountryPlayers(cache, country, withMain)).filter(p => !!p.id).map(p => p.id);
const getManuallyAddedPlayersIds = (cache, country, withMain = false) => {
  const friendsIds = getFriendsIds(cache, withMain);

  const players = getPlayers(cache );

  return friendsIds.filter(playerId => !isCountryPlayer(players?.[playerId] ?? null, country));
}
const getAllActivePlayersIds = (cache, country) => arrayUnique((getActiveCountryPlayersIds(cache, country)).concat(getManuallyAddedPlayersIds(cache, country)));

export const convertFromLocalForage = async (cache, transaction) => {
  const activePlayersIds = getAllActivePlayersIds(cache, getActiveCountry(cache));

  const activePlayers = Object.values(cache.users)
    .filter(p => p && activePlayersIds.includes(p.id))
    .map(p => {
      const {playerId, playerName, previousLastUpdated, scores, stats, userHistory, ...playerInfo} = p;
      playerInfo.lastUpdated = dateFromString(playerInfo.lastUpdated);

      return {profile: playerInfo, history: userHistory, scores};
    });

  let store, promises;

  store = transaction.objectStore('players');
  promises = activePlayers.map(p => store.put(p.profile));
  await Promise.all(promises);

  store = transaction.objectStore('players-history');
  promises = activePlayers.reduce((cum, player) => cum.concat(Object.entries(player.history).map(([timestamp, data]) => ({...data, timestamp: new Date(parseInt(timestamp, 10)), playerId: player.profile.id}))), []).map(h => store.put(h));
  await Promise.all(promises);

  store = transaction.objectStore('scores');
  const scores = activePlayers
    .reduce((cum, p) => cum.concat(
      p.scores
        ? Object.values(p.scores).map(s => {
          let {id, diff, difficulty, timeset, name, songSubName, scoreMult, ...score} = s;
          name = name + (songSubName && songSubName.length ? ' ' + songSubName : '');
          return {...score, name, hash: id, id: s.playerId + '_' + s.leaderboardId, timeset: dateFromString(timeset)};
        })
        : [],
      ),
      [],
    );
  promises = scores.map(s => store.put(s));
  await Promise.all(promises);

  const rankeds = convertArrayToObjectByKey(
    Object.values(cache.rankedSongs).map(s => {
      let {diff: diffInfo, difficulty, id: hash, oldStars, firstSeen, ...song} = s;

      firstSeen = firstSeen ? new Date(parseInt(firstSeen, 10)) : null;

      return {...song, firstSeen, diffInfo, hash, status: 'ranked'}
    }),
    'leaderboardId',
  );

  const leaderboards = Object.values({
    ...activePlayers.reduce((cum, p) => {
      const leaderboards = Object.values(p.scores).map(s => {
        let {diff, diffInfo, difficulty, id: hash, leaderboardId, levelAuthorName: levelAuthor, name, songAuthorName: songAuthor, songSubName: subName, maxScoreEx} = s;

        if (!diffInfo && diff && diff.length) diffInfo = extractDiffAndType(diff);

        return {
          diffInfo,
          difficulty,
          hash,
          leaderboardId,
          levelAuthor,
          name,
          songAuthor,
          subName,
          maxScoreEx,
          stars: null,
          status: 'unranked'
        };
      });

      return {...convertArrayToObjectByKey(leaderboards, 'leaderboardId'), ...cum};
    }, {}),
    ...rankeds
  });

  store = transaction.objectStore('leaderboards');
  promises = leaderboards.map(s => store.put(s));
  await Promise.all(promises);

  if(cache?.beatSaver?.hashes) {
    store = transaction.objectStore('songs');
    promises = Object.values(cache.beatSaver.hashes).map(s => store.put(s));
    await Promise.all(promises);
  }

  if(cache?.twitch?.users) {
    store = transaction.objectStore('twitch');
    promises = Object.entries(cache.twitch.users).map(([playerId, data]) => store.put({...data, playerId}));
    await Promise.all(promises);
  }

  if(cache?.rankedSongsChanges) {
    const rankedChanges = Object.entries(cache.rankedSongsChanges).reduce((cum, [timestamp, changes]) => cum.concat(changes.map(c => ({...c, timestamp: parseInt(timestamp, 10)}))), []);
    store = transaction.objectStore('rankeds-changes');
    promises = rankedChanges.map(c => store.put(c));
    await Promise.all(promises);
  }

  let keyValue = [];
  if (cache?.config) {
    const config = cache.config;
    if (config?.ss?.song) {
      config.ssSong = config.ss.song;
      delete config.ss;
    }

    if (config?.users?.groups) delete config.users.groups;

    keyValue.push({key: 'config', value: config});
  }

  let twitchToken = null;
  if (cache?.twitch?.token) {
    twitchToken = cache.twitch.token;

    if (twitchToken?.expires) twitchToken.expires = dateFromString(twitchToken.expires);
  }

  keyValue.push({key: 'twitchToken', value: twitchToken});

  ['activePlayersLastUpdate', 'lastUpdated', 'rankedSongsLastUpdated']
    .map(key => keyValue.push({key, value: cache?.[key] ? dateFromString(cache[key]) : null}));

  store = transaction.objectStore('key-value');
  promises = keyValue.map(data => store.put(data.value, data.key));
  await Promise.all(promises);

  const groups = getPlayerGroups(cache) ?? {};
  store = transaction.objectStore('groups');
  promises = Object.values(groups).reduce((cum, group) => cum.concat(group.players.map(playerId => store.put({name: group.name, playerId}))), []);
  await Promise.all(promises);

  await transaction.done;
}

export const fetchLocalForageData = async _ => {
  log.info("Data fetch from OLD cache");

  const CURRENT_CACHE_VERSION = 1.5;

  const prepareFreshCache = () => ({
    version: CURRENT_CACHE_VERSION,
    lastUpdated: null,
    users: {},
    rankedSongs: null,
    rankedSongsLastUpdated: null,
    beatSaver: {}
  });

  let cache = (await getLocalforageCache()) ?? prepareFreshCache();

  if(cache.version < 1.2) {
    log.warn("The old data format is no longer supported, sorry. Initializing fresh cache.");
    cache = prepareFreshCache();
  }

  if (!cache.config) {
    if (!cache.config) cache.config = {};
    if (!cache.config.users) cache.config.users = {main: null, country: null, additionalForCountry: ADDITIONAL_COUNTRY_PLAYERS_IDS, groups: []};
    if (!cache.config.songBrowser) cache.config.songBrowser = {};
    if (!cache.config.songLeaderboard) cache.config.songLeaderboard = {};
    if (!cache.config.profile) cache.config.profile = {};
    if (!cache.config.ss) cache.config.ss = {song: {}};

    cache.config.profile.enlargeAvatar = true;
    cache.config.profile.showOnePpCalc = true;
    cache.config.profile.showTwitchIcon = false;
    cache.config.profile.showChart = true;

    cache.config.songBrowser.autoTransform = false;
    cache.config.songBrowser.defaultView = 'compact';
    cache.config.songBrowser.defaultType = 'all';
    cache.config.songBrowser.defaultSort = 'timeset';
    cache.config.songBrowser.showColumns = ['timeset', 'rank', 'pp', 'acc', 'score', 'diff', 'icons']
    cache.config.songBrowser.showIcons = ['bsr', 'bs', 'preview', 'twitch'];

    cache.config.songLeaderboard.showDiff = true;
    cache.config.songLeaderboard.showWhatIfPp = true;

    cache.config.ss.song.enhance = true;
    cache.config.ss.song.showDiff = true;
    cache.config.ss.song.showWhatIfPp = true;
  }
  if (!cache.config.others) cache.config.others = {theme: 'darkss'}

  if (cache.config.others.bgDownload === undefined) cache.config.others.bgDownload = true;
  if (cache.config.others.viewsUpdate === undefined) cache.config.others.viewsUpdate = 'keep-view';

  if (cache.config.others.language === undefined) cache.config.others.language = cache.lastUpdated ? 'pl' : 'en';
  if (cache.config.others.locale === undefined) cache.config.others.locale = cache.lastUpdated ? 'pl-PL' : 'en-US';

  if (!cache.config.songLeaderboard.defaultType) cache.config.songLeaderboard.defaultType = 'country';

  setThemeInFastCache(cache.config.others.theme);

  if(cache.version === 1.2) {
    cache.config.profile.showTwitchIcon = true
    cache.version = 1.3;
  }

  if (cache.version === 1.3) {
    // fix timeset bug - forceDb refetch all scores since fuckup day (commit 822ac040)
    const fuckupDay = dateFromString("2020-09-28T21:09:00Z");

    if (cache.rankedSongsChanges) {
      const rankedSongsChangesTimestamps = Object.keys(cache.rankedSongsChanges).sort((a, b) => a - b).slice(0, 1);
      if (rankedSongsChangesTimestamps.length) {
        const firstTimestamp = parseInt(rankedSongsChangesTimestamps[0], 10);
        if (new Date(firstTimestamp) > fuckupDay) {
          // replacement of the timestamp of the first rankeds download to just before the fuckup (in order not to update all rankeds)
          cache.rankedSongsChanges[fuckupDay.getTime() - 1000*60*60*24] = [...cache.rankedSongsChanges[firstTimestamp]];
          delete cache.rankedSongsChanges[firstTimestamp];
        }
      }
    }

    if (cache.users) {
      const playersToUpdate = Object.values(cache.users)
        .filter(p => p && p.scores)
        .map(player => ({
          id: player.id,
          lastUpdated: player.lastUpdated,
          songsWithoutTimeset: Object.values(player.scores).filter(s => !dateFromString(s.timeset))
        }))
        .filter(p => p.songsWithoutTimeset.length || p.id === cache.config.users.main);

      playersToUpdate.forEach(player => {
        const lastUpdated = dateFromString(player.lastUpdated);
        if (lastUpdated > fuckupDay) {
          cache.users[player.id].lastUpdated = new Date(fuckupDay.getTime());
        }
      })
    }

    if (!cache.config.songBrowser.showColumns.includes('rank'))
      cache.config.songBrowser.showColumns.push('rank');

    cache.version = 1.4;
  }

  return cache;
}

const CACHE_KEY = 'sspl_users';
const getLocalforageCache = async () => new Promise((resolve, reject) =>
  window.localforage.getItem(CACHE_KEY, function (err, value) {
    resolve(value);
  })
);
