<script>
    import ProfileLine from './ProfileLine.svelte';
    import ProfilePpCalc from './ProfilePpCalc.svelte';

    export let profile;

    $: scores = profile.scores
            ? Object.values(profile.scores)
                    .filter((s) => s.pp > 0)
                    .map((s) => s.pp)
                    .sort((a, b) => b - a)
            : null;
</script>

{#if profile && profile.stats}
    <ProfileLine label="Ranked play count" value={profile.stats.rankedPlayCount} precision={0}/>
    <ProfileLine label="Total ranked score" value={profile.stats.totalRankedScore} precision={0}/>
    <ProfileLine label="Average ranked accuracy" value={profile.stats.averageRankedAccuracy} suffix="%"/>
{/if}

{#if scores}
    <li class="calc">
        <ProfilePpCalc scores={scores} />
    </li>
{/if}

<style>
    li.calc {
        list-style: none;
        margin-left: -1.25em;
    }
</style>