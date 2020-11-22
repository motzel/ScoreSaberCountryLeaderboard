import {substituteVars} from "../../utils/format";
import {delay, fetchApiPage, fetchHtmlPage} from "../fetch";
import {arrayUnique, convertArrayToObjectByKey, getFirstRegexpMatch} from "../../utils/js";
import {PLAYER_INFO_URL, PLAYERS_PER_PAGE, USER_PROFILE_URL, USERS_URL} from "./consts";
import queue from "../queue";
import {getCacheAndConvertIfNeeded, setCache} from "../../store";
import {
    getManuallyAddedPlayersIds,
    getPlayerInfo,
    getPlayerRankedsScorePagesToUpdate,
    getPlayerScorePagesToUpdate,
    getScoresByPlayerId,
    setSongScore,
} from "../../scoresaber/players";
import {dateFromString, timestampFromString, toSSTimestamp} from "../../utils/date";
import {fetchAllNewScores, fetchRecentScores, fetchSsRecentScores} from "./scores";
import eventBus from "../../utils/broadcast-channel-pubsub";
import nodeSync from '../../network/multinode-sync';
import {getActiveCountry} from "../../scoresaber/country";
import {getMainPlayerId} from "../../plugin-config";
import {updateSongCountryRanks} from "../../song";
import {parseSsFloat} from '../../scoresaber/other';
import keyValueRepository from '../../db/repository/key-value'
import playersRepository from '../../db/repository/players';
import {db} from '../../db/db'

export const ADDITIONAL_COUNTRY_PLAYERS_IDS = {pl: ['76561198967371424', '76561198093469724', '76561198204804992']};

export const getActivePlayersLastUpdate = async (refreshCache = false) => keyValueRepository().get('activePlayersLastUpdate', refreshCache)
// TODO: get it from DB
export const getAdditionalPlayers = (country) => ADDITIONAL_COUNTRY_PLAYERS_IDS[country] ?? [];
export const fetchPlayerInfo = async playerId => fetchApiPage(queue.SCORESABER_API, substituteVars(PLAYER_INFO_URL, {userId: playerId})).then(info => {
    const {playerInfo: {playerId: id, playerName: name, avatar, rank, countryRank, pp, country, history, inactive, banned}} = info;
    const weeklyDiff =  history ? (history.length >= 7 ? history[6] - history[0] : 0) : null;
    return {
        avatar,
        country,
        countryRank,
        id,
        inactive: !!inactive || !!banned,
        name,
        pp,
        rank,
        url: substituteVars(USER_PROFILE_URL, {userId: id}),
        weeklyDiff,
    };
});
export const fetchSsCountryRankPage = async (country, page = 1) =>
  [...(await fetchHtmlPage(queue.SCORESABER, substituteVars(USERS_URL, {country}), page)).querySelectorAll('.ranking.global .player a')]
    .map(a => {
        const tr = a.closest("tr");
        const id = getFirstRegexpMatch(/\/(\d+)$/, a.href)

        return {
            avatar: tr.querySelector('td.picture img').src,
            country: getFirstRegexpMatch(/^.*?\/flags\/([^.]+)\..*$/, tr.querySelector('td.player img').src).toUpperCase(),
            countryRank: parseInt(getFirstRegexpMatch(/^\s*#(\d+)\s*$/, tr.querySelector('td.rank').innerText), 10),
            id,
            inactive: false,
            name: a.querySelector('.songTop.pp').innerText,
            pp: parseSsFloat(tr.querySelector('td.pp .scoreTop.ppValue').innerText),
            rank: null,
            url: substituteVars(USER_PROFILE_URL, {userId: id}),
            weeklyDiff: parseInt(tr.querySelector('td.diff').innerText, 10),
        }
    });
export const fetchSsCountryRanking = async (country, count = 50) => {
    return (await Promise.all(
      new Array(Math.ceil(count / PLAYERS_PER_PAGE)).fill(null)
        .map(async (_, idx) => fetchSsCountryRankPage(country, idx + 1)),
    ))
      .reduce((cum, rankPage) => cum.concat(rankPage), [])
      .slice(0, count);
}
export const fetchCountryRanking = async (country, withMain = true, count = 50) => {
    country = country ?? await getActiveCountry();
    const mainPlayerId = await getMainPlayerId();
    const ssCountryRanking = country ? await fetchSsCountryRanking(country) : [];
    const ssCountryRankingContainsMainPlayerId = ssCountryRanking.filter(p => mainPlayerId && p.id === mainPlayerId).length > 0;
    const additionalPlayersIds = getAdditionalPlayers(country).concat(withMain && mainPlayerId && !ssCountryRankingContainsMainPlayerId ? [mainPlayerId] : []);

    return ssCountryRanking.concat(await Promise.all(additionalPlayersIds.map(async playerId => fetchPlayerInfo(playerId))))
      .filter(player => !player.inactive)
      .sort((a, b) => b.pp - a.pp)
      .map((player, idx) => ({...player, ssplCountryRank: country ? {[country]: idx + 1} : null}))
      .slice(0, 50);
}

export const updateActivePlayers = async () => {
    const country = await getActiveCountry();
    const countryPlayers = country ? await fetchCountryRanking(country) : [];
    const countryPlayersIds = countryPlayers.map(player => player.id);

    const manuallyAddedPlayers = await Promise.all(
      (await getManuallyAddedPlayersIds(country))
        .filter(playerId => !countryPlayersIds.includes(playerId))
        .map(async playerId => fetchPlayerInfo(playerId))
    );

    const allPlayers = {
        ...convertArrayToObjectByKey(countryPlayers, 'id'),
        ...convertArrayToObjectByKey(manuallyAddedPlayers, 'id')
    }

    await db.runInTransaction(['players', 'players-history'], async tx => {
        let cursor = await tx.objectStore('players').openCursor();
        while (cursor) {
            const dbPlayer = cursor.value;
            const {lastUpdated, recentPlay} = dbPlayer;

            const fetchedPlayer = allPlayers[dbPlayer.id] ? allPlayers[dbPlayer.id] : {inactive: true, ssplCountryRank: null};
            const {inactive, ssplCountryRank} = fetchedPlayer;

            const player = {
                ...dbPlayer,
                ...fetchedPlayer,
                inactive,
                lastUpdated: lastUpdated ?? null,
                recentPlay: recentPlay ?? null,
                ssplCountryRank: ssplCountryRank ?? null,
                profileLastUpdated: new Date(),
            };

            fetchedPlayer.processed = true;

            await cursor.update(player);

            cursor = await cursor.continue();
        }

        Object.values(allPlayers).filter(p => !p.processed).forEach(player => {
            const {lastUpdated, recentPlay, ssplCountryRank} = player;

            tx.objectStore('players').put({
                ...player,
                lastUpdated: lastUpdated ?? null,
                recentPlay: recentPlay ?? null,
                ssplCountryRank: ssplCountryRank ?? null,
                profileLastUpdated: new Date(),
            })
        });

        // remove all today's history
        const timestamp = new Date(toSSTimestamp(new Date()));
        cursor = await tx.objectStore('players-history').index('players-history-timestamp').openCursor(timestamp);
        while (cursor) {
            await cursor.delete();

            cursor = await cursor.continue();
        }

        // update today's history
        Object.values(allPlayers).forEach(player => {
            const {countryRank, id, pp, ssplCountryRank} = player;

            tx.objectStore('players-history').put({
                countryRank,
                playerId: id,
                pp,
                ssplCountryRank,
                timestamp
            });
        });
    });

    // clear all players cache
    playersRepository().flushCache();

    if (country) {
        await updateSongCountryRanks();
    }

    await keyValueRepository().set(new Date(), 'activePlayersLastUpdate');

    eventBus.publish('active-players-updated', {nodeId: nodeSync.getId(), countryPlayers, manuallyAddedPlayers, allPlayers});

    return Object.values(allPlayers);
}

export const getPlayerWithUpdatedScores = async (playerId, progressCallback = null) => {
    // TODO: replace with scores repository
    let player = await getPlayerInfo(playerId);
    if (!player) return null;

    // clone player data
    player = {...player};

    const {rank, pp, countryRank, ssplCountryRank} = player;
    player.userHistory = Object.assign({}, player.userHistory ?? {}, {[toSSTimestamp(new Date())]: {rank, pp, countryRank, ssplCountryRank}})

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

    await updateSongCountryRanks(leaderboardIdsToRefresh);

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

export const setRefreshedPlayerScores = async (playerId, scores, someFieldsUpdateOnly = true) => {
    let playerScores;
    if (someFieldsUpdateOnly) {
        playerScores = convertArrayToObjectByKey(await getScoresByPlayerId(playerId, true) ?? [], 'leaderboardId');

        if (!playerScores) {
            emitEventForScoresUpdate('player-score-update-failed', playerId, scores.map(s => s.leaderboardId));

            return false;
        }
    }

    const updatedScores = scores
      .map(s => {
          if (!s.leaderboardId) return;

          s.id = playerId + '_' + s.leaderboardId;
          s.playerId = playerId;

          const currentScore = playerScores[s.leaderboardId] ?? null;

          if (someFieldsUpdateOnly && !currentScore) {
              emitEventForScoreUpdate('player-score-update-failed', playerId, {leaderboardId: s.leaderboardId});

              return null;
          }

          const updatedScore = {...currentScore ?? {}, ...s, lastUpdated: new Date()};

          emitEventForScoreUpdate('player-score-updated', playerId, updatedScore);

          return updatedScore;
      })
      .filter(s => s?.timeset); // filter out scores without timeset field set

    await Promise.all(updatedScores.map(s => setSongScore(s)));

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

export const refreshPlayerScoreRank = async (playerId, leaderboardIds, lastScoreTimeset = null) => {
    let pages = [];
    let playerScoresPages = null;

    try {
        emitEventForScoresUpdate('player-score-update-start', playerId, leaderboardIds);

        const playerInfo = await getPlayerInfo(playerId, true);
        if (!playerInfo) throw 'Player not found';

        const playerScores = convertArrayToObjectByKey(await getScoresByPlayerId(playerId, true) ?? [], 'leaderboardId');
        if (!playerScores) throw 'Player scores not found';

        const cachedRecentPlay = dateFromString(playerInfo.recentPlay);
        if (!lastScoreTimeset || !cachedRecentPlay || cachedRecentPlay < lastScoreTimeset) {
            await updatePlayerScores(playerId);
        }

        const pagesInProgress = playersPagesInProgress[playerId] ?? [];

        playerScoresPages = getPlayerScorePagesToUpdate(playerScores, leaderboardIds, true);

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
