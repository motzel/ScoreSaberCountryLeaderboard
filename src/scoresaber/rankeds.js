import {getCacheAndConvertIfNeeded} from "../store";

export const getRankedSongs = async (force = false) => (await getCacheAndConvertIfNeeded(force)).rankedSongs;
export const getRankedChanges = async _ => (await getCacheAndConvertIfNeeded()).rankedSongsChanges ?? {};
export const getFilteredRankedChanges = async filterTimestampFunc => {
    const rankedSongsChanges = await getRankedChanges();

    const changeTimestampsSorted = Object.keys(rankedSongsChanges).sort((a, b) => a - b);

    const timestampsMatchingFilter = changeTimestampsSorted.filter(filterTimestampFunc);

    // return all song changes for matched timestamps {leaderboardId: [{change1}, {change2}...]}
    return timestampsMatchingFilter.reduce((cum, timestamp) => {
        rankedSongsChanges[timestamp].forEach(c => {
            cum[c.leaderboardId] = cum[c.leaderboardId] ?? [];
            cum[c.leaderboardId].push({...c, timestamp: parseInt(timestamp, 10)});
        });

        return cum
    }, {});
}

// errors in API
export const UNRANKED = [97223, 20506];
export const RANKED = [102179, 102180]