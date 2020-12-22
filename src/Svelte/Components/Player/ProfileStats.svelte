<script>
    import {_} from '../../stores/i18n';
    import {hoverable} from '../../Actions/hoverable';
    import MiniRanking from "../Country/MiniRanking.svelte";
    import {onMount} from "svelte";
    import {getActiveCountry} from "../../../scoresaber/country";
    import {getPlayerInfo, isCountryPlayer} from "../../../scoresaber/players";

    export let profileId;
    export let stats = null;

    let countryRankingEl;

    let activeCountry;
    let playerInfo;
    let isPlayerFromCurrentCountry = false;
    let playerPp = null;
    let type = "country";
    let globalRank = null;
    let countryRank = null;
    onMount(async () => {
        activeCountry = await getActiveCountry();

        if (profileId) playerInfo = await getPlayerInfo(profileId);

        if (playerInfo && activeCountry) {
            isPlayerFromCurrentCountry = isCountryPlayer(playerInfo, activeCountry);
        }

        const ppStat = stats ? stats.filter(s => s.key === 'Performance Points') : null;
        if (ppStat) playerPp = ppStat && ppStat.length ? ppStat[0].value : null;

        const rankStat = stats ? stats.filter(s => s.type === 'rank') : null;
        if (rankStat) {
            globalRank = rankStat[0].value;
            countryRank = rankStat[0].originalRank;
        }
    });

    function onHover(event) {
        if (!isPlayerFromCurrentCountry) return;

        const el = event.detail.target.closest('[data-type]');
        if (el && ['country', 'global'].includes(el.dataset.type)) {
            type = el.dataset.type;
        }

        countryRankingEl.style.display = 'block';
    }

    function onUnhover(event) {
        if (!isPlayerFromCurrentCountry) return;

        countryRankingEl.style.display = 'none';
    }
</script>

{#if stats && stats.length}
    <ul>
        {#each stats as stat}
                    <li use:hoverable on:hover={onHover} on:unhover={onUnhover}>
                        {#if isPlayerFromCurrentCountry}
                        <div bind:this={countryRankingEl} class="country-ranking">
                            <MiniRanking country={stat.originalCountry ? stat.originalCountry : activeCountry} {type} {globalRank} {countryRank} playerId={profileId} {playerPp} numOfItems={5} />
                        </div>
                        {/if}

                        <strong>{$_.profile.stats.ranking}:</strong>
                        <a href="/global/{Math.floor((stat.value-1) / 50) + 1}" data-type="global">#{stat.value}</a>

                        <span data-type="country">
                        {#if stat.originalCountry === activeCountry}
                            (
                            {#if stat.ssplCountryRank}
                                <a href="/global?country={activeCountry}"><img
                                        src="/imports/images/flags/{activeCountry}.png"/>
                                    <strong>#{stat.ssplCountryRank}</strong>
                                    {#if stat.originalRank !== stat.ssplCountryRank}
                                        / <small>#{stat.originalRank}</small> {/if}
                                </a>
                            {:else}
                                <a href="/global?country={activeCountry}"><img
                                        src="/imports/images/flags/{activeCountry}.png"/>
                                    <strong>#{stat.originalRank}</strong></a>
                            {/if}
                            )
                        {:else}
                            (
                            {#if stat.ssplCountryRank && activeCountry}
                                <a href="/global?country={activeCountry}"><img
                                        src="/imports/images/flags/{activeCountry}.png"/>
                                    <strong>#{stat.ssplCountryRank}</strong></a>
                                {#if stat.originalRank !== stat.ssplCountryRank}
                                    / <small><a href="/global?country={stat.originalCountry}"><img
                                        src="/imports/images/flags/{stat.originalCountry}.png"/> #{stat.originalRank}
                                </a></small> {/if}
                            {:else}
                                <a href="/global?country={stat.originalCountry}"><img
                                        src="/imports/images/flags/{stat.originalCountry}.png"/>
                                    <strong>#{stat.originalRank}</strong></a>
                            {/if}
                            )
                        {/if}
                        </span>
                    </li>
        {/each}
    </ul>
{/if}

<style>
    ul li:first-of-type {
        position: relative;
    }

    .country-ranking {
        display: none;
        position: absolute;
        top: 1.5rem;
        left: 0;
        z-index: 10;
        width: 25rem;
        max-height: 12rem;
        padding: .25rem;
        font-size: .875rem;
        font-weight: normal;
        color: var(--textColor);
        background-color: var(--foreground);
        border: 1px solid var(--textColor);
        overflow: hidden;
    }
</style>