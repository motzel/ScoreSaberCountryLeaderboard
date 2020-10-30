<script>
    import {onMount} from 'svelte';
    import Rank from '../Common/Rank.svelte';
    import Player from '../Common/Player.svelte';
    import Pp from '../Common/Pp.svelte';
    import Value from '../Common/Value.svelte';
    import Table from '../Common/Table.svelte';
    import Avatar from "../Common/Avatar.svelte";

    import {PLAYERS_PER_PAGE, MAGIC_HISTORY_NUMBER} from "../../../network/scoresaber/consts";
    import {daysAgo, getFirstNotNewerThan, toSSDate} from "../../../utils/date";
    import {getAllPlayersRanking} from "../../../scoresaber/players";
    import {_, trans} from "../../stores/i18n";
    import {formatNumber} from "../../../utils/format";

    export let country;
    export let overridePlayersPp = {};
    export let itemsPerPage = 25;
    export let diff = 6;
    export let filterFunc = null;
    export let refreshTag = null;

    const diffOptions = [
        {value: 0, text: trans('dashboard.ranking.changeOptions.day')},
        {value: 6, text: trans('dashboard.ranking.changeOptions.week')},
        {value: 29, text: trans('dashboard.ranking.changeOptions.month')}
    ];

    let users = [];
    onMount(async () => {
        users = await getAllPlayersRanking(country);
    });

    let selectedDiff = diffOptions.find(i => i.value === diff);
    let ranking = [];

    const header = [
        {label: '', key: 'picture', className: 'picture'},
        {label: '#', key: 'rank', className: 'rank'},
        {label: trans('dashboard.ranking.header.player'), key: 'player', className: 'player'},
        {label: trans('dashboard.ranking.header.pp'), key: 'pp', className: 'pp'},
        {label: trans('dashboard.ranking.header.change'), key: 'weeklyDiff', className: 'diff'}
    ]
    let rows = [];

    $: if (users && (selectedDiff || refreshTag)) {
        ranking = users
                .map(u => {
                    if (overridePlayersPp[u.id] && overridePlayersPp[u.id].pp) {
                        u.pp = overridePlayersPp[u.id].pp;
                    }
                    return u;
                })
                .sort((a,b) => b.pp - a.pp) // sort it again after override
                .filter(p => !filterFunc || filterFunc(p))
                .reduce((cum, user) => {
                    const {id, name, country, pp, rank, userHistory, weeklyDiff} = user;

                    const historicalTimestamp = userHistory ? getFirstNotNewerThan(toSSDate(daysAgo(selectedDiff.value + 1)), Object.keys(userHistory)) : null;

                    const change = rank && weeklyDiff && rank !== MAGIC_HISTORY_NUMBER && weeklyDiff !== MAGIC_HISTORY_NUMBER
                            ? weeklyDiff
                            : null;
                    cum.push({
                        id,
                        name,
                        country,
                        pp,
                        prevPp: userHistory && historicalTimestamp && pp !== userHistory[historicalTimestamp].pp ? userHistory[historicalTimestamp].pp : null,
                        rank,
                        change,
                        weeklyDiff_className: 'diff ' + (change ? (change > 0 ? 'inc' : 'dec') : '')
                    });

                    return cum;
                }, [])
    }
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

