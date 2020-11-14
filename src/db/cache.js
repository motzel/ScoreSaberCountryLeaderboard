export default () => {
  const cache = {};

  const set = (key, value) => {
    cache[key] = value;

    return value;
  };

  const get = async (key, setFunc) => {
    // try to get value from cache
    const value = cache[key] ?? undefined;
    if (value !== undefined) return value;

    return setFunc ? set(key, await setFunc(value)) : undefined;
  };

  const has = key => cache[key] !== undefined;

  return {
    has,
    get,
    set,
  }
}
