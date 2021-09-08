import {openDB} from 'idb'
import log from '../utils/logger'
import {isDateObject} from '../utils/js'
import {updateSongCountryRanks} from '../song'
import eventBus from '../utils/broadcast-channel-pubsub'

const SSPL_DB_VERSION = 5;
export let db = null;

import cacheRepository from './repository/cache';
import groupsRepository from './repository/groups';
import keyValueRepository from './repository/key-value';
import playersRepository from './repository/players';
import playersHistoryRepository from './repository/players-history';
import rankedsRepository from './repository/rankeds';
import rankedsChangesRepository from './repository/rankeds-changes';
import scoresRepository from './repository/scores';
import songsBeatMapsRepository from './repository/songs-beatmaps';
import twitchRepository from './repository/twitch';

export default async () => {
  IDBKeyRange.prototype.toString = function () {
    return "IDBKeyRange-" + (isDateObject(this.lower) ? this.lower.getTime() : this.lower) + '-' + (isDateObject(this.upper) ? this.upper : this.upper);
  }

  return await openDatabase();
}

async function openDatabase() {
  try {
    let dbNewVersion = 0, dbOldVersion = 0;

    db = await openDB('sspl', SSPL_DB_VERSION, {
      async upgrade(db, oldVersion, newVersion, transaction) {
        log.info(`Converting database from version ${oldVersion} to version ${newVersion}`);

        dbNewVersion = newVersion;
        dbOldVersion = oldVersion;

        switch (true) {
          case newVersion >= 2 && oldVersion < 2:
            db.createObjectStore('players', {
              keyPath: 'id',
              autoIncrement: false,
            });

            const playersHistory = db.createObjectStore('players-history', {
              keyPath: '_idbId',
              autoIncrement: true,
            });
            playersHistory.createIndex('players-history-playerId', 'playerId', {unique: false});
            playersHistory.createIndex('players-history-timestamp', 'timestamp', {unique: false});

            const scoresStore = db.createObjectStore('scores', {
              keyPath: 'id',
              autoIncrement: false,
            });
            scoresStore.createIndex('scores-leaderboardId', 'leaderboardId', {unique: false});
            scoresStore.createIndex('scores-playerId', 'playerId', {unique: false});
            scoresStore.createIndex('scores-timeset', 'timeset', {unique: false});
            scoresStore.createIndex('scores-pp', 'pp', {unique: false});

            db.createObjectStore('rankeds', {
              keyPath: 'leaderboardId',
              autoIncrement: false,
            });

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
              keyPath: '_idbId',
              autoIncrement: true,
            });
            rankedsChangesStore.createIndex('rankeds-changes-timestamp', 'timestamp', {unique: false});
            rankedsChangesStore.createIndex('rankeds-changes-leaderboardId', 'leaderboardId', {unique: false});

            // no autoIncrement, no keyPath - key must be provided
            db.createObjectStore('key-value');

            db.createObjectStore('cache');

            const groups = db.createObjectStore('groups', {keyPath: '_idbId', autoIncrement: true});
            groups.createIndex('groups-name', 'name', {unique: false});
            groups.createIndex('groups-playerId', 'playerId', {unique: false});

            // NO break here!

          case newVersion >= 3 && oldVersion < 3:
            const beatSaviorFiles = db.createObjectStore('beat-savior-files', {
              keyPath: 'fileId',
              autoIncrement: false,
            });

            const beatSavior = db.createObjectStore('beat-savior', {
              keyPath: 'beatSaviorId',
              autoIncrement: false,
            });
            beatSavior.createIndex('beat-savior-playerId', 'playerId', {unique: false});
            beatSavior.createIndex('beat-savior-songId', 'songId', {unique: false});
            beatSavior.createIndex('beat-savior-fileId', 'fileId', {unique: false});

          // NO break here!

          case newVersion >= 4 && oldVersion < 4:
            const songsBeatMapsStore = db.createObjectStore('songs-beatmaps', {
              keyPath: 'hash',
              autoIncrement: false,
            });
            songsBeatMapsStore.createIndex('songs-beatmaps-key', 'key', {unique: true});

          // NO break here

          case newVersion >= 5 && oldVersion < 5:
            const songsBeatMapsStoreV2 = transaction.objectStore('songs-beatmaps');
            songsBeatMapsStoreV2.deleteIndex('songs-beatmaps-key');
            songsBeatMapsStoreV2.createIndex('songs-beatmaps-key', 'key', {unique: false});

          // NO break here
        }

        log.info("Database converted");
      },

      // TODO
      blocked() {
        console.warn('DB blocked')
      },
      blocking() {
        // other tab tries to open newer db version - close connection
        console.warn('DB blocking... will be closed')
        db.close();

        eventBus.publish('dl-manager-pause-cmd');

        // TODO: should be reopened with new version: event.newVersion
        // TODO: or rather notify user / auto reload page
      },
      terminated() {
        console.warn('DB terminated');

        eventBus.publish('dl-manager-pause-cmd');
      },
    });

    // enhance db object
    let _currentTransaction = null;
    const getCurrentTransaction = () => _currentTransaction;
    const getTransactionMode = () => _currentTransaction?.mode ?? null;
    const getTransactionStores = () => [..._currentTransaction?.objectStoreNames ?? []];

    // Closure code should awaits DB operations ONLY or fail
    // https://github.com/jakearchibald/idb#user-content-transaction-lifetime
    const runInTransaction = async (objectStores, closure, mode = 'readwrite', options = {durability: 'strict'}) => {
      try {
        if (_currentTransaction) return Promise.reject('Another transaction in progress');

        _currentTransaction = db.transaction(objectStores, mode, options);

        _currentTransaction.getMode = getTransactionMode;
        _currentTransaction.getStores = getTransactionStores;

        try {
          const result = await closure(_currentTransaction);

          await _currentTransaction.done;

          return result;
        }
        finally {
          _currentTransaction = null;
        }
      }
      catch(e) {
        _currentTransaction = null;

        throw e;
      }
    }
    db.getCurrentTransaction = getCurrentTransaction;
    db.runInTransaction = runInTransaction;

    if (dbNewVersion === 2 && dbOldVersion !== dbNewVersion) {
      log.info("Create country ranks cache");
      await updateSongCountryRanks();
    }

    // initialize all repositories in order to create cache to sync
    [cacheRepository, groupsRepository, keyValueRepository, playersRepository, playersHistoryRepository, rankedsRepository, rankedsChangesRepository, scoresRepository, songsBeatMapsRepository, twitchRepository].map(repository => repository());

    return db;
  }
  catch(e) {
    log.error('Can not open DB. Please update plugin to the newest version.');

    throw e;
  }
}