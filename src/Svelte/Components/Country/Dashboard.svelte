<script>
    import config from "../../../temp";
    import Ranking from "./Ranking.svelte";
    import Songs from "./Songs.svelte";

    export let country = config.COUNTRY;
</script>

<div class="columns is-multiline">
    <div class="leaderboard content column is-full-tablet is-half-widescreen is-two-fifths-fullhd">
        <div class="box has-shadow">
            <header>
                <h2 class="title is-5">Ranking</h2>
            </header>

            <Ranking {country} itemsPerPage={20}/>
        </div>
    </div>

    <div class="scores content column is-full-tablet is-half-widescreen is-three-fifths-fullhd">
        <div class="box has-shadow">
            <header>
                <h2 class="title is-5">Ostatnie wyniki</h2>
                <nav>
                    xxx
                </nav>
            </header>
            <Songs {country} sortBy="timeset" min={new Date(Date.now()-1000*60*60*24*14)} itemsPerPage={5}
                   pagesDisplayMax={7} noRank={true}/>
        </div>

        <div class="box has-shadow">
            <header>
                <h2 class="title is-5">Najlepsze wyniki</h2>
                <hav>
                    xxx
                </hav>
            </header>

            <Songs {country} sortBy="pp" min={300} itemsPerPage={5} pagesDisplayMax={7}/>
        </div>
    </div>
</div>

<style>
    .box {
        overflow-x: hidden;
    }

    .box h2 {
        margin-bottom: 1rem;
    }

    header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
</style>