import cache from '../cache';
import {db} from '../db';

export const ALL_KEY = '__ALL';
const NONE_KEY = '__NONE';

// TODO: add cache tags support for easier cache invalidation
export default (storeName, inlineKeyName = undefined) => {
  let repositoryCache = cache();

  const getCacheKeyFor =  (query, count, indexName) => (indexName ? indexName : ALL_KEY) + '-' + (query ? query : NONE_KEY) + '-' + (count ? count : ALL_KEY);

  const getCachedKeys = _ => repositoryCache.getKeys();

  const forgetCachedKey = key => repositoryCache.forget(key);

  const flushCache = () => repositoryCache.flush();

  const get = async (key, refreshCache = false) => {
    const cacheKey = getCacheKeyFor(key);

    if (refreshCache) repositoryCache.forget(cacheKey);

    return repositoryCache.get(cacheKey, async () => db.get(storeName, key));
  };

  const getFromIndex = async (indexName, query, refreshCache = false) => {
    const cacheKey = getCacheKeyFor(query, undefined, indexName);

    if (refreshCache) repositoryCache.forget(cacheKey);

    return repositoryCache.get(cacheKey, async () => db.getFromIndex(storeName, indexName, query));
  };

  const getAll = async(query = undefined, count = undefined, refreshCache = false) => {
    const cacheKey = getCacheKeyFor(query, count);

    if (refreshCache) repositoryCache.forget(cacheKey);

    return repositoryCache.get(cacheKey, async () => db.getAll(storeName, query, count));
  }

  const getAllFromIndex = async(indexName, query = undefined, count = undefined, refreshCache = false) => {
    const cacheKey = getCacheKeyFor(query, count, indexName);

    if (refreshCache) repositoryCache.forget(cacheKey);

    return repositoryCache.get(cacheKey, async () => db.getAllFromIndex(storeName, indexName, query, count));
  }

  const set = async (value, key) => {
    const tx = db.getCurrentTransaction();

    if (tx) {
      await tx.objectStore(storeName).put(value, inlineKeyName ? undefined : key);
    } else {
      await db.put(storeName, value, inlineKeyName ? undefined : key);
    }

    return repositoryCache.set(getCacheKeyFor(inlineKeyName ? value[inlineKeyName] : key), value);
  }

  const del = async key => {
    await db.delete(storeName, key);

    return repositoryCache.forget(getCacheKeyFor(key));
  }

  const deleteObject = async obj => {
    if (!inlineKeyName || !inlineKeyName.length) throw 'deleteObject function is not available in repositories with out-of-line keys';

    if (!obj[inlineKeyName]) throw `Object does not contain ${inlineKeyName} field which is repository key`;

    return del(obj[inlineKeyName]);
  }

  const openCursor = async (mode = 'readonly') => db.transaction(storeName, mode).store.openCursor();

  return {get, getFromIndex, getAll, getAllFromIndex, set, delete: del, deleteObject, openCursor, flushCache, forgetCachedKey, getCachedKeys, getCacheKeyFor};
};
