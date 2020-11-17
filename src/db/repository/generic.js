import cache from '../cache';
import {db} from '../db';

const ALL_KEY = '__ALL';

export default (storeName, inlineKeyName = undefined) => {
  let repositoryCache = cache();

  const get = async (key, refreshCache = false) => {
    if (refreshCache) repositoryCache.forget(key);

    return repositoryCache.get(key, async () => db.get(storeName, key));
  };

  const getAll = async(query = undefined, count = undefined, refreshCache = false) => {
    const key = (query ? query : ALL_KEY) + '-' + (count ? count : ALL_KEY)

    if (refreshCache) repositoryCache.forget(key);

    return repositoryCache.get(key, async () => db.getAll(storeName, query, count));
  }

  const getAllFromIndex = async(indexName, query = undefined, count = undefined, refreshCache = false) => {
    const key = indexName + '-' + (query ? query : ALL_KEY) + '-' + (count ? count : ALL_KEY)

    if (refreshCache) repositoryCache.forget(key);

    return repositoryCache.get(key, async () => db.getAllFromIndex(storeName, indexName, query, count));
  }

  const set = async (value, key) => {
    await db.put(storeName, value, inlineKeyName ? undefined : key);

    return repositoryCache.set(inlineKeyName ? value[inlineKeyName] : key, value);
  }

  const forgetCachedKey = key => repositoryCache.forget(key);

  const flushCache = () => repositoryCache.flush();

  return {get, getAll, getAllFromIndex, set, flushCache, forgetCachedKey};
};
