import {capitalize, convertArrayToObjectByKey} from "./utils/js";
import {shouldBeHidden} from "./eastereggs";
import {getSongByHash} from "./network/beatsaver";
import {
    getActiveCountryPlayers,
    getActiveCountryPlayersIds,
    getAllActivePlayers,
    getFriends,
    getPlayerInfoFromPlayers,
    getPlayerScores,
    getPlayerSongScore,
    getPlayerSongScoreHistory,
    getScoresByPlayerId,
    getSongScoreByPlayerId
} from "./scoresaber/players";
import {getActiveCountry} from "./scoresaber/country";
import {getCacheAndConvertIfNeeded, setCache} from "./store";

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

    const filteredScores = players
        .map(player => getPlayerSongScore(player, leaderboardId) ? {playerId: player.id, songHash: getPlayerSongScore(player, leaderboardId).id} : null)
        .filter(s => s)
    ;
    if (!filteredScores.length) return [];

    const songInfo = filteredScores[0].songHash ? await getSongByHash(filteredScores[0].songHash) : null;
    const songCharacteristics = songInfo?.metadata?.characteristics;
    let diffInfo = null, maxSongScore = 0;

    players = convertArrayToObjectByKey(players, 'id');

    return (await filteredScores.map(s => s.playerId)
        .reduce(async (cum, playerId) => {
            cum = await cum;

            const playerSongScore = getPlayerSongScore(getPlayerInfoFromPlayers(players, playerId), leaderboardId);
            if (!playerSongScore) return cum;

            if (!maxSongScore && !cum.length) {
                diffInfo = findDiffInfo(
                    songCharacteristics,
                    playerSongScore.diff
                );
                maxSongScore =
                    diffInfo?.length && diffInfo?.notes
                        ? getMaxScore(diffInfo.notes)
                        : 0;
            }

            const {scores, ...user} = getPlayerInfoFromPlayers(players, playerId);
            const {
                id: songHash,
                score,
                uScore,
                timeset,
                rank,
                mods,
                pp,
                maxScoreEx,
                ..._
            } = playerSongScore;

            const playHistory = await getPlayerSongScoreHistory(playerSongScore, maxSongScore);

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
    )
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