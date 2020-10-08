import {getAdditionalPlayers} from "../network/scoresaber/players";
import tempConfig from '../temp';
import {getCacheAndConvertIfNeeded} from "../store";
import {getFilteredRankedChanges, getRankedSongs} from "./rankeds";
import {NEW_SCORESABER_URL, PLAYS_PER_PAGE, USER_PROFILE_URL} from "../network/scoresaber/consts";
import {substituteVars} from "../utils/format";
import {dateFromString, timestampFromString} from "../utils/date";
import {arrayUnique, isEmpty} from "../utils/js";
import {getMainPlayerId} from "../plugin-config";

export const isActiveCountryPlayer = (u, country) => u && u.id && !!u.ssplCountryRank && !!u.ssplCountryRank[country] && (getAdditionalPlayers(country).includes(u.id) || u.country.toLowerCase() === country.toLowerCase());

export const getActiveCountryPlayers = async (country, withMain = true) => {
    const players = (await getPlayers()) ?? {};
    const mainPlayerId = withMain ? await getMainPlayerId() : null;
    return Object.values(players).filter(p => (p && p.id && mainPlayerId && p.id === mainPlayerId) || isActiveCountryPlayer(p, country))
}
export const getActiveCountryPlayersIds = async (country, withMain = true) => (await getActiveCountryPlayers(country, withMain)).filter(p => !!p.id).map(p => p.id);

export const mapPlayersToObj = (playerIds, players) => playerIds.reduce((cum, playerId) => {
    cum[playerId] = players[playerId] ?? {};
    return cum;
}, {})

export const getAllPlayersRanking = async country => {
    const players = await getAllActivePlayers(country);
    return players ? Object.values(players).sort((a,b) => b.pp - a.pp) : null;
}

export const getCountryRanking = async (country) => {
    const players = await getActiveCountryPlayers(country);
    return players ? players.sort((a,b) => b.pp - a.pp).slice(0, tempConfig.COUNTRY_PLAYERS_QTY) : null;
}

export const isDataAvailable = async () => !isEmpty(await getPlayers());

export const getPlayers = async () => (await getCacheAndConvertIfNeeded())?.users;
export const getPlayersFromData = data => data?.users ? data.users : null;

export const getPlayerInfo = async playerId => (await getPlayers())?.[playerId] ?? null;
export const getPlayerInfoFromData = (data, playerId) => getPlayersFromData(data)?.[playerId] ? getPlayersFromData(data)[playerId] : null;
export const getPlayerInfoFromPlayers = (players, playerId) => players?.[playerId] ? players[playerId] : null;

export const getPlayerLastUpdated = async playerId => (await getPlayerInfo(playerId))?.lastUpdated ?? null;
export const getPlayerProfileLastUpdated = async playerId => (await getPlayerInfo(playerId))?.profileLastUpdated ?? null;

export const getPlayerGroups = async () => (await getCacheAndConvertIfNeeded())?.groups ?? null;

export const addPlayerToGroup = async (playerId, groupId = 'default', groupName = 'Default') => {
    const data = await getCacheAndConvertIfNeeded();
    if (!data?.groups) data.groups = {};

    const groups = data.groups;
    if(!groups[groupId]) groups[groupId] = {name: groupName, players: []};

    groups[groupId].players = arrayUnique(groups[groupId].players.concat([playerId]));
}

export const removePlayerFromGroup = async (playerId, removeData = true, groupId = 'default') => {
    const data = await getCacheAndConvertIfNeeded();
    if (!data?.groups?.[groupId]?.players) return;

    data.groups[groupId].players = data.groups[groupId].players.filter(pId => pId !== playerId);

    if (!!data?.users?.[playerId] && removeData) delete data.users[playerId];
}

export const getGroupPlayerIds = async (groupId) => (await getPlayerGroups())?.[groupId] ?? null;

export const getFriendsIds = async (withMain = false) => {
    const groups = (await getPlayerGroups()) ?? {};

    return arrayUnique(
      Object.keys(groups)
        .reduce((cum, groupId) => cum.concat(groups[groupId].players), [])
        .concat(withMain ? [await getMainPlayerId()] : [])
        .filter(playerId => playerId)
    );
}

export const getFriends = async (country, withMain = false) => Object.values(mapPlayersToObj(await getFriendsIds(country, withMain), await getPlayers()));

export const getManuallyAddedPlayersIds = async (country, withMain = false) => {
    const friendsIds = await getFriendsIds(withMain);

    const players = await getPlayers();

    return friendsIds.filter(playerId => !isActiveCountryPlayer(players?.[playerId] ?? null, country));
}

export const getManuallyAddedPlayers = async (country, withMain = false) => Object.values(mapPlayersToObj(await getManuallyAddedPlayersIds(country, withMain), await getPlayers()));

export const getAllActivePlayersIds = async (country) => arrayUnique((await getActiveCountryPlayersIds(country)).concat(await getManuallyAddedPlayersIds(country)));

export const getAllActivePlayers = async (country) => Object.values(mapPlayersToObj(await getAllActivePlayersIds(country), await getPlayers()));

export const getPlayerProfileUrl = (playerId, recentPlaysPage = false) => substituteVars(USER_PROFILE_URL + (recentPlaysPage ? '?sort=2' : ''), {userId: playerId})

export const getPlayerAvatarUrl = async playerId => {
    if (!playerId) return null;

    const playerInfo = await getPlayerInfo(playerId);
    return playerInfo && playerInfo.avatar ? (playerInfo.avatar.startsWith('http') ? playerInfo.avatar : NEW_SCORESABER_URL + playerInfo.avatar) : null;
}

export const getPlayerScores = player => player?.scores ? player.scores : null;

export const getScoresByPlayerId = async playerId => getPlayerScores(await getPlayerInfo(playerId))

export const getRankedScoresByPlayerId = async playerId => {
    const scores = await getScoresByPlayerId(playerId);
    const rankedMaps = await getRankedSongs();
    return scores
        ? Object.values(scores)
            .filter(s => s.pp > 0)
            .filter(s => rankedMaps?.[s.leaderboardId])
        : [];
}

export const getPlayerSongScore = (player, leaderboardId) => {
    if (!player) return null;

    const score = getPlayerScores(player)?.[leaderboardId];

    return score ? score : null;
}

export const getSongScoreByPlayerId = async (playerId, leaderboardId) => {
    const score = (await getScoresByPlayerId(playerId))?.[leaderboardId];

    return score ? score : null;
}

const getPlayerRankedsToUpdate = async (scores, previousLastUpdated) => {
    const songsChangedAfterPreviousUpdate = await getFilteredRankedChanges(timestamp => timestamp >= previousLastUpdated);

    // check all song changed after previous update
    return Object.keys(songsChangedAfterPreviousUpdate).reduce((cum, leaderboardId) => {
        // skip if the player didn't play the song
        if (!scores[leaderboardId]) return cum;

        const songLastPlayTimestamp = timestampFromString(scores[leaderboardId].timeset);

        // skip if song was played AFTER previous update (because all new scores were downloaded with current update, changed or not)
        if (songLastPlayTimestamp && songLastPlayTimestamp > previousLastUpdated) return cum;

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