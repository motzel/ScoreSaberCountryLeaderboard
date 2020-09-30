<script>
    import {_, trans} from "../../stores/i18n";
    import Ranking from "./Ranking.svelte";
    import Songs from "./Songs.svelte";
    import Button from "../Common/Button.svelte";
    import Range from "../Common/Range.svelte";
    import Select from "../Common/Select.svelte";
    import Refresh from "../Player/Refresh.svelte";
    import {getActiveCountryPlayers, getAllActivePlayers, getFriends} from "../../../scoresaber/players";
    import TypeFilterSelect from "../Common/TypeFilterSelect.svelte";

    export let country;

    let playersFilter = [];
    let refreshTag = null;
    let leaderboardType;

    let strings = {
        lastSongsPeriods: [
            {_key: 'dashboard.periods.last3Days', value: 3},
            {_key: 'dashboard.periods.lastWeek', value: 7},
            {_key: 'dashboard.periods.last2Weeks', value: 14},
            {_key: 'dashboard.periods.lastMonth', value: 30},
        ],
    }

    let values = {
        selectedSongPeriod: strings.lastSongsPeriods.find(p => p.value === 14),
    }

    function translateAllStrings() {
        Object.keys(strings).forEach(key => {
            strings[key].forEach(item => {
                if (item._key) item.label = trans(item._key);
            })
        })

        strings = {...strings};
        values = {...values};
    }

    async function filterPlayers(type) {
        let players;

        switch (type) {
            case 'all':
                players = await getAllActivePlayers(country);
                break;

            case 'manually_added':
                players = await getFriends(country, true);
                break;

            case 'country':
            default:
                players = await getActiveCountryPlayers(country, true);
                break;
        }

        playersFilter = players ? players.map(player => player.id).filter(s => s) : [];

        refreshTag = leaderboardType;
    }

    let minPp = 300;

    function onTypeChange() {
        const cont = document.querySelector('body > .section > .container.original');
        const newCont = document.querySelector('body > .section > main');
        if (!cont || !newCont) return;

        newCont.style.display = 'none';
        cont.style.display = 'block';
    }

    function songScoresFilter(song) {
        return playersFilter && playersFilter.includes(song.playerId);
    }

    function rankingFilter(player) {
        return playersFilter && playersFilter.includes(player.id);
    }

    $: {
        translateAllStrings($_);
    }

    $: {
        filterPlayers(leaderboardType);
    }
</script>

{#if country}
<div class="filters">
    <TypeFilterSelect bind:value={leaderboardType} {country} />
</div>

<div class="columns is-multiline">
    <div class="leaderboard content column is-full-tablet is-half-widescreen is-two-fifths-fullhd">
        <div class="ranking box has-shadow">
            <header>
                <h2 class="title is-5">{$_.dashboard.rankingHeader}</h2>
                <nav>
                    <Button iconFa="fas fa-exchange-alt" label={$_.dashboard.showOriginal} type="primary" on:click={onTypeChange} />
                </nav>
            </header>

            <Ranking {country} itemsPerPage={20} filterFunc={rankingFilter} {refreshTag}/>
        </div>
    </div>

    <div class="scores content column is-full-tablet is-half-widescreen is-three-fifths-fullhd">
        <div class="box has-shadow">
            <header>
                <h2>
                    <div class="title is-5">{$_.dashboard.lastScores}</div>
                    <div class="refresh">
                        <Refresh />
                    </div>
                </h2>
                <nav>
                    <Select bind:value={values.selectedSongPeriod} items={strings.lastSongsPeriods} right={true}/>
                </nav>
            </header>
            <Songs {country} sortBy="timeset" filterFunc={songScoresFilter} {refreshTag}
                   min={new Date(Date.now()-values.selectedSongPeriod.value*1000*60*60*24)}
                   itemsPerPage={5} pagesDisplayMax={7} noRank={true}/>
        </div>

        <div class="box has-shadow">
            <header>
                <h2 class="title is-5">{$_.dashboard.bestScores}</h2>
                <nav>
                    <Range bind:value={minPp} min={0} max={700} step={1} suffix="pp" inline={true}/>
                </nav>
            </header>

            <Songs {country} sortBy="pp" filterFunc={songScoresFilter} min={minPp} itemsPerPage={5} pagesDisplayMax={7}  {refreshTag} />
        </div>
    </div>
</div>
{/if}

<style>
    .filters {
        display: flex;
        justify-content: flex-start;
        margin-bottom: .5rem;
    }

    .box {
        min-height: 12rem;
        overflow-x: hidden;
        padding: .75rem 1rem 1rem 1rem;
    }

    .box h2 {
        margin-bottom: 0;
    }

    .box h2 {
        display: flex;
        align-items: center;
    }

    .box h2 .title {
        margin-bottom: 0;
    }

    .box h2 .refresh {
        margin-left: 1rem;
        margin-top: -.25em;
        font-size: 1rem;
    }

    header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: .5rem;
    }

    header nav {
        max-width: 15rem;
    }

    .ranking header nav {
        font-size: .8em!important;
    }
</style>