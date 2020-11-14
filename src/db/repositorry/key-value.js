import cache from '../cache';
import {db} from '../db';

const STORE = 'key-value';

let configCache = cache();

const get = async (key, refreshCache = false) => {
  const fetchFromDb = async () => db.get(STORE, key);

  return refreshCache
    ? configCache.set(key, await fetchFromDb())
    : configCache.get(key, fetchFromDb);
};

const set = async (key, value) => {

  await db.put(STORE, value, key);

  return configCache.set(key, value);
}

export default {get, set};