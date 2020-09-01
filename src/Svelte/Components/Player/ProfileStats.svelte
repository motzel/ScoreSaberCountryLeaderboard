<script>
    import {_} from '../../stores/i18n';
    import config from '../../../temp';
    import ProfileLine from './ProfileLine.svelte';

    export let stats = null;
</script>

{#if stats && stats.length}
    <ul>
        {#each stats as stat}
            {#if stat.type}
                {#if stat.type === 'rank'}
                    <li>
                        <strong>{$_.profile.stats.ranking}:</strong>
                        <a href="/global/{Math.floor((stat.value-1) / 50) + 1}">#{stat.value}</a>

                        {#if stat.originalCountry === config.COUNTRY}
                            (
                            {#if stat.ssplCountryRank}
                                <a href="/global?country={config.COUNTRY}"><img
                                        src="/imports/images/flags/{config.COUNTRY}.png"/>
                                    <strong>#{stat.ssplCountryRank}</strong>
                                    {#if stat.originalRank !== stat.ssplCountryRank}
                                        / <small>#{stat.originalRank}</small> {/if}
                                </a>
                            {:else}
                                <a href="/global?country={config.COUNTRY}"><img
                                        src="/imports/images/flags/{config.COUNTRY}.png"/>
                                    <strong>#{stat.originalRank}</strong></a>
                            {/if}
                            )
                        {:else}
                            (
                            {#if stat.ssplCountryRank}
                                <a href="/global?country={config.COUNTRY}"><img
                                        src="/imports/images/flags/{config.COUNTRY}.png"/>
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