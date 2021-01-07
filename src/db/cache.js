import eventBus from '../utils/broadcast-channel-pubsub'
import nodeSync from '../utils/multinode-sync'

export default (name, getObjKey) => {
  let cache = {};

  // update data cached on another node
  eventBus.on('cache-key-set-' + name, ({nodeId, key, value}) => nodeId !== nodeSync().getId() ? set(key, value, false) : null);
  eventBus.on('cache-all-set' + name, ({nodeId, data}) => nodeId !== nodeSync().getId() ? setAll(data, false) : null);
  eventBus.on('cache-merge-' + name, ({nodeId, data}) => nodeId !== nodeSync().getId() ? merge(data, false) : null);
  eventBus.on('cache-key-forget-' + name, ({nodeId, key}) => nodeId !== nodeSync().getId() ? forget(key, false) : null);
  eventBus.on('cache-flush-' + name, ({nodeId}) => nodeId !== nodeSync().getId() ? flush(false) : null);

  const set = (key, value, emitEvent = true) => {
    cache[key] = value;

    if (emitEvent) eventBus.publish('cache-key-set-' + name, {nodeId: nodeSync().getId(), key, value});

    return value;
  };

  const setAll = (data, emitEvent = true) => {
    cache = data;

    if (emitEvent) eventBus.publish('cache-all-set-' + name, {nodeId: nodeSync().getId(), data});

    return cache;
  }
  const merge = (data, emitEvent = true) => {
    cache = {...cache, ...data}

    if (emitEvent) eventBus.publish('cache-merge-' + name, {nodeId: nodeSync().getId(), data});

    return cache;
  }

  const get = async (key, fetchFunc) => {
    if (cache.hasOwnProperty(key)) return cache[key];

    const value = await fetchFunc();

    return set(key, value);
  };

  const getByFilter = async (fetchFunc, filterFunc) => {
    if (filterFunc) {
      const obj = Object.values(cache).find(filterFunc);
      if (obj) return obj;
    }

    const value = await fetchFunc();

    const key = getObjKey(value);

    return set(key, value);
  }

  const getAll = () => cache;

  const has = key => cache[key] !== undefined;

  const getKeys = () => Object.keys(cache);

  const forget = (key, emitEvent = true) => {
    delete cache[key];

    if (emitEvent) eventBus.publish('cache-key-forget-' + name, {nodeId: nodeSync().getId(), key});

    return cache;
  }

  const forgetByFilter = (filterFunc, emitEvent = true) => {
    if (!filterFunc) return false;

    Object.keys(cache).filter(key => filterFunc(cache[key]))
      .forEach(key => {
        delete cache[key]

        if (emitEvent) eventBus.publish('cache-key-forget-' + name, {nodeId: nodeSync().getId(), key});
      });

    return true;
  }

  const flush = (emitEvent = true) => {
    cache = {};

    if (emitEvent) eventBus.publish('cache-flush-' + name, {nodeId: nodeSync().getId()});

    return cache;
  }

  return {
    has,
    get,
    getByFilter,
    getAll,
    set,
    setAll,
    merge,
    getKeys,
    forget,
    forgetByFilter,
    flush,
  }
}
