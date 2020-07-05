import {getAdditionalPlayers} from "../network/scoresaber/players";
import {default as config} from '../temp';
import {getCacheAndConvertIfNeeded} from "../store";
import {getRankedSongs} from "./rankeds";

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
    return data?.users?.[playerId] ? data.users[playerId] : null;
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