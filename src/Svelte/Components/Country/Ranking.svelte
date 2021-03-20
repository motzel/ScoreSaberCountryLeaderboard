<script>
    import {onMount} from 'svelte';
    import Rank from '../Common/Rank.svelte';
    import Player from '../Common/Player.svelte';
    import Pp from '../Common/Pp.svelte';
    import Value from '../Common/Value.svelte';
    import Table from '../Common/Table.svelte';
    import Avatar from "../Common/Avatar.svelte";

    import {PLAYERS_PER_PAGE, MAGIC_HISTORY_NUMBER} from "../../../network/scoresaber/consts";
    import {daysAgo, getFirstNotNewerThan, toSSTimestamp} from "../../../utils/date";
    import {getAllPlayersHistory, getAllPlayersRanking} from "../../../scoresaber/players";
    import {_, trans} from "../../stores/i18n";
    import {formatNumber} from "../../../utils/format";
    import {getPlayerName} from '../../../eastereggs'

    export let country;
    export let overridePlayersPp = {};
    export let itemsPerPage = 25;
    export let filterFunc = null;
    export let refreshTag = null;

    const DB_FETCH_DIFF = 14;

    let players = [];
    onMount(async () => {
        players = await getAllPlayersRanking(country);
    });

    let ranking = [];

    const header = [
        {label: '', key: 'picture', className: 'picture'},
        {label: '#', key: 'rank', className: 'rank'},
        {label: trans('dashboard.ranking.header.player'), key: 'player', className: 'player'},
        {label: trans('dashboard.ranking.header.pp'), key: 'pp', className: 'pp'},
        {label: trans('dashboard.ranking.header.change'), key: 'weeklyDiff', className: 'diff'}
    ]
    let rows = [];

    async function addPlayersHistory() {
        const DIFF_DAYS = 7;
        const timestampDiffAgo = toSSTimestamp(daysAgo(DIFF_DAYS));
        const dbFetchTimestamp = toSSTimestamp(daysAgo(DIFF_DAYS + DB_FETCH_DIFF));
        const playersHistory = (await getAllPlayersHistory(new Date(dbFetchTimestamp), new Date(timestampDiffAgo)))
         .reduce((cum, item) => {
             if (!cum[item.playerId]) cum[item.playerId] = {};

             cum[item.playerId][item.timestamp.getTime()] = item;

             return cum;
         }, {});

        ranking = ranking.map(p => {
            const historicalTimestamp = playersHistory[p.id] ? getFirstNotNewerThan(timestampDiffAgo, Object.keys(playersHistory[p.id])) : null;

            return {...p, prevPp: historicalTimestamp && p.pp !== playersHistory[p.id][historicalTimestamp].pp ? playersHistory[p.id][historicalTimestamp].pp : null}
        });
    }

    $: if (players && refreshTag) {
        ranking = players
                .map(player => {
                    if (overridePlayersPp[player.id] && overridePlayersPp[player.id].pp) {
                        player.pp = overridePlayersPp[player.id].pp;
                    }

                    const {weeklyDiff:change} = player;

                    return {...player, change, weeklyDiff_className: 'diff ' + (change ? (change > 0 ? 'inc' : 'dec') : '')};
                })
                .sort((a,b) => b.pp - a.pp) // sort it again after override
                .filter(p => !filterFunc || filterFunc(p))
                .map((player, idx) => ({...player, name: getPlayerName(player.name, idx)}))
        ;
    }

    $: addPlayersHistory(players, refreshTag, overridePlayersPp, filterFunc);
</script>

{#if ranking && ranking.length}
<Table {header} rows={ranking} {itemsPerPage} pagesDisplayMax={7} className="ranking global sspl">
    <span slot="head-col" let:col>{col.label}</span>

    <span slot="body-col" let:key let:rowIdx let:row>
        {#if key === 'picture'}
            <Avatar playerId={row.id} />
        {:else if key === 'rank'}
            <Rank rank={rowIdx+1} url={'/global/' + encodeURIComponent( Math.ceil(row.rank / PLAYERS_PER_PAGE))} />
        {:else if key === 'player'}
            <Player user={row} />
        {:else if key === 'pp'}
            <Pp pp="{row.pp}" zero={formatNumber(0)} prevPp={row.prevPp} inline={true} />
        {:else if key === 'weeklyDiff'}
            <Value value={row.change ? row.change : 0} zero="0" digits={0} withSign={true} />
        {/if}
    </span>
</Table>
{/if}

<style>
    :global(.sspl .picture) {
        padding: .5rem 0;
        width: 1.5rem;
    }
</style>

