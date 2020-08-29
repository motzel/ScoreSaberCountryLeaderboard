<script>
    import {onMount} from 'svelte';
    import debounce from '../../../utils/debounce';
    import {hoverable} from '../../Actions/hoverable';

    import Avatar from '../Common/Avatar.svelte';
    import Rank from '../Common/Rank.svelte';
    import Player from '../Common/Player.svelte';
    import FormattedDate from "../Common/FormattedDate.svelte";
    import Pp from '../Common/Pp.svelte';
    import Value from '../Common/Value.svelte';
    import WhatIfPp from './WhatIfPp.svelte';

    import Refresh from '../Player/Refresh.svelte';

    import {SCORES_PER_PAGE} from "../../../network/scoresaber/consts";
    import {getConfig, getMainPlayerId} from "../../../plugin-config";
    import {getLeaderboard} from "../../../song";
    import eventBus from '../../../utils/broadcast-channel-pubsub';
    import nodeSync from '../../../network/multinode-sync';
    import {getCacheAndConvertIfNeeded} from "../../../store";

    export let leaderboardId;
    export let tableOnly = false;
    export let showDiff;
    export let bgLeft = "0rem";
    export let bgTop = "0rem";
    export let highlight = [];

    const PLAYERS_SCORES_UPDATED_DEBOUNCE_DELAY = 3000;

    let leaderboard = null;

    let showWhatIfPp = false;
    let showBgCover = true;

    async function refreshLeaderboard() {
        leaderboard = await getLeaderboard(leaderboardId);
    }

    onMount(async () => {
        const mainPlayerId = await getMainPlayerId()
        if (mainPlayerId) highlight.push(mainPlayerId);

        const config = await getConfig('songLeaderboard');
        showDiff = undefined !== showDiff ? showDiff : !!config.showDiff;
        showWhatIfPp = !!config.showWhatIfPp && !tableOnly;
        showBgCover = config.showBgCover !== false;

        await refreshLeaderboard();

        const refresh = async nodeId => {
            if (nodeId !== nodeSync.getId()) await getCacheAndConvertIfNeeded(true);

            await refreshLeaderboard();
        }

        const dataRefreshedUnsubscriber = eventBus.on('data-refreshed', async ({nodeId}) => await refresh(nodeId));

        const playerScoresUpdatedHandler = debounce(async ({nodeId, player}) => await refresh(nodeId), PLAYERS_SCORES_UPDATED_DEBOUNCE_DELAY);
        const playerScoresUpdatedUnsubscriber = eventBus.on('player-scores-updated', playerScoresUpdatedHandler)

        return () => {
            dataRefreshedUnsubscriber();
            playerScoresUpdatedUnsubscriber();
        }
    })

    let tooltip;
    let tooltipHistory = [];
    let leaderboardContainer;

    function onHover(event) {
        if (tableOnly || !leaderboard) return;
        const tr = event.detail.target.closest("tr"), trBound = tr.getBoundingClientRect(),
                lbBound = leaderboardContainer.getBoundingClientRect(),
                tooltipTop = trBound.top - lbBound.top;

        tooltipHistory = [];

        const userId = tr.dataset.id;
        if(!userId) return;

        const score = leaderboard.find(u => u.id === userId);
        if(!score || !score.playHistory || !score.playHistory.length) return;

        tooltipHistory = score.playHistory.slice(0,3);

        tooltip.style.display = 'inline-block';
        tooltip.style.top = (tooltipTop + trBound.height) + 'px';
    }

    function onUnhover(event) {
        if (tableOnly || !leaderboard) return;
        tooltip.style.display = 'none';
    }
</script>

<div bind:this={leaderboardContainer} class="leaderboard-container" style="--background-image: url(/imports/images/songs/{showBgCover && leaderboard && leaderboard.length ? leaderboard[0].songHash : ''}.png); --bgLeft: {bgLeft}; --bgTop: {bgTop}">

{#if !tableOnly}
    <div class="refresh"><Refresh /></div>
{/if}

{#if leaderboard}
    {#if leaderboard.length}
        <table class="ranking sspl">
            <thead>
            <tr>
                <th class="picture"></th>
                <th class="rank">#</th>
                <th class="player">Gracz</th>
                <th class="score">Wynik</th>
                <th class="timeset">Czas</th>
                <th class="mods">Mody</th>
                <th class="percentage">Procent</th>
                <th class="pp">PP</th>
            </tr>
            </thead>

            <tbody use:hoverable on:hover={onHover} on:unhover={onUnhover}>
            {#each leaderboard as item, idx (item.id)}
                <tr class={(item.hidden ? 'hidden' : '') + (highlight.includes(item.id) ? ' main' : '')}
                    data-id={item.id}>
                    <td class="picture">
                        <Avatar playerId={item.id}/>
                    </td>
                    <td class="rank">
                        <Rank rank={idx+1} url={'/leaderboard/' +
                            encodeURIComponent(leaderboardId) +
                            '?page=' +
                            encodeURIComponent(
                                Math.ceil(item.rank / SCORES_PER_PAGE)
                            )}/>
                    </td>
                    <td class="player">
                        <Player user={item}/>
                    </td>
                    <td class="score">
                        <Value value={item.score} digits={0} zero="-"
                               prevValue={showDiff && item.playHistory && item.playHistory.length ? item.playHistory[0].score : null}/>
                    </td>
                    <td class="timeset">
                        <FormattedDate date={item.timeset}
                                       prevDate={showDiff && item.playHistory && item.playHistory.length ? item.playHistory[0].timeset : null}/>
                    </td>
                    <td class="mods">{item.mods && item.mods.length ? item.mods : '-'}</td>
                    <td class="percentage">
                        <Value value={item.percent*100} zero="-" suffix="%"
                               prevValue={showDiff && item.playHistory && item.playHistory.length ? item.playHistory[0].percent*100 : null}/>
                    </td>
                    <td class="pp">
                        <Pp pp="{item.pp}"
                            prevPp={showDiff && item.playHistory && item.playHistory.length ? item.playHistory[0].pp : null}/>
                        {#if showWhatIfPp}
                            <WhatIfPp {leaderboardId} pp={item.pp}/>{/if}
                    </td>
                </tr>
            {/each}
            </tbody>
        </table>

        {#if !tableOnly}
            <div bind:this={tooltip} class="tooltip">
                <table class="history">
                    <tbody>
                    {#each tooltipHistory as item (item.timestamp)}
                        <tr>
                            <td>
                                <FormattedDate date={item.timeset}/>
                            </td>
                            <td>
                                <Value value={item.score} digits={0} zero="-"/>
                            </td>
                            <td>
                                <Value value={item.percent*100} zero="-" suffix="%"/>
                            </td>
                            <td>
                                <Pp pp="{item.pp}"/>
                            </td>
                        </tr>
                    {/each}
                    </tbody>
                </table>
            </div>
        {/if}
    {:else}
        <div class="first-fetch">
            <p>Wygląda na to, że nikt jeszcze nie zagrał tej nutki.</p>
        </div>
    {/if}
{:else}
    <div class="first-fetch">
        <p>Wyszukiwanie wyników...</p>
    </div>
{/if}
</div>

<style>
    .leaderboard-container:before {
        position: absolute;
        content: ' ';
        background-image: var(--background-image);
        left: var(--bgLeft, 0);
        top: var(--bgTop, 0);
        width: calc(100% - var(--bgLeft) - var(--bgLeft));
        height: calc(100% - var(--bgTop) - var(--bgTop));
        background-repeat: no-repeat;
        background-size: cover;
        opacity: 0.1;
        pointer-events: none;
    }

    .sspl tbody {padding-bottom: 2rem;}
    .sspl th, .sspl td {
        padding: .5rem;
    }

    .sspl thead th.rank {
        width: 2rem;
    }

    .sspl thead th, .sspl tbody td.mods, .sspl tbody td.percentage, .sspl tbody td.pp {
        text-align: center;
    }

    .sspl tbody td.score {
        text-align: right;
    }

    .sspl .score, .sspl .pp {
        width: 6rem;
    }

    .sspl .picture {
        padding: .5rem 0;
    }

    .refresh {
        text-align: right;
        margin-bottom: 1rem;
        padding-top: .5rem;
        margin-right: .5rem;
    }

    .first-fetch {
        text-align: center
    }

    .tooltip {
        display: none;
        position: absolute;
        top: 0;
        right: 1rem;
        z-index: 10;
        width: 25rem;
        padding: .25rem;
        font-size: .875rem;
        font-weight: normal;
        text-align: center;
        color: var(--textColor);
        background-color: var(--background);
        border: 1px solid var(--textColor);
    }

    .tooltip table td {padding: 3px;}

    .leaderboard-container {position: relative;}
</style>