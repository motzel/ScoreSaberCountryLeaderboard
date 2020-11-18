import {capitalize, convertArrayToObjectByKey} from "./utils/js";
import {shouldBeHidden} from "./eastereggs";
import {getSongByHash} from "./network/beatsaver";
import {
    getActiveCountryPlayers,
    getAllActivePlayers,
    getFriends,
    getPlayerSongScore,
} from "./scoresaber/players";
import {getActiveCountry} from "./scoresaber/country";
import {getCacheAndConvertIfNeeded} from "./store";
import scoresRepository from './db/repository/scores'

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

export async function refreshSongCountryRanksCache(leaderboardIds = []) {
    const country = await getActiveCountry();
    if (!country) return;

    const players = (await getActiveCountryPlayers(country, false))
    if (!leaderboardIds || !leaderboardIds.length)
        leaderboardIds = [...new Set(players.reduce((cum, player) => cum.concat(Object.keys(player.scores)), []))];

    const data = await getCacheAndConvertIfNeeded();

    for (let leaderboardId of leaderboardIds.map(s => parseInt(s, 10))) {
        const scores = players
            .map(player => {
                // TODO: getPlayerSongScore should by awaited
                const score = getPlayerSongScore(player, leaderboardId);
                return score && score.score ? {playerId: player.id, score: score.score} : null;
            })
            .filter(s => s)
            .sort((a, b) => b.score - a.score);

        scores.forEach((d, pos) => {
            if (!data.users[d.playerId].scores[leaderboardId].ssplCountryRank)
                data.users[d.playerId].scores[leaderboardId].ssplCountryRank = {[country]: null};

            data.users[d.playerId].scores[leaderboardId].ssplCountryRank[country] = {
                rank: pos + 1,
                total: scores.length
            };
        });
    }
}

export const getSongScores = async (leaderboardId, count = undefined) => scoresRepository().getAllFromIndex('scores-leaderboardId', leaderboardId, count);

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

export async function getSongMaxScore(hash, diff) {
    const songInfo = await getSongByHash(hash);
    const songCharacteristics = songInfo?.metadata?.characteristics;
    const diffInfo = findDiffInfo(songCharacteristics, diff);

    return diffInfo?.length && diffInfo?.notes ? getMaxScore(diffInfo.notes) : 0;
}

export async function getSongMaxScoreWithDiffAndType(hash, diffAndType, cacheOnly = false, forceUpdate = false) {
    const songInfo = await getSongByHash(hash, forceUpdate, cacheOnly);
    const songCharacteristics = songInfo?.metadata?.characteristics;
    const diffInfo = findDiffInfoWithDiffAndType(songCharacteristics, diffAndType);

    return diffInfo?.length && diffInfo?.notes ? getMaxScore(diffInfo.notes) : 0;
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