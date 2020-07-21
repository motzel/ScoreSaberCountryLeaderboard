<script>
    import {hoverable} from '../../Actions/hoverable';

    import Avatar from '../Common/Avatar.svelte';
    import Rank from '../Common/Rank.svelte';
    import Player from '../Common/Player.svelte';
    import Date from "../Common/Date.svelte";
    import Pp from '../Common/Pp.svelte';
    import Value from '../Common/Value.svelte';
    import WhatIfPp from './WhatIfPp.svelte';

    import Refresh from '../Common/Refresh.svelte';
    import NewRankeds from '../Song/NewRankeds.svelte';

    import {isAnyData} from '../../../store';
    import {NEW_SCORESABER_URL, SCORES_PER_PAGE} from "../../../network/scoresaber/consts";
    import {getMainUserId} from "../../../plugin-config";

    export let leaderboardId;
    export let leaderboard = [];

    let mainUserId;
    (async () => {mainUserId = await getMainUserId()})()

    let tooltip;
    let tooltipHistory = [];
    let leaderboardContainer;

    let newRankeds = [];

    let dataAvailable = false;
    isAnyData().then(v => dataAvailable = v);

    function onNewRankeds(event) {
        newRankeds = event.detail;
    }

    function onHover(event) {
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
        tooltip.style.display = 'none';
    }
</script>

<style>
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

<div bind:this={leaderboardContainer} class="leaderboard-container">

<div class="refresh"><Refresh on:new-rankeds={onNewRankeds} on:data-refreshed/></div>

<NewRankeds rankeds={newRankeds} />

{#if dataAvailable}
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
        <tr class={(item.hidden ? 'hidden' : '') + (mainUserId === item.id ? ' main' : '')} data-id={item.id}>
            <td class="picture"><Avatar url={item.avatar}/></td>
            <td class="rank">
                <Rank rank={idx+1} url={'/leaderboard/' +
                            encodeURIComponent(leaderboardId) +
                            '?page=' +
                            encodeURIComponent(
                                Math.ceil(item.rank / SCORES_PER_PAGE)
                            )}/>
            </td>
            <td class="player"><Player user={item}/></td>
            <td class="score"><Value value={item.score} digits={0} zero="-" prevValue={item.playHistory && item.playHistory.length ? item.playHistory[0].score : null}/></td>
            <td class="timeset"><Date date={item.timeset} prevDate={item.playHistory && item.playHistory.length ? item.playHistory[0].timeset : null} /></td>
            <td class="mods">{item.mods && item.mods.length ? item.mods : '-'}</td>
            <td class="percentage"><Value value={item.percent*100} zero="-" suffix="%" prevValue={item.playHistory && item.playHistory.length ? item.playHistory[0].percent*100 : null} /></td>
            <td class="pp">
                <Pp pp="{item.pp}" prevPp={item.playHistory && item.playHistory.length ? item.playHistory[0].pp : null}/>
                <WhatIfPp {leaderboardId} pp={item.pp} />
            </td>
        </tr>
    {/each}
    </tbody>
</table>
<div bind:this={tooltip} class="tooltip">
    <table class="history"><tbody>
    {#each tooltipHistory as item (item.timestamp)}
    <tr>
        <td><Date date={item.timeset} /></td>
        <td><Value value={item.score} digits={0} zero="-" /></td>
        <td><Value value={item.percent*100} zero="-" suffix="%" /></td>
        <td><Pp pp="{item.pp}" /></td>
    </tr>
    {/each}
    </tbody></table>
</div>
{:else}
    <div class="first-fetch">
        <h3>Strasznie tu pusto</h3>
        <p>Wygląda na to, że nie ma jeszcze żadnych danych.</p>
        <p>Usiądź sobie wygodnie, otwórz harnasia, kliknij Odśwież i poczekaj, bo trochę to potrwa...</p>
    </div>
{/if}
</div>