import {getAdditionalPlayers} from "../network/scoresaber/players";
import {default as config} from '../temp';

export const isActiveCountryUser = (u, country = config.COUNTRY) => !u.inactive && (getAdditionalPlayers().includes(u.id) || u.country.toLowerCase() === country.toLowerCase());

export const filterByCountry = (users, country = config.COUNTRY) => Object.keys(users)
    .filter(userId => isActiveCountryUser(users[userId]), country)

export const mapUsersToObj = (userIds, users) => userIds.reduce((cum, userId) => {
    cum[userId] = users[userId];
    return cum;
}, {})
