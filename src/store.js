import {convertFetchedRankedSongsToObj, fetchRankedSongsArray} from "./network/scoresaber/rankeds";

const THEME_KEY = 'sspl_theme';

// TODO: remove dependency
export const Globals = {data: null};

export const lastUpdated = async () => (await getCacheAndConvertIfNeeded()).lastUpdated;

export const isAnyData = async () => {await getCacheAndConvertIfNeeded(); return Globals.data && Object.keys(Globals.data.users).length}

// TODO: remove it when new DB methods would be ready
export async function getCacheAndConvertIfNeeded(forceDb = false, forceCache = false) {
    return null;
}

export function getThemeFromFastCache() {
    return window.localStorage.getItem(THEME_KEY);
}

export function setThemeInFastCache(theme) {
    return window.localStorage.setItem(THEME_KEY, theme);
}

export function setCache() {
    throw 'setCache() should NOT be used anymore'
}