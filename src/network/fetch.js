import {substituteVars} from "../utils/format";

const delay = async (time, val) => new Promise((resolve) => setTimeout(_ => resolve(val), time));

export class SsplError extends Error {
    constructor(message) {
        super(message);
        this.name = "SsplError";
    }
}

export class TimeoutError extends SsplError {
    constructor(timeout, message) {
        super(message);
        this.name = "TimeoutError";
        this.timeout = timeout;
    }
}

export class NotFoundError extends SsplError {
    constructor(message) {
        super(message);
        this.name = "NotFoundError";
    }
}

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

export async function queueFetch(queue, url, options) {
    const controller = new AbortController();
    const signal = controller.signal;

    return queueRetriedPromise(
        queue,
        () => window.fetch(url, {...options, signal, mode: 'cors'})
            .then(async response => {
                if (429 === response.status) {
                    const rateLimitReset = parseInt(response.headers.get('x-ratelimit-reset'), 10);
                    const waitTimeForLimitReset = rateLimitReset && !isNaN(rateLimitReset) ? (new Date(rateLimitReset * 1000)).getTime() - (new Date()).getTime() : null;

                    if(waitTimeForLimitReset && waitTimeForLimitReset > 0) await delay(waitTimeForLimitReset);
                    throw new Error("Rate limit")
                }

                if ([404, 403].includes(response.status)) {
                    throw new NotFoundError('404 Not Found');
                }

                return response;
            })
    );
}

export async function queueFetchJson(queue, url, options) {
    return queueFetch(queue, url, options)
        .then(response => response.json())
}

export async function queueFetchHtml(queue, url, options) {
    return queueFetch(queue, url, options)
        .then(response => response.text())
        .then(text => new DOMParser().parseFromString(text, 'text/html'))
}

export const fetchHtmlPage = async (queue, url, page = 1) =>
    queueFetchHtml(queue, substituteVars(url, {page}))
        .catch(_ => new DOMParser().parseFromString('', 'text/html'));

export const fetchApiPage = async (queue, url, page = 1) =>
    queueFetchJson(queue, substituteVars(url, {page}))
        .catch(_ => null);