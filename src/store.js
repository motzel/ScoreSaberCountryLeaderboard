import log from './utils/logger';
import {convertFetchedRankedSongsToObj, fetchRankedSongsArray} from "./network/scoresaber/rankeds";
import config, {getSseMainUserId} from "./temp";
import {ADDITIONAL_COUNTRY_PLAYERS_IDS} from "./network/scoresaber/players";

const CACHE_KEY = 'sspl_users';
const THEME_KEY = 'sspl_theme';

export const Globals = {data: null};

const getCache = async () => new Promise((resolve, reject) =>
    window.localforage.getItem(CACHE_KEY, function (err, value) {
        resolve(value);
    })
);

export const lastUpdated = async () => (await getCacheAndConvertIfNeeded()).lastUpdated;

export const isAnyData = async () => {await getCacheAndConvertIfNeeded(); return Globals.data && Object.keys(Globals.data.users).length}

export async function getCacheAndConvertIfNeeded(force = false) {
    if (Globals.data && !force) return Globals.data;

    log.info("Data fetch from cache");

    const CURRENT_CACHE_VERSION = 1.2;

    const prepareFreshCache = () => ({
        version: CURRENT_CACHE_VERSION,
        lastUpdated: null,
        users: {},
        rankedSongs: null,
        rankedSongsLastUpdated: null,
        beatSaver: {}
    });

    let cache = (await getCache()) ?? prepareFreshCache();

    if(cache.version < 1.2) {
        log.warn("The old data format is no longer supported, sorry. Initializing fresh cache.");
        cache = prepareFreshCache();
    }

    if (!cache.config) {
        if (!cache.config) cache.config = {};
        if (!cache.config.users) cache.config.users = {main: null, country: null, additionalForCountry: ADDITIONAL_COUNTRY_PLAYERS_IDS, groups: []};
        if (!cache.config.songBrowser) cache.config.songBrowser = {};
        if (!cache.config.songLeaderboard) cache.config.songLeaderboard = {};
        if (!cache.config.profile) cache.config.profile = {};
        if (!cache.config.ss) cache.config.ss = {song: {}};

        cache.config.profile.enlargeAvatar = true;
        cache.config.profile.showOnePpCalc = true;
        cache.config.profile.showTwitchIcon = false;
        cache.config.profile.showChart = true;

        cache.config.songBrowser.autoTransform = false;
        cache.config.songBrowser.defaultView = 'compact';
        cache.config.songBrowser.defaultType = 'all';
        cache.config.songBrowser.defaultSort = 'timeset';
        cache.config.songBrowser.showColumns = ['timeset', 'pp', 'acc', 'score', 'diff', 'icons']
        cache.config.songBrowser.showIcons = ['bsr', 'bs', 'preview', 'twitch'];

        cache.config.songLeaderboard.showDiff = true;
        cache.config.songLeaderboard.showWhatIfPp = true;

        cache.config.ss.song.enhance = true;
        cache.config.ss.song.showDiff = true;
        cache.config.ss.song.showWhatIfPp = true;
    }
    if (!cache.config.others) cache.config.others = {theme: 'darkss'}

    if (cache.config.others.bgDownload === undefined) cache.config.others.bgDownload = true;
    if (cache.config.others.viewsUpdate === undefined) cache.config.others.viewsUpdate = 'keep-view';

    if (cache.config.others.language === undefined) cache.config.others.language = cache.lastUpdated ? 'pl' : 'en';
    if (cache.config.others.locale === undefined) cache.config.others.locale = cache.lastUpdated ? 'pl-PL' : 'en-US';

    if (!cache.config.songLeaderboard.defaultType) cache.config.songLeaderboard.defaultType = 'country';

    setThemeInFastCache(cache.config.others.theme);

    Globals.data = cache;

    return cache;
}

export async function setCache(value) {
    Globals.data = value;

    return window.localforage.setItem(CACHE_KEY, value);
}

export function getThemeFromFastCache() {
    return window.localStorage.getItem(THEME_KEY);
}

export function setThemeInFastCache(theme) {
    return window.localStorage.setItem(THEME_KEY, theme);
}