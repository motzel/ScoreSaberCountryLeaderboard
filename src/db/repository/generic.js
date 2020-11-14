import cache from '../cache';
import {db} from '../db';

const ALL_KEY = '__ALL';

export default (storeName, inlineKeyName = undefined) => {
  let repositoryCache = cache();

  const get = async (key, refreshCache = false) => {
    if (refreshCache) repositoryCache.forget(key);

    return repositoryCache.get(key, async () => db.get(storeName, key));
  };

  const getAll = async(refreshCache = false) => {
    if (refreshCache) repositoryCache.forget(ALL_KEY);

    return repositoryCache.get(ALL_KEY, async () => db.getAll(storeName));
  }

  const set = async (value, key) => {
    await db.put(storeName, value, inlineKeyName ? undefined : key);

    return repositoryCache.set(inlineKeyName ? value[inlineKeyName] : key, value);
  }

  const forgetCachedKey = key => repositoryCache.forget(key);

  const flushCache = () => repositoryCache.flush();

  return {get, getAll, set, flushCache, forgetCachedKey};
};
