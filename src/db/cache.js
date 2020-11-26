import eventBus from '../utils/broadcast-channel-pubsub'
import nodeSync from '../network/multinode-sync'

const delayedFetch = async (time, fetchFunc) => new Promise(resolve => setTimeout(async _ => resolve(await fetchFunc()), time));

export default (name, fetchTimeout = 5000) => {
  let cache = {};
  let keysInProgress = {};

  const set = (key, value) => {
    cache[key] = value;

    eventBus.publish('cache-key-set-' + name, {nodeId: nodeSync.getId(), key});

    return value;
  };

  const get = async (key, fetchFunc) => {
    if (cache.hasOwnProperty(key)) return cache[key];

    if(keysInProgress[key]) {
      return await Promise.race([
        delayedFetch(fetchTimeout, fetchFunc), // timeout
        new Promise(resolve => {
          eventBus.on('cache-key-set-' + name, ({nodeId, key:keyAvailable}) => {
            if (nodeId !== nodeSync.getId()) return;

            if (key === keyAvailable) {
              resolve(cache[key] ?? null);
            }
          })
        })
      ]);
    }

    keysInProgress[key] = fetchFunc;

    const value = await fetchFunc();

    delete keysInProgress[key];

    return set(key, value);
  };

  const has = key => cache[key] !== undefined;

  const getKeys = () => Object.keys(cache);

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
