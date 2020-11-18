import cache from '../cache';
import {db} from '../db';

const ALL_KEY = '__ALL';
const NONE_KEY = '__NONE';

export default (storeName, inlineKeyName = undefined) => {
  let repositoryCache = cache();

  const forgetCachedKey = key => repositoryCache.forget(key);

  const flushCache = () => repositoryCache.flush();

  const get = async (key, refreshCache = false) => {
    if (refreshCache) repositoryCache.forget(key);

    return repositoryCache.get(key, async () => db.get(storeName, key));
  };

  const getFromIndex = async (indexName, query, refreshCache = false) => {
    const key = indexName + '-' + (query ? query : NONE_KEY);

    if (refreshCache) repositoryCache.forget(key);

    return repositoryCache.get(key, async () => db.getFromIndex(storeName, indexName, query));
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

  const del = async key => {
    await db.delete(storeName, key);

    return repositoryCache.forget(key);
  }

  const deleteObject = async obj => {
    if (!inlineKeyName || !inlineKeyName.length) throw 'deleteObject function is not available in repositories with out-of-line keys';

    if (!obj[inlineKeyName]) throw `Object does not contain ${inlineKeyName} field which is repository key`;

    return del(obj[inlineKeyName]);
  }

  return {get, getFromIndex, getAll, getAllFromIndex, set, delete: del, deleteObject, flushCache, forgetCachedKey};
};
