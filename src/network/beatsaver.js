import {fetchApiPage, NotFoundError} from "./fetch";
import {substituteVars} from "../utils/format";
import {default as queue} from "./queue";
import log from '../utils/logger';
import songsBeatmapsRepository from "../db/repository/songs-beatmaps";
import cacheRepository from "../db/repository/cache";
import eventBus from '../utils/broadcast-channel-pubsub'
import nodeSync from '../utils/multinode-sync'
import {addToDate, dateFromString} from '../utils/date'
import makePendingPromisePool from '../utils/pending-promises'
import {capitalize} from '../utils/js'

const BEATSAVER_API_URL = 'https://beatsaver.com/api';
const SONG_BY_HASH_URL = BEATSAVER_API_URL + '/maps/hash/${hash}';
const SONG_BY_KEY_URL = BEATSAVER_API_URL + '/maps/id/${key}'

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

const resolvePromiseOrWaitForPending = makePendingPromisePool();

export const getSongByHash = async (hash, forceUpdate = false, cacheOnly = false) => {
    hash = hash.toLowerCase();

    const songInfo = await songsBeatmapsRepository().get(hash);
    if (!forceUpdate && songInfo) return Promise.resolve(songInfo);

    if(cacheOnly) return null;

    let bsSuspension = await getCurrentSuspension();

    try {
        if (isSuspended(bsSuspension) || await isHashUnavailable(hash)) return null;

        const songInfo = await resolvePromiseOrWaitForPending(hash, () => fetchApiPage(queue.BEATSAVER, substituteVars(SONG_BY_HASH_URL, {hash})), 8000);
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

    const songInfo = await songsBeatmapsRepository().getFromIndex('songs-beatmaps-key', key);
    if (!forceUpdate && songInfo) return Promise.resolve(songInfo);

    if(cacheOnly) return null;

    let bsSuspension = await getCurrentSuspension();

    try {
        if (isSuspended(bsSuspension)) return null;

        const songInfo = await resolvePromiseOrWaitForPending(key, () => fetchApiPage(queue.BEATSAVER, substituteVars(SONG_BY_KEY_URL, {key})));
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

export const convertOldBeatSaverToBeatMaps = song => {
    let {key, hash, name, metadata: {characteristics}} = song;

    if (!key || !hash || !name || !characteristics || !Array.isArray(characteristics)) return null;

    if (hash.toLowerCase) hash = hash.toLowerCase();

    const diffs = characteristics.reduce((diffs, ch) => {
        if (!ch.name || !ch.difficulties) return diffs;
        const characteristic = ch.name;

        return diffs.concat(
          Object.entries(ch.difficulties)
            .map(([difficulty, obj]) => {
                if (!obj) return null;
                difficulty = capitalize(difficulty);

                const seconds = obj?.length ?? null;
                const notes = obj?.notes ?? null

                const nps = notes && seconds ? notes / seconds : null;

                return {
                    njs: obj?.njs ?? null,
                    offset: obj?.njsOffset ?? null,
                    notes,
                    bombs: obj?.bombs ?? null,
                    obstacles: obj?.obstacles ?? null,
                    nps,
                    length: obj?.duration ?? null,
                    characteristic,
                    difficulty,
                    events: null,
                    chroma: null,
                    me: null,
                    ne: null,
                    cinema: null,
                    seconds,
                    paritySummary: {
                        errors: null,
                        warns: null,
                        resets: null,
                    },
                    stars: null,
                };
            }))
          .filter(diff => diff)
    }, []);

    return {
        lastUpdated: dateFromString(song?.uploaded) ?? new Date(),
        oldBeatSaverId: song?._id ?? null,
        id: key,
        hash,
        key,
        name,
        description: '',
        uploader: {
            id: null,
            name: song?.uploader?.username ?? null,
            hash: null,
            avatar: null
        },
        metadata: {
            bpm: song?.metadata?.bpm ?? null,
            duration: song?.metadata?.duration ?? null,
            songName: song?.metadata?.songName ?? '',
            songSubName: song?.metadata?.songSubName ?? '',
            songAuthorName: song?.metadata?.songAuthorName ?? '',
            levelAuthorName: song?.metadata?.levelAuthorName ?? ''
        },
        stats: {
            plays: song?.stats?.plays ?? 0,
            downloads: song?.stats?.downloads ?? 0,
            upvotes: song?.stats?.upVotes ?? 0,
            downvotes: song?.stats?.downVotes ?? 0,
            score: null
        },
        uploaded: song?.uploaded ?? null,
        automapper: !!(song?.metadata?.automapper ?? false),
        ranked: null,
        qualified: null,
        versions: [
            {
                hash,
                key,
                state: "Published",
                createdAt: song?.uploaded ?? null,
                sageScore: null,
                diffs,
                downloadURL: `https://cdn.beatsaver.com/${hash}.zip`,
                coverURL: `https://cdn.beatsaver.com/${hash}.jpg`,
                previewURL: `https://cdn.beatsaver.com/${hash}.mp3`
            }
        ]
    }
}

async function cacheSongInfo(songInfo) {
    const hash = songInfo?.versions?.[0].hash;
    const key = songInfo?.versions?.[0].key;

    if (!hash || !key || !hash.toLowerCase) return null;

    songInfo.hash = hash.toLowerCase();
    songInfo.key = key.toLowerCase();

    delete songInfo.description;

    await songsBeatmapsRepository().set(songInfo);

    return songInfo;
}
