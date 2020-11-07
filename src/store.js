import log from './utils/logger';
import {convertFetchedRankedSongsToObj, fetchRankedSongsArray} from "./network/scoresaber/rankeds";
import {openDB} from 'idb';
import {convertFromLocalForage, fetchLocalForageData} from './db/convert-localforage'

const THEME_KEY = 'sspl_theme';
const SSPL_DB_VERSION = 2;

export const Globals = {data: null};

export let db = null;

export const lastUpdated = async () => (await getCacheAndConvertIfNeeded()).lastUpdated;

export const isAnyData = async () => {await getCacheAndConvertIfNeeded(); return Globals.data && Object.keys(Globals.data.users).length}

async function openDatabase(cache = null) {
    db = await openDB('sspl', SSPL_DB_VERSION, {
        async upgrade(db, oldVersion, newVersion, transaction) {
            log.info(`Converting database from version ${oldVersion} to version ${newVersion}`);

            switch (newVersion) {
                case 2:
                    db.createObjectStore('players', {
                        keyPath: 'id',
                        autoIncrement: false,
                    });

                    const playersHistory = db.createObjectStore('players-history', {
                        keyPath: '_id',
                        autoIncrement: true,
                    });
                    playersHistory.createIndex('players-history-playerId', 'playerId', {unique: false});

                    const scoresStore = db.createObjectStore('scores', {
                        keyPath: 'id',
                        autoIncrement: false,
                    });
                    scoresStore.createIndex('scores-leaderboard', 'leaderboardId', {unique: false});
                    scoresStore.createIndex('scores-player', 'playerId', {unique: false});

                    const leaderboardsStore = db.createObjectStore('leaderboards', {
                        keyPath: 'leaderboardId',
                        autoIncrement: false,
                    });
                    leaderboardsStore.createIndex('leaderboards-status', 'status', {unique: false});

                    const songsStore = db.createObjectStore('songs', {
                        keyPath: 'hash',
                        autoIncrement: false,
                    });
                    songsStore.createIndex('songs-key', 'key', {unique: true});

                    db.createObjectStore('twitch', {
                        keyPath: 'playerId',
                        autoIncrement: false,
                    });

                    const rankedsChangesStore = db.createObjectStore('rankeds-changes', {
                        keyPath: '_id',
                        autoIncrement: true,
                    });
                    rankedsChangesStore.createIndex('rankeds-changes-timestamp', 'timestamp', {unique: false});
                    rankedsChangesStore.createIndex('rankeds-changes-leaderboardId', 'leaderboardId', {unique: false});

                    db.createObjectStore('key-value', {
                        keyPath: 'key',
                        autoIncrement: false,
                    });

                    await convertFromLocalForage(cache, transaction);
            }

            log.info("Database converted");
        },

        // TODO
        blocked() {
            console.warn('DB blocked')
        },
        blocking(event) {
            // other tab tries to open newer db version - close connection
            console.warn('DB blocking', event)
            db.close();

            // TODO: should be reopened with new version: event.newVersion
            // TODO: or rather notify user / auto reload page
        },
        terminated() {
            console.warn('DB terminated')
        },
    });
}

export async function getCacheAndConvertIfNeeded(forceDb = false, forceCache = false) {
    // TODO: remove Globals.data dependency
    if ((Globals.data && !forceDb) || forceCache) return Globals.data;

    let cache = null;
    if (await isConversionFromLocalforageNeeded()) {
        cache = await fetchLocalForageData();

        Globals.data = cache;
    }

    await openDatabase(cache)

    // console.time("sspl get");
    // console.log(await db.get('leaderboards', 220734));
    // console.timeLog("sspl get", "Leaderboard GET");
    // console.log(await db.getAllFromIndex('leaderboards', 'leaderboards-status', 'ranked'));
    // console.timeLog("sspl get", "Leaderboard by index GET (rankeds)");
    // console.log(convertArrayToObjectByKey(await db.getAll('leaderboards'), 'leaderboardId'));
    // console.timeLog("sspl get", "Leaderboard GET (all)");
    // const scores = (await db.getAllFromIndex('scores', 'scores-player', '76561198035381239x'))
    // // const scores = (await db.getAll('scores'))
    //   .filter(s => !s.acc && cache.beatSaver.hashes[s.hash]);
    // console.log(scores);
    // console.timeLog("sspl get", "Player scores GET (76561198035381239)");
    // console.timeEnd("sspl get");

    // TODO: remove it
    return null;
}

export function getThemeFromFastCache() {
    return window.localStorage.getItem(THEME_KEY);
}

export function setThemeInFastCache(theme) {
    return window.localStorage.setItem(THEME_KEY, theme);
}

async function isConversionFromLocalforageNeeded() {
    let convertingFromLocalForageNeeded = false;
    try {
        const db1 = await openDB('sspl', 1, {
            async upgrade(db, oldVersion, newVersion) {
                convertingFromLocalForageNeeded = true;
            },
        });
        db1.close();
    } catch {
        // swallow error - old localforage cache is already converted
    }
    return convertingFromLocalForageNeeded
}