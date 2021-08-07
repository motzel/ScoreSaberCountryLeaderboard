import keyValueRepository from './repository/key-value';
import log from '../utils/logger';
import {db} from './db'
import {getConfig, setConfig} from '../plugin-config'
import {dateFromString} from '../utils/date'
import {convertOldBeatSaverToBeatMaps} from '../network/beatsaver'

const FIXES_KEY = 'data-fix';

const getAppliedFixes = async () => keyValueRepository().get(FIXES_KEY, true);
const storeAppliedFixes = async fixes => keyValueRepository().set(fixes, FIXES_KEY);

const allFixes = {
  'rankeds-20201129': {
    validTo: new Date(2021, 0, 1),
    apply: async () => {
      log.info('Apply rankeds dl fix (20201129)')

      return db.runInTransaction(['rankeds-changes', 'rankeds', 'key-value'], async tx => {
        let cursor = await tx.objectStore('rankeds-changes').index('rankeds-changes-timestamp').openCursor(IDBKeyRange.lowerBound(1606646160000));

        const leaderboardsIds = [];

        // delete rankeds-changes after 2020-11-29, needs to be refeched together with updated scores
        while (cursor) {
          await cursor.delete();

          if (cursor.value.leaderboardId) leaderboardsIds.push(cursor.value.leaderboardId);

          cursor = await cursor.continue();
        }

        let store = tx.objectStore('rankeds');
        await Promise.all(leaderboardsIds.map(leaderboardId => store.delete(leaderboardId)));

        store = tx.objectStore('key-value')
        const allAppliedFixes = await store.get(FIXES_KEY) ?? [];
        allAppliedFixes.push('rankeds-20201129');
        await store.put(allAppliedFixes, FIXES_KEY);
      });
    },
  },

  'config-chart-20210108': {
    apply: async () => {
      log.info('Apply config showChart fix (20210108)');

      const config = await getConfig();
      if (config && config.profile) {
        config.profile.showChart = config.profile.showChart === true ? 'rank' : (config.profile.showChart === false ? 'none' : config.profile.showChart);
        await setConfig(config);
      }

      const allAppliedFixes = await getAppliedFixes() ?? [];
      allAppliedFixes.push('config-chart-20210108');
      await storeAppliedFixes(allAppliedFixes);
    }
  },

  'rankeds-20210117': {
    apply: async () => {
      log.info('Apply rankeds diff fix (20210117)')

      return db.runInTransaction(['rankeds', 'key-value'], async tx => {
        let cursor = await tx.objectStore('rankeds').openCursor();

        while (cursor) {
          const {diff, ...ranked} = cursor.value;

          if (diff && !cursor.value.diffInfo) {
            const updatedRanked = {...ranked, diffInfo: diff};
            cursor.update(updatedRanked);
          }

          cursor = await cursor.continue();
        }

        const store = tx.objectStore('key-value');
        const allAppliedFixes = await store.get(FIXES_KEY) ?? [];
        allAppliedFixes.push('rankeds-20210117');
        await store.put(allAppliedFixes, FIXES_KEY);
      });
    },
  },
  'april-fools-2021': {
    validTo: new Date(2021, 3, 30),
    apply: async () => {
      log.info('Apply april fools fix (2021)')

      const fixDate = new Date(2021, 2, 31);
      const playersKeys = ['lastRankedsRefetch', 'lastUpdated', 'profileLastUpdated', 'beatSaviorLastUpdated'];
      const keyValueKeys = ['activePlayersLastUpdate', 'lastUpdated', 'rankedSongsLastUpdated'];

      return db.runInTransaction(['players', 'key-value'], async tx => {
        let cursor = await tx.objectStore('players').openCursor();

        while (cursor) {
          const player = cursor.value;

          let shouldUpdate = false;
          playersKeys.forEach(key => {
            if (player[key]) {
              if (dateFromString(player[key]) > fixDate) {
                player[key] = fixDate;

                shouldUpdate = true;
              }
            }
          });

          if (shouldUpdate) {
            await cursor.update(player);
          }

          cursor = await cursor.continue();
        }

        cursor = await tx.objectStore('key-value').openCursor();

        while (cursor) {
          const keyValue = cursor.value;

          if (keyValueKeys.includes(cursor.key) && dateFromString(keyValue) > fixDate) {
            await cursor.update(fixDate);
          }

          cursor = await cursor.continue();
        }

        const store = tx.objectStore('key-value');
        const allAppliedFixes = await store.get(FIXES_KEY) ?? [];
        allAppliedFixes.push('april-fools-2021');
        await store.put(allAppliedFixes, FIXES_KEY);
      });
    },
  },

  'beatsaver-20210807': {
    apply: async fixName => {
      log.info('Converting BeatSaver songs to a new format...', 'DBFix')

      return db.runInTransaction(['songs', 'songs-beatmaps', 'key-value'], async tx => {
        const songsBeatMapsStore = tx.objectStore('songs-beatmaps');

        let cursor = await tx.objectStore('songs').openCursor();

        let songCount = 0;

        while (cursor) {
          const beatSaverSong = cursor.value;

          if (beatSaverSong?.metadata?.characteristics) {
            const beatMapsSong = convertOldBeatSaverToBeatMaps(beatSaverSong);
            if (beatMapsSong) {
              songsBeatMapsStore.put(beatMapsSong)

              songCount++;
            } else {
              log.info(`Unable to convert, deleting a song`, 'DBFix');
            }
          } else {
            log.info(`No metadata characteristics, skipping a song`, 'DBFix');
          }

          cursor = await cursor.continue();
        }

        const keyValueStore = tx.objectStore('key-value')
        let allAppliedFixes = await keyValueStore.get(FIXES_KEY);
        allAppliedFixes = allAppliedFixes && Array.isArray(allAppliedFixes) ? allAppliedFixes : [];
        allAppliedFixes.push(fixName);
        await keyValueStore.put(allAppliedFixes, FIXES_KEY);

        log.info(`${songCount} BeatSaver song(s) converted`, 'DBFix')
      });
    }
  },
};

export const setupDataFixes = async () => {
  const appliedFixes = await getAppliedFixes() ?? [];
  const neededFixes = Object.keys(allFixes).filter(f => !appliedFixes.includes(f) && (!allFixes[f].validTo || allFixes[f].validTo > new Date()));

  if (!neededFixes.length) return;

  for (let key of neededFixes) {
    await allFixes[key].apply(key);
  }
}