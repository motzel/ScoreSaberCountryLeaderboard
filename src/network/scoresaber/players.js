import {substituteVars} from "../../utils/format";
import {fetchApiPage, fetchHtmlPage} from "../fetch";
import {getFirstRegexpMatch} from "../../utils/js";
import {PLAYER_INFO_URL, SCORESABER_URL, USERS_URL} from "./consts";

export const USER_PROFILE_URL = SCORESABER_URL + '/u/${userId}';
export const ADDITIONAL_PLAYERS_IDS = ['76561198967371424', '76561198093469724'];
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
    ).concat(ADDITIONAL_PLAYERS_IDS);

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