import {capitalize, convertArrayToObjectByKey, isEmpty} from "./utils/js";
import {shouldBeHidden} from "./eastereggs";
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
import nodeSync from './network/multinode-sync'

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

export function findDiffInfoWithDiffAndType(characteristics, diffAndType) {
    if (!characteristics || !diffAndType) return null;

    return characteristics.reduce((cum, ch) => {
        if (ch.name === diffAndType.type) {
            return ch.difficulties?.[diffAndType.diff];
        }

        return cum;
    }, null);
}
export function findDiffInfo(characteristics, ssDiff) {
    return findDiffInfoWithDiffAndType(characteristics, extractDiffAndType(ssDiff));
}

export const updateSongCountryRanks = async (onlyLeaderboardsIds = null) => {
  const country = await getActiveCountry();
  if (!country) return {};

  const countryPlayersIds = await getActiveCountryPlayersIds(country, true, true);

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
      .sort((a, b) => b.score - a.score)
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

  eventBus.publish('sspl-country-ranks-cache-updated', {nodeId: nodeSync.getId(), ssplCountryRanks});

  return ssplCountryRanks;
}

export const getSongScores = async (leaderboardId) => scoresRepository().getAllFromIndex('scores-leaderboardId', leaderboardId);

export function getAccFromScore(score, maxSongScore) {
    const scoreMult = score.uScore && score.score ? score.score / score.uScore : 1

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

      case 'country':
      default:
        players = await getActiveCountryPlayers(country, true);
        break;
    }
    if (!players || !players.length) return [];

    const songScores = await getSongScores(leaderboardId);
    if (!songScores) return [];

    const playersIds = players.map(player => player.id);

    const filteredScores = songScores.filter(s => playersIds.includes(s.playerId));
    if (!filteredScores.length) return [];

    const songInfo = filteredScores[0].hash ? await getSongByHash(filteredScores[0].hash) : null;
    const songCharacteristics = songInfo?.metadata?.characteristics;
    let diffInfo = null, maxSongScore = undefined;

    players = convertArrayToObjectByKey(players, 'id');

    return filteredScores
      .map(score => {
        const player = players[score.playerId];
        if (!player) return null;

        if (maxSongScore === undefined) {
          diffInfo = findDiffInfoWithDiffAndType(songCharacteristics, score.diffInfo);
          maxSongScore = diffInfo?.length && diffInfo?.notes ? getMaxScore(diffInfo.notes) : null;
        }

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
        };
      })
      .filter(score => score) // filter out empty items
      .map(score => ({...score, hidden: shouldBeHidden(score)}))
      .sort((a, b) => b.score - a.score);
}

export function getMaxScoreFromSongCharacteristics(songCharacteristics, diffInfo, maxScorePerBlock = 115) {
  const songDiffInfo = findDiffInfoWithDiffAndType(songCharacteristics, diffInfo);

  return songDiffInfo?.length && songDiffInfo?.notes ? getMaxScore(songDiffInfo.notes, maxScorePerBlock) : 0;
}

export async function getSongMaxScore(hash, diffInfo, cacheOnly = false, forceUpdate = false, maxScorePerBlock = 115) {
  const songInfo = await getSongByHash(hash, forceUpdate, cacheOnly);
  const songCharacteristics = songInfo?.metadata?.characteristics;
  return getMaxScoreFromSongCharacteristics(songCharacteristics, diffInfo, maxScorePerBlock)
}

export async function getSongDiffInfo(hash, diffAndType, cacheOnly = false) {
    const songInfo = await getSongByHash(hash, false, cacheOnly);
    if (!songInfo) return null;

    const songMetadata = songInfo.metadata;
    if (!songMetadata) return null;

    const songCharacteristics = songMetadata.characteristics;
    if (!songCharacteristics) return null;

    const diffInfo = findDiffInfoWithDiffAndType(songCharacteristics, diffAndType);
    if (!diffInfo) return null;

    return Object.assign(
        {bpm: songMetadata.bpm, maxScore: diffInfo?.length && diffInfo?.notes ? getMaxScore(diffInfo.notes) : 0},
        songInfo,
        diffInfo
    );
}