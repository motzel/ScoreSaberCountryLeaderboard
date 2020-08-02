<script>
    import config from "../../../temp";
    import Ranking from "./Ranking.svelte";
    import Songs from "./Songs.svelte";

    export let country  = config.COUNTRY;
</script>

<div class="columns is-multiline">
    <div class="leaderboard content column is-full-tablet is-half-widescreen is-one-third-fullhd">
        <div class="box has-shadow">
            <Ranking {country} />
        </div>
    </div>

    <div class="scores column is-full-tablet is-half-widescreen is-two-thirds-fullhd">
        <div class="box has-shadow">
            <h2 class="title is-5">Najnowsze wyniki</h2>
            <Songs {country} sortBy="timeset" />
        </div>

        <div class="box has-shadow">
            <h2 class="title is-5">Najlepsze wyniki</h2>

            <Songs {country} sortBy="pp" />
        </div>
    </div>
</div>

<style>
</style>