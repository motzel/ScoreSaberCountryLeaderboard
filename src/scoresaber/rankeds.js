import leaderboardsRepository from "../db/repository/leaderboards";
import keyValueRepository from "../db/repository/key-value";
import rankedsChangesRepository from "../db/repository/rankeds-changes";
import {convertArrayToObjectByKey} from '../utils/js'

export const getRankedSongs = async (force = false) => {
    const rankeds = await leaderboardsRepository().getAllFromIndex('leaderboards-status', 'ranked', undefined, force);
    return rankeds ? convertArrayToObjectByKey(rankeds, 'leaderboardId') : null;
}
export const getRankedSongsLastUpdated = async (refreshCache = true) => keyValueRepository().get('rankedSongsLastUpdated', refreshCache);
export const getRankedChanges = async query => {
    return rankedsChangesRepository().getAllFromIndex('rankeds-changes-timestamp', query);
}
export const getRankedsChangesSince = async sinceTimestamp => {
    const changes = await rankedsChangesRepository().getAllFromIndex('rankeds-changes-timestamp', IDBKeyRange.lowerBound(sinceTimestamp));
    if (!changes || !changes.length) return {};

    // return all song changes for matched timestamps {leaderboardId: [{change1}, {change2}...]}
    return changes.reduce((cum, change) => {
        cum[change.leaderboardId] = cum[change.leaderboardId] ?? [];
        cum[change.leaderboardId].push(change);
    }, {});
}

// errors in API
export const UNRANKED = [97223, 20506, 102179, 102180];
export const RANKED = [];