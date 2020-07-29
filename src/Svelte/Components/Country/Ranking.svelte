<script>
    import Rank from '../Common/Rank.svelte';
    import Player from '../Common/Player.svelte';
    import Pp from '../Common/Pp.svelte';
    import Value from '../Common/Value.svelte';

    import {PLAYERS_PER_PAGE, MAGIC_HISTORY_NUMBER} from "../../../network/scoresaber/consts";
    import {daysAgo, getFirstNotNewerThan, toUTCDate} from "../../../utils/date";
    import {filterByCountry} from "../../../scoresaber/players";
    import Avatar from "../Common/Avatar.svelte";
    import {getMainUserId} from "../../../plugin-config";

    export let diff = 6;
    export let users = {};

    const diffOptions = [
        {value: 0, text: 'Dzień'},
        {value: 6, text: 'Tydzień'},
        {value: 29, text: 'Miesiąc'}
    ];

    let mainUserId;
    (async () => {mainUserId = await getMainUserId()})()

    let selectedDiff = diffOptions.find(i => i.value === diff);
    let ranking = [];

    $: if (selectedDiff) {
        ranking = filterByCountry(users)
                .reduce((cum, userId) => {
                    const {id, name, country, pp, rank, userHistory, weeklyDiff} = users[userId];

                    const historicalTimestamp = userHistory ? getFirstNotNewerThan(toUTCDate(daysAgo(selectedDiff.value + 1)), Object.keys(userHistory)) : null;

                    cum.push({
                        id,
                        name,
                        country,
                        pp,
                        prevPp: userHistory && historicalTimestamp && pp !== userHistory[historicalTimestamp].pp ? userHistory[historicalTimestamp].pp : null,
                        rank,
                        history,
                        change: rank && weeklyDiff && rank !== MAGIC_HISTORY_NUMBER && weeklyDiff !== MAGIC_HISTORY_NUMBER
                                ? weeklyDiff
                                : null
                    });

                    return cum;
                }, [])
                .sort((a, b) => b.pp - a.pp)
                .slice(0, 50)
    }
</script>

<style>
    .sspl .picture {
        padding: .5rem 0;
        width: 1.5rem;
    }
</style>

<table class="ranking global sspl">
    <thead>
    <tr>
        <th class="picture"></th>
        <th class="rank">Pozycja</th>
        <th class="player">Gracz</th>
        <th class="pp">PPs</th>
        <th class="diff">Tydzień</th>
    </tr>
    </thead>

    <tbody>
    {#each ranking as user, idx (user.id)}
        <tr style="{mainUserId === user.id ? 'background-color: var(--highlight);' : ''}">
            <td class="picture"><Avatar playerId={user.id} /></td>
            <td class="rank">
                <Rank rank={idx+1} url={'/global/' + encodeURIComponent( Math.ceil(user.rank / PLAYERS_PER_PAGE))} />
            </td>
            <td class="player">
                <Player {user} />
            </td>
            <td class="pp">
                <Pp pp="{user.pp}" zero="0,00" prevPp={user.prevPp} inline={true} />
            </td>
            <td class="diff {user.change ? (user.change > 0 ? 'inc' : 'dec') : ''}"><Value value={user.change ? user.change : 0} zero="0" digits={0} withSign={true} /></td>
        </tr>
    {/each}
    </tbody>
</table>