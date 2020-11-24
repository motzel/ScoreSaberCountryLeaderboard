import playersRepository from "../db/repository/players";
import playersHistoryRepository from "../db/repository/players-history";
import scoresRepository from "../db/repository/scores";
import groupsRepository from "../db/repository/groups";
import {getAdditionalPlayers} from "../network/scoresaber/players";
import tempConfig from '../temp';
import {getRankedsChangesSince, getRankedSongs} from "./rankeds";
import {NEW_SCORESABER_URL, PLAYS_PER_PAGE, USER_PROFILE_URL} from "../network/scoresaber/consts";
import {substituteVars} from "../utils/format";
import {dateFromString} from "../utils/date";
import {arrayUnique, convertArrayToObjectByKey, isEmpty} from "../utils/js";
import {getMainPlayerId} from "../plugin-config";
import {findDiffInfo, getMaxScore} from "../song";
import {getSongByHash} from "../network/beatsaver";

export const isCountryPlayer = (u, country) => u && u.id && !!u.ssplCountryRank && !!u.ssplCountryRank[country] && (getAdditionalPlayers(country).includes(u.id) || u.country.toLowerCase() === country.toLowerCase());

export const getActiveCountryPlayers = async (country, withMain = true, refreshCache = false) => {
    const players = await getPlayers(refreshCache) ?? {};
    const mainPlayerId = withMain ? await getMainPlayerId() : null;
    return players.filter(p => (p && p.id && mainPlayerId && p.id === mainPlayerId) || isCountryPlayer(p, country))
}
export const getActiveCountryPlayersIds = async (country, withMain = true, refreshCache = false) => (await getActiveCountryPlayers(country, withMain, refreshCache)).filter(p => !!p.id).map(p => p.id);

export const filterPlayersByIdsList = (playerIds, players) => players.filter(player => playerIds.includes(player.id));

export const getAllPlayersRanking = async country => {
    const players = await getAllActivePlayers(country);
    return players ? Object.values(players).sort((a,b) => b.pp - a.pp) : null;
}

export const getCountryRanking = async (country) => {
    const players = await getActiveCountryPlayers(country);
    return players ? players.sort((a,b) => b.pp - a.pp).slice(0, tempConfig.COUNTRY_PLAYERS_QTY) : null;
}

export const isDataAvailable = async () => !isEmpty(await getPlayers());

export const flushPlayersCache = () => playersRepository().flushCache();
export const getPlayers = async (refreshCache = false) => playersRepository().getAll(undefined, undefined, refreshCache);

export const getPlayerInfo = async (playerId, refreshCache = false) => await playersRepository().get(playerId, refreshCache) ?? null;
export const getPlayerHistory = async playerId => await playersHistoryRepository().getAllFromIndex('players-history-playerId', playerId) ?? null;
export const getAllPlayersHistory = async query => await playersHistoryRepository().getAllFromIndex('players-history-timestamp', query) ?? [];
export const getPlayerInfoFromPlayers = (players, playerId) => players?.[playerId] ? players[playerId] : null;

export const getPlayerLastUpdated = async playerId => (await getPlayerInfo(playerId))?.lastUpdated ?? null;
export const getPlayerProfileLastUpdated = async playerId => (await getPlayerInfo(playerId))?.profileLastUpdated ?? null;

export const removeAllPlayerData = async playerId => {
    const playerHistory = await playersHistoryRepository().getAllFromIndex('players-history-playerId', playerId);
    const playerScores = await scoresRepository().getAllFromIndex('scores-playerId', playerId);

    await Promise.all(
      []
        .concat(playerHistory.map(ph => playersHistoryRepository().deleteObject(ph)))
        .concat(playerScores.map(s => scoresRepository().deleteObject(s)))
        .concat([playersRepository().delete(playerId)])
    );
};

export const getPlayerGroups = async (groupName, refreshCache = false) => {
    const groups = await groupsRepository().getAllFromIndex('groups-name', groupName, undefined, refreshCache);

    return groups && groups.length
      ? Object.values(
        groups.reduce((cum, playerGroup) => {
            if (!cum[playerGroup.name]) cum[playerGroup.name] = {name: playerGroup.name, players: []};

            cum[playerGroup.name].players.push(playerGroup.playerId);

            return cum;
        }, {}),
      )
      : null;
};

export const addPlayerToGroup = async (playerId, groupName = 'Default') => {
    const isPlayerAlreadyAdded = (await groupsRepository().getAllFromIndex('groups-name', groupName, undefined, true))
      .some(g => g.playerId === playerId);
    if (isPlayerAlreadyAdded) return;

    return groupsRepository().set({groupName, playerId});
}

export const removePlayerFromGroup = async (playerId, removeData = true, groupName = 'Default') => {
    const playerGroups = await groupsRepository().getAllFromIndex('groups-playerId', playerId, undefined, true);

    const playerGroupsToRemove = playerGroups.filter(pg => !groupName || pg.name === groupName);

    await Promise.all(playerGroupsToRemove.map(async pg => groupsRepository().deleteObject(pg)));

    if (!removeData || playerGroups.length > playerGroupsToRemove.length) return;

    await removeAllPlayerData(playerId);
}

export const getFriendsIds = async (withMain = false, refreshCache = false) => {
    const groups = await getPlayerGroups(undefined, refreshCache) ?? [];

    return arrayUnique(
      groups
        .reduce((cum, group) => cum.concat(group.players), [])
        .concat(withMain ? [await getMainPlayerId()] : [])
        .filter(playerId => playerId)
    );
}

export const getFriends = async (country, withMain = false, refreshCache = false) => filterPlayersByIdsList(await getFriendsIds(withMain, refreshCache), await getPlayers(refreshCache));

export const getManuallyAddedPlayersIds = async (country, withMain = false, refreshCache = false) => {
    const friendsIds = await getFriendsIds(withMain, refreshCache);

    const players = convertArrayToObjectByKey(await getPlayers(refreshCache), 'id');

    return friendsIds.filter(playerId => !isCountryPlayer(players?.[playerId] ?? null, country));
}

export const getManuallyAddedPlayers = async (country, withMain = false) => filterPlayersByIdsList(await getManuallyAddedPlayersIds(country, withMain), await getPlayers());

export const getAllActivePlayersIds = async (country, refreshCache = false) => arrayUnique((await getActiveCountryPlayersIds(country, true, refreshCache)).concat(await getManuallyAddedPlayersIds(country, false, refreshCache)));

export const getAllActivePlayers = async (country, refreshCache = false) => filterPlayersByIdsList(await getAllActivePlayersIds(country, refreshCache), await getPlayers(refreshCache));

export const getPlayerProfileUrl = (playerId, recentPlaysPage = false) => substituteVars(USER_PROFILE_URL + (recentPlaysPage ? '?sort=2' : ''), {userId: playerId})

export const getPlayerAvatarUrl = async playerId => {
    if (!playerId) return null;

    const playerInfo = await getPlayerInfo(playerId);
    return playerInfo && playerInfo.avatar ? (playerInfo.avatar.startsWith('http') ? playerInfo.avatar : NEW_SCORESABER_URL + playerInfo.avatar) : null;
}

export const getPlayerScores = player => player?.scores ? player.scores : null;

export const flushScoresCache = () => scoresRepository().flushCache();
export const getAllScores = async () => scoresRepository().getAll();
export const getScoresByPlayerId = async (playerId, refreshCache = false) => scoresRepository().getAllFromIndex('scores-playerId', playerId, undefined, refreshCache);
export const getAllScoresSince = async (sinceDate, refreshCache = false) => scoresRepository().getAllFromIndex('scores-timeset', sinceDate ? IDBKeyRange.lowerBound(sinceDate) : undefined, undefined, refreshCache);
export const getAllScoresWithPpOver = async (minPp, refreshCache = false) => scoresRepository().getAllFromIndex('scores-pp', minPp ? IDBKeyRange.lowerBound(minPp) : undefined, undefined, refreshCache);

export const getRankedScoresByPlayerId = async (playerId, refreshCache = false) => {
    const scores = await getScoresByPlayerId(playerId, refreshCache);
    const rankedMaps = await getRankedSongs();
    return scores
        ? Object.values(scores)
            .filter(s => s.pp > 0)
            .filter(s => rankedMaps?.[s.leaderboardId])
        : [];
}

export const getPlayerSongScore = async (player, leaderboardId) => getSongScoreByPlayerId(player?.id + '_' + leaderboardId);
export const getSongScoreByPlayerId = async (playerId, leaderboardId) => scoresRepository().get(playerId + '_' + leaderboardId);
export const setSongScore = async score => scoresRepository().set(score);

// TODO: look at song.js::getLeaderboard() lines 153/173
export const getPlayerSongScoreHistory = async (playerScore, maxSongScore = null) => {
    if (!playerScore || !playerScore.history) return null;

    if (!maxSongScore) {
        const songInfo = playerScore.id ? await getSongByHash(playerScore.hash) : null;
        const songCharacteristics = songInfo?.metadata?.characteristics;

        const diffInfo = findDiffInfo(
            songCharacteristics,
            playerScore.diff
        );
        maxSongScore =
            diffInfo?.length && diffInfo?.notes
                ? getMaxScore(diffInfo.notes)
                : 0;
    }

    return playerScore.history
        .filter(h => h.score && h.score !== playerScore.score)
        .sort((a, b) => b.score - a.score)
        .map(h => Object.assign(
            {},
            h,
            {
                timeset: new Date(h.timestamp),
                percent: maxSongScore
                    ? h.score / maxSongScore / (h.uScore ? h.score / h.uScore : 1)
                    : (playerScore.maxScoreEx
                        ? h.score / playerScore.maxScoreEx / (h.uScore ? h.score / h.uScore : 1)
                        : null)
            }
        ));
}

const getPlayerRankedsToUpdate = async (scores, previousLastUpdated) => {
    const songsChangedAfterPreviousUpdate = await getRankedsChangesSince(previousLastUpdated.getTime());

    // check all song changed after previous update
    return Object.keys(songsChangedAfterPreviousUpdate).reduce((cum, leaderboardId) => {
        // skip if the player didn't play the song
        if (!scores[leaderboardId]) return cum;

        const songLastPlay = scores[leaderboardId]?.timeset;

        // skip if song was played AFTER previous update (because all new scores were downloaded with current update, changed or not)
        if (songLastPlay && songLastPlay > previousLastUpdated) return cum;

        // mark song to update
        cum.push(parseInt(leaderboardId, 10));

        return cum;
    }, [])
}

export const getPlayerScorePagesToUpdate = (allScores, leaderboardIdsToUpdate, includeAllLeaderboardIdsOnPage = false) => {
    const sortedScores = Object.values(allScores)
      .map((s) => ({
          leaderboardId: s.leaderboardId,
          timeset      : dateFromString(s.timeset)
      }))
      .sort((a, b) => b.timeset - a.timeset);

    return sortedScores
      .reduce((cum, s, idx) => {
          if (leaderboardIdsToUpdate.includes(s.leaderboardId)) {
              const page = Math.floor(idx / PLAYS_PER_PAGE) + 1;

              if (includeAllLeaderboardIdsOnPage) {
                  if (!cum[page]) cum[page] = {searched: [], all: []};

                  cum[page].searched = cum[page].searched.concat([s.leaderboardId]);

                  cum[page].all = arrayUnique(
                    cum[page].all.concat(
                      sortedScores
                        .slice((page - 1) * PLAYS_PER_PAGE, page * PLAYS_PER_PAGE)
                        .map(s => s.leaderboardId)
                    )
                  );
              } else {
                  cum[page] = (cum[page] ?? []).concat([s.leaderboardId]);
              }
          }
          return cum;
      }, {});
}

export const getPlayerRankedsScorePagesToUpdate = async (scores, previousLastUpdated) => {
    const songsToUpdate = await getPlayerRankedsToUpdate(scores, previousLastUpdated);
    if (!songsToUpdate.length) return {};

    return getPlayerScorePagesToUpdate(scores, songsToUpdate);
}