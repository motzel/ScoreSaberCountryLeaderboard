import {uuid} from "./uuid";
import logger from "./logger";
import {dateFromString} from './date';
import header from '../../header.json';

let nodeSync = null;
let nodeId;
let masterNodeId;

const initNodeSync = async () => {
    const getId = () => nodeId;
    const getMasterId = () => masterNodeId;
    const isMaster = (nodeId = getId()) => getMasterId() === nodeId;

    const getCurrentTab = () => GM_getTab ? new Promise(resolve => GM_getTab(resolve)) : Promise.resolve(null);
    const getAllTabs = async () => {
        try {
            const currentTab = await getCurrentTab();
            const tabs = await new Promise(resolve => GM_getTabs(resolve));

            return Object.values(tabs)
              .map(t => ({
                  ...t,
                  since: dateFromString(t.since),
                  current: currentTab && t.id === currentTab.id
              }));
        }
        catch {
            return [];
        }
    }
    const saveValueToCurrentTab = async (key, value) => {
        try {
            const tab = await getCurrentTab();
            tab[key] = value;
            GM_saveTab(tab);

            return tab;
        }
        catch {
            return null;
        }
    }
    const saveObjectToCurrentTab = async obj => {
        try {
            const tab = await getCurrentTab();

            Object.entries(obj).forEach(([key, value]) => tab[key] = value);

            GM_saveTab(tab);

            return tab;
        }
        catch {
            return null;
        }
    }
    const notifyOthers = (id, state) => {
        try {
            GM_setValue('nodeSync', id + '::' + state);

            return true;
        }
        catch {
            return false;
        }
    }
    const addNewNode = async id => {
        await saveObjectToCurrentTab({id, since: new Date(), current: true, visible: true, version: header.versionNumeric});

        notifyOthers(id, 'added');
    }
    const removeNode = async () => {
        logger.info(`Node ${nodeId} has been removed`, 'NodeSync');

        notifyOthers(nodeId, 'removed');
    }

    if (!nodeId) {
        nodeId = uuid();
        // add close handler (also prevents back-forward cache)
        window.addEventListener('beforeunload', () => removeNode(), {capture: true});
        window.addEventListener('visibilitychange', async () => {
            saveValueToCurrentTab('visible', document.visibilityState === 'visible');

            logger.debug(`Node ${nodeId} is now ${document.visibilityState}`, 'NodeSync');

            notifyOthers(nodeId, document.visibilityState);
        }, {capture: true});

        // listen to node changes
        if (GM_addValueChangeListener)
            GM_addValueChangeListener('nodeSync', async (name, old_value, new_value, remote) => {
                logger.debug(`Node synchronization event from ${remote ? 'REMOTE' : 'CURRENT'} node`, 'NodeSync');

                // sort all tabs; visible first, then by creation time (from the newest)
                const sortedTabs = (await getAllTabs())
                  .sort((a, b) => a.visible === b.visible ? b.since - a.since : b.visible - a.visible);

                const maxVersion = sortedTabs.reduce((max, cur) => max = cur.version > max ? cur.version : max, 0);
                if (header.versionNumeric < maxVersion) {
                    window.location.reload();
                    return;
                }

                const newMasterId = sortedTabs.length ? sortedTabs[0].id : null;

                if (newMasterId !== masterNodeId) {
                    logger.info(`Node ${newMasterId} is NEW MASTER, replacing ${masterNodeId}`, 'NodeSync');

                    masterNodeId = newMasterId;

                    logger.table(sortedTabs);
                }
            });

        await addNewNode(nodeId);

        logger.info(`NEW node ${nodeId} has been created`, 'NodeSync');
    }

    nodeSync = {
        getId,
        getMasterId,
        isMaster
    }

    return nodeSync;
}

export default () => nodeSync ?? initNodeSync();
