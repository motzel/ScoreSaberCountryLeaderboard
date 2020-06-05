<script>
    import Rank from '../Common/Rank.svelte';
    import Player from '../Common/Player.svelte';
    import Pp from '../Common/Pp.svelte';
    import Value from '../Common/Value.svelte';

    import {getMainUserId, default as config} from '../../../config';

    export let diff = 6;
    export let users = {};

    const diffOptions = [
        {value: 0, text: 'Dzień'},
        {value: 6, text: 'Tydzień'},
        {value: 29, text: 'Miesiąc'}
    ];

    const mainUserId = getMainUserId();

    let selectedDiff = diffOptions.find(i => i.value === diff);
    let ranking = [];

    $: if (selectedDiff) {
        ranking = Object.keys(users)
                .reduce((cum, userId) => {
                    const {id, name, country, pp, rank, history} = users[userId];

                    const historicalRank = history && typeof (history[selectedDiff.value]) !== "undefined" ? history[selectedDiff.value] : null;

                    cum.push({
                        id,
                        name,
                        country,
                        pp,
                        rank,
                        history,
                        change: rank && historicalRank && rank !== config.MAGIC_HISTORY_NUMBER && historicalRank !== config.MAGIC_HISTORY_NUMBER
                                ? historicalRank - rank
                                : null
                    });

                    return cum;
                }, [])
                .sort((a, b) => b.pp - a.pp)
                .slice(0, 50)
    }
</script>

<table class="ranking global sspl">
    <thead>
    <tr>
        <th class="rank">Pozycja</th>
        <th class="player">Gracz</th>
        <th class="pp">PPs</th>
        <th class="diff">
            <select bind:value={selectedDiff}>
                {#each diffOptions as option}
                    <option value={option} selected="{option.value === diff}">{option.text}</option>
                {/each}
            </select>
        </th>
    </tr>
    </thead>

    <tbody>
    {#each ranking as user, idx (user.id)}
        <tr style="{mainUserId === user.id ? 'background-color: var(--color-highlight);' : ''}">
            <td class="rank">
                <Rank rank={idx+1} subRank={user.rank} url={'/global/' + encodeURIComponent( Math.ceil(user.rank / config.SS_PLAYERS_PER_PAGE))} />
            </td>
            <td class="player">
                <Player {user} />
            </td>
            <td class="pp">
                <Pp pp="{user.pp}" zero="0,00" />
            </td>
            <td class="diff {user.change ? (user.change > 0 ? 'inc' : 'dec') : ''}"><Value value={user.change ? user.change : 0} zero="0" digits={0} withSign={true} /></td>
        </tr>
    {/each}
    </tbody>
</table>