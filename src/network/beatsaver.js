import {fetchApiPage} from "./fetch";
import {substituteVars} from "../utils/format";
import {default as queue} from "./queue";
import {getCacheAndConvertIfNeeded, setCache} from "../store";
import log from '../utils/logger';
import songsRepository from "../db/repository/songs";

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
        log.warn(`Error fetching Beat Saver song by hash "${hash}"`);
        return null;
    }
};

// TODO:
export const getSongByKey = async (key, forceUpdate = false) => {
    key = key.toLowerCase();

    const data = await getCacheAndConvertIfNeeded();
    if (
        !forceUpdate && data.beatSaver &&
        data.beatSaver.keys && data.beatSaver.keys[key] &&
        data.beatSaver.hashes && data.beatSaver.hashes[data.beatSaver.keys[key]]
    ) return Promise.resolve(data.beatSaver.hashes[data.beatSaver.keys[key]]);

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
    if (!songInfo.hash) return null;

    delete songInfo.description;

    await songsRepository().set(songInfo);

    return songInfo;
}
