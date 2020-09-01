<script>
    import {onMount} from 'svelte';
    import ProfileLine from './ProfileLine.svelte';
    import ProfilePpCalc from './ProfilePpCalc.svelte';
    import Button from '../Common/Button.svelte';
    import Badge from "../Common/Badge.svelte";

    import {getConfig} from '../../../plugin-config';
    import {UNRANKED} from '../../../scoresaber/rankeds';
    import {diffColors} from '../../../song';
    import eventBus from '../../../utils/broadcast-channel-pubsub';
    import {_} from '../../stores/i18n';

    export let profile;

    let mode = 'pp-stars';
    let showCalc = false;
    let showBadges = true;

    const badgesDef = [
        {name: 'A', min: null, max: 80, value: 0, color: diffColors.easy},
        {name: 'S', min: 80, max: 85, value: 0, color: diffColors.normal},
        {name: 'S+', min: 85, max: 90, value: 0, color: diffColors.hard},
        {name: 'SS', min: 90, max: 95, value: 0, color: diffColors.expert},
        {name: 'SS+', min: 95, max: null, value: 0, color: diffColors.expertPlus},
    ];

    onMount(async() => {
        const profileConfig = await getConfig('profile');
        if (profileConfig && profileConfig.showOnePpCalc) showCalc = true;

        if (profileConfig && (undefined === profileConfig.showBadges || profileConfig.showBadges)) showBadges = true;

        // TODO: reload profile page for now, try to do it to be more dynamic
        return eventBus.on('data-refreshed', ({nodeId}) => window.location.reload());
    })

    function getPlayerStats(scores) {
        if (!scores || !scores.length) return null;

        const stats = scores.reduce((cum, s) => {
            if (!s.maxScoreEx) return cum;

            const scoreMult = s.uScore ? s.score / s.uScore : 1
            const acc = s.score / s.maxScoreEx / scoreMult * 100;

            cum.totalScore += s.uScore ? s.uScore : s.score;
            cum.totalAcc += acc;

            cum.badges.forEach(badge => {
                if ((!badge.min || badge.min <= acc) && (!badge.max || badge.max > acc)) badge.value++;

                badge.title = !badge.min ? '< ' + badge.max + '%' : (!badge.max ? '> ' + badge.min + '%' : badge.min + '% - ' + badge.max + '%')
            })

            return cum;
        }, {badges: badgesDef, totalAcc: 0, totalScore: 0, avgAcc: 0, playCount: scores.length})

        stats.avgAcc = stats.totalAcc / scores.length;
        delete stats.totalAcc;

        return stats;
    }

    $: allRankedScores = profile.scores
            ? Object.values(profile.scores)
                    .filter(s => s.pp > 0 && !UNRANKED.includes(s.leaderboardId))
            : null;

    $: scores = allRankedScores
            ? allRankedScores
                    .map(s => s.pp)
                    .sort((a, b) => b - a)
            : null;

    $: stats = getPlayerStats(allRankedScores);
</script>

{#if profile && stats}
    <ProfileLine label={$_.profile.stats.rankedPlayCount} value={stats.playCount} precision={0}/>
    <ProfileLine label={$_.profile.stats.totalRankedScore} value={stats.totalScore} precision={0}/>
    <ProfileLine label={$_.profile.stats.avgRankedAccuracy} value={stats.avgAcc} suffix="%"/>
{/if}

{#if showCalc && scores && scores.length}
    <li class="calc">
        <div>
            <ProfilePpCalc scores={scores} playerId={profile.id} mode={mode}/>
        </div>
        <Button iconFa="fas fa-arrows-alt-v" on:click={() => mode = mode === 'pp-stars' ? 'stars-pp' : 'pp-stars'}/>
    </li>
{/if}

{#if showBadges && stats && stats.badges}
    <div class="badges">
        {#each stats.badges.reverse() as badge (badge)}
            <Badge name={badge.name} value={badge.value} title={badge.title} color="white" bgColor={badge.color} digits={0}/>
        {/each}
    </div>
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

    .badges {
        margin-top: .75em;
        margin-left: -1.25em;
    }
</style>