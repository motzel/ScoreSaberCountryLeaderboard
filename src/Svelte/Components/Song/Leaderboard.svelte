<script>
    import Avatar from '../Common/Avatar.svelte';
    import Rank from '../Common/Rank.svelte';
    import Player from '../Common/Player.svelte';
    import Pp from '../Common/Pp.svelte';
    import Value from '../Common/Value.svelte';
    import WhatIfPp from '../Common/WhatIfPp.svelte';

    import Refresh from '../Common/Refresh.svelte';
    import NewRankeds from '../Song/NewRankeds.svelte';

    import {getMainUserId, default as config} from '../../../temp';
    import {dateFromString, formatDate} from '../../../utils/format';
    import {isAnyData} from '../../../store';
    import {NEW_SCORESABER_URL, SCORES_PER_PAGE} from "../../../network/scoresaber/consts";

    export let leaderboardId;
    export let leaderboard = [];

    const mainUserId = getMainUserId();

    let newRankeds = [];

    let dataAvailable = false;
    isAnyData().then(v => dataAvailable = v);

    function onNewRankeds(event) {
        newRankeds = event.detail;
    }
</script>

<style>
    .sspl th, .sspl td {
        padding: .5rem;
    }

    .sspl thead th.rank {
        width: 5.4rem;
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

    .refresh {text-align: right; margin-bottom: 1rem;}

    .first-fetch {text-align: center}
</style>

<div class="refresh"><Refresh on:new-rankeds={onNewRankeds}/></div>

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

    <tbody>
    {#each leaderboard as item, idx (item.id)}
        <tr class={item.hidden ? 'hidden' : '', mainUserId === item.id ? 'main' : ''}>
            <td class="picture"><Avatar url={NEW_SCORESABER_URL + item.avatar}/></td>
            <td class="rank">
                <Rank rank={idx+1} subRank={item.rank} url={'/leaderboard/' +
                            encodeURIComponent(leaderboardId) +
                            '?page=' +
                            encodeURIComponent(
                                Math.ceil(item.rank / SCORES_PER_PAGE)
                            )}/>
            </td>
            <td class="player"><Player user={item}/></td>
            <td class="score"><Value value={item.score} digits={0} zero="-"/></td>
            <td class="timeset" title={dateFromString(item.timeset).toLocaleString()}>{formatDate(item.timeset)}</td>
            <td class="mods">{item.mods && item.mods.length ? item.mods : '-'}</td>
            <td class="percentage"><Value value={item.percent*100} zero="-"/>%</td>
            <td class="pp">
                <Pp pp="{item.pp}"/>
                <WhatIfPp {leaderboardId} pp={item.pp} />
            </td>
        </tr>
    {/each}
    </tbody>
</table>
{:else}
    <div class="first-fetch">
        <h3>Strasznie tu pusto</h3>
        <p>Wygląda na to, że nie ma jeszcze żadnych danych.</p>
        <p>Usiądź sobie wygodnie, otwórz harnasia, kliknij Odśwież i poczekaj, bo trochę to potrwa...</p>
    </div>
{/if}