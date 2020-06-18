import {substituteVars} from "../../utils/format";
import {fetchApiPage, fetchHtmlPage, SsplError} from "../fetch";
import {getFirstRegexpMatch} from "../../utils/js";
import {PLAYER_INFO_URL, SCORESABER_URL, USERS_URL} from "./consts";
import {default as queue} from "../queue";
import {default as config} from '../../temp';

export const USER_PROFILE_URL = SCORESABER_URL + '/u/${userId}';
export const ADDITIONAL_COUNTRY_PLAYERS_IDS = {pl: ['76561198967371424', '76561198093469724']};

export const getAdditionalPlayers = (country = config.COUNTRY) => ADDITIONAL_COUNTRY_PLAYERS_IDS[country] ?? [];
export const fetchPlayerInfo = async (userId) => await fetchApiPage(queue.SCORESABER_API, substituteVars(PLAYER_INFO_URL, {userId}));
export const getUserIds = async (page = 1) => {
    const usersIds = await Promise.all(
        Array.prototype.map.call(
            (await fetchHtmlPage(queue.SCORESABER, USERS_URL, page)).querySelectorAll(
                '.ranking.global .player a'
            ),
            async (a) => getFirstRegexpMatch(/\/(\d+)$/, a.href)
        )
    );
    if (!usersIds || !usersIds.length) throw new SsplError("Can not fetch users list");

    return usersIds.concat(getAdditionalPlayers());
}

export const fetchUsers = async (page = 1) =>
    Promise.all(
        Array.prototype.map.call(await getUserIds(page), async (userId) => {
            const info = await fetchPlayerInfo(userId);
            const {
                playerName,
                playerId,
                role,
                badges,
                banned,
                ...playerInfo
            } = info.playerInfo;

            playerInfo.inactive = !!(playerInfo.inactive);

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
                    id: playerId,
                    name: playerName,
                    url: substituteVars(USER_PROFILE_URL, {
                        userId: playerId
                    }),
                    lastUpdated: null,

                    scores: {}
                },
                playerInfo,
                {stats: info.scoreStats}
            );
        })
    );