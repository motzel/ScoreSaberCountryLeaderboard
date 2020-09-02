import {substituteVars} from "../../utils/format";
import {fetchApiPage, fetchHtmlPage} from "../fetch";
import {convertArrayToObjectByKey, getFirstRegexpMatch} from "../../utils/js";
import {PLAYER_INFO_URL, USER_PROFILE_URL, USERS_URL} from "./consts";
import queue from "../queue";
import config from '../../temp';
import {getCacheAndConvertIfNeeded, setCache} from "../../store";
import {
    getActiveCountry,
    getManuallyAddedPlayersIds,
    getPlayerInfo,
    getPlayerRankedsScorePagesToUpdate
} from "../../scoresaber/players";
import {dateFromString, toUTCDate} from "../../utils/date";
import {fetchAllNewScores, fetchScores} from "./scores";
import eventBus from "../../utils/broadcast-channel-pubsub";
import nodeSync from '../../network/multinode-sync';

export const ADDITIONAL_COUNTRY_PLAYERS_IDS = {pl: ['76561198967371424', '76561198093469724', '76561198204804992']};

export const getActivePlayersLastUpdate = async (force = false) => (await getCacheAndConvertIfNeeded(force))?.activePlayersLastUpdate ?? null;
export const getAdditionalPlayers = (country) => ADDITIONAL_COUNTRY_PLAYERS_IDS[country] ?? [];
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

const updatePlayerInfo = async (info, players) => {
    const {recentPlay, scores, userHistory} = players?.[info.playerInfo.playerId]
        ? players?.[info.playerInfo.playerId]
        : {recentPlay: null, userHistory: {}, scores: {}};

    if (!info.scoreStats || !players?.[info.playerInfo.playerId]) {
        const playerInfo = await fetchPlayerInfo(info.playerInfo.playerId);
        if (info.playerInfo.avatar) playerInfo.playerInfo.avatar = info.playerInfo.avatar;

        return Object.assign({}, players[info.playerInfo.playerId] ?? {}, convertPlayerInfo(playerInfo), {
            profileLastUpdated: new Date(),
            recentPlay,
            scores,
            userHistory
        });
    }

    return Object.assign({}, players[info.playerInfo.playerId] ?? {}, info.playerInfo, info.scoreStats);
}
export const updateActivePlayers = async (persist = true) => {
    const data = await getCacheAndConvertIfNeeded();

    const country = await getActiveCountry();

    // set all cached country players as inactive
    if (data.users)
        Object.keys(data.users).map(userId => {
            if (data.users?.[userId]?.ssplCountryRank) {
                data.users[userId].inactive = true;
                data.users[userId].ssplCountryRank = null;
            }
        })

    const page = 1;

    const countryPlayers =
        (await Promise.all(
            [...(await fetchHtmlPage(queue.SCORESABER, substituteVars(USERS_URL, {country: await getActiveCountry()}), page)).querySelectorAll('.ranking.global .player a')]
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
                                weeklyDiff: parseInt(tr.querySelector('td.diff').innerText, 10),
                                profileLastUpdated: new Date()
                            },
                            scoreStats: {}
                        }
                    }
                )
                .concat(getAdditionalPlayers(country).map(playerId => ({
                    playerInfo: {
                        playerId,
                        inactive: false
                    }
                })))
                .map(async info => updatePlayerInfo(info, data?.users))
        ))
            .sort((a, b) => b.pp - a.pp)
            .map((u, idx) => ({...u, ssplCountryRank: {[country]: idx + 1}}))
            .slice(0, 50);

    const manuallyAddedPlayers = await Promise.all(
        (await getManuallyAddedPlayersIds(country))
            .map(playerId => updatePlayerInfo({
                playerInfo: {
                    playerId,
                    inactive: false
                }
            }, data?.users))
    );

    const allPlayers = {
        ...convertArrayToObjectByKey(countryPlayers, 'id'),
        ...convertArrayToObjectByKey(manuallyAddedPlayers, 'id')
    }

    data.activePlayersLastUpdate = new Date().toISOString();

    data.users = {
        ...data.users,
        ...allPlayers
    }

    if (persist) {
        await setCache(data);
    }

    eventBus.publish('active-players-updated', {nodeId: nodeSync.getId(), countryPlayers, manuallyAddedPlayers, allPlayers});

    return Object.values(allPlayers);
}

export const getPlayerWithUpdatedScores = async (playerId, progressCallback = null) => {
    let player = await getPlayerInfo(playerId);
    if (!player) return null;

    // clone player data
    player = {...player};

    const {rank, pp, countryRank, ssplCountryRank} = player;
    player.userHistory = Object.assign({}, player.userHistory ?? {}, {[toUTCDate(new Date())]: {rank, pp, countryRank, ssplCountryRank}})

    const playerLastUpdated = dateFromString(player.lastUpdated ?? null);
    let newScores = await fetchAllNewScores(
        player,
        playerLastUpdated,
        (info) => progressCallback ? progressCallback(info) : null
    );

    if(newScores && newScores.scores) {
        const prevScores = player.scores ?? {};
        Object.keys(newScores.scores).map(leaderboardId => {
            const prevScore = prevScores[leaderboardId] ? prevScores[leaderboardId] : null;
            if(prevScore) {
                if (!newScores.scores[leaderboardId].history) newScores.scores[leaderboardId].history = [];

                const {pp, rank, score, uScore, timeset} = prevScore;
                newScores.scores[leaderboardId].history.push(
                    {pp, rank, score, uScore, timestamp: dateFromString(timeset).getTime()}
                )
            }
        })

        player = {
            ...player,
            previousLastUpdated: dateFromString(player.lastUpdated ? player.lastUpdated : null),
            lastUpdated: new Date().toISOString(),
            recentPlay: newScores.lastUpdated,
            scores: {...prevScores, ...newScores.scores}
        };
    } else {
        player.lastUpdated = new Date().toISOString();
    }

    // update ranked scores if needed
    if (player.scores && playerLastUpdated) {
        // fetch all player pages that need to be re-fetched
        // {pageIdx: [leaderboardId, leaderboardId...]}
        const playerScorePagesToUpdate = await getPlayerRankedsScorePagesToUpdate(player.scores, playerLastUpdated);

        let idxProgress = 0;
        let updatedPlayerScores = {};
        for (const page in playerScorePagesToUpdate) {
            const progressInfo = {
                id: player.id,
                name: `Aktualizacja: ${player.name}`,
                page: idxProgress + 1,
                total: null
            };

            if (progressCallback) progressCallback(progressInfo);

            const scores = convertArrayToObjectByKey(
                await fetchScores(
                    player.id,
                    page,
                    (time) => progressCallback ? progressCallback(Object.assign({}, progressInfo, {wait: time})) : null,
                    ...playerScorePagesToUpdate[page]
                ),
                'leaderboardId'
            );
            updatedPlayerScores = {...updatedPlayerScores, ...scores};

            idxProgress++;
        }

        player.scores = {...player.scores, ...updatedPlayerScores};
    }

    return player;
}

export const updatePlayerScores = async (playerId, persist = true, emitEvents = true, progressCallback = null) => {
    const data = await getCacheAndConvertIfNeeded();

    data.users[playerId] = await getPlayerWithUpdatedScores(playerId, progressCallback);
    data.lastUpdated = new Date().toISOString();

    if (persist) {
        await setCache(data);
    }

    if (emitEvents && data.users[playerId]) {
        eventBus.publish('player-scores-updated', {nodeId: nodeSync.getId(), player: data.users[playerId]});
    }
}