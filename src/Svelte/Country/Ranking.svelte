<script>
    import {getMainUserId, default as config} from '../../config';
    import {formatNumber, substituteVars} from '../../utils/format';

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
                <span>#{idx+1}</span>
                <small>
                    <a href="/global/{encodeURIComponent( Math.ceil(user.rank / config.SS_PLAYERS_PER_PAGE))}">#{user.rank}</a>
                </small>
            </td>
            <td class="player">
                <a href="{substituteVars(config.USER_PROFILE_URL, { userId: user.id })}">
                    <img src="/imports/images/flags/{user.country.toLowerCase()}.png"/>
                    <span class="player-name">{user.name}</span>
                </a>
            </td>
            <td class="pp">
                <span class="scoreTop ppValue">{formatNumber(user.pp, 2)}</span>
                <span class="scoreTop ppLabel">pp</span></td>
            <td class="diff {user.change ? (user.change > 0 ? 'inc' : 'dec') : ''}">{formatNumber(user.change ? user.change : 0,  0, true)}</td>
        </tr>
    {/each}
    </tbody>
</table>