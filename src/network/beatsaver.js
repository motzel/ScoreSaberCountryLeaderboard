import {fetchApiPage} from "./fetch";
import {substituteVars} from "../utils/format";

const BEATSAVER_API_URL = 'https://beatsaver.com/api';
const SONG_BY_HASH_URL = BEATSAVER_API_URL + '/maps/by-hash/${songHash}';

// 50 reqs/min, max 8 at the time
export const RATE_LIMITS = {
    concurrency: 8,
    limit: 50,
    time: 60 * 1000
}

export const fetchSongByHash = async (songHash) =>
    await fetchApiPage(substituteVars(SONG_BY_HASH_URL, {songHash}));

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
