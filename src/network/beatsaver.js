import {fetchApiPage} from "./fetch";
import {substituteVars} from "../utils/format";
import {default as queue} from "./queue";
import {getCacheAndConvertIfNeeded, setCache} from "../store";

const BEATSAVER_API_URL = 'https://beatsaver.com/api';
const SONG_BY_HASH_URL = BEATSAVER_API_URL + '/maps/by-hash/${hash}';
const SONG_BY_KEY_URL = BEATSAVER_API_URL + '/maps/detail/${key}'

export const getSongByHash = async (hash, forceUpdate = false) => {
    hash = hash.toLowerCase();

    const data = await getCacheAndConvertIfNeeded();
    if (!forceUpdate && data.beatSaver && data.beatSaver.hashes && data.beatSaver.hashes[hash]) return Promise.resolve(data.beatSaver.hashes[hash]);

    console.log("fetch", hash, data.beatSaver);
    const songInfo = await fetchApiPage(queue.BEATSAVER, substituteVars(SONG_BY_HASH_URL, {hash}));
    if (!songInfo) return Promise.resolve(null);

    return cacheSongInfo(songInfo);
};

export const getSongByKey = async (key, forceUpdate = false) => {
    key = key.toLowerCase();

    const data = await getCacheAndConvertIfNeeded();
    if (
        !forceUpdate && data.beatSaver &&
        data.beatSaver.keys && data.beatSaver.keys[key] &&
        data.beatSaver.hashes && data.beatSaver.hashes[data.beatSaver.keys[key]]
    ) return Promise.resolve(data.beatSaver.hashes[data.beatSaver.keys[key]]);

    const songInfo = await fetchApiPage(queue.BEATSAVER, substituteVars(SONG_BY_KEY_URL, {key}));
    if (!songInfo) return Promise.resolve(null);

    return cacheSongInfo(songInfo);
};

export function extractDiffAndType(ssDiff) {
    const match = /^_([^_]+)_Solo(.*)$/.exec(ssDiff);
    if (!match) return null;

    return {
        diff: match[1].toLowerCase().replace('plus', 'Plus'),
        type: match[2] ?? 'Standard'
    };
}

export function findDiffInfo(characteristics, ssDiff) {
    if (!characteristics) return null;
    const diffAndType = extractDiffAndType(ssDiff);
    if (!diffAndType) return null;

    return characteristics.reduce((cum, ch) => {
        if (ch.name === diffAndType.type) {
            return ch.difficulties?.[diffAndType.diff];
        }

        return cum;
    }, null);
}

async function cacheSongInfo(songInfo) {
    const data = await getCacheAndConvertIfNeeded();

    delete songInfo.description;

    if (!data.beatSaver) data.beatSaver = {hashes: {}, keys: {}};

    if (songInfo.hash) {
        data.beatSaver.hashes[songInfo.hash.toLowerCase()] = songInfo;
        if (songInfo.key) data.beatSaver.keys[songInfo.key.toLowerCase()] = songInfo.hash;
    }

    await setCache(data);

    return songInfo;
}
