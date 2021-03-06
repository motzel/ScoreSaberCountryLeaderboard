import {substituteVars} from "../utils/format";

export const delay = async (time, val, shouldReject = false) => new Promise((resolve, reject) => setTimeout(_ => shouldReject ? reject(val) : resolve(val), time));

export class SsplError extends Error {
    constructor(message) {
        super(message);
        this.name = "SsplError";
    }
}

export class ResponseError extends SsplError {
    constructor(message) {
        super(message);
        this.name = "ResponseError";
    }
}

export class TimeoutError extends ResponseError {
    constructor(timeout, message) {
        super(message);
        this.name = "TimeoutError";
        this.timeout = timeout;
    }
}

export class AbortError extends ResponseError {
    constructor(message) {
        super(message);
        this.name = "AbortError";
    }
}

export class JsonParsingError extends ResponseError {
    constructor(message) {
        super(message);
        this.name = "JsonParsingError";
    }
}

export class NotFoundError extends ResponseError {
    constructor(message) {
        super(message);
        this.name = "NotFoundError";
    }
}

export const gmFetch = (url, timeout = 10000) => new Promise((resolve, reject) => GM_xmlhttpRequest({
    method: 'GET',
    url,
    timeout,
    onabort: () => reject(new AbortError('Request was aborted')),
    onerror: () => reject(new ResponseError('Response error')),
    onload: response => {
        try {
            resolve(JSON.parse(response.response));
        } catch(err) {
            reject(new JsonParsingError('JSON parsing error'))
        }
        resolve(response.response)
    },
    ontimeout: () => reject(new TimeoutError("Timeout error", timeout)),
}));

export async function queueRetriedPromise(queue, promiseReturningFunc, abortController = null, retries = 3) {
    let error;
    let result = undefined;
    for (let i = 0; i < retries; i++) {
        try {
            await queue.add(
                () => promiseReturningFunc()
                    .then(r => result = r)
                    .catch(e => {
                        if (e instanceof SsplError) i = retries; // do not retry if SsplError
                        error = e
                    })
            )
        } catch (t) {
            console.warn(t.name);
            error = new TimeoutError(queue.timeout, 'Your time has come');

            if (abortController && abortController.abort) abortController.abort();
        }

        if (undefined !== result) return Promise.resolve(result);
    }

    throw error;
}

export async function queueFetch(queue, url, options, rateLimitCallback = null) {
    const controller = new AbortController();
    const signal = controller.signal;

    const rateLimiteDelaySteps = [1000, 5000, 10000];
    let rateLimitTry = 0;

    return queueRetriedPromise(
        queue,
        () => window.fetch(url, {...options, signal, mode: 'cors'})
            .then(async response => {
                if (429 === response.status) {
                    const rateLimitReset = parseInt(response.headers.get('x-ratelimit-reset'), 10);
                    const waitTimeForLimitReset = (
                        rateLimitReset && !isNaN(rateLimitReset)
                            ? (new Date(rateLimitReset * 1000)).getTime() - (new Date()).getTime()
                            : 0
                    ) + rateLimiteDelaySteps[rateLimitTry++];

                    if(waitTimeForLimitReset && waitTimeForLimitReset > 0) {
                        let intId;
                        const rateLimitCallbackTick = 500;

                        let timer = waitTimeForLimitReset;
                        queue.pause();

                        if (rateLimitCallback)
                            intId = setInterval(_ => rateLimitCallback((timer = timer - rateLimitCallbackTick)), rateLimitCallbackTick)

                        await delay(waitTimeForLimitReset);

                        if(rateLimitCallback) clearInterval(intId);

                        queue.start();
                    }

                    throw new Error("Rate limit")
                }

                if ([404, 403].includes(response.status)) {
                    throw new NotFoundError('404 Not Found');
                }

                return response;
            }),
            controller
    );
}

export async function queueFetchJson(queue, url, options, rateLimitCallback = null) {
    return queueFetch(queue, url, options, rateLimitCallback)
        .then(response => response.json())
}

export async function queueFetchHtml(queue, url, options) {
    return queueFetch(queue, url, options)
        .then(response => response.text())
        .then(text => new DOMParser().parseFromString(text, 'text/html'))
}

export const fetchHtmlPage = async (queue, url, page = 1) =>
    queueFetchHtml(queue, substituteVars(url, {page}))

export const fetchApiPage = async (queue, url, page = 1, rateLimitCallback = null) =>
    queueFetchJson(queue, substituteVars(url, {page}), {}, rateLimitCallback)