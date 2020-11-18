<script>
    import {onMount} from 'svelte';
    import ProfileLine from './ProfileLine.svelte';
    import ProfilePpCalc from './ProfilePpCalc.svelte';
    import Button from '../Common/Button.svelte';
    import Badge from "../Common/Badge.svelte";
    import Select from "../Common/Select.svelte";

    import {getConfig} from '../../../plugin-config';
    import {RANKED, UNRANKED} from '../../../scoresaber/rankeds';
    import {diffColors, getAccFromScore} from '../../../song';
    import eventBus from '../../../utils/broadcast-channel-pubsub';
    import {_, trans} from '../../stores/i18n';
    import {timestampFromString} from "../../../utils/date";

    import {getScoresByPlayerId} from '../../../scoresaber/players'
    import {getActiveCountry} from '../../../scoresaber/country'

    export let profile;

    let playerScores = null;

    let mode = 'pp-stars';
    let showCalc = false;
    let showBadges = true;

    let country;

    const ALL = 365 * 100;
    let strings = {
        periods: [
            {_key: 'dashboard.periods.last3Days', value: 3},
            {_key: 'dashboard.periods.lastWeek', value: 7},
            {_key: 'dashboard.periods.last2Weeks', value: 14},
            {_key: 'dashboard.periods.lastMonth', value: 30},
            {_key: 'dashboard.periods.last3Months', value: 90},
            {_key: 'dashboard.periods.lastHalfYear', value: 182},
            {_key: 'dashboard.periods.lastYear', value: 365},
            {_key: 'dashboard.periods.all', value: ALL},
        ]
    }

    let values = {
        selectedPeriod: strings.periods.find(p => p.value === ALL)
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

    const badgesDef = [
        {name: 'SS+', min: 95, max: null, value: 0, color: diffColors.expertPlus},
        {name: 'SS', min: 90, max: 95, value: 0, color: diffColors.expert},
        {name: 'S+', min: 85, max: 90, value: 0, color: diffColors.hard},
        {name: 'S', min: 80, max: 85, value: 0, color: diffColors.normal},
        {name: 'A', min: null, max: 80, value: 0, color: diffColors.easy},
    ];

    onMount(async () => {
        if (profile) {
            playerScores = await getScoresByPlayerId(profile.id);
        }

        country = await getActiveCountry();

        const profileConfig = await getConfig('profile');
        if (profileConfig && profileConfig.showOnePpCalc) showCalc = true;

        if (profileConfig && (undefined === profileConfig.showBadges || profileConfig.showBadges)) showBadges = true;

        // TODO: reload profile page for now, try to do it to be more dynamic
        const dataRefreshed = eventBus.on('data-refreshed', ({nodeId}) => window.location.reload());

        const playerTwitchLinked = eventBus.on('player-twitch-linked', async () => window.location.reload());

        return () => {
            dataRefreshed();
            playerTwitchLinked();
        }
    })

    function getPlayerStats(scores, country) {
        badgesDef.forEach(badge => {
            badge.value = 0;
            badge.title = !badge.min ? '< ' + badge.max + '%' : (!badge.max ? '> ' + badge.min + '%' : badge.min + '% - ' + badge.max + '%');
        });

        let stats = {badges: badgesDef, totalAcc: 0, totalScore: 0, avgAcc: 0, playCount: scores.length, medianAcc:
             0, stdDeviation: 0, avgRank: null, totalRank: 0};

        if (!scores || !scores.length) return stats;

        stats = scores.reduce((cum, s) => {
            if (!s.maxScoreEx) return cum;

            s.acc = getAccFromScore(s);

            cum.totalScore += s.uScore ? s.uScore : s.score;
            cum.totalAcc += s.acc;

            cum.totalRank += country && s.ssplCountryRank && s.ssplCountryRank[country] && s.ssplCountryRank[country].rank
             ? s.ssplCountryRank[country].rank
             : 0;

            cum.badges.forEach(badge => {
                if ((!badge.min || badge.min <= s.acc) && (!badge.max || badge.max > s.acc)) badge.value++;
            })

            return cum;
        }, {badges: badgesDef, totalAcc: 0, totalScore: 0, totalRank: 0, avgAcc: 0, playCount: scores.length})

        stats.medianAcc = (scores.sort((a, b) => a.acc - b.acc))[Math.ceil(scores.length / 2)].acc;
        stats.avgAcc = stats.totalAcc / scores.length;
        stats.stdDeviation = Math.sqrt(scores.reduce((sum, s) => sum + Math.pow(stats.avgAcc - s.acc, 2), 0) / scores.length);
        stats.avgRank = stats.totalRank > 0 ? stats.totalRank / scores.length : null;

        delete stats.totalAcc;
        delete stats.totalRank;

        return stats;
    }

    $: allRankedScores = playerScores
      ? playerScores.filter(s => s.pp > 0 && (!UNRANKED.includes(s.leaderboardId) || RANKED.includes(s.leaderboardId)))
      : [];

    $: filteredScores = allRankedScores.filter(s => values.selectedPeriod.value === ALL || Date.now() - timestampFromString(s.timeset) <= values.selectedPeriod.value * 1000 * 60 * 60 * 24)

    $: stats = getPlayerStats(filteredScores, country);

    $: {
        translateAllStrings($_);
    }
</script>

{#if profile && stats}
    <ProfileLine label={$_.profile.stats.rankedPlayCount} value={stats.playCount} precision={0}>
        <Select bind:value={values.selectedPeriod} items={strings.periods} right={true}/>
    </ProfileLine>
    {#if country}
    <ProfileLine label={$_.profile.stats.avgCountryRank} value={stats.avgRank} precision={2} prefix="#" />
    {/if}
    <ProfileLine label={$_.profile.stats.totalRankedScore} value={stats.totalScore} precision={0}/>
    <ProfileLine label={$_.profile.stats.avgRankedAccuracy} value={stats.avgAcc} suffix="%"/>
    <ProfileLine label={$_.profile.stats.stdDeviationRankedAccuracy} value={stats.stdDeviation} suffix="%"/>
    <ProfileLine label={$_.profile.stats.medianRankedAccuracy} value={stats.medianAcc} suffix="%"/>
{/if}

{#if showCalc && allRankedScores && allRankedScores.length}
    <li class="calc">
        <div>
            <ProfilePpCalc scores={allRankedScores} playerId={profile.id} mode={mode}/>
        </div>
        <Button iconFa="fas fa-arrows-alt-v" on:click={() => mode = mode === 'pp-stars' ? 'stars-pp' : 'pp-stars'}/>
    </li>
{/if}

{#if showBadges && stats && stats.badges}
    <div class="badges">
        {#each stats.badges as badge (badge)}
            <Badge name={badge.name} value={badge.value} title={badge.title} color="white" bgColor={badge.color} digits={0}/>
        {/each}
    </div>
{/if}

<style>
    :global(li .multi-select) {
        position: absolute;
        top: -.5rem;
        right: 0;
    }

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