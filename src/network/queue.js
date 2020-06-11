import PQueue from "p-queue";

export default {
    SCORESABER: new PQueue({
        concurrency: 3,
        timeout: 8000,
        throwOnTimeout: true,
        intervalCap: 50,
        interval: 60 * 1000
    }),
    SCORESABER_API: new PQueue({
        concurrency: 8,
        timeout: 8000,
        throwOnTimeout: true,
        intervalCap: 50,
        interval: 60 * 1000
    }),
    BEATSAVER: new PQueue({
        concurrency: 8,
        timeout: 8000,
        throwOnTimeout: true,
        intervalCap: 50,
        interval: 60 * 1000
    })
};