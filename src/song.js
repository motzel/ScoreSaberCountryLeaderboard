import {capitalize} from "./utils/js";
import {getCacheAndConvertIfNeeded} from "./store";
import {shouldBeHidden} from "./eastereggs";
import {findDiffInfo, getSongByHash} from "./network/beatsaver";

export function getDiffColor(diffInfo) {
    const colors = {
        easy: 'MediumSeaGreen',
        normal: '#59b0f4',
        hard: 'tomato',
        expert: '#bf2a42',
        expertPlus: '#8f48db'
    };
    return colors[diffInfo.diff] ? colors[diffInfo.diff] : null;
}

export function getHumanDiffName(diffInfo) {
    return (
        capitalize(diffInfo.diff).replace('ExpertPlus', 'Expert+') +
        (diffInfo.type !== 'Standard' ? '/' + diffInfo.type : '')
    );
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

export async function getLeaderboard(songHash, leaderboardId) {
    const data = await getCacheAndConvertIfNeeded();

    const songInfo = songHash ? await getSongByHash(songHash) : null;
    const songCharacteristics = songInfo?.metadata?.characteristics;
    let diffInfo = null,
        maxSongScore = 0;

    return Object.keys(data.users)
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
                score,
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
                            ? h.score / maxSongScore
                            : (maxScoreEx
                                ? h.score / maxScoreEx
                                : null)
                    }
                ));

            cum.push(
                Object.assign({}, user, {
                    score,
                    timeset,
                    rank,
                    mods,
                    pp,
                    playHistory,
                    percent: maxSongScore
                        ? score / maxSongScore
                        : (maxScoreEx
                            ? score / maxScoreEx
                            : null)
                })
            );

            return cum;
        }, [])
        .map((u) => Object.assign({}, u, {hidden: shouldBeHidden(u)}))
        .sort((a, b) => b.score - a.score);
}