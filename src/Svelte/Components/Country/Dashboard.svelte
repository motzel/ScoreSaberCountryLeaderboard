<script>
    import config from "../../../temp";
    import Ranking from "./Ranking.svelte";
    import Songs from "./Songs.svelte";
    import Button from "../Common/Button.svelte";
    import Range from "../Common/Range.svelte";
    import Select from "../Common/Select.svelte";
    import Refresh from "../Player/Refresh.svelte";

    export let country = config.COUNTRY;

    const lastSongsPeriods = [
        {label: 'Ostatnie 3 dni', value: 3},
        {label: 'Ostatni tydzień', value: 7},
        {label: 'Ostatnie 2 tygodnie', value: 14},
        {label: 'Ostatni miesiąc', value: 30},
    ]
    let selectedSongPeriod = lastSongsPeriods.find(p => p.value === 14);
    let minPp = 300;

    function onTypeChange() {
        const cont = document.querySelector('body > .section > .container.original');
        const newCont = document.querySelector('body > .section > main');
        if (!cont || !newCont) return;

        newCont.style.display = 'none';
        cont.style.display = 'block';
    }
</script>

<div class="columns is-multiline">
    <div class="leaderboard content column is-full-tablet is-half-widescreen is-two-fifths-fullhd">
        <div class="ranking box has-shadow">
            <header>
                <h2 class="title is-5">Ranking</h2>
                <nav>
                    <Button iconFa="fas fa-exchange-alt" label="Pokaż oryginał" type="primary" on:click={onTypeChange} />
                </nav>
            </header>

            <Ranking {country} itemsPerPage={20}/>
        </div>
    </div>

    <div class="scores content column is-full-tablet is-half-widescreen is-three-fifths-fullhd">
        <div class="box has-shadow">
            <header>
                <h2>
                    <div class="title is-5">Ostatnie wyniki</div>
                    <div class="refresh">
                        <Refresh />
                    </div>
                </h2>
                <nav>
                    <Select bind:value={selectedSongPeriod} items={lastSongsPeriods} right={true}/>
                </nav>
            </header>
            <Songs {country} sortBy="timeset"
                   min={new Date(Date.now()-selectedSongPeriod.value*1000*60*60*24)}
                   itemsPerPage={5} pagesDisplayMax={7} noRank={true}/>
        </div>

        <div class="box has-shadow">
            <header>
                <h2 class="title is-5">Najlepsze wyniki</h2>
                <nav>
                    <Range bind:value={minPp} min={0} max={700} step={1} suffix="pp" inline={true}/>
                </nav>
            </header>

            <Songs {country} sortBy="pp" min={minPp} itemsPerPage={5} pagesDisplayMax={7}/>
        </div>
    </div>
</div>

<style>
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
        margin-top: .25em;
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