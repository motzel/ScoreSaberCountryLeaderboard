import {fetchApiPage, NotFoundError} from "./fetch";
import {substituteVars} from "../utils/format";
import {default as queue} from "./queue";
import log from '../utils/logger';
import songsRepository from "../db/repository/songs";
import cacheRepository from "../db/repository/cache";
import {
    getRankedsNotesCache,
    getRankedsNotesSongCacheFromCharacteristics,
    setRankedsNotesCache,
} from '../scoresaber/rankeds'
import eventBus from '../utils/broadcast-channel-pubsub'
import nodeSync from './multinode-sync'
import {addToDate} from '../utils/date'

const BEATSAVER_API_URL = 'https://beatsaver.com/api';
const SONG_BY_HASH_URL = BEATSAVER_API_URL + '/maps/by-hash/${hash}';
const SONG_BY_KEY_URL = BEATSAVER_API_URL + '/maps/detail/${key}'

const BS_SUSPENSION_KEY = 'bsSuspension';
const BS_NOT_FOUND_KEY = 'bs404';
const BS_NOT_FOUND_HOURS_BETWEEN_COUNTS = 1;

const addHoursToDate = (hours, date = new Date()) => addToDate(date, 1000 * 60 * 60 * hours);
const isSuspended = bsSuspension => !!bsSuspension && bsSuspension.activeTo > new Date() && bsSuspension.started > addHoursToDate(-24);
const getCurrentSuspension = async () => cacheRepository().get(BS_SUSPENSION_KEY);
const prolongSuspension = async bsSuspension => {
    const current = new Date();

    const suspension = isSuspended(bsSuspension) ? bsSuspension : {started: current, activeTo: new Date(), count: 0};

    suspension.activeTo = addHoursToDate(Math.pow(2, suspension.count), suspension.activeTo);
    suspension.count++;

    return await cacheRepository().set(suspension, BS_SUSPENSION_KEY);
}

const get404Hashes = async () => cacheRepository().get(BS_NOT_FOUND_KEY);
const set404Hashes = async hashes => cacheRepository().set(hashes, BS_NOT_FOUND_KEY);
const isHashUnavailable = async hash => {
    const songs404 = await get404Hashes();
    return songs404 && songs404[hash] && songs404[hash].count >= 3;
}
const setHashNotFound = async hash => {
    const songs404 = await get404Hashes() ?? {};

    const item = songs404[hash] ?? {firstTry: new Date(), recentTry: null, count: 0};

    if (!item.recentTry || addHoursToDate(BS_NOT_FOUND_HOURS_BETWEEN_COUNTS, item.recentTry) < new Date()) {
        item.recentTry = new Date();
        item.count++;

        songs404[hash] = item;

        await set404Hashes(songs404);
    }
}

export const getSongByHash = async (hash, forceUpdate = false, cacheOnly = false) => {
    hash = hash.toLowerCase();

    const songInfo = await songsRepository().get(hash);
    if (!forceUpdate && songInfo) return Promise.resolve(songInfo);

    if(cacheOnly) return null;

    let bsSuspension = await getCurrentSuspension();

    try {
        if (isSuspended(bsSuspension) || await isHashUnavailable(hash)) return null;

        const songInfo = await fetchApiPage(queue.BEATSAVER, substituteVars(SONG_BY_HASH_URL, {hash}));
        if (!songInfo) {
            log.warn(`Song with ${hash} hash is no longer available at Beat Saver.`);
            return Promise.resolve(null)
        }

        return cacheSongInfo(songInfo);
    } catch (err) {
        if (err instanceof TypeError && err.toString().indexOf('Failed to fetch') >= 0) {
            try {await prolongSuspension(bsSuspension)} catch {}
        }

        if (err instanceof NotFoundError) {
            setHashNotFound(hash);
        }

        log.warn(`Error fetching Beat Saver song by hash "${hash}"`);

        return null;
    }
};

export const getSongByKey = async (key, forceUpdate = false, cacheOnly = false) => {
    key = key.toLowerCase();

    const songInfo = await songsRepository().getFromIndex('songs-key', key);
    if (!forceUpdate && songInfo) return Promise.resolve(songInfo);

    if(cacheOnly) return null;

    let bsSuspension = await getCurrentSuspension();

    try {
        if (isSuspended(bsSuspension)) return null;

        const songInfo = await fetchApiPage(queue.BEATSAVER, substituteVars(SONG_BY_KEY_URL, {key}));
        if (!songInfo) {
            log.warn(`Song with ${key} key is no longer available at Beat Saver.`);
            return Promise.resolve(null);
        }

        return cacheSongInfo(songInfo);
    } catch (err) {
        if (err instanceof TypeError && err.toString().indexOf('Failed to fetch') >= 0) {
            try {await prolongSuspension(bsSuspension)} catch {}
        }

        log.warn(`Error fetching Beat Saver song by key "${key}"`);
        return null;
    }
};

async function cacheSongInfo(songInfo) {
    if (!songInfo.hash || !songInfo.key) return null;

    songInfo.hash = songInfo.hash.toLowerCase();
    songInfo.key = songInfo.key.toLowerCase();

    delete songInfo.description;

    await songsRepository().set(songInfo);

    return songInfo;
}

export const fetchRankedsFromBs = async rankedsHashesToFetch => {
    if (!rankedsHashesToFetch || !rankedsHashesToFetch.length || isSuspended(await getCurrentSuspension())) return;

    const currentRankedsCache = await getRankedsNotesCache();

    const songInfos = await Promise.allSettled(rankedsHashesToFetch.map(hash => getSongByHash(hash)));

    if (songInfos && songInfos.length) {
        songInfos.forEach(value => {
            if (value?.status !== 'fulfilled' || !value?.value?.hash) return;

            const songCharacteristics = value?.value?.metadata?.characteristics ?? null;

            currentRankedsCache[value?.value?.hash?.toLowerCase()] = getRankedsNotesSongCacheFromCharacteristics(songCharacteristics);
        });

        await setRankedsNotesCache(currentRankedsCache);

        eventBus.publish('rankeds-notes-cache-updated', {
            nodeId: nodeSync.getId(),
            rankedsNotesCache: currentRankedsCache,
        });
    }
}