<script>
    import {_} from '../../stores/i18n';
    import {getActiveCountry} from "../../../scoresaber/players";
    import ProfileLine from './ProfileLine.svelte';
    import {onMount} from "svelte";

    export let stats = null;

    let activeCountry;
    onMount(async () => {
        activeCountry = await getActiveCountry();
    });
</script>

{#if stats && stats.length}
    <ul>
        {#each stats as stat}
            {#if stat.type}
                {#if stat.type === 'rank'}
                    <li>
                        <strong>{$_.profile.stats.ranking}:</strong>
                        <a href="/global/{Math.floor((stat.value-1) / 50) + 1}">#{stat.value}</a>

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
                            {#if stat.ssplCountryRank}
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
                    </li>
                {:else if stat.type === 'number'}
                    <ProfileLine {...stat}/>
                {:else}
                    <li><strong>{stat.label}:</strong> {stat.value}</li>
                {/if}
            {:else}
                <li><strong>{stat.label}:</strong> {stat.value}</li>
            {/if}
        {/each}
    </ul>
{/if}

<style>
</style>