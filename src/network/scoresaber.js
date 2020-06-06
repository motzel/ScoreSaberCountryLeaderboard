import {substituteVars} from "../utils/format";
import {fetchApiPage} from "./api";
import {dateFromString, getFirstRegexpMatch} from "../utils/js";
import {default as config} from "../config";

export const SCORESABER_URL = 'https://scoresaber.com';
const SCORESABER_API_URL = 'https://new.scoresaber.com/api';
const PLAYER_INFO_URL = SCORESABER_API_URL + '/player/${userId}/full';
const USERS_URL = SCORESABER_URL + '/global/${page}?country=' + config.COUNTRY;
const USER_PROFILE_URL = SCORESABER_URL + '/u/${userId}';
const SCORES_URL = SCORESABER_API_URL + '/player/${userId}/scores/recent/${page}';

export const SS_SCORES_PER_PAGE = 12; // song leaderboard
export const SS_PLAYS_PER_PAGE = 8; // top/recent plays

const ADDITIONAL_USER_IDS = ['76561198967371424', '76561198093469724'];

const fetchHtmlPage = async (url, page = 1) =>
    new DOMParser().parseFromString(
        await (await fetch(substituteVars(url, {page}))).text(),
        'text/html'
    );

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


const fetchPlayerInfo = async (userId) => await fetchApiPage(substituteVars(PLAYER_INFO_URL, {userId}));
const getUserIds = async (page = 1) =>
    (
        await Promise.all(
            Array.prototype.map.call(
                (await fetchHtmlPage(USERS_URL, page)).querySelectorAll(
                    '.ranking.global .player a'
                ),
                async (a) => getFirstRegexpMatch(/\/(\d+)$/, a.href)
            )
        )
    ).concat(ADDITIONAL_USER_IDS);
export const fetchUsers = async (page = 1) =>
    Promise.all(
        Array.prototype.map.call(await getUserIds(page), async (userId) => {
            const info = await fetchPlayerInfo(userId);
            const {
                name,
                playerid,
                role,
                badges,
                banned,
                inactive,
                ...playerInfo
            } = info.playerInfo;

            // history is fetched as comma separated values string, let's make it a proper array
            playerInfo.history = playerInfo.history
                ? playerInfo.history
                    .split(',')
                    .map((rank) => {
                        const i = parseInt(rank, 10);
                        return !isNaN(i) ? i : null;
                    })
                    .reverse()
                : null;

            return Object.assign(
                {
                    id: playerid,
                    name: name,
                    url: substituteVars(USER_PROFILE_URL, {
                        userId: playerid
                    }),
                    lastUpdated: null,

                    scores: {}
                },
                playerInfo,
                {stats: info.scoreStats}
            );
        })
    );