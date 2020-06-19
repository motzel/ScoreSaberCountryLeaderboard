import log from './utils/logger';
import {convertFetchedRankedSongsToObj, fetchRankedSongsArray} from "./network/scoresaber/rankeds";
import {dateFromString} from "./utils/date";

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

    const CURRENT_CACHE_VERSION = 1.2;

    let cache = (await getCache()) ?? {
        version: CURRENT_CACHE_VERSION,
        lastUpdated: null,
        users: {},
        rankedSongs: null,
        rankedSongsLastUpdated: null
    };

    // CONVERSION FROM OLDER CACHE VERSION IF NEEDED
    if(1 === cache.version) {
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
    }

    if(1.1 === cache.version) {
        // special case after SS API change - reset last updated in order to data be refetched
        const resetDate = "2020-06-17T00:00:00.000Z";
        const resetDateTimestamp = Date.parse(resetDate);
        if((dateFromString(cache.lastUpdated)).getTime() > resetDateTimestamp) {
            cache.lastUpdated = resetDate;
            const userLastUpdated = dateFromString(cache.lastUpdated);
            Object.values(cache.users).map(u => u.lastUpdated = userLastUpdated)
        }
        cache.version = 1.2;
    }

    Globals.data = cache;

    return cache;
}

export async function setCache(value) {
    Globals.data = value;

    return window.localforage.setItem(CACHE_KEY, value);
}