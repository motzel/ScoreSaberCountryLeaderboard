import {fetchApiPage, fetchHtmlPage, NotFoundError} from "../fetch";
import {substituteVars} from "../../utils/format";
import {SCORES_URL, SS_SCORES_URL} from "./consts";
import {dateFromString} from "../../utils/date";
import queue from "../queue";
import eventBus from "../../utils/broadcast-channel-pubsub";
import {getFirstRegexpMatch} from "../../utils/js";
import {parseSsInt} from "../../scoresaber/other";

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

export const parseSsUserScores = doc => [...doc.querySelectorAll('table.ranking tbody tr')].map(tr => {
    let ret = {tr, lastUpdated: new Date()};

    const rank = tr.querySelector('th.rank');
    if (rank) {
        const rankMatch = parseSsInt(rank.innerText);
        ret.rank = rankMatch ?? null;
    } else {
        ret.rank = null;
    }

    const song = tr.querySelector('th.song a');
    if (song) {
        const leaderboardMatch = getFirstRegexpMatch(/leaderboard\/(\d+)/, song.href);
        ret.leaderboardId = leaderboardMatch ? parseInt(leaderboardMatch, 10) : null;
    } else {
        ret.leaderboardId = null;
    }

    const img = tr.querySelector('th.song img');
    ret.songImg = img ? img.src : null;

    const imgMatch = img.src.match(/([^\/]+)\.(jpg|jpeg|png)$/);
    ret.id = imgMatch ? imgMatch[1] : null;

    const songPp = tr.querySelector('th.song a .songTop.pp');
    const songMatch = songPp ? songPp.innerHTML.match(/^(.*?)\s*<span[^>]+>(.*?)<\/span>/) : null;
    if (songMatch) {
        ret.songName = songMatch[1];
        ret.songDiff = songMatch[2];
    } else {
        ret = Object.assign(ret, {songName: null, songDiff: null});
    }

    const songMapper = tr.querySelector('th.song a .songTop.mapper');
    ret.levelAuthorName = songMapper ? songMapper.innerText : null;

    const songDate = tr.querySelector('th.song span.songBottom.time');
    ret.timeset = songDate ? songDate.title : null;

    const pp = tr.querySelector('th.score .scoreTop.ppValue');
    if (pp) ret.pp = parseFloat(pp.innerText);

    const ppWeighted = tr.querySelector('th.score .scoreTop.ppWeightedValue');
    const ppWeightedMatch = ppWeighted ? getFirstRegexpMatch(/^\(([0-9.]+)pp\)$/, ppWeighted.innerText) : null;
    ret.ppWeighted = ppWeightedMatch ? parseFloat(ppWeightedMatch) : null;

    const scoreInfo = tr.querySelector('th.score .scoreBottom');
    const scoreInfoMatch = scoreInfo ? scoreInfo.innerText.match(/^([^:]+):\s*([0-9,.]+)(?:.*?\((.*?)\))?/) : null;
    if (scoreInfoMatch) {
        switch (scoreInfoMatch[1]) {
            case "score":
                ret.percent = null;
                ret.mods = scoreInfoMatch[3] ? scoreInfoMatch[3] : "";
                ret.score = parseFloat(scoreInfoMatch[2].replace(/[^0-9.]/g, ''));
                break;

            case "accuracy":
                ret.score = null;
                ret.mods = scoreInfoMatch[3] ? scoreInfoMatch[3] : "";
                ret.percent = parseFloat(scoreInfoMatch[2].replace(/[^0-9.]/g, '')) / 100;
                break;
        }
    }

    return ret;
})

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
            if (
                lastUpdated &&
                dateFromString(scorePage[i].timeset) <= lastUpdated
            ) {
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