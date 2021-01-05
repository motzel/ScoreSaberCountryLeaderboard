<script>
    import {onMount} from 'svelte';
    import {fly} from 'svelte/transition';

    import debounce from '../../../utils/debounce';

    import Avatar from '../Common/Avatar.svelte';
    import Rank from '../Common/Rank.svelte';
    import Player from '../Common/Player.svelte';
    import FormattedDate from "../Common/FormattedDate.svelte";
    import Pp from '../Common/Pp.svelte';
    import Value from '../Common/Value.svelte';
    import TypeFilterSelect from "../Common/TypeFilterSelect.svelte";
    import WhatIfPp from './WhatIfPp.svelte';

    import Refresh from '../Player/Refresh.svelte';

    import {SCORES_PER_PAGE} from "../../../network/scoresaber/consts";
    import {getConfig, getMainPlayerId} from "../../../plugin-config";
    import {getLeaderboard} from "../../../song";
    import eventBus from '../../../utils/broadcast-channel-pubsub';
    import nodeSync from '../../../network/multinode-sync';
    import {_} from '../../stores/i18n';
    import {getActiveCountry} from '../../../scoresaber/country'

    export let leaderboardId;
    export let tableOnly = false;
    export let showDiff;
    export let bgLeft = "0rem";
    export let bgTop = "0rem";
    export let highlight = [];
    export let showBgCover = true;
    export let country = null;
    export let leaderboardType;

    const PLAYERS_SCORES_UPDATED_DEBOUNCE_DELAY = 3000;

    let leaderboard = null;

    let showWhatIfPp = false;

    let initialized = false;

    async function refreshLeaderboard() {
        if (!leaderboardId || !leaderboardType || (leaderboardType === 'country' && !country)) return;

        leaderboard = await getLeaderboard(leaderboardId, country, leaderboardType);
    }

    async function refreshConfig() {
        const config = await getConfig('songLeaderboard');
        showDiff = undefined !== showDiff ? showDiff : !!config.showDiff;
        showWhatIfPp = !!config.showWhatIfPp && !tableOnly;
        showBgCover = showBgCover && config.showBgCover !== false;
    }

    onMount(async () => {
        const mainPlayerId = await getMainPlayerId()
        if (mainPlayerId) highlight.push(mainPlayerId);

        if (!country) {
            country = await getActiveCountry();
        }

        await refreshConfig();

        const dataRefreshedUnsubscriber = eventBus.on('data-refreshed', async () => await refreshLeaderboard());
        const playerScoresUpdatedUnsubscriber = eventBus.on('player-scores-updated', debounce(async () => await refreshLeaderboard(), PLAYERS_SCORES_UPDATED_DEBOUNCE_DELAY))
        const configChangedUnsubscriber = eventBus.on('config-changed', refreshConfig);

        initialized = true;

        return () => {
            dataRefreshedUnsubscriber();
            playerScoresUpdatedUnsubscriber();
            configChangedUnsubscriber();
        }
    })

    $: {
        refreshLeaderboard(leaderboardId, country, leaderboardType);
    }
</script>

{#if initialized}
<div class="leaderboard-container" style="--background-image: url(/imports/images/songs/{showBgCover && leaderboard && leaderboard.length ? leaderboard[0].songHash : ''}.png); --bgLeft: {bgLeft}; --bgTop: {bgTop}">

{#if !tableOnly}
    <div class="refresh">
        <TypeFilterSelect bind:value={leaderboardType} {country} />

        <Refresh />
    </div>
{:else}
    <div class="refresh">
        <TypeFilterSelect bind:value={leaderboardType} {country} />
    </div>
{/if}

{#if leaderboard}
    {#if leaderboard.length}
        <table class="ranking sspl">
            <thead>
            <tr>
                <th class="picture"></th>
                <th class="rank">#</th>
                <th class="player">{$_.songLeaderboard.player}</th>
                <th class="score">{$_.songBrowser.fields.score}</th>
                <th class="timeset">{$_.songBrowser.fields.timesetShort}</th>
                <th class="mods">{$_.songLeaderboard.mods}</th>
                <th class="percentage">{$_.songBrowser.fields.acc}</th>
                <th class="pp">{$_.songBrowser.fields.pp}</th>
            </tr>
            </thead>

            <tbody>
            {#each leaderboard as item, idx (item.id)}
                <tr class={(item.hidden ? 'hidden' : '') + (highlight.includes(item.id) ? ' main' : '')}
                    data-id={item.id}  in:fly={{ x: 50, duration: 500 }}>
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
                        <Value value={item.acc} zero="-" suffix="%"
                               prevValue={showDiff && item.playHistory && item.playHistory.length ? item.playHistory[0].acc : null}/>
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
    {:else}
        <div class="first-fetch">
            <p>{$_.songLeaderboard.nobodyPlayed}</p>
        </div>
    {/if}
{:else}
    <div class="first-fetch">
        <p>{$_.songLeaderboard.searching}</p>
    </div>
{/if}
</div>
{/if}

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
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
        padding-top: .5rem;
        margin-right: .5rem;
    }

    .refresh :global(.dropdown-trigger .button) {
        background-color: transparent;
    }

    .first-fetch {
        text-align: center
    }

    .leaderboard-container {position: relative;}
</style>