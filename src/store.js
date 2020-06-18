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

    switch(cache.version) {
        case 1.1:
            flags.rankedSongsAvailable = true;
            cache.lastUpdated = "2020-06-17T00:00:00.000Z";
            Object.values(cache.users).map(u => u.lastUpdated = dateFromString("2020-06-17T00:00:00.000Z"))
            cache.version = 1.2;
            break;

        case 1:
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
            break;

        default:
            flags.rankedSongsAvailable = true;
            break;
    }

    Globals.data = Object.assign(cache, {flags});

    return cache;
}

export async function setCache(value) {
    Globals.data = value;

    return window.localforage.setItem(CACHE_KEY, value);
}