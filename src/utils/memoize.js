export default function(promiseFunc) {
    const cache = {};

    return async function() {
        const key = JSON.stringify(arguments);

        cache[key] = cache[key] || promiseFunc.apply(this, arguments);

        return cache[key];
    }
}