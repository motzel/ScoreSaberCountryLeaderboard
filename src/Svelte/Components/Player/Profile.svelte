<script>
    import ProfileLine from './ProfileLine.svelte';
    import ProfilePpCalc from './ProfilePpCalc.svelte';
    import Button from '../Common/Button.svelte';

    export let profile;
    let mode = 'pp-stars';

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
        <div><ProfilePpCalc scores={scores} playerId={profile.id} mode={mode} /></div>
        <Button iconFa="fas fa-arrows-alt-v" on:click={() => mode = mode === 'pp-stars' ? 'stars-pp' : 'pp-stars'} />
    </li>
{/if}

<style>
    li.calc {
        display: flex;
        align-items: flex-start;
        list-style: none;
        margin-left: -1.25em;
    }
    li.calc > div {
        margin-right: 1rem;
        width: 27rem;
    }
</style>