<!--suppress JSUnfilteredForInLoop -->
<script>
    import {onMount} from 'svelte';
    import Progress from '../Common/Progress.svelte';
    import Button from '../Common/Button.svelte';
    import FormattedDate from '../Common/FormattedDate.svelte';

    import {lastUpdated as getAnyLastUpdated} from '../../../store';
    import {escapeHtml} from '../../../utils/js';
    import log from '../../../utils/logger';

    import {updateRankeds} from "../../../network/scoresaber/rankeds";
    import {
        updateActivePlayers,
        updatePlayerScores
    } from "../../../network/scoresaber/players";
    import {dateFromString} from "../../../utils/date";
    import {createBroadcastChannelStore} from '../../stores/broadcast-channel';
    import eventBus from '../../../utils/broadcast-channel-pubsub';
    import {flushPlayersCache, getPlayerLastUpdated} from "../../../scoresaber/players";
    import {isBackgroundDownloadEnabled} from "../../../plugin-config";
    import nodeSync from '../../../network/multinode-sync';

    import logger from "../../../utils/logger";
    import {_, trans} from '../../stores/i18n';
    import {formatNumber} from "../../../utils/format";
    import {getActiveCountry} from "../../../scoresaber/country";

    export let profileId;
    export let forceShowProgress = false;
    export let showLastDownloaded = true;
    export let refreshLabel = "";

    let stateObj = {
        started: false,
        progress: 0,
        label: '',
        subLabel: '',
        errorMsg: ''
    };
    let state = createBroadcastChannelStore('refresh-widget', stateObj);
    
    let lastUpdated = null
    let lastUpdatedState = createBroadcastChannelStore(`refresh-widget-last-update${profileId ? '-' + profileId : ''}`, lastUpdated)

    let bgDownload = true;
    let isBackgroundDownloadInProgress = false;
    let hasBackgroundDownloadError = false;
    let stopRefreshingFlag = false;

    onMount(async () => {
        updateState({errorMsg: ''});

        bgDownload = await isBackgroundDownloadEnabled();

        const unsubscriberConfig = eventBus.on('config-changed', async () => {
            bgDownload = await isBackgroundDownloadEnabled(true);
        })

        const unsubscriberBgStart = eventBus.on('bg-download-started', ({size}) => {
            logger.debug(`Background download STARTED event. Queue size: ${size}`, 'RefreshWidget');

            isBackgroundDownloadInProgress = true;
            hasBackgroundDownloadError = false;
        })

        const unsubscriberBgProgress = eventBus.on('bg-download-progress', ({size, label, name, page, wait}) => {
            logger.debug(`Background download PROGRESS event. Queue size: ${size}, Job label: ${label}. Progress label: ${name} / ${wait ? '[Waiting ' + Math.round(wait/1000) + 's]' : page}`, 'RefreshWidget');

            isBackgroundDownloadInProgress = true;
            hasBackgroundDownloadError = false;
        })

        const unsubscriberBgError = eventBus.on('bg-download-error', err => {
            logger.debug(`Background download ERROR event.`, 'RefreshWidget');

            logger.error(err);

            isBackgroundDownloadInProgress = false;
            hasBackgroundDownloadError = true;
        })

        const unsubscriberBgStopped = eventBus.on('bg-download-stopped', async _ => {
            logger.debug(`Background download STOPPED event.`, 'RefreshWidget');

            isBackgroundDownloadInProgress = false;

            await setLastRefreshDate();
        })

        const unsubscriberScoresUpdated = eventBus.on('player-scores-updated', async ({nodeId, playerId}) => {
            if (nodeId !== nodeSync.getId()) flushPlayersCache();

            if (playerId === profileId) {
                await setLastRefreshDate();
            }
        })

        await setLastRefreshDate();
        setInterval(() => setLastRefreshDate(), 1000 * 60);

        return () => {
            unsubscriberConfig();
            unsubscriberBgStart();
            unsubscriberBgProgress();
            unsubscriberBgError();
            unsubscriberBgStopped();
            unsubscriberScoresUpdated();
        }
    })

    async function setLastRefreshDate() {
        if (profileId) {
            const playerLastUpdated = await getPlayerLastUpdated(profileId);
            if (playerLastUpdated) $lastUpdatedState = dateFromString(playerLastUpdated);
        } else {
            getAnyLastUpdated(true).then(d => $lastUpdatedState = dateFromString(d));
        }
    }

    function updateState(obj) {
        stateObj = {...stateObj, ...obj}
        $state = stateObj;
    }

    function updateProgress(info) {
        updateState({progress: info.percent, label: escapeHtml(info.name), subLabel: info.page.toString() + (info.wait ? ' ' + trans('refresh.waiting', {seconds: formatNumber(Math.floor(info.wait/1000),0)}) : '')});
    }

    export function stopRefreshing() {
        stopRefreshingFlag = true;
        eventBus.publish('stop-fetching-scores-cmd');
    }

    async function refresh() {
        stopRefreshingFlag = false;

        eventBus.publish('start-data-refreshing', {nodeId: nodeSync.getId()});
        eventBus.publish('dl-manager-pause-cmd');

        updateState({started: true, progress: 0, subLabel: $_.refresh.rankedsDownload});
        await updateRankeds();

        if (stopRefreshingFlag) {
            updateState({label: '', subLabel: '', started: false});
            eventBus.publish('dl-manager-unpause-cmd');
            return;
        }

        const country = await getActiveCountry();
        updateState({errorMsg: '', label: '', subLabel: trans('refresh.countryPlayersDownload', {country: country ? country.toUpperCase() : null})});
        const activePlayers = await updateActivePlayers(false);

        updateState({label: '', subLabel: ''});

        if (stopRefreshingFlag) {
            updateState({label: '', subLabel: '', started: false});
            eventBus.publish('dl-manager-unpause-cmd');
            return;
        }

        for(let idx = 0; idx < activePlayers.length; idx++) {
            await updatePlayerScores(
                activePlayers[idx].id,
                false,
                info => updateProgress(Object.assign({}, info, {percent: Math.floor((idx / activePlayers.length) * 100)}))
            );

            if (stopRefreshingFlag) {
                updateState({label: '', subLabel: '', started: false});
                eventBus.publish('dl-manager-unpause-cmd');
                return;
            }
        }

        updateState({started: false});

        await setLastRefreshDate();

        eventBus.publish('data-refreshed', {nodeId: nodeSync.getId()});
        eventBus.publish('dl-manager-unpause-cmd');
    }

    async function onRefresh() {
        refresh()
                .catch(e => {
                    updateState({started: false, errorMsg: $_.refresh.error});
                    eventBus.publish('dl-manager-unpause-cmd');

                    log.error("Can not refresh users")
                    console.error(e);
                })
        ;
    }
</script>

<div class="refresh-widget" class:pulse={isBackgroundDownloadInProgress} class:error={hasBackgroundDownloadError}>
    {#if $state.started}
        <Progress value={$state.progress} label={$state.label} subLabel={$state.subLabel} maxWidth="16rem"/>
    {:else}
        <span class="btn-cont"><Button iconFa="fas fa-sync-alt" title={isBackgroundDownloadInProgress ? $_.refresh.btnDisabledBgDlInProgress : ''} label={refreshLabel} on:click={onRefresh} disabled={$state.started || isBackgroundDownloadInProgress} /></span>

        {#if !$state.errorMsg || !$state.errorMsg.length}
            {#if showLastDownloaded}
                <strong>{$_.refresh.lastDownload}</strong> <span><FormattedDate date={$lastUpdatedState} noDate="-" /></span>
            {/if}
        {:else}
            <span class="error">{$state.errorMsg}</span>
        {/if}
    {/if}
</div>

<style>
    .refresh-widget {
        display: inline-flex;
        align-items: center;

        color: var(--dimmed, #666);
    }
    .refresh-widget strong {
        color: inherit !important;
        margin-right: .25em;
    }
    .refresh-widget.pulse {
        animation: pulse 1.5s infinite;
    }

    @keyframes pulse {
        0% {
            color: var(--dimmed);
        }

        50% {
            color: var(--foreground);
        }

        100% {
            color: var(--dimmed);
        }
    }

    .btn-cont {
        font-size: .5em;
        margin-right: .5em;
    }

    .btn-cont :global(.button) {
        margin-bottom: 0;
    }

    .error {
        color: var(--decrease, red) !important;
    }
</style>