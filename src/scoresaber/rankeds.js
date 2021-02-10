import rankedsRepository from "../db/repository/rankeds";
import keyValueRepository from "../db/repository/key-value";
import rankedsChangesRepository from "../db/repository/rankeds-changes";
import {convertArrayToObjectByKey} from '../utils/js'
import {getAccFromScore, getMaxScore} from '../song'
import songsRepository from '../db/repository/songs'

const RANKEDS_NOTES_CACHE_KEY = 'rankedsNotes';

export const storeRanked = async ranked => rankedsRepository().set(ranked);
export const storeRankeds = async rankeds => Promise.all(rankeds.map(async ranked => storeRanked(ranked)));
export const getRankedSongs = async () => convertArrayToObjectByKey(await rankedsRepository().getAll() ?? {}, 'leaderboardId');
export const getRankedSongsLastUpdated = async () => keyValueRepository().get('rankedSongsLastUpdated');
export const setRankedSongsLastUpdated = async date => keyValueRepository().set(date,'rankedSongsLastUpdated');
export const getRankedsChangesSince = async (sinceTimestamp, upToTimestamp = null) => {
    const changes = await rankedsChangesRepository().getAllFromIndex('rankeds-changes-timestamp', upToTimestamp ? IDBKeyRange.bound(sinceTimestamp, upToTimestamp) : IDBKeyRange.lowerBound(sinceTimestamp));
    if (!changes || !changes.length) return {};

    // return all song changes for matched timestamps {leaderboardId: [{change1}, {change2}...]}
    return changes.reduce((cum, change) => {
        cum[change.leaderboardId] = cum[change.leaderboardId] ?? [];
        cum[change.leaderboardId].push(change);

        return cum;
    }, {});
}
export const storeRankedsChanges = async rankedsChanges => Promise.all(rankedsChanges.map(async rc => rankedsChangesRepository().set(rc)));
export const getAccFromRankedScore = (score, rankedsCache) => {
    if (!score || !rankedsCache) return getAccFromScore(score);

    const hash = (score.hash) ? score.hash.toLowerCase() : null;
    const diffInfo = score.diffInfo;

    if (!hash || !diffInfo || !diffInfo.type || !diffInfo.diff) return getAccFromScore(score);

    const notesCount = rankedsCache?.[hash]?.[diffInfo.type]?.[diffInfo.diff];
    if (!notesCount) return getAccFromScore(score);

    return getAccFromScore(score, getMaxScore(notesCount));
}
export const setRankedsNotesCache = async rankedsNotesCache => keyValueRepository().set(rankedsNotesCache, RANKEDS_NOTES_CACHE_KEY);

export const getRankedsNotesCache = async () => {
    // try to get current cache
    const currentCache = await keyValueRepository().get(RANKEDS_NOTES_CACHE_KEY);
    if (currentCache) return currentCache;

    // prepare cache
    const bsSongs = convertArrayToObjectByKey(
      (await songsRepository().getAll()).map(s => ({hash: s.hash.toLowerCase(), characteristics: s?.metadata?.characteristics})),
      'hash'
    );
    const rankedsWithLowerCaseHashes = Object.values(await getRankedSongs()).map(r => ({...r, hash: r.hash.toLowerCase()}));
    const rankedsNotesCaches = rankedsWithLowerCaseHashes.reduce((cum, ranked) => {
        if (!ranked.leaderboardId) return cum;

        const hash = ranked.hash;

        const songCharacteristics = bsSongs?.[hash]?.characteristics ?? null;
        const songNotesCount = getRankedsNotesSongCacheFromCharacteristics(songCharacteristics);

        if (!cum[hash]) cum[hash] = songNotesCount;

        return cum;
    }, {});

    // store cache
    await keyValueRepository().set(rankedsNotesCaches, RANKEDS_NOTES_CACHE_KEY);

    return rankedsNotesCaches;
}

export const getRankedsNotesSongCacheFromCharacteristics = songCharacteristics => {
    return songCharacteristics
      ? songCharacteristics.reduce((scCum, ch) => {
          scCum[ch.name] = Object.keys(ch.difficulties).reduce((dCum, diffKey) => {
              const notes = ch.difficulties?.[diffKey]?.notes
              if (!notes) return dCum;

              dCum[diffKey] = notes;

              return dCum;
          }, {})
          return scCum;
      }, {})
      : null;
}

// errors in API
export const UNRANKED = [97223, 20506, 102179, 102180];
export const RANKED = [];
