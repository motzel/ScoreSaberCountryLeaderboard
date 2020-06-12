import {fetchApiPage} from "../fetch";
import {substituteVars} from "../../utils/format";
import {SCORES_URL} from "./consts";
import {dateFromString} from "../../utils/date";

export const fetchScores = async (userId, page = 1, ...leaderboards) =>
    fetchApiPage(substituteVars(SCORES_URL, {userId}), page).then((s) =>
        s && s.scores
            ? s.scores.filter(
            (s) =>
                !leaderboards.length ||
                leaderboards.includes(s.leaderboardId)
            )
            : null
    );

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
        if (progressCallback)
            progressCallback({
                id: user.id,
                name: user.name,
                page: page,
                total: null
            });

        let scorePage = await fetchScores(user.id, page);
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