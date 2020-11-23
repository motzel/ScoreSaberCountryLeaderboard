import keyValueRepository from "./db/repository/key-value";
import {getPlayers} from './scoresaber/players'

const THEME_KEY = 'sspl_theme';

export const lastUpdated = async (refreshCache = true) => keyValueRepository().get('lastUpdated', refreshCache);

export const isAnyData = async () => {const players = await getPlayers(); return players && players.length}

export function getThemeFromFastCache() {
    return window.localStorage.getItem(THEME_KEY);
}

export function setThemeInFastCache(theme) {
    return window.localStorage.setItem(THEME_KEY, theme);
}
