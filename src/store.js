import log from './utils/logger';
import {convertFetchedRankedSongsToObj, fetchRankedSongsArray} from "./network/scoresaber/rankeds";
import {ADDITIONAL_COUNTRY_PLAYERS_IDS} from "./network/scoresaber/players";
import {dateFromString} from "./utils/date";
import {refreshSongCountryRanksCache} from "./song";
import logger from "./utils/logger";

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

export async function getCacheAndConvertIfNeeded(forceDb = false, forceCache = false) {
    if ((Globals.data && !forceDb) || forceCache) return Globals.data;

    log.info("Data fetch from cache");

    const CURRENT_CACHE_VERSION = 1.5;

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
        cache.config.songBrowser.showColumns = ['timeset', 'rank', 'pp', 'acc', 'score', 'diff', 'icons']
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

    if(cache.version === 1.2) {
        cache.config.profile.showTwitchIcon = true
        cache.version = 1.3;
    }

    if (cache.version === 1.3) {
        // fix timeset bug - forceDb refetch all scores since fuckup day (commit 822ac040)
        const fuckupDay = dateFromString("2020-09-28T21:09:00Z");

        if (cache.rankedSongsChanges) {
            const rankedSongsChangesTimestamps = Object.keys(cache.rankedSongsChanges).sort((a, b) => a - b).slice(0, 1);
            if (rankedSongsChangesTimestamps.length) {
                const firstTimestamp = parseInt(rankedSongsChangesTimestamps[0], 10);
                if (new Date(firstTimestamp) > fuckupDay) {
                    // replacement of the timestamp of the first rankeds download to just before the fuckup (in order not to update all rankeds)
                    cache.rankedSongsChanges[fuckupDay.getTime() - 1000*60*60*24] = [...cache.rankedSongsChanges[firstTimestamp]];
                    delete cache.rankedSongsChanges[firstTimestamp];
                }
            }
        }

        if (cache.users) {
            const playersToUpdate = Object.values(cache.users)
                .filter(p => p && p.scores)
                .map(player => ({
                    id: player.id,
                    lastUpdated: player.lastUpdated,
                    songsWithoutTimeset: Object.values(player.scores).filter(s => !dateFromString(s.timeset))
                }))
                .filter(p => p.songsWithoutTimeset.length || p.id === cache.config.users.main);

            playersToUpdate.forEach(player => {
                const lastUpdated = dateFromString(player.lastUpdated);
                if (lastUpdated > fuckupDay) {
                    cache.users[player.id].lastUpdated = new Date(fuckupDay.getTime());
                }
            })
        }

        if (!cache.config.songBrowser.showColumns.includes('rank'))
            cache.config.songBrowser.showColumns.push('rank');

        cache.version = 1.4;
        await setCache(cache);
    }

    if (cache.version === 1.4) {
        Globals.data = cache;

        logger.info('Cache country ranks for the first time');

        await refreshSongCountryRanksCache();

        logger.info('Cache country ranks for the first time / Done');

        cache.version = 1.5;
    }

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