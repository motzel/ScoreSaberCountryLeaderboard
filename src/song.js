import {capitalize} from "./utils/js";
import {getCacheAndConvertIfNeeded} from "./store";
import {shouldBeHidden} from "./eastereggs";
import {getSongByHash} from "./network/beatsaver";
import {
  getActiveCountryPlayers,
  getAllActivePlayers, getFriends,
  getManuallyAddedPlayers
} from "./scoresaber/players";

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

export async function getLeaderboard(leaderboardId, country, type = 'country') {
    const data = await getCacheAndConvertIfNeeded();

    let scores;
    switch(type) {
      case 'all':
        scores = await getAllActivePlayers(country);
        break;

      case 'manually_added':
        scores = await getFriends(country, true);
        break;

      case 'country':
      default:
        scores = await getActiveCountryPlayers(country, true);
        break;
    }
    if (!scores || !scores.length) return [];

    const filteredScores = scores
        .map(player => player?.scores?.[leaderboardId] ? {playerId: player.id, songHash: player?.scores[leaderboardId].id} : null)
        .filter(s => s)
    ;
    if (!filteredScores.length) return [];

    const songInfo = filteredScores[0].songHash ? await getSongByHash(filteredScores[0].songHash) : null;
    const songCharacteristics = songInfo?.metadata?.characteristics;
    let diffInfo = null, maxSongScore = 0;

    return filteredScores.map(s => s.playerId)
        .reduce((cum, userId) => {
            if (!data.users[userId].scores[leaderboardId]) return cum;

            if (!maxSongScore && !cum.length) {
                diffInfo = findDiffInfo(
                    songCharacteristics,
                    data.users[userId].scores[leaderboardId].diff
                );
                maxSongScore =
                    diffInfo?.length && diffInfo?.notes
                        ? getMaxScore(diffInfo.notes)
                        : 0;
            }

            const { scores, ...user } = data.users[userId];
            const {
                id: songHash,
                score,
                uScore,
                timeset,
                rank,
                mods,
                pp,
                maxScoreEx,
                diff,
                history,
                ..._
            } = data.users[userId].scores[leaderboardId];

            const playHistory = (history ? history: [])
                .sort((a, b) => b.timestamp - a.timestamp)
                .map(h => Object.assign(
                    {},
                    h,
                    {
                        timeset: new Date(h.timestamp),
                        percent: maxSongScore
                            ? h.score / maxSongScore / (h.uScore ? h.score / h.uScore : 1)
                            : (maxScoreEx
                                ? h.score / maxScoreEx / (h.uScore ? h.score / h.uScore : 1)
                                : null)
                    }
                ));

            const scoreMult = uScore && score ? score / uScore : 1
            cum.push(
                Object.assign({}, user, {
                    songHash,
                    score,
                    timeset,
                    rank,
                    mods,
                    pp,
                    playHistory,
                    percent: maxSongScore
                        ? score / maxSongScore / scoreMult
                        : (maxScoreEx
                            ? score / maxScoreEx / scoreMult
                            : null)
                })
            );

            return cum;
        }, [])
        .map((u) => Object.assign({}, u, {hidden: shouldBeHidden(u)}))
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