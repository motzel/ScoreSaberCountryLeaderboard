import {fetchRankedSongsArray, convertFetchedRankedSongsToObj} from './network/api';
import log from './utils/logger';

const CACHE_KEY = 'sspl_users';

export const Globals = {data: null};

const getCache = async () => new Promise((resolve, reject) =>
    window.localforage.getItem(CACHE_KEY, function (err, value) {
        resolve(value);
    })
);

export const lastUpdated = async () => (await getCacheAndConvertIfNeeded()).lastUpdated;

export const isAnyData = async () => {await getCacheAndConvertIfNeeded(); return Globals.data && Object.keys(Globals.data.users).length}

export async function getCacheAndConvertIfNeeded() {
    if (Globals.data) return Globals.data;

    log.info("Data fetch from cache");

    let cache = (await getCache()) ?? {
        version: 1.1,
        lastUpdated: null,
        users: {},
        rankedSongs: null,
        rankedSongsLastUpdated: null
    };

    // CONVERSION FROM OLDER CACHE VERSION IF NEEDED
    let flags = {
        rankHistoryAvailable: false,
        rankedSongsAvailable: false
    };
    if (Object.values(cache?.users)?.[0]?.history?.length) {
        flags.rankHistoryAvailable = true;
    }

    if (cache.version === 1) {
        // special case - fetch scores for all ranked songs that was ranked/changed since first plugin version
        const allRankeds = await fetchRankedSongsArray();
        let nanomoriApproached = false;
        cache.rankedSongs = convertFetchedRankedSongsToObj(
            allRankeds.filter((s) => {
                if (s.leaderboardId === 221711) nanomoriApproached = true;
                return nanomoriApproached;
            })
        );
        cache.version = 1.1;
        cache.rankedSongsLastUpdated = JSON.parse(
            JSON.stringify(new Date())
        );
        flags.rankedSongsAvailable = false;
    } else {
        flags.rankedSongsAvailable = true;
    }

    Globals.data = Object.assign(cache, {flags});

    return cache;
}

export async function setCache(value) {
    Globals.data = value;

    window.localforage.setItem(CACHE_KEY, value);

    return value;
}