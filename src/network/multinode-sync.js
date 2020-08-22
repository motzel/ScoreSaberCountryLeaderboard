import {uuid} from "../utils/uuid";
import eventBus from "../utils/broadcast-channel-pubsub";
import logger from "../utils/logger";
import {convertArrayToObjectByKey} from "../utils/js";

const CHANNEL_NAME = 'multi-node-sync';
const HEARTBEAT_INTERVAL = 3 * 1000;
const HEARTBEAT_TIMEOUT = HEARTBEAT_INTERVAL * 2 + 1000;

const statuses = {
    CREATED: 0,
    HEARTBEAT: 1
}

let nodeId;
let masterNodeId;
let knownNodes = {};

const initNodeSync = () => {
    let intervalId;

    const getId = () => nodeId;
    const getMasterId = () => masterNodeId;
    const isMaster = (nodeId = getId()) => getMasterId() === nodeId;
    const addNode = (nodeId, lastSeen = Date.now(), since = Date.now()) => knownNodes[nodeId] = {
        nodeId,
        lastSeen,
        since
    }
    const updateLastSeen = (nodeId = getId(), lastSeen = Date.now()) => {
        if (knownNodes[nodeId]) knownNodes[nodeId].lastSeen = lastSeen;
    }
    const removeDeadNodes = () => knownNodes = convertArrayToObjectByKey(Object.values(knownNodes).filter(n => n.lastSeen + HEARTBEAT_TIMEOUT >= Date.now() || n.nodeId === nodeId), 'nodeId');
    const electNewMaster = (oldMasterNodeId) => {
        masterNodeId = (Object.values(knownNodes).sort((a, b) => a.since - b.since)?.[0] ?? undefined)?.nodeId;
        if (oldMasterNodeId !== masterNodeId) {
            eventBus.publish('master-node-elected', masterNodeId)

            logger.info(`Node ${masterNodeId} is NEW MASTER, replacing ${oldMasterNodeId}`, 'NodeSync');
        }
    }
    const publishKnowNodes = (status = statuses.HEARTBEAT) => {
        // update own lastSeen before send a message
        updateLastSeen();

        const messagePayload = {nodeId, masterNodeId, status, knownNodes: Object.values(knownNodes)};

        logger.debug(`Send heartbeat from node ${nodeId}`, 'NodeSync');
        logger.trace(`Payload: ${JSON.stringify(messagePayload)}`, 'NodeSync')

        eventBus.publish(CHANNEL_NAME, messagePayload);
    }

    const stopHeartbeat = () => {
        if (intervalId) clearInterval(intervalId);
    }
    const startHeartbeat = () => {
        if (intervalId) stopHeartbeat();
        intervalId = setInterval(publishKnowNodes, HEARTBEAT_INTERVAL)
    }

    if (!nodeId) {
        nodeId = uuid();
        addNode(nodeId);

        logger.info(`NEW node ${nodeId} has been created`, 'NodeSync');

        publishKnowNodes(statuses.CREATED);

        startHeartbeat();
    }

    eventBus.on(CHANNEL_NAME, ({nodeId: heartbeatNodeId, masterNodeId: heartbeatMasterNodeId, status: heartbeatStatus, knownNodes: heartbeatKnownNodes}) => {
        // skip messages from myself, unless it's (first) HEARTBEAT and masterNodeId is undefined yet
        if (getId() === heartbeatNodeId && (!!masterNodeId || heartbeatStatus === statuses.CREATED)) {
            removeDeadNodes();
            electNewMaster(getMasterId());

            return;
        }

        const oldMaster = getMasterId();

        logger.debug(`Received heartbeat from node ${heartbeatNodeId}. His master is ${heartbeatMasterNodeId}`, 'NodeSync');
        logger.trace(`Known nodes: ${JSON.stringify(heartbeatKnownNodes)}`, 'NodeSync');

        if (heartbeatKnownNodes)
            heartbeatKnownNodes
                .forEach(node => {
                    if (!knownNodes[node.nodeId]) addNode(node.nodeId, node.lastSeen, node.since);
                })

        updateLastSeen(heartbeatNodeId);

        removeDeadNodes();

        electNewMaster(oldMaster);

        logger.table(
            Object.values(knownNodes)
                .map(n => ({...n, me: n.nodeId === nodeId, masterNode: n.nodeId === masterNodeId}))
                .sort((a, b) => a.since - b.since),
            logger.TRACE
        )

        // node sending heartbeat has just started, send him some info immediately
        if (heartbeatStatus === statuses.CREATED) publishKnowNodes();
    });

    return {
        getId,
        getMasterId,
        isMaster
    }
}

const nodeSync = initNodeSync();

export default nodeSync;
