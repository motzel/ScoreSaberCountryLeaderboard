import rankedsRepository from "../db/repository/rankeds";
import keyValueRepository from "../db/repository/key-value";
import rankedsChangesRepository from "../db/repository/rankeds-changes";
import {convertArrayToObjectByKey} from '../utils/js'

export const storeRanked = async ranked => rankedsRepository().set(ranked);
export const storeRankeds = async rankeds => Promise.all(rankeds.map(async ranked => storeRanked(ranked)));
export const getRankedSongs = async (refreshCache = false) => convertArrayToObjectByKey(await rankedsRepository().getAll(undefined, refreshCache) ?? {}, 'leaderboardId');
export const getRankedSongsLastUpdated = async (refreshCache = true) => keyValueRepository().get('rankedSongsLastUpdated', refreshCache);
export const setRankedSongsLastUpdated = async date => keyValueRepository().set(date,'rankedSongsLastUpdated');
export const getRankedChanges = async query => rankedsChangesRepository().getAllFromIndex('rankeds-changes-timestamp', query);
export const getRankedsChangesSince = async sinceTimestamp => {
    const changes = await getRankedChanges(IDBKeyRange.lowerBound(sinceTimestamp));
    if (!changes || !changes.length) return {};

    // return all song changes for matched timestamps {leaderboardId: [{change1}, {change2}...]}
    return changes.reduce((cum, change) => {
        cum[change.leaderboardId] = cum[change.leaderboardId] ?? [];
        cum[change.leaderboardId].push(change);

        return cum;
    }, {});
}
export const storeRankedsChanges = async rankedsChanges => Promise.all(rankedsChanges.map(async rc => rankedsChangesRepository().set(rc)));

// errors in API
export const UNRANKED = [97223, 20506, 102179, 102180];
export const RANKED = [];
