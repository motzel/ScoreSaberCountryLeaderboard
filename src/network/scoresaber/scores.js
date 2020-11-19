import {fetchApiPage, fetchHtmlPage, NotFoundError} from "../fetch";
import {substituteVars} from "../../utils/format";
import {SCORES_URL, SS_SCORES_URL} from "./consts";
import {dateFromString} from "../../utils/date";
import queue from "../queue";
import eventBus from "../../utils/broadcast-channel-pubsub";
import {parseSsUserScores} from '../../scoresaber/scores'

export const fetchRecentScores = async (userId, page = 1, rateLimitCallback = null, ...leaderboards) =>
    fetchApiPage(queue.SCORESABER_API, substituteVars(SCORES_URL, {userId}), page, rateLimitCallback).then((s) =>
        s && s.scores
            ? s.scores
                .filter(
                    (s) =>
                        !leaderboards.length ||
                        leaderboards.includes(s.leaderboardId)
                )
                .map(s => ({
                    scoreId: s.scoreId,
                    leaderboardId: s.leaderboardId,
                    score: s.score,
                    uScore: s.unmodififiedScore,
                    mods: s.mods,
                    playerId: userId,
                    timeset: s.timeSet,
                    pp: s.pp,
                    weight: s.weight,
                    id: s.songHash,
                    name: s.songName,
                    songSubName: s.songSubName,
                    songAuthorName: s.songAuthorName,
                    levelAuthorName: s.levelAuthorName,
                    diff: s.difficultyRaw,
                    difficulty: s.difficulty,
                    maxScoreEx: s.maxScore,
                    rank: s.rank,
                    lastUpdated: new Date(),
                }))
            : null
    );

export const fetchSsRecentScores = async (userId, page = 1) => parseSsUserScores(await fetchHtmlPage(queue.SCORESABER, substituteVars(SS_SCORES_URL, {userId, page})));

let stopFetchingScores = false;
eventBus.on('stop-fetching-scores-cmd', () => {stopFetchingScores = true;});

export async function fetchAllNewScores(
    user,
    lastUpdated = null,
    progressCallback = null
) {
    let allScores = {
        lastUpdated,
        scores: {}
    };

    let page = 0;
    let recentPlay = null;
    while (++page) {
        if (stopFetchingScores) {
            stopFetchingScores = false;
            queue.SCORESABER_API.clear();
            throw 'Fetching scores aborted';
        }

        const progressInfo = {
            id: user.id,
            name: user.name,
            page: page,
            total: null
        };

        if (progressCallback) progressCallback(progressInfo);

        let scorePage;
        try {
            scorePage = await fetchRecentScores(user.id, page, (time) => {
                if (progressCallback) progressCallback(Object.assign({}, progressInfo, {wait: time}))
            });
        }
        catch(err) {
            // skip 404 errors
            if (! (err instanceof NotFoundError)) throw err;
        }
        if (!scorePage) break;

        // remember most recent play time
        if (page === 1 && scorePage.length) {
            recentPlay = dateFromString(scorePage[0].timeset);
        }

        for (let i in scorePage) {
            const scoreTimeset = dateFromString(scorePage[i].timeset);
            if (lastUpdated && scoreTimeset <= lastUpdated) {
                // remember most recent play time
                if (recentPlay) allScores.lastUpdated = recentPlay;

                return allScores;
            }

            allScores.scores[scorePage[i].leaderboardId] = scorePage[i];
        }

        // remember most recent play time
        if (recentPlay) allScores.lastUpdated = recentPlay;

        if (scorePage.length < 8) break;
    }

    allScores.lastUpdated = recentPlay;

    return allScores;
}