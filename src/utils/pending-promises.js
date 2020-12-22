export default () => {
  let pendingPromises = {};

  return async (promiseKey, promiseReturningFunc, timeout = 5000) => {
    const isPromisePending = promiseKey => !!pendingPromises[promiseKey];
    const getAwaitingHandlers = promiseKey => pendingPromises[promiseKey] ?? [];
    const registerAwaitingHandler = (promiseKey, handler) => pendingPromises[promiseKey] && pendingPromises[promiseKey].push(handler);
    const unregisterAwaitingHandler = (promiseKey, handler) => {
      if (!isPromisePending(promiseKey)) return;

      const handlerIdx = pendingPromises[promiseKey].findIndex(h => h === handler);
      if (handlerIdx) pendingPromises[promiseKey].splice(handlerIdx, 1);
    };

    const notifyAwaitingHandlers = (promiseKey, value, status) => {
      getAwaitingHandlers(promiseKey).forEach(handler => handler(value, status));

      delete pendingPromises[promiseKey];
    }

    if (isPromisePending(promiseKey)) {
      return await new Promise((resolve, reject) => {
        let promiseFulfilled = false;

        const handler = (value, status) => {
          promiseFulfilled = true;

          if (status === 'reject') reject(value);
          else resolve(value);
        };

        registerAwaitingHandler(promiseKey, handler);

        setTimeout(async _ => {
          unregisterAwaitingHandler(promiseKey, handler);

          if (!promiseFulfilled) resolve(await promiseReturningFunc());
        }, timeout);
      });
    }

    pendingPromises[promiseKey] = [];

    try {
      const value = await promiseReturningFunc();

      notifyAwaitingHandlers(promiseKey, value, 'resolved');

      return value;
    } catch (error) {
      notifyAwaitingHandlers(promiseKey, error, 'rejected');

      throw error;
    }
  }
}