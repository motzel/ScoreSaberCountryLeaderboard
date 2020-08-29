<!--suppress JSUnfilteredForInLoop -->
<script>
    import {onMount} from 'svelte';
    import Progress from '../Common/Progress.svelte';
    import Button from '../Common/Button.svelte';
    import FormattedDate from '../Common/FormattedDate.svelte';

    import {getCacheAndConvertIfNeeded, setCache, lastUpdated as getAnyLastUpdated} from '../../../store';
    import config from '../../../temp';
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
    import {getPlayerLastUpdated} from "../../../scoresaber/players";
    import {isBackgroundDownloadEnabled} from "../../../plugin-config";
    import nodeSync from '../../../network/multinode-sync';

    import logger from "../../../utils/logger";
    import {_, trans} from '../../stores/i18n';
    import {formatNumber} from "../../../utils/format";

    export let profileId;

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

    onMount(async () => {
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

        const unsubscriberScoresUpdated = eventBus.on('player-scores-updated', async ({nodeId, player}) => {
            if (nodeId !== nodeSync.getId()) await getCacheAndConvertIfNeeded(true);

            if (player && player.id === profileId) {
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
            getAnyLastUpdated().then(d => $lastUpdatedState = dateFromString(d));
        }
    }

    function updateState(obj) {
        stateObj = {...stateObj, ...obj}
        $state = stateObj;
    }

    function updateProgress(info) {
        updateState({progress: info.percent, label: escapeHtml(info.name), subLabel: info.page.toString() + (info.wait ? ' ' + trans('refresh.waiting', {seconds: formatNumber(Math.floor(info.wait/1000),0)}) : '')});
    }

    async function refresh() {
        updateState({started: true, progress: 0, subLabel: $_.refresh.rankedsDownload});
        await updateRankeds();

        updateState({errorMsg: '', label: '', subLabel: trans('refresh.countryPlayersDownload', {country: config.COUNTRY.toUpperCase()})});
        const activePlayers = await updateActivePlayers(false);

        updateState({label: '', subLabel: ''});

        for(let idx = 0; idx < activePlayers.length; idx++) {
            await updatePlayerScores(
                activePlayers[idx].id,
                false,
                false,
                info => updateProgress(Object.assign({}, info, {percent: Math.floor((idx / activePlayers.length) * 100)}))
            );
        }

        await setCache(await getCacheAndConvertIfNeeded());

        updateState({started: false});

        await setLastRefreshDate();

        eventBus.publish('data-refreshed', {nodeId: nodeSync.getId()});
    }

    async function onRefresh() {
        refresh()
                .catch(e => {
                    updateState({started: false, errorMsg: $_.refresh.error});
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
        {#if !bgDownload}
            <span class="btn-cont"><Button iconFa="fas fa-sync-alt" on:click={onRefresh} disabled={$state.started} /></span>
        {/if}
        {#if !$state.errorMsg || !$state.errorMsg.length}
            <strong>{$_.refresh.lastDownload}</strong> <span><FormattedDate date={$lastUpdatedState} noDate="-" /></span>
        {:else}
            <span class="error">{$state.errorMsg}</span>
        {/if}
    {/if}
</div>

<style>
    .refresh-widget {
        color: var(--faded, #666);
    }
    .refresh-widget strong {
        color: inherit !important;
    }
    .refresh-widget.pulse {
        animation: pulse 1.5s infinite;
    }

    @keyframes pulse {
        0% {
            color: var(--faded);
        }

        50% {
            color: var(--foreground);
        }

        100% {
            color: var(--faded);
        }
    }

    .btn-cont {
        font-size: .5rem;
    }

    .error {
        color: var(--decrease, red) !important;
    }
</style>