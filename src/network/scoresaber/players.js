import {substituteVars} from "../../utils/format";
import {fetchApiPage, fetchHtmlPage} from "../fetch";
import {getFirstRegexpMatch} from "../../utils/js";
import {PLAYER_INFO_URL, USERS_URL} from "./consts";
import queue from "../queue";
import config from '../../temp';
import {getCacheAndConvertIfNeeded} from "../../store";
import {USER_PROFILE_URL} from "../../scoresaber/players";

export const ADDITIONAL_COUNTRY_PLAYERS_IDS = {pl: ['76561198967371424', '76561198093469724', '76561198204804992']};

export const getAdditionalPlayers = (country = config.COUNTRY) => ADDITIONAL_COUNTRY_PLAYERS_IDS[country] ?? [];
export const convertPlayerInfo = info => {
    const {
        playerName,
        playerId,
        role,
        badges,
        permissions,
        banned,
        history,
        ...playerInfo
    } = info.playerInfo;

    playerInfo.inactive = !!(playerInfo.inactive);

    return Object.assign(
        {
            id: playerId,
            name: playerName,
            playerId,
            playerName,
            url: substituteVars(USER_PROFILE_URL, {
                userId: playerId
            }),
            lastUpdated: null,
            recentPlay: null,

            userHistory: {},
            scores: {}
        },
        playerInfo,
        {stats: info.scoreStats}
    );
};
export const fetchPlayerInfo = async userId => fetchApiPage(queue.SCORESABER_API, substituteVars(PLAYER_INFO_URL, {userId})).then(info => {
    const history = info?.playerInfo?.history.split(',').reverse();
    info.playerInfo.weeklyDiff =  history ? (history.length >= 7 ? history[6] - history[0] : 0) : null;
    return info;
})

export const fetchUsers = async (page = 1) => {
    const data = await getCacheAndConvertIfNeeded();

    return (await Promise.all(
        [...(await fetchHtmlPage(queue.SCORESABER, USERS_URL, page)).querySelectorAll('.ranking.global .player a')]
            .map(a => {
                    const tr = a.closest("tr");

                    return {
                        playerInfo: {
                            id: getFirstRegexpMatch(/\/(\d+)$/, a.href),
                            name: a.querySelector('.songTop.pp').innerText,
                            playerId: getFirstRegexpMatch(/\/(\d+)$/, a.href),
                            playerName: a.querySelector('.songTop.pp').innerText,
                            avatar: tr.querySelector('td.picture img').src,
                            countryRank: parseInt(getFirstRegexpMatch(/^\s*#(\d+)\s*$/, tr.querySelector('td.rank').innerText), 10),
                            pp: parseFloat(getFirstRegexpMatch(/^\s*([0-9,.]+)\s*$/, tr.querySelector('td.pp .scoreTop.ppValue').innerText).replace(/[^0-9.]/, '')),
                            country: getFirstRegexpMatch(/^.*?\/flags\/([^.]+)\..*$/, tr.querySelector('td.player img').src).toUpperCase(),
                            inactive: false,
                            weeklyDiff: parseInt(tr.querySelector('td.diff').innerText, 10)
                        },
                        scoreStats: {}
                    }
                }
            )
            .concat(getAdditionalPlayers().map(playerId => ({playerInfo: {playerId, inactive: false}})))
            .map(async info => {
                const {lastUpdated, recentPlay, scores, userHistory} = data.users?.[info.playerInfo.playerId]
                    ? data.users?.[info.playerInfo.playerId]
                    : {lastUpdated: null, recentPlay: null, userHistory: {}, scores: {}};

                if (!info.scoreStats || !data.users?.[info.playerInfo.playerId]) {
                    const playerInfo = await fetchPlayerInfo(info.playerInfo.playerId);
                    if (info.playerInfo.avatar) playerInfo.playerInfo.avatar = info.playerInfo.avatar;

                    return Object.assign({}, data.users[info.playerInfo.playerId], convertPlayerInfo(playerInfo), {lastUpdated, recentPlay, scores, userHistory});
                }

                return Object.assign({}, data.users[info.playerInfo.playerId], info.playerInfo, info.scoreStats);
            })
    ))
        .sort((a,b) => b.pp - a.pp)
        .map((u,idx) => ({...u, ssplCountryRank: {[config.COUNTRY]: idx+1}}))
}