import keyValueRepository from './repository/key-value';
import log from '../utils/logger';
import {db} from './db'

const FIXES_KEY = 'data-fix';

const getAppliedFixes = async () => keyValueRepository().get(FIXES_KEY, true);

const allFixes = {
  'rankeds-20201129': async () => {
    log.info('Apply rankeds dl fix (20201129)')

    return db.runInTransaction(['rankeds-changes', 'rankeds', 'key-value'], async tx => {
      let cursor = await tx.objectStore('rankeds-changes').index('rankeds-changes-timestamp').openCursor(IDBKeyRange.lowerBound(1606646160000));

      const leaderboardsIds = [];

      // delete rankeds-changes after 2020-11-29, needs to be refeched together with updated scores
      while (cursor) {
        await cursor.delete();

        if(cursor.value.leaderboardId) leaderboardsIds.push(cursor.value.leaderboardId);

        cursor = await cursor.continue();
      }

      let store = tx.objectStore('rankeds');
      await Promise.all(leaderboardsIds.map(leaderboardId => store.delete(leaderboardId)));

      store = tx.objectStore('key-value')
      const allAppliedFixes = await store.get(FIXES_KEY) ?? [];
      allAppliedFixes.push('rankeds-20201129');
      await store.put(allAppliedFixes, FIXES_KEY);
    });
  }
};

export const setupDataFixes = async () => {
  const appliedFixes = await getAppliedFixes() ?? [];
  const neededFixes = Object.keys(allFixes).filter(f => !appliedFixes.includes(f));

  if (!neededFixes.length) return;

  for(let key of neededFixes) {
    await allFixes[key]();
  }
}