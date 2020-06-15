import {getCacheAndConvertIfNeeded} from '../store';
import {dateFromString} from "../utils/date";

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

async function getRankedScores(userId) {
    return Object.values((await getCacheAndConvertIfNeeded())?.users?.[userId].scores)
        ?.filter(s => s.pp > 0)
        ?.map(s => Object.assign({}, s, {timeset: dateFromString(s.timeset), stars: Globals.data.rankedSongs?.[s.leaderboardId]?.stars, acc: s.score/s.maxScoreEx}))
        ?.filter(s => s.stars);
}

// written by BaliBalo: https://github.com/BaliBalo/ScoreSaber/blob/master/pages/peepee.js
function getScoreEstimate(stars, scores) {
    let now = Date.now();
    let decay = 1000 * 60 * 60 * 24 * 15;
    let maxStars = Math.max(...scores.map(e => e.stars));
    let data = scores.reduce((o, score) => {
        let d = 2 * Math.abs(stars - score.stars);
        let front = stars > score.stars ? d * d * d : 1;
        let timeset = score.timeset || now;
        let time = 1 + Math.max(now - timeset, 0) / decay;
        let weight = 1 / (1 + d * time * front);
        o.weight += weight;
        o.sum += score.acc * weight;
        return o;
    }, { weight: 0, sum: 0 });
    let result = data.weight ? data.sum / data.weight : 0;
    if (stars > maxStars) {
        let d = 2 * Math.abs(stars - maxStars);
        result /= (1 + d * d);
    }
    return result;
}
export const PP_PER_STAR = 42.114296;
const ppCurve = [
    { at: 0, value: 0 },
    { at: 45, value: 0.015 },
    { at: 50, value: 0.03 },
    { at: 55, value: 0.06 },
    { at: 60, value: 0.105 },
    { at: 65, value: 0.16 },
    { at: 68, value: 0.24 },
    { at: 70, value: 0.285 },
    { at: 80, value: 0.563 },
    { at: 84, value: 0.695 },
    { at: 88, value: 0.826 },
    { at: 94.5, value: 1.015 },
    { at: 95, value: 1.046 },
    { at: 100, value: 1.12 },
    { at: 110, value: 1.18 },
    { at: 114, value: 1.25 },
];
export function ppFromScore(score) {
    if (!score || score <= 0) {
        return 0;
    }
    let index = ppCurve.findIndex(o => o.at >= score);
    if (index === -1) {
        return ppCurve[ppCurve.length - 1].value;
    }
    if (!index) {
        return ppCurve[0].value;
    }
    let from = ppCurve[index - 1];
    let to = ppCurve[index];
    let progress = (score - from.at) / (to.at - from.at);
    return from.value + (to.value - from.value) * progress;
}