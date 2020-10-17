<script>
    import {onMount} from 'svelte';
    import Rank from '../Common/Rank.svelte';
    import Player from '../Common/Player.svelte';
    import Pp from '../Common/Pp.svelte';
    import {USERS_URL} from "../../../network/scoresaber/consts";
    import {getActiveCountryPlayers,} from "../../../scoresaber/players";
    import {formatNumber, substituteVars} from "../../../utils/format";
    import {parseSsLeaderboardScores} from "../../../network/scoresaber/scores";
    import {convertArrayToObjectByKey} from "../../../utils/js";
    import {fetchHtmlPage} from "../../../network/fetch";
    import queue from "../../../network/queue";

    export let country;
    export let playerId;
    export let playerPp;
    export let numOfItems = 5;

    if (numOfItems < 2) numOfItems = 2;

    let players = [];
    let overridePlayersPp = {};
    let ranking = [];
    onMount(async () => {
        if (country) {
            players = await getActiveCountryPlayers(country);

            await fetchHtmlPage(queue.SCORESABER, substituteVars(USERS_URL, {country}))
                    .then(document => {
                        overridePlayersPp = convertArrayToObjectByKey(
                                parseSsLeaderboardScores(document)
                                        .map(s => ({playerId: s.playerId, pp: s.pp})), 'playerId');
                    })
                    .catch(_ => {}); // swallow error
        }
    });

    function getRanking(players, overridePlayersPp) {
        if (!players || !playerId) return null;

        const ranking = players
                .map(u => {
                    if (overridePlayersPp && overridePlayersPp[u.id] && overridePlayersPp[u.id].pp) {
                        u.pp = overridePlayersPp[u.id].pp;
                    }
                    return u;
                })
                .sort((a, b) => b.pp - a.pp) // sort it again after override
                .map((p, idx) => ({...p, countryRank: idx + 1}));

        const playerIdx = ranking.findIndex(p => p.id === playerId);
        if (playerIdx < 0) return null;

        let startIdx = playerIdx - (numOfItems - (numOfItems > 2 ? 2 : 1)) - (playerIdx + 1 === ranking.length ? 1 : 0);
        if (startIdx < 0) startIdx = 0;

        return ranking.slice(startIdx, startIdx + numOfItems);
    }

    $: ranking = getRanking(players, overridePlayersPp);
</script>

{#if ranking && ranking.length}
    <table class="sspl">
        <tbody>
        {#each ranking as row}
            <tr>
                <td>
                    <Rank rank={row.countryRank}/>
                </td>
                <td>
                    <Player user={row}/>
                </td>
                <td>
                    <Pp pp="{row.pp}" zero={formatNumber(0)} prevPp={playerPp} inline={true}/>
                </td>
            </tr>
        {/each}
        </tbody>
    </table>
{/if}

<style>
    table tbody td {
        padding: 0.25em 0.25em;
    }
</style>

