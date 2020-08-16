<!--suppress JSUnfilteredForInLoop -->
<script>
    import Progress from '../Common/Progress.svelte';
    import Button from '../Common/Button.svelte';
    import FormattedDate from '../Common/FormattedDate.svelte';

    import {getCacheAndConvertIfNeeded, setCache, lastUpdated} from '../../../store';
    import config from '../../../temp';
    import {escapeHtml} from '../../../utils/js';
    import log from '../../../utils/logger';

    import {updateRankeds} from "../../../network/scoresaber/rankeds";
    import {updateActivePlayers, getPlayerWithUpdatedScores} from "../../../network/scoresaber/players";
    import {dateFromString} from "../../../utils/date";
    import {createBroadcastChannelStore} from '../../stores/broadcast-channel';
    import eventBus from '../../../utils/broadcast-channel-pubsub';
    import {getPlayerInfo} from "../../../scoresaber/players";

    export let profileId;

    let stateObj = {
        date: null,
        started: false,
        progress: 0,
        label: '',
        subLabel: '',
        errorMsg: ''
    };
    let state = createBroadcastChannelStore('refresh-widget', stateObj);

    setLastRefreshDate();

    async function setLastRefreshDate() {
        if (profileId) {
            const playerInfo = await getPlayerInfo(profileId);
            if (playerInfo && playerInfo.lastUpdated) $state.date = dateFromString(playerInfo.lastUpdated);
        } else {
            lastUpdated().then(d => $state.date = dateFromString(d));
        }
    }

    function updateState(obj) {
        stateObj = {...stateObj, ...obj}
        $state = stateObj;
    }

    function updateProgress(info) {
        updateState({progress: info.percent, label: escapeHtml(info.name), subLabel: info.page.toString() + (info.wait ? ' ' + `[Czekam ${Math.floor(info.wait/1000)} s]` : '')});
    }

    async function refresh() {
        updateState({started: true, progress: 0, subLabel: 'Pobieranie aktualnych rankedów'});

        const rankedChanges = await updateRankeds();
        if (rankedChanges && rankedChanges.length) {
            eventBus.publish('rankeds-changed', rankedChanges)
        }

        updateState({errorMsg: '', label: '', subLabel: `Pobieranie listy top 50 ${config.COUNTRY.toUpperCase()}...`});

        const countryPlayers = await updateActivePlayers();

        updateState({label: '', subLabel: ''});

        const data = {...await getCacheAndConvertIfNeeded()};

        let idx = 0;
        let cache = await countryPlayers.reduce(async (promisedCum, player) => {
            let cum = await promisedCum;

            cum.users[player.id] = await getPlayerWithUpdatedScores(
                    player.id,
                    (info) => updateProgress(Object.assign({}, info, {percent: Math.floor((idx / countryPlayers.length) * 100)}))
            );

            idx++;

            return cum;
        }, data);

        cache.lastUpdated = new Date().toISOString();

        await setCache(cache);

        updateState({started: false});

        await setLastRefreshDate();

        eventBus.publish('data-refreshed', {});
    }

    async function onRefresh() {
        refresh()
                .catch(e => {
                    updateState({started: false, errorMsg: 'Błąd pobierania danych. Spróbuj ponownie.'});
                    log.error("Can not refresh users")
                    console.error(e);
                })
        ;
    }
</script>

<div>
    {#if $state.started}
        <Progress value={$state.progress} label={$state.label} subLabel={$state.subLabel} maxWidth="16rem"/>
    {:else}
        <span class="btn-cont"><Button iconFa="fas fa-sync-alt" on:click={onRefresh} disabled={$state.started} /></span>
        {#if !$state.errorMsg || !$state.errorMsg.length}
            <strong>Data pobrania:</strong> <span><FormattedDate date={$state.date} noDate="-" /></span>
        {:else}
            <span class="err">{$state.errorMsg}</span>
        {/if}
    {/if}
</div>

<style>
    .btn-cont {
        font-size: .5rem;
    }

    .err {
        color: var(--decrease, red) !important;
    }
</style>