import {getCacheAndConvertIfNeeded} from '../store';

export function calcPp(scores, startIdx = 0) {
    return scores.reduce(
        (cum, pp, idx) => cum + Math.pow(0.965, idx + startIdx) * pp,
        0
    );
}

export function calcRawPpAtIdx(bottomScores, idx, expected) {
    const oldBottomPp = calcPp(bottomScores, idx);
    const newBottomPp = calcPp(bottomScores, idx + 1);

    // 0.965^idx * rawPpToFind = expected + oldBottomPp - newBottomPp;
    // rawPpToFind = (expected + oldBottomPp - newBottomPp) / 0.965^idx;
    return (expected + oldBottomPp - newBottomPp) / Math.pow(0.965, idx);
}

export function findRawPp(scores, expected) {
    if (!scores.length) return expected;

    let idx = scores.length - 1;

    while (idx >= 0) {
        const bottomSlice = scores.slice(idx);
        const bottomPp = calcPp(bottomSlice, idx);

        bottomSlice.unshift(scores[idx]);
        const modifiedBottomPp = calcPp(bottomSlice, idx);
        const diff = modifiedBottomPp - bottomPp;

        if (diff > expected) {
            return calcRawPpAtIdx(scores.slice(idx + 1), idx + 1, expected);
        }

        idx--;
    }

    return calcRawPpAtIdx(scores, 0, expected);
}

export function getTotalPp(scores) {
    return Object.values(scores)
        .filter((s) => s.pp > 0)
        .map((s) => s.pp)
        .sort((a, b) => b - a)
        .reduce((cum, pp, idx) => cum + Math.pow(0.965, idx) * pp, 0);
}

export async function getTotalUserPp(userId, modifiedScores = {}) {
    return getTotalPp(
        Object.assign(
            {},
            (await getCacheAndConvertIfNeeded()).users?.[userId]?.scores,
            modifiedScores
        )
    );
}

export async function getWhatIfScore(userId, leaderboardId, pp) {
    const currentTotalPp = await getTotalUserPp(userId);
    const newTotalPp = await getTotalUserPp(userId, {
        [leaderboardId]: { pp }
    });
    return {
        currentTotalPp,
        newTotalPp,
        diff: newTotalPp - currentTotalPp
    };
}

export async function getUserScores(userId) {
    return (await getCacheAndConvertIfNeeded()).users?.[userId]?.scores;
}

export async function getUserSongScore(userId, leaderboardId)
{
    return (await getUserScores(userId))?.[leaderboardId];
}