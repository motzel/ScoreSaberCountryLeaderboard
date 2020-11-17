import {convertFromLocalForage, fetchLocalForageData} from './convert-localforage'
import {openDB} from 'idb'
import log from '../utils/logger'

const SSPL_DB_VERSION = 2;
export let db = null;

export default async () => {
  let cache = null;
  if (await isConversionFromLocalforageNeeded()) {
    cache = await fetchLocalForageData();
  }

  return await openDatabase(cache);
}

async function openDatabase(cache = null) {
  try {
    db = await openDB('sspl', SSPL_DB_VERSION, {
      async upgrade(db, oldVersion, newVersion, transaction) {
        log.info(`Converting database from version ${oldVersion} to version ${newVersion}`);

        switch (newVersion) {
          case 2:
            db.createObjectStore('players', {
              keyPath: 'id',
              autoIncrement: false,
            });

            const playersHistory = db.createObjectStore('players-history', {
              autoIncrement: true,
            });
            playersHistory.createIndex('players-history-playerId', 'playerId', {unique: false});

            const scoresStore = db.createObjectStore('scores', {
              keyPath: 'id',
              autoIncrement: false,
            });
            scoresStore.createIndex('scores-leaderboard', 'leaderboardId', {unique: false});
            scoresStore.createIndex('scores-player', 'playerId', {unique: false});

            const leaderboardsStore = db.createObjectStore('leaderboards', {
              keyPath: 'leaderboardId',
              autoIncrement: false,
            });
            leaderboardsStore.createIndex('leaderboards-status', 'status', {unique: false});

            const songsStore = db.createObjectStore('songs', {
              keyPath: 'hash',
              autoIncrement: false,
            });
            songsStore.createIndex('songs-key', 'key', {unique: true});

            db.createObjectStore('twitch', {
              keyPath: 'playerId',
              autoIncrement: false,
            });

            const rankedsChangesStore = db.createObjectStore('rankeds-changes', {
              autoIncrement: true,
            });
            rankedsChangesStore.createIndex('rankeds-changes-timestamp', 'timestamp', {unique: false});
            rankedsChangesStore.createIndex('rankeds-changes-leaderboardId', 'leaderboardId', {unique: false});

            // no autoIncrement, no keyPath - key must be provided
            db.createObjectStore('key-value');

            const groups = db.createObjectStore('groups', {autoIncrement: true});
            groups.createIndex('groups-name', 'name', {unique: false});

            await convertFromLocalForage(cache, transaction);
        }

        log.info("Database converted");
      },

      // TODO
      blocked() {
        console.warn('DB blocked')
      },
      blocking(event) {
        // other tab tries to open newer db version - close connection
        console.warn('DB blocking', event)
        db.close();

        // TODO: should be reopened with new version: event.newVersion
        // TODO: or rather notify user / auto reload page
      },
      terminated() {
        console.warn('DB terminated')
      },
    });

    return db;
  }
  catch(e) {
    log.error('Can not open DB. Please update plugin to the newest version.');

    throw e;
  }
}

async function isConversionFromLocalforageNeeded() {
  let convertingFromLocalForageNeeded = false;
  try {
    const db1 = await openDB('sspl', 1, {
      async upgrade(db, oldVersion, newVersion) {
        convertingFromLocalForageNeeded = true;
      },
    });
    db1.close();
  } catch {
    // swallow error - old localforage cache is already converted
  }
  return convertingFromLocalForageNeeded
}