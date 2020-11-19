export default () => {
  let cache = {};

  const set = (key, value) => {
    cache[key] = value;

    return value;
  };

  const get = async (key, fetchFunc) => {
    // try to get value from cache
    const value = cache[key] ?? undefined;
    if (value !== undefined) return value;

    return fetchFunc ? set(key, await fetchFunc(value)) : undefined;
  };

  const has = key => cache[key] !== undefined;

  const getKeys = _ => Object.keys(cache);

  const forget = key => delete cache[key];

  const flush = () => cache = {};

  return {
    has,
    get,
    set,
    getKeys,
    forget,
    flush,
  }
}
