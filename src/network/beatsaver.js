import {fetchApiPage, NotFoundError} from "./fetch";
import {substituteVars} from "../utils/format";
import {default as queue} from "./queue";
import log from '../utils/logger';
import songsRepository from "../db/repository/songs";
import {
    getRankedsNotesCache,
    getRankedsNotesSongCacheFromCharacteristics,
    setRankedsNotesCache,
} from '../scoresaber/rankeds'
import eventBus from '../utils/broadcast-channel-pubsub'
import nodeSync from './multinode-sync'

const BEATSAVER_API_URL = 'https://beatsaver.com/api';
const SONG_BY_HASH_URL = BEATSAVER_API_URL + '/maps/by-hash/${hash}';
const SONG_BY_KEY_URL = BEATSAVER_API_URL + '/maps/detail/${key}'

export const getSongByHash = async (hash, forceUpdate = false, cacheOnly = false) => {
    hash = hash.toLowerCase();

    const songInfo = await songsRepository().get(hash);
    if (!forceUpdate && songInfo) return Promise.resolve(songInfo);

    if(cacheOnly) return null;

    try {
        const songInfo = await fetchApiPage(queue.BEATSAVER, substituteVars(SONG_BY_HASH_URL, {hash}));
        if (!songInfo) {
            log.warn(`Song with ${hash} hash is no longer available at Beat Saver.`);
            return Promise.resolve(null)
        }

        return cacheSongInfo(songInfo);
    } catch (err) {
        if (err instanceof NotFoundError) {
            // TODO: cache it and do not try again
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

    try {
        const songInfo = await fetchApiPage(queue.BEATSAVER, substituteVars(SONG_BY_KEY_URL, {key}));
        if (!songInfo) {
            log.warn(`Song with ${key} key is no longer available at Beat Saver.`);
            return Promise.resolve(null);
        }

        return cacheSongInfo(songInfo);
    } catch (err) {
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
    if (!rankedsHashesToFetch || !rankedsHashesToFetch.length) return;

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