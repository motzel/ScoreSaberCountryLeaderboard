import {getAdditionalPlayers} from "../network/scoresaber/players";
import {default as config} from '../temp';
import {getCacheAndConvertIfNeeded} from "../store";
import {getFilteredRankedChanges, getRankedSongs} from "./rankeds";
import {NEW_SCORESABER_URL, PLAYS_PER_PAGE, SCORESABER_URL} from "../network/scoresaber/consts";
import {substituteVars} from "../utils/format";
import {dateFromString} from "../utils/date";

export const USER_PROFILE_URL = SCORESABER_URL + '/u/${userId}';

export const isActiveCountryUser = (u, country = config.COUNTRY) => !u.inactive && (getAdditionalPlayers().includes(u.id) || u.country.toLowerCase() === country.toLowerCase());

export const filterByCountry = (players, country = config.COUNTRY) => Object.keys(players)
    .filter(userId => isActiveCountryUser(players[userId]), country)

export const mapUsersToObj = (playerIds, players) => playerIds.reduce((cum, playerId) => {
    cum[playerId] = players[playerId];
    return cum;
}, {})

export const getCountryRanking = async (country = config.COUNTRY) => {
    const players = (await getCacheAndConvertIfNeeded())?.users;
    return players
        ? Object.values(players)
            .filter(p => isActiveCountryUser(p, country))
            .sort((a,b) => b.pp - a.pp)
            .map((p, idx) => {
                p.countryRank = idx + 1

                return p;
            })
            .slice(0, 50)
        : null;
}

export const getPlayerInfo = async playerId => {
    const data = await getCacheAndConvertIfNeeded();
    return data?.users?.[playerId] ?? null;
}

export const getPlayerProfileUrl = playerId => substituteVars(USER_PROFILE_URL, {userId: playerId})

export const getPlayerAvatarUrl = async playerId => {
    if (!playerId) return null;

    const playerInfo = await getPlayerInfo(playerId);
    return playerInfo && playerInfo.avatar ? (playerInfo.avatar.startsWith('http') ? playerInfo.avatar : NEW_SCORESABER_URL + playerInfo.avatar) : null;
}

export const getPlayerScores = async playerId => {
    const playerInfo = await getPlayerInfo(playerId);
    return playerInfo && playerInfo.scores ? playerInfo.scores : null;
}

export const getPlayerRankedScores = async playerId => {
    const scores = await getPlayerScores(playerId);
    const rankedMaps = await getRankedSongs();
    return scores
        ? Object.values(scores)
            .filter(s => s.pp > 0)
            .filter(s => rankedMaps?.[s.leaderboardId])
        : [];
}

export const getPlayerSongScore = async (playerId, leaderboardId) => {
    const score = (await getPlayerScores(playerId))?.[leaderboardId];

    return score ? score : null;
}

const getPlayerRankedsToUpdate = async (scores, previousLastUpdated) => {
    const songsChangedAfterPreviousUpdate = await getFilteredRankedChanges(timestamp => timestamp >= previousLastUpdated);

    // check all song changed after previous update
    return Object.keys(songsChangedAfterPreviousUpdate).reduce((cum, leaderboardId) => {
        // skip if the player didn't play the song
        if (!scores[leaderboardId]) return cum;

        const songLastPlayTimestamp = dateFromString(scores[leaderboardId].timeset).getTime();

        // skip if song was played AFTER previous update (because all new scores were downloaded with current update, changed or not)
        if (songLastPlayTimestamp > previousLastUpdated) return cum;

        // mark song to update
        cum.push(parseInt(leaderboardId, 10));

        return cum;
    }, [])
}

export const getPlayerRankedsScorePagesToUpdate = async (scores, previousLastUpdated) => {
    const songsToUpdate = await getPlayerRankedsToUpdate(scores, previousLastUpdated);
    if (!songsToUpdate.length) return {};

    return Object.values(scores)
        .map((s) => ({
            leaderboardId: s.leaderboardId,
            timeset: dateFromString(s.timeset)
        }))
        .sort((a, b) => b.timeset.getTime() - a.timeset.getTime())
        .reduce((cum, s, idx) => {
            if (songsToUpdate.includes(s.leaderboardId)) {
                const page = Math.floor(idx / PLAYS_PER_PAGE) + 1;
                cum[page] = (cum && cum[page] ? cum[page] : []).concat([
                    s.leaderboardId
                ]);
            }
            return cum;
        }, {});
}