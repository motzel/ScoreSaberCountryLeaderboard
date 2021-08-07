import {capitalize, convertArrayToObjectByKey, isEmpty} from "./utils/js";
import {getPlayerName, shouldBeHidden} from "./eastereggs";
import {getSongByHash} from "./network/beatsaver";
import {
  getActiveCountryPlayers,
  getActiveCountryPlayersIds,
  getAllActivePlayers,
  getAllScores,
  getFriends,
} from "./scoresaber/players";
import {getActiveCountry} from "./scoresaber/country";
import scoresRepository from './db/repository/scores'
import {getSsplCountryRanks, setSsplCountryRanks} from './scoresaber/sspl-cache'
import eventBus from './utils/broadcast-channel-pubsub'
import nodeSync from './utils/multinode-sync'
import {getAccTooltipFromTrackers} from './scoresaber/beatsavior'

// rankeds with incorrect maxScore in SS
const FUCKED_UP_RANKEDS = {"1950":798675,"1962":747155,"2720":468395,"2895":651475,"2900":531875,"3231":374555,"4022":262315,"6004":516235,"8270":176755,"9007":476675,"9023":324875,"9025":181355,"9028":141795,"11909":340515,"17020":449995,"18691":237475,"18728":438955,"19580":491395,"21628":357075,"21670":254035,"23871":594435,"29546":227355,"30818":383755,"33282":639515,"40338":311995,"40892":249435,"41481":605475,"45370":539235,"50288":824435,"50328":526355,"51360":946795,"58409":597195,"58412":721395,"59096":424235,"59409":320275,"61728":2001115,"66449":771995,"66930":875035,"66944":599035,"78657":426075,"79636":576035,"84513":487715,"99196":492315};

export const diffColors = {
    easy: 'MediumSeaGreen',
    normal: '#59b0f4',
    hard: 'tomato',
    expert: '#bf2a42',
    expertPlus: '#8f48db'
}

export function getDiffColor(diffInfo) {
    return diffColors[diffInfo.diff] ? diffColors[diffInfo.diff] : null;
}

export function getHumanDiffInfo(diffInfo) {
    if (!diffInfo || !diffInfo.diff) return null;

    const name = capitalize(diffInfo.diff).replace('ExpertPlus', 'Expert+');
    const typeSuffix = diffInfo.type !== 'Standard' ? '/' + diffInfo.type : '';

    switch(name) {
        case 'Easy':
            return {name, type: diffInfo.type, fullName: name + typeSuffix, shortName: 'Es', difficulty: 1, color: getDiffColor(diffInfo)};
        case 'Normal':
            return {name, type: diffInfo.type, fullName: name + typeSuffix, shortName: 'N', difficulty: 3, color: getDiffColor(diffInfo)};
        case 'Hard':
            return {name, type: diffInfo.type, fullName: name + typeSuffix, shortName: 'H', difficulty: 5, color: getDiffColor(diffInfo)};
        case 'Expert':
            return {name, type: diffInfo.type, fullName: name + typeSuffix, shortName: 'Ex', difficulty: 7, color: getDiffColor(diffInfo)};
        case 'Expert+':
            return {name, type: diffInfo.type, fullName: name + typeSuffix, shortName: 'E+', difficulty: 9, color: getDiffColor(diffInfo)};

        default: return null;
    }
}

export const getMaxScore = (blocks, maxScorePerBlock = 115) =>
    Math.floor(
        (blocks >= 14 ? 8 * maxScorePerBlock * (blocks - 13) : 0) +
        (blocks >= 6
            ? 4 * maxScorePerBlock * (Math.min(blocks, 13) - 5)
            : 0) +
        (blocks >= 2
            ? 2 * maxScorePerBlock * (Math.min(blocks, 5) - 1)
            : 0) +
        Math.min(blocks, 1) * maxScorePerBlock
    );

export function extractDiffAndType(ssDiff) {
    const match = /^_([^_]+)_Solo(.*)$/.exec(ssDiff);
    if (!match) return null;

    return {
        diff: match[1].toLowerCase().replace('plus', 'Plus'),
        type: match[2] ?? 'Standard'
    };
}

export function getDiffAndTypeFromOnlyDiffName(ssString) {
    return extractDiffAndType('_' + ssString.replace('Expert+', 'ExpertPlus') + '_SoloStandard');
}

export const updateSongCountryRanks = async (onlyLeaderboardsIds = null) => {
  const country = await getActiveCountry();
  if (!country) return {};

  const countryPlayersIds = await getActiveCountryPlayersIds(country, true);

  const ssplCountryRanks = await getSsplCountryRanks();
  const shouldProcessAllLeaderboards = isEmpty(ssplCountryRanks) || !onlyLeaderboardsIds;

  const scores = (await getAllScores() ?? [])
    .filter(score => score.score && countryPlayersIds.includes(score.playerId) && (
        shouldProcessAllLeaderboards ||
        (onlyLeaderboardsIds && onlyLeaderboardsIds.includes(score.leaderboardId))
      ),
    );

  const leaderboards = convertArrayToObjectByKey(scores, 'leaderboardId', true);
  Object.keys(leaderboards).forEach(leaderboardId => {
    ssplCountryRanks[leaderboardId] = leaderboards[leaderboardId]
      .sort((a, b) => b.score !== a.score ? b.score - a.score : a.timeset - b.timeset)
      .map((score, idx, leaderboard) => ({
        playerId: score.playerId,
        ssplCountryRank: {[country]: {rank: idx + 1, total: leaderboard.length}},
      }))
      .reduce((cum, rank) => {
        cum[rank.playerId] = rank.ssplCountryRank;
        return cum;
      }, {})
    ;
  });

  await setSsplCountryRanks(ssplCountryRanks);

  eventBus.publish('sspl-country-ranks-cache-updated', {nodeId: nodeSync().getId(), ssplCountryRanks, onlyLeaderboardsIds});

  return ssplCountryRanks;
}

export const getAnySongScore = async (leaderboardId) => scoresRepository().getFromIndex('scores-leaderboardId', leaderboardId);
export const getSongScores = async (leaderboardId) => scoresRepository().getAllFromIndex('scores-leaderboardId', leaderboardId);

export function getFixedLeaderboardMaxScore(leaderboardId, maxScore = null) {
  return leaderboardId && FUCKED_UP_RANKEDS[leaderboardId] ? FUCKED_UP_RANKEDS[leaderboardId] : maxScore;
}

export function getAccFromScore(score, maxSongScore = null, percentageInsteadOfAcc = false) {
    const scoreMult = !percentageInsteadOfAcc && score.uScore && score.score ? score.score / score.uScore : 1

    return maxSongScore
      ? score.score / maxSongScore / scoreMult * 100
      : (score.maxScoreEx
        ? score.score / score.maxScoreEx / scoreMult * 100
        : null)
}

export async function getLeaderboard(leaderboardId, country, type = 'country') {
    let players;
    switch(type) {
      case 'all':
        players = await getAllActivePlayers(country);
        break;

      case 'manually_added':
        players = await getFriends(country, true);
        break;

      case 'country_and_friends':
        const countryPlayers = await getActiveCountryPlayers(country, true);
        const friendsFromCountry = (await getFriends(country, true)).filter(p => p.country && country && p.country.toLowerCase() === country.toLowerCase());
        players = Object.values({...convertArrayToObjectByKey(countryPlayers, 'id'), ...convertArrayToObjectByKey(friendsFromCountry, 'id')});
        break;

      case 'country':
      default:
        players = await getActiveCountryPlayers(country, true);
        break;
    }
    if (!players || !players.length) return [];

    const songScores = await getSongScores(leaderboardId);
    if (!songScores) return [];

    const playersIds = players.filter(player => player.name).map(player => player.id);

    const filteredScores = songScores.filter(s => playersIds.includes(s.playerId));
    if (!filteredScores.length) return [];

    const maxSongScore = filteredScores[0].hash && songScores?.[0]?.diffInfo ? await getSongMaxScore(filteredScores[0].hash, songScores[0].diffInfo, leaderboardId) : null;

    players = convertArrayToObjectByKey(players, 'id');

    return filteredScores
      .map(score => {
        const player = players[score.playerId];
        if (!player) return null;

        const playHistory = (score.history ?? []).map(score => ({...score, acc: getAccFromScore(score, maxSongScore), timeset: new Date(score.timestamp)}));

        return {
          ...player,
          songHash: score.hash,
          score: score.score,
          timeset: score.timeset,
          rank: score.rank,
          mods: score.mods,
          pp: score.pp,
          playHistory,
          acc: getAccFromScore(score, maxSongScore),
          accTooltip: getAccTooltipFromTrackers(score?.beatSavior?.trackers)
        };
      })
      .filter(score => score) // filter out empty items
      .map(score => ({...score, hidden: shouldBeHidden(score)}))
      .sort((a, b) => b.score !== a.score ? b.score - a.score : a.timeset - b.timeset)
      .map((score, idx) => ({...score, name: getPlayerName(score.name, idx)}));
}

export async function getSongMaxScore(hash, diffInfo, leaderboardId = null, cacheOnly = false, forceUpdate = false, maxScorePerBlock = 115) {
  if (leaderboardId) {
    const leaderboardMaxScore = getFixedLeaderboardMaxScore(leaderboardId);
    if (leaderboardMaxScore) return leaderboardMaxScore;
  }

  if (!diffInfo?.diff || !diffInfo?.type) return null;

  const songInfo = await getSongByHash(hash, forceUpdate, cacheOnly);
  const diffStats = (songInfo?.versions?.[0]?.diffs ?? []).find(d => d.characteristic === diffInfo.type && d.difficulty === capitalize(diffInfo.diff))
  if (!diffStats || !diffStats?.notes) return null;

  return getMaxScore(diffStats.notes);
}

export async function getLeaderboardMaxScore(leaderboardId, hash, difficulty, mods=[], cacheOnly = false, maxScorePerBlock = 115) {
  const score = await getAnySongScore(leaderboardId);
  if (!score && (!hash || !difficulty)) return null;

  const diffInfo = score?.diffInfo ?? {type: 'Standard', diff: difficulty};

  return getSongMaxScore(hash, diffInfo, leaderboardId, cacheOnly, false, maxScorePerBlock);
}

export async function getSongDiffInfo(hash, diffAndType, leaderboardId = null, cacheOnly = false) {
    if (!diffAndType?.diff || !diffAndType?.type) return null;

    const songInfo = await getSongByHash(hash, false, cacheOnly);
    if (!songInfo) return null;

    const diffInfo = (songInfo?.versions?.[0]?.diffs ?? []).find(d => d.characteristic === diffAndType.type && d.difficulty === capitalize(diffAndType.diff));
    const bpm = songInfo?.metadata?.bpm ?? null;

    return Object.assign(
        {bpm, maxScore: await getSongMaxScore(hash, diffAndType, leaderboardId, true)},
        songInfo,
        diffInfo
    );
}