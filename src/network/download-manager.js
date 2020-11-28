import eventBus from "../utils/broadcast-channel-pubsub";
import nodeSync from './multinode-sync';
import {getMainPlayerId, isBackgroundDownloadEnabled} from "../plugin-config";
import fifoQueue from "../utils/queue";
import {flushPlayersCache, getAllActivePlayersIds, getPlayerInfo} from "../scoresaber/players";
import {dateFromString} from "../utils/date";
import {getActivePlayersLastUpdate, updateActivePlayers, updatePlayerScores} from "./scoresaber/players";
import {getRankedSongsLastUpdated} from "../scoresaber/rankeds";
import {updateRankeds} from "./scoresaber/rankeds";
import logger from "../utils/logger";
import {getActiveCountry} from "../scoresaber/country";

let bgDownload = false;
let isPaused = false;

const INTERVAL_TICK = 1000 * 60; // 1 min

const RANKEDS_REFRESH = 1000 * 60 * 60; // 1h
const ACTIVE_PLAYERS_REFRESH = 1000 * 60 * 30; // 30 min
const PLAYERS_SCORES_REFRESH = 1000 * 60 * 25; // 25 min
const MAIN_PLAYER_REFRESH = 1000 * 60 * 3; // 3 min

const RANKEDS_PRIORITY = 200;
const MAIN_PLAYER_PRIORITY = 100;
const ACTIVE_PLAYERS_PRIORITY = 20;
const PLAYER_SCORES_PRIORITY = 1;

export const TYPES = {
    RANKEDS: 'rankeds',
    ACTIVE_PLAYERS: 'active-players',
    PLAYER_SCORES: 'player-score',
}

const enqueuePlayerScores = async (queue, playerId, force = false, then = null, refreshInterval = PLAYERS_SCORES_REFRESH, priority = PLAYER_SCORES_PRIORITY, metadata = {}) => {
    logger.debug(`Starting enqueuing scores of player ${playerId}`, 'DlManager')

    const QUEUE_LABEL = `${TYPES.PLAYER_SCORES}-${playerId}`;
    if (queue.contains(QUEUE_LABEL)) return;

    const playerInfo = await getPlayerInfo(playerId);
    if (!playerInfo) return;

    const lastUpdated = dateFromString(playerInfo?.lastUpdated ?? null);

    const shouldBeQueued = force || !lastUpdated || Date.now() - lastUpdated > refreshInterval;

    logger.trace(`Scores of player ${playerId} last updated on ${lastUpdated ? lastUpdated.toISOString() : 'NEVER'}. ${!shouldBeQueued ? 'SKIPPED' : (force ? 'FORCED' : '')}`, 'DlManager')

    if (shouldBeQueued) {
        logger.debug(`Scores of player ${playerId} enqueued`, 'DlManager')

        const mergedMetadata = {type: TYPES.PLAYER_SCORES, nodeId: nodeSync.getId(), playerId, ...metadata};
        queue.add(
            async () => await updatePlayerScores(
                playerId, true,
                info => {
                    const {id, ...rest} = info;
                    eventBus.publish('bg-download-progress', {size: queue.size() + 1, label: QUEUE_LABEL, ...mergedMetadata, ...rest})

                }
            ),
            QUEUE_LABEL, priority, then, mergedMetadata
        )
    }
}

const enqueueMainPlayer = async (queue, force = false, then = null) => {
    const mainPlayerId = await getMainPlayerId();
    if (!mainPlayerId) return;

    const playerInfo = await getPlayerInfo(mainPlayerId);
    if (!playerInfo?.lastUpdated)
        await enqueueActivePlayers(queue, true, async () => {
            await enqueuePlayerScores(queue, mainPlayerId, force, then, MAIN_PLAYER_REFRESH, MAIN_PLAYER_PRIORITY, {mainPlayerId: true})
        }, MAIN_PLAYER_PRIORITY + 1);
    else await enqueuePlayerScores(queue, mainPlayerId, force, then, MAIN_PLAYER_REFRESH, MAIN_PLAYER_PRIORITY, {mainPlayerId: true});
}

const enqueueRankeds = async (queue, force = false, then = null) => {
    logger.debug(`Starting enqueuing  rankeds`, 'DlManager');

    const QUEUE_LABEL = TYPES.RANKEDS;
    if (queue.contains(QUEUE_LABEL)) return;

    const lastUpdated = dateFromString(await getRankedSongsLastUpdated());

    const shouldBeQueued = force || !lastUpdated || Date.now() - lastUpdated > RANKEDS_REFRESH;

    logger.trace(`Rankeds last updated on ${lastUpdated ? lastUpdated.toISOString() : 'NEVER'}. ${!shouldBeQueued ? 'SKIPPED' : (force ? 'FORCED' : '')}`, 'DlManager')

    if (shouldBeQueued) {
        logger.debug(`Rankeds enqueued`, 'DlManager')

        const metadata = {type: TYPES.RANKEDS, nodeId: nodeSync.getId()};
        queue.add(async () => await updateRankeds(), QUEUE_LABEL, RANKEDS_PRIORITY, then, metadata);
    }
}

const enqueueActivePlayers = async (queue, force = false, then = null, priority = ACTIVE_PLAYERS_PRIORITY) => {
    logger.debug(`Starting enqueuing active players`, 'DlManager');

    const QUEUE_LABEL = TYPES.ACTIVE_PLAYERS;
    if (queue.contains(QUEUE_LABEL)) return;

    const lastUpdated = dateFromString(await getActivePlayersLastUpdate());

    const shouldBeQueued = force || !lastUpdated || Date.now() - lastUpdated > ACTIVE_PLAYERS_REFRESH;

    logger.trace(`Active players last updated on ${lastUpdated ? lastUpdated.toISOString() : 'NEVER'}. ${!shouldBeQueued ? 'SKIPPED' : (force ? 'FORCED' : '')}`, 'DlManager')

    if (shouldBeQueued) {
        logger.debug(`Active players enqueued`, 'DlManager')

        const metadata = {type: TYPES.ACTIVE_PLAYERS, nodeId: nodeSync.getId()};
        queue.add(async () => await updateActivePlayers(true), QUEUE_LABEL, priority, then, metadata);
    }
}

const enqueueActivePlayersScores = async (queue, force = false, then = null) => {
    logger.debug(`Starting enqueuing active players scores`, 'DlManager');

    const mainPlayerId = await getMainPlayerId();
    const activePlayers = (await getAllActivePlayersIds(await getActiveCountry())).filter(playerId => playerId !== mainPlayerId);

    logger.trace(`Active players: ${JSON.stringify(activePlayers)}`, 'DlManager')

    for (let idx = 0; idx < activePlayers.length; idx++) {
        await enqueuePlayerScores(queue, activePlayers[idx], force, then, PLAYERS_SCORES_REFRESH, PLAYER_SCORES_PRIORITY);
    }
}

let queueIsProcessed = false;
const processQueue = async (queue) => {
    logger.debug(`Try to process queue. isPaused: ${isPaused ? 'ON' : 'OFF'}, BgDownload: ${bgDownload ? 'ON' : 'OFF'}, isMaster: ${nodeSync.isMaster()}, queueIsProcessed: ${queueIsProcessed}`, 'DlManager');

    if(queueIsProcessed) {
        logger.debug(`Queue processing in progress. SKIPPED`);

        return;
    }

    if (!bgDownload || isPaused || !nodeSync.isMaster()) {
        queue.clear();

        return;
    }

    try {
        queueIsProcessed = true;

        const size = queue.size();

        if(!size) {
            logger.debug(`Start queue processing. Queue size: ${size}`, 'DlManager')
        }

        if (size) {
            logger.info(`Start queue processing. Queue size: ${size}`, 'DlManager')

            eventBus.publish('bg-download-started', {size})

            let job;
            while (job = queue.next()) {
                const size = queue.size() + 1;

                eventBus.publish('bg-download-job-started', {size, label: job.label})

                logger.debug(`Start processing job ${job.label}. Queue size: ${size}`, 'DlManager')
                logger.trace(`Job metadata: ${JSON.stringify(job.metadata)}`, 'DlManager');

                // execute job
                await job.item();

                if (job.then) {
                    logger.debug(`Start processing then after job ${job.label}`, 'DlManager')
                    await job.then();
                    logger.debug(`then() function after job ${job.label} processed`, 'DlManager')
                }

                logger.debug(`Job ${job.label} processed. Queue size: ${size}`, 'DlManager')

                eventBus.publish('bg-download-job-processed', {size, label: job.label})
            }

            eventBus.publish('bg-download-stopped')

            logger.info(`Queue processed`, 'DlManager')
        }

        queueIsProcessed = false;
    } catch (err) {
        queueIsProcessed = false;

        eventBus.publish('bg-download-error', err);
        eventBus.publish('bg-download-stopped');
    }
}

const enqueue = async (queue, type, force = false, data = null, then = null) => {
    logger.debug(`Try to enqueue type ${type}. BgDownload: ${bgDownload ? 'ON' : 'OFF'}, isMaster: ${nodeSync.isMaster()}, forced: ${force}`, 'DlManager');

    if (!bgDownload || !nodeSync.isMaster()) {
        queue.clear();

        return;
    }

    switch (type) {
        case TYPES.RANKEDS:
            await enqueueRankeds(queue, force, then);
            break;

        case TYPES.ACTIVE_PLAYERS:
            await enqueueActivePlayers(queue, force, then);
            break;

        case TYPES.PLAYER_SCORES:
            if (!data?.playerId) {
                await enqueueActivePlayersScores(queue, force, then);
            } else {
                await enqueuePlayerScores(queue, data.playerId, force, then);
            }
    }
}

const enqueueAndProcess = async (queue, force = false) => {
    logger.debug(`Try to enqueue & process queue. BgDownload: ${bgDownload ? 'ON' : 'OFF'}, isMaster: ${nodeSync.isMaster()}`, 'DlManager');

    if (!bgDownload || !nodeSync.isMaster()) {
        queue.clear();

        return;
    }

    await enqueueMainPlayer(queue, force);
    await enqueue(queue, TYPES.RANKEDS, force);
    await enqueue(queue, TYPES.ACTIVE_PLAYERS, force);
    await enqueue(queue, TYPES.PLAYER_SCORES, force);

    await processQueue(queue);
}

let intervalId;
const startSyncing = async queue => {
    if (nodeSync.isMaster()) {
        await enqueueAndProcess(queue);
        intervalId = setInterval(() => enqueueAndProcess(queue), INTERVAL_TICK);
    }
}

const stopSyncing = () => {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
}

export default async () => {
    const queue = fifoQueue();

    let currentMasterId = nodeSync.getMasterId();

    bgDownload = await isBackgroundDownloadEnabled();

    eventBus.on('config-changed', async () => {
        const newBgDownload = await isBackgroundDownloadEnabled(true);
        const oldBgDownload = bgDownload;

        bgDownload = newBgDownload;

        if (oldBgDownload !== newBgDownload) {
            await enqueueAndProcess(queue);
        }
    });

    eventBus.on('master-node-elected', async masterNodeId => {
        if (currentMasterId !== masterNodeId) {
            await startSyncing(queue)
        }

        if (!nodeSync.isMaster()) {
            stopSyncing();
        }

        currentMasterId = masterNodeId;
    });

    const refreshPlayersData = () => flushPlayersCache();

    eventBus.on('player-added', async ({playerId, nodeId}) => {
        refreshPlayersData({nodeId});

        await enqueue(
            queue, TYPES.ACTIVE_PLAYERS, true,
            null,
            async () => await enqueue(queue, TYPES.PLAYER_SCORES, true, {playerId})
        );
        await processQueue(queue);
    });

    eventBus.on('player-added-to-friends', async ({playerId, nodeId}) => {
        refreshPlayersData({nodeId});

        await enqueue(
          queue, TYPES.ACTIVE_PLAYERS, true,
          null,
          async () => await enqueue(queue, TYPES.PLAYER_SCORES, true, {playerId})
        );
        await processQueue(queue);
    });

    eventBus.on('player-removed', refreshPlayersData);

    eventBus.on('player-removed-from-friends', refreshPlayersData);

    eventBus.on('dl-manager-pause-cmd', () => {
        logger.debug('Pause Dl Manager', 'DlManager');
       isPaused = true;
       queue.clear();
    });

    eventBus.on('dl-manager-unpause-cmd', () => {
        logger.debug('Unpause Dl Manager', 'DlManager');

        isPaused = false;
        queue.clear();
    });

    await startSyncing(queue);
}