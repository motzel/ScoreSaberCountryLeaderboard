import {substituteVars} from "../../utils/format";
import {delay, fetchApiPage, fetchHtmlPage} from "../fetch";
import {arrayUnique, convertArrayToObjectByKey, getFirstRegexpMatch} from "../../utils/js";
import {PLAYER_INFO_URL, USER_PROFILE_URL, USERS_URL} from "./consts";
import queue from "../queue";
import {getCacheAndConvertIfNeeded, setCache} from "../../store";
import {
    getActiveCountryPlayers,
    getManuallyAddedPlayersIds,
    getPlayerInfo, getPlayerInfoFromPlayers,
    getPlayerRankedsScorePagesToUpdate, getPlayers, getPlayerScorePagesToUpdate, getPlayerScores, getScoresByPlayerId
} from "../../scoresaber/players";
import {dateFromString, timestampFromString, toUTCDate} from "../../utils/date";
import {fetchAllNewScores, fetchRecentScores, fetchSsRecentScores} from "./scores";
import eventBus from "../../utils/broadcast-channel-pubsub";
import nodeSync from '../../network/multinode-sync';
import {getActiveCountry} from "../../scoresaber/country";
import {getMainPlayerId} from "../../plugin-config";
import {refreshSongCountryRanksCache} from "../../song";

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
    const player = getPlayerInfoFromPlayers(players, info.playerInfo.playerId);

    const {recentPlay, scores, userHistory} = player ? player : {recentPlay: null, userHistory: {}, scores: {}};

    if (!info.scoreStats || !player) {
        const playerInfo = await fetchPlayerInfo(info.playerInfo.playerId);
        if (info.playerInfo.avatar) playerInfo.playerInfo.avatar = info.playerInfo.avatar;

        return Object.assign({}, players[info.playerInfo.playerId] ?? {}, convertPlayerInfo(playerInfo), {
            profileLastUpdated: new Date(),
            recentPlay,
            scores,
            userHistory
        });
    }

    return Object.assign({}, player ?? {}, info.playerInfo, info.scoreStats);
}
export const updateActivePlayers = async (persist = true) => {
    const data = await getCacheAndConvertIfNeeded();

    const country = await getActiveCountry();

    const previousCountryPlayersIds = (await getActiveCountryPlayers(country)).map(p => p.id);

    // set all cached country players as inactive
    if (data.users)
        Object.keys(data.users).map(userId => {
            if (data.users?.[userId]?.ssplCountryRank) {
                data.users[userId].inactive = true;
                data.users[userId].ssplCountryRank = null;
            }
        })

    const page = 1;

    const mainPlayerId = await getMainPlayerId();

    const countryPlayers =
      Object.values(convertArrayToObjectByKey(
        (await Promise.all(
          (country
              ? [...(await fetchHtmlPage(queue.SCORESABER, substituteVars(USERS_URL, {country}), page)).querySelectorAll('.ranking.global .player a')]
              : []
          )
            .map(a => {
                  const tr = a.closest("tr");

                  return {
                      playerInfo: {
                          id                : getFirstRegexpMatch(/\/(\d+)$/, a.href),
                          name              : a.querySelector('.songTop.pp').innerText,
                          playerId          : getFirstRegexpMatch(/\/(\d+)$/, a.href),
                          playerName        : a.querySelector('.songTop.pp').innerText,
                          avatar            : tr.querySelector('td.picture img').src,
                          countryRank       : parseInt(getFirstRegexpMatch(/^\s*#(\d+)\s*$/, tr.querySelector('td.rank').innerText), 10),
                          pp                : parseFloat(getFirstRegexpMatch(/^\s*([0-9,.]+)\s*$/, tr.querySelector('td.pp .scoreTop.ppValue').innerText).replace(/[^0-9.]/, '')),
                          country           : getFirstRegexpMatch(/^.*?\/flags\/([^.]+)\..*$/, tr.querySelector('td.player img').src).toUpperCase(),
                          inactive          : false,
                          weeklyDiff        : parseInt(tr.querySelector('td.diff').innerText, 10),
                          profileLastUpdated: new Date()
                      },
                      scoreStats: {}
                  }
              }
            )
            .concat(getAdditionalPlayers(country).concat(mainPlayerId ? [mainPlayerId] : []).map(playerId => ({
                playerInfo: {
                    playerId,
                    inactive: false
                }
            })))
            .map(async info => updatePlayerInfo(info, data?.users))
        )),
        'id'
      ))
            .sort((a, b) => b.pp - a.pp)
            .map((u, idx) => ({...u, ssplCountryRank: {[country]: idx + 1}}))
            .slice(0, 50);

    const countryPlayersIds = countryPlayers.map(player => player.id);

    const manuallyAddedPlayers = await Promise.all(
        (await getManuallyAddedPlayersIds(country))
            .filter(playerId => !countryPlayersIds.includes(playerId))
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

    if (country) {
        const removedPlayers = previousCountryPlayersIds.filter(playerId => !countryPlayersIds.includes(playerId));
        const newPlayers = countryPlayersIds.filter(playerId => !previousCountryPlayersIds.includes(playerId));
        const changedPlayers = newPlayers.concat(removedPlayers);

        const players = await getPlayers();
        const leaderboardIds = [...new Set(
            Object.values(players ?? {})
                .filter(player => player && player.id && changedPlayers.includes(player.id))
                .map(player => Object.keys(player.scores))
                .filter(s => s && s.length)
                .reduce((cum, ids) => cum.concat(ids), [])
        )];
        await refreshSongCountryRanksCache(leaderboardIds);
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

    let leaderboardIdsToRefresh = newScores && newScores.scores ? Object.keys(newScores.scores) : [];

    if(newScores && newScores.scores) {
        const prevScores = player.scores ?? {};
        Object.keys(newScores.scores).map(leaderboardId => {
            const prevScore = prevScores[leaderboardId] ? prevScores[leaderboardId] : null;
            if(prevScore) {
                if (!newScores.scores[leaderboardId].history)
                    newScores.scores[leaderboardId].history = prevScore?.history && prevScore.history.length ? prevScore.history.filter(h => h.timestamp) : [];

                const {pp, rank, score, uScore, timeset} = prevScore;
                if (timeset && score && uScore && (newScores?.scores?.[leaderboardId]?.score && newScores?.scores?.[leaderboardId]?.score !== score))
                    newScores.scores[leaderboardId].history.push(
                        {pp, rank, score, uScore, timestamp: timestampFromString(timeset)}
                    )

                    newScores.scores[leaderboardId].history = newScores.scores[leaderboardId].history.slice(0,3);
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
                name: `${player.name}`,
                page: idxProgress + 1,
                total: null
            };

            if (progressCallback) progressCallback(progressInfo);

            const scores = convertArrayToObjectByKey(
                await fetchRecentScores(
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

        leaderboardIdsToRefresh = leaderboardIdsToRefresh.concat(Object.keys(updatedPlayerScores));
    }

    await refreshSongCountryRanksCache(leaderboardIdsToRefresh);

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

const emitEventForScoreUpdate = (eventName, playerId, data = {}) => {
    eventBus.publish(eventName, {
        ...data,
        nodeId: nodeSync.getId(),
        playerId,
    });
}

const emitEventForScoresUpdate = (eventName, playerId, leaderboardIds) => {
    leaderboardIds.forEach(leaderboardId => emitEventForScoreUpdate(eventName, playerId, {leaderboardId}));
}

export const setRefreshedPlayerScores = async (playerId, scores) => {
    const data = await getCacheAndConvertIfNeeded();

    const playerScores = await getScoresByPlayerId(playerId);
    if (!playerScores) {
        emitEventForScoresUpdate('player-score-update-failed', playerId, scores.map(s => s.leaderboardId));

        return false;
    }

    scores.forEach(s => {
        if (!s.leaderboardId) return;

        if (!playerScores[s.leaderboardId]) {
            emitEventForScoreUpdate('player-score-update-failed', playerId, {leaderboardId: s.leaderboardId});

            return;
        }

        if (!s.timeset) delete s.timeset;

        playerScores[s.leaderboardId] = {...playerScores[s.leaderboardId], ...s, lastUpdated: new Date()};

        emitEventForScoreUpdate('player-score-updated', playerId, playerScores[s.leaderboardId]);
    })

    await setCache(data);

    return true;
}

let playersPagesInProgress = {};
eventBus.on('player-scores-page-update-start', ({playerId, page}) => {
    if (!playersPagesInProgress[playerId]) playersPagesInProgress[playerId] = [];

    playersPagesInProgress[playerId] = arrayUnique(playersPagesInProgress[playerId].concat(page));
})
eventBus.on('player-scores-page-updated', ({playerId, page}) => {
    if (!playersPagesInProgress[playerId]) return;

    playersPagesInProgress[playerId] = playersPagesInProgress[playerId].filter(p => p !== page);
})

export const fetchScores = async (playerId, page = 1, ssTimeout = 3000) => {
    try {
        return await Promise.race([
            fetchSsRecentScores(playerId, page),
            delay(ssTimeout, null, true)
        ]);
    }
    catch(e) {
        return await fetchRecentScores(playerId, page);
    }
}

export const refreshPlayerScores = async (playerId, leaderboardIds, lastScoreTimeset = null) => {
    let pages = [];
    let playerScoresPages = null;

    try {
        emitEventForScoresUpdate('player-score-update-start', playerId, leaderboardIds);

        const playerInfo = await getPlayerInfo(playerId);
        if (!playerInfo || !playerInfo.scores) throw 'Player not found';

        const cachedRecentPlay = dateFromString(playerInfo.recentPlay);
        if (!lastScoreTimeset || !cachedRecentPlay || cachedRecentPlay < lastScoreTimeset) {
            await updatePlayerScores(playerId);
        }

        const pagesInProgress = playersPagesInProgress[playerId] ?? [];

        playerScoresPages = getPlayerScorePagesToUpdate(playerInfo.scores, leaderboardIds, true);

        pages = Object.keys(playerScoresPages).filter(p => !pagesInProgress.includes(p));

        pages.forEach(page => {
            emitEventForScoreUpdate('player-scores-page-update-start', playerId, {page});

            if (playerScoresPages[page])
                playerScoresPages[page].all.forEach(leaderboardId => emitEventForScoreUpdate('player-score-update-start', playerId, {leaderboardId}));
        });

        let refreshedPlayerScores = {};
        let tryNum = 0;
        let pagesDownloaded = [];
        let dlPages = [...pages];
        while(dlPages.length && tryNum < 3) {
            for (const page of dlPages) {
                if (pagesDownloaded.includes(page)) continue;

                try {
                    refreshedPlayerScores = {
                        ...refreshedPlayerScores,
                        ...convertArrayToObjectByKey(
                            (await fetchScores(
                                playerId,
                                page,
                            )).map(s => ({
                                leaderboardId: s.leaderboardId,
                                rank: s.rank,
                            })),
                          'leaderboardId'
                        )
                    };
                }
                catch(e) {
                    // swallow error in order to dl in next try
                }

                pagesDownloaded.push(page);
            }

            tryNum++;

            const pagesWithNotFoundScores = arrayUnique(pages.reduce((cum, page) => {
                // check if all searched scores has been found on calculated scores page
                if (!playerScoresPages[page]) return cum;

                const notFoundLeaderboardIds = playerScoresPages[page].searched.filter(leaderboardId => !refreshedPlayerScores[leaderboardId])

                return notFoundLeaderboardIds.length ? cum.concat([page - tryNum]) : cum;
            }, []));

            dlPages = pagesWithNotFoundScores.filter(page => page > 0);
        }

        pages.forEach(page => emitEventForScoreUpdate('player-scores-page-updated', playerId, {page}));

        return (await setRefreshedPlayerScores(playerId, Object.values(refreshedPlayerScores)));
    }
    catch (e) {
        emitEventForScoresUpdate('player-score-update-failed', playerId, leaderboardIds);

        pages.forEach(page => {
            emitEventForScoreUpdate('player-scores-page-updated', playerId, {page});

            if (playerScoresPages[page])
                playerScoresPages[page].all.forEach(leaderboardId => emitEventForScoreUpdate('player-score-update-failed', playerId, {leaderboardId}));
        });

        return false;
    }
}
