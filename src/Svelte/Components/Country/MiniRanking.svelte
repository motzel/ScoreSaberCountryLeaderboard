<script>
    import {onMount} from 'svelte';
    import {_} from '../../stores/i18n';
    import Rank from '../Common/Rank.svelte';
    import Player from '../Common/Player.svelte';
    import Pp from '../Common/Pp.svelte';
    import {GLOBAL_URL, PLAYERS_PER_PAGE, COUNTRY_URL} from "../../../network/scoresaber/consts";
    import {getActiveCountryPlayers,} from "../../../scoresaber/players";
    import {formatNumber, substituteVars} from "../../../utils/format";
    import {convertArrayToObjectByKey} from "../../../utils/js";
    import {fetchHtmlPage} from "../../../network/fetch";
    import queue from "../../../network/queue";
    import {getActiveCountry} from "../../../scoresaber/country";
    import {parseSsLeaderboardScores} from '../../../scoresaber/scores'

    export let type = "country";
    export let country;
    export let rank;
    export let playerId;
    export let playerPp;
    export let numOfItems = 5;

    if (numOfItems < 2) numOfItems = 2;

    let activeCountry;
    let activeCountryPlayers = null;
    let playersCache = {global: {}, country: {}};
    let overridePlayersPp = {};
    let players = null;
    let loading = true;
    let error = null;

    onMount(async () => {
        // TODO: update active country & players when change
        activeCountry = await getActiveCountry();
        if (activeCountry) activeCountryPlayers = await getActiveCountryPlayers(activeCountry);
    });

    function getPage(rank) {
        return Math.ceil(rank / PLAYERS_PER_PAGE);
    }

    async function fetchRanking(url, rank, country) {
        const playerPage = getPage(rank);
        const firstPlayerRank = rank - (numOfItems - (numOfItems > 2 ? 2 : 1));
        const firstPlayerRankPage = getPage(firstPlayerRank);
        const lastPlayerRankPage = getPage(firstPlayerRank + 1);

        const pages = [... new Set([playerPage, firstPlayerRankPage === 0 ? 1 : firstPlayerRankPage, lastPlayerRankPage])];

        let ranking = [];
        for (const page of pages) {
            ranking = ranking.concat(
                    await fetchHtmlPage(queue.SCORESABER, substituteVars(url, {page, country}))
                            .then(document => parseSsLeaderboardScores(document))
                            .then(players => players.map(p => {
                                const {tr, mods, percent, score, timesetAgo, rank, playerId, playerName, ...player} = p;
                                return {...player, id: playerId, name: playerName, miniRank: rank};
                            }))
            )
        }

        return ranking.sort((a, b) => b.pp - a.pp);
    }

    function setPlayers(type, overridePlayersPp, country, rank, isActiveCountryPlayer) {
        players = null;
        error = null;

        if (!playersCache.country[country]) playersCache.country[country] = {};

        const cache = type === 'global' ? playersCache.global : playersCache.country[country];
        const url = type === 'global' ? GLOBAL_URL : COUNTRY_URL;

        if (!(cache.players && cache.players.length) || (rank && cache.rank !== rank)) {
            if (!rank) return;

            loading = true;
            players = null;

            fetchRanking(url, rank, country)
             .then(ranking => {
                 if (type === 'country' && country === activeCountry && activeCountryPlayers && isActiveCountryPlayer) {
                     const additionalPlayers = activeCountryPlayers.filter(p => p.country.toLowerCase() !== activeCountry);

                     overridePlayersPp = Object.assign(
                      {},
                      overridePlayersPp,
                      convertArrayToObjectByKey(additionalPlayers.map(p => ({id: p.id, pp: p.pp})), 'playerId'),
                     )

                     ranking = ranking.concat(additionalPlayers)
                      .map(player => {
                          if (overridePlayersPp[player.id] && overridePlayersPp[player.id].pp) {
                              player.pp = overridePlayersPp[player.id].pp;
                          }

                          return player;
                      })
                      .sort((a, b) => b.pp - a.pp) // sort it again after override
                      .map((p, idx) => ({...p, miniRank: idx + 1}));
                 }

                 players = cache.players = ranking;
                 cache.rank = rank;

                 loading = false;
             })
             .catch(e => {
                 loading = false;

                 error = $_.common.downloadError;
             })
        } else {
            players = cache.players;
        }
    }

    function getRanking(players) {
        if (!players || !playerId) return null;

        const playerIdx = players.findIndex(p => p.id === playerId);
        if (playerIdx < 0) return null;

        let startIdx = playerIdx - (numOfItems - (numOfItems > 2 ? 2 : 1)) - (playerIdx + 1 === players.length ? 1 : 0);
        if (startIdx < 0) startIdx = 0;

        return players.slice(startIdx, startIdx + numOfItems);
    }

    $: isActiveCountryPlayer = !!(activeCountryPlayers && activeCountryPlayers.find(p => p.id === playerId));

    $: {
        setPlayers(type, overridePlayersPp, country, rank, isActiveCountryPlayer);
    }
    $: ranking = getRanking(players);
</script>

{#if loading}
    <div class="spinner-box">
        <i class="fas fa-sun fa-spin fa-3x"></i>
    </div>
{:else}
    {#if ranking && ranking.length}
        <table class="sspl">
            <tbody>
            {#each ranking as row}
                <tr>
                    <td class="rank">
                        <Rank rank={row.miniRank}/>
                    </td>
                    <td class="player">
                        <Player user={row}/>
                    </td>
                    <td class="pp">
                        <Pp pp="{row.pp}" zero={formatNumber(0)} prevPp={playerPp} inline={true}/>
                    </td>
                </tr>
            {/each}
            </tbody>
        </table>
    {:else if error}
        <p class="error">{error}</p>
    {:else}
        <p>{$_.common.noData}</p>
    {/if}
{/if}

<style>
    .spinner-box {
        padding: .5rem;
        text-align: center;
    }
    table {
        width: 100%;
    }
    table tbody td {
        padding: 0.25em 0.25em;
        border-bottom: 1px solid var(--dimmed);
    }
    td.rank {
        min-width: 3.75em;
        text-align: right;
    }
    td.player {
        overflow-x: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        width: 14em;
    }
    td.pp {
        min-width: 10.75em;
        text-align: left!important;
    }
    .error {
        font-weight: 500;
        color: red;
    }
</style>

