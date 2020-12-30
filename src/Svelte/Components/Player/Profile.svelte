<script>
    import {onMount} from 'svelte';
    import ProfilePpCalc from './ProfilePpCalc.svelte';
    import Badge from "../Common/Badge.svelte";
    import Select from "../Common/Select.svelte";

    import {getConfig, getMainPlayerId} from '../../../plugin-config';
    import {getAccFromRankedScore, getRankedsNotesCache, RANKED, UNRANKED} from '../../../scoresaber/rankeds';
    import {diffColors} from '../../../song';
    import eventBus from '../../../utils/broadcast-channel-pubsub';
    import {_, trans} from '../../stores/i18n';
    import {dateFromString, timestampFromString} from "../../../utils/date";

    import {getPlayerInfo, getPlayerProfileUrl, getScoresByPlayerId} from '../../../scoresaber/players'
    import {getActiveCountry} from '../../../scoresaber/country'
    import {getSsplCountryRanks} from '../../../scoresaber/sspl-cache'
    import Value from '../Common/Value.svelte'
    import Refresh from './Refresh.svelte'
    import Settings from './Settings.svelte'
    import Chart from './Chart.svelte'
    import Browser from '../Song/Browser.svelte'
    import ScoreSaberProvider from '../Song/Provider/ScoreSaber.svelte'
    import ScoreSaberPresenter from '../Song/Presenter/ScoreSaber.svelte'

    export let profileId;
    export let name;
    export let country;
    export let steamUrl;
    export let avatarUrl;
    export let ssStats = {};
    export let ssBadges = [];
    export let chartHistory = [];
    export let prefetchedScores = {};
    export let autoTransform = false;

    const ONE_DAY = 1000 * 60 * 60 * 24

    let transformed = autoTransform;

    let recentPlay = prefetchedScores && prefetchedScores.scores && prefetchedScores.scores.length && prefetchedScores.pageNum === 1 && prefetchedScores.type === 'recent'
     ? dateFromString(prefetchedScores.scores[0].timeset)
     : null;

    let playerInfo = null;
    let rank = null;
    let countryRanks = [];
    let pp = null;

    let playerScores = null;

    let mainPlayerId = null;

    let mode = 'pp-stars';
    let showCalc = false;
    let showBadges = true;
    let showChart = false;

    let compareTo = [];
    let players = [];

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
        ],
    }

    let values = {
        selectedPeriod: strings.periods.find(p => p.value === ALL),
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

    let activeCountry = null;
    let ssplCountryRanksCache = {};

    let initialized = false;

    let rankedsNotesCache = null;

    const refreshSsplCountryRanksCache = async () => ssplCountryRanksCache = await getSsplCountryRanks();

    function getBasicStats(ssStats, stats, allScores) {
        const basicStats = [];
        const addSsStat = (name, otherProps) => ssStats && ssStats.hasOwnProperty(name)
         ? basicStats.push({
             ...{
                 label: ssStats[name].label,
                 title: ssStats[name].title ? ssStats[name].title : '',
                 value: ssStats[name].value,
                 digits: ssStats[name].precision,
                 bgColor: `var(--${ssStats[name].colorVar})`,
                 type: ssStats[name].type,
                 fluid: true,
             }, ...otherProps,
         })
         : null;
        const addSsplStat = (varName, label) => stats && stats.hasOwnProperty(varName)
         ? basicStats.push({
             label,
             value: stats[varName],
             digits: 0,
             bgColor: `var(--ppColour)`,
             fluid: true,
         })
         : null;

        const addPlayCount = allScores => allScores
         ? addSsStat('Play Count', {value: allScores.length})
         : addSsStat('Play Count');
        const addTotalScore = allScores => allScores
         ? addSsStat('Total Score', {value: allScores.reduce((sum, s) => sum + s.score, 0)})
         : addSsStat('Total Score');

        addPlayCount(allScores);

        if (playerScores) {
            addSsplStat('playCount', $_.profile.stats.rankedPlayCount);
            addSsStat('Replays Watched by Others');
            addTotalScore(allScores);
            addSsplStat('totalScore', $_.profile.stats.totalRankedScore);
        } else {
            addTotalScore();
            addSsStat('Replays Watched by Others');
        }

        if (ssStats['Inactive Account']) addSsStat('Inactive Account', {onlyLabel: true})

        return basicStats;
    }

    function getAccStats(stats) {
        if (!playerScores) return [];

        let accStats = [];
        const addSsplStat = (varName, label, title, color) => stats && stats.hasOwnProperty(varName)
         ? accStats.push({
             label,
             value: stats[varName],
             title: title,
             digits: 2,
             bgColor: `var(--${color})`,
             fluid: true,
             suffix: '%',
         })
         : null;
        addSsplStat('avgAcc', $_.profile.stats.avgRankedAccuracyShort, $_.profile.stats.avgRankedAccuracy, 'selected');
        addSsplStat('medianAcc', $_.profile.stats.medianRankedAccuracyShort, $_.profile.stats.medianRankedAccuracy, 'ppColour');
        addSsplStat('stdDeviation', $_.profile.stats.stdDeviationRankedAccuracyShort, $_.profile.stats.stdDeviationRankedAccuracy, 'decrease');

        return accStats;
    }

    onMount(async () => {
        mainPlayerId = await getMainPlayerId();

        const config = await getConfig('songBrowser');
        if (config.compareTo && Array.isArray(config.compareTo)) {
            compareTo = config.compareTo;
        }

        players = []
         .concat(profileId ? [{playerId: profileId, name}] : [])
         .concat(
          profileId && mainPlayerId && mainPlayerId !== profileId
           ? [{playerId: mainPlayerId, name: 'Main'}] :
           [],
         )
         .concat(
           compareTo && compareTo.length
           ? compareTo.filter(pId => pId !== mainPlayerId && pId !== profileId).map(pId => ({playerId: pId, name: ''}))
           : [],
         )
         .slice(0, 4);

        if (ssStats && ssStats['Player ranking']) rank = ssStats['Player ranking'].value;
        if (ssStats && ssStats['Performance Points']) pp = ssStats['Performance Points'].value;

        if (!playerInfo && profileId) {
            playerInfo = await getPlayerInfo(profileId);
        }

        // TODO: autorefresh when config is changed
        const profileConfig = await getConfig('profile');
        showChart = profileConfig && profileConfig.showChart && chartHistory && chartHistory.length;

        if (country && ssStats['Player ranking']) countryRanks = countryRanks.concat([{
            rank: ssStats['Player ranking'].countryRank,
            country,
            type: 'country',
        }]);

        if (playerInfo) {
            playerScores = await getScoresByPlayerId(playerInfo.id);

            if (!name) name = playerInfo.name;
            if (rank === null || rank === undefined) rank = playerInfo.rank;
            if (!pp) pp = playerInfo.pp;

            activeCountry = await getActiveCountry();

            const ssplCountryRank = playerInfo.ssplCountryRank && typeof playerInfo.ssplCountryRank === "object" && playerInfo.ssplCountryRank[activeCountry] ? playerInfo.ssplCountryRank[activeCountry] : (typeof playerInfo.ssplCountryRank === "number" ? playerInfo.ssplCountryRank : null);
            if (ssplCountryRank) countryRanks =
             activeCountry === country
              ? [{
                  rank: ssplCountryRank,
                  subRank: ssStats && ssStats['Player ranking'] ? ssStats['Player ranking'].countryRank : null,
                  country: activeCountry,
                  type: 'active-country',
              }]
              : countryRanks.concat([{rank: ssplCountryRank, country: activeCountry, type: 'active-country'}]);

            // TODO: autorefresh when config is changed
            const profileConfig = await getConfig('profile');
            if (profileConfig && profileConfig.showOnePpCalc) showCalc = true;

            if (profileConfig && (undefined === profileConfig.showBadges || profileConfig.showBadges)) showBadges = true;

            await refreshSsplCountryRanksCache();

            rankedsNotesCache = await getRankedsNotesCache();

            const rankedsNotesCacheUnsubscriber = eventBus.on('rankeds-notes-cache-updated', ({rankedsNotesCache: newRankedsNotesCache}) => rankedsNotesCache = newRankedsNotesCache);

            // TODO: reload profile page for now, try to do it to be more dynamic
            const dataRefreshed = eventBus.on('data-refreshed', () => window.location.reload());
            const ssplCountryRanksCacheUpdated = eventBus.on('sspl-country-ranks-cache-updated', async () => refreshSsplCountryRanksCache());

            initialized = true;

            return () => {
                dataRefreshed();
                ssplCountryRanksCacheUpdated();
                rankedsNotesCacheUnsubscriber();
            }
        }

        initialized = true;
    })

    function getPlayerStats(scores, country) {
        if (!initialized || !scores) return;

        if (country) country = country.toLowerCase();

        badgesDef.forEach(badge => {
            badge.value = 0;
            badge.title = !badge.min ? '< ' + badge.max + '%' : (!badge.max ? '> ' + badge.min + '%' : badge.min + '% - ' + badge.max + '%');
        });

        let stats = {
            badges: badgesDef,
            totalAcc: 0,
            totalScore: 0,
            avgAcc: 0,
            playCount: scores.length,
            medianAcc: 0,
            stdDeviation: 0,
            bestRank: null,
            bestRankCnt: 0,
            avgRank: null,
            totalRank: 0,
        };

        if (!scores || !scores.length) return stats;

        stats = scores.reduce((cum, s) => {
            if (!s.maxScoreEx) return cum;

            s.acc = getAccFromRankedScore(s, rankedsNotesCache);

            cum.totalScore += s.uScore ? s.uScore : s.score;
            cum.totalAcc += s.acc;

            const ssplCountryRank = country && ssplCountryRanksCache[s.leaderboardId] && ssplCountryRanksCache[s.leaderboardId][s.playerId] && ssplCountryRanksCache[s.leaderboardId][s.playerId][country] && ssplCountryRanksCache[s.leaderboardId][s.playerId][country];
            cum.totalRank += ssplCountryRank ? ssplCountryRank.rank : 0;

            if (ssplCountryRank && (cum.bestRank === null || ssplCountryRank.rank <= cum.bestRank)) {
                if (cum.bestRank === null || ssplCountryRank.rank < cum.bestRank) cum.bestRankCnt = 1; else cum.bestRankCnt += 1;

                cum.bestRank = ssplCountryRank.rank;
            }

            cum.badges.forEach(badge => {
                if ((!badge.min || badge.min <= s.acc) && (!badge.max || badge.max > s.acc)) badge.value++;
            })

            return cum;
        }, {...stats})

        stats.medianAcc = scores.length > 1
         ? (scores.sort((a, b) => a.acc - b.acc))[Math.ceil(scores.length / 2)].acc
         : scores[0].acc;
        stats.avgAcc = stats.totalAcc / scores.length;
        stats.stdDeviation = Math.sqrt(scores.reduce((sum, s) => sum + Math.pow(stats.avgAcc - s.acc, 2), 0) / scores.length);
        stats.avgRank = stats.totalRank > 0 ? stats.totalRank / scores.length : null;

        delete stats.totalAcc;
        delete stats.totalRank;

        return stats;
    }

    const filterByPeriod = (s, period) => period === ALL || Date.now() - timestampFromString(s.timeset) <= period * ONE_DAY;

    $: allRankedScores = playerScores
     ? playerScores.filter(s => s.pp > 0 && (!UNRANKED.includes(s.leaderboardId) || RANKED.includes(s.leaderboardId)))
     : [];

    $: filteredRankedScores = allRankedScores.filter(s => filterByPeriod(s, values.selectedPeriod.value));
    $: filteredAllScores = playerScores ? playerScores.filter(s => filterByPeriod(s, values.selectedPeriod.value)) : null;

    $: stats = getPlayerStats(filteredRankedScores, activeCountry, ssplCountryRanksCache, rankedsNotesCache, initialized)

    $: basicStats = getBasicStats(ssStats, stats, filteredAllScores);
    $: accStats = getAccStats(stats);

    $: {
        translateAllStrings($_);
    }

    let currentPage = prefetchedScores.pageNum ? prefetchedScores.pageNum - 1 : 0;
    let scoresType = prefetchedScores.type ? prefetchedScores.type : 'recent';
    function onScoreBrowse() {
        if (!players || !players.length) return;

        // update browser url
        const url = new URL(
         getPlayerProfileUrl(players[0].playerId, !(scoresType === 'top'), false, currentPage + 1)
        );
        history.replaceState(null, '', url.toString());
    }
    function onTransformProfile() {
        transformed = true;
    }
</script>

<div>
    <div class="player-top">
        <div class="icons"><Settings {profileId} /></div>
        <div class="refresh"><Refresh {profileId} /></div>
    </div>

    <div class="box has-shadow">
        {#if playerScores && accStats}
            <div class="period">
                <Select bind:value={values.selectedPeriod} items={strings.periods} right={true}/>
            </div>
        {/if}

        <div class="columns">
            <div class="column is-narrow avatar enlarge">
                <img src={avatarUrl} class="avatar" />
            </div>

            <div class="column">
                <div class="columns player-name">
                    <div class="column">
                        <h1 class="title is-4">
                            {#if steamUrl}<a href={steamUrl}>{name}</a>{:else}{name}{/if}
                            <span class="pp"><Value value={pp} suffix="pp" /></span>
                        </h1>
                        <h2 class="title is-5">
                            <a href="/global/{rank ? Math.floor((rank-1) / 50) + 1 : ''}">
                                <i class="fas fa-globe-americas"></i>
                                <Value value={rank} prefix="#" digits={0} zero="#0" />
                            </a>
                            {#each countryRanks as countryRank}
                                <a href="/global?country={countryRank.country}">
                                <img src="/imports/images/flags/{countryRank.country}.png">
                                <Value value={countryRank.rank} prefix="#" digits={0} zero="#0" suffix={ countryRank.subRank && countryRank.subRank !== countryRank.rank ? ` (#${countryRank.subRank})` : ''} />
                            </a>
                            {/each}
                        </h2>
                    </div>

                    {#if playerScores && ssBadges && ssBadges.length}
                    <div class="column">
                        <div class="badges ss-badges">
                            {#each ssBadges as ssBadge}
                                <img src={ssBadge.src} alt={ssBadge.title} title={ssBadge.title}/>
                            {/each}
                        </div>
                    </div>
                    {/if}
                </div>

                <div class="columns">
                    <div class="column">
                        <div class="badges">
                            {#each basicStats as stat} <Badge {...stat}/> {/each}
                        </div>

                        {#if !playerScores && ssBadges && ssBadges.length}
                            <div class="badges ss-badges">
                                {#each ssBadges as ssBadge}
                                    <img src={ssBadge.src} alt={ssBadge.title} title={ssBadge.title}/>
                                {/each}
                            </div>
                        {/if}

                        {#if showCalc && allRankedScores && allRankedScores.length}
                            <div class="content">
                                <ProfilePpCalc scores={allRankedScores} playerId={playerInfo.id} />
                            </div>
                        {/if}
                    </div>
                    {#if playerScores && playerScores.length}
                    <div class="column">
                        {#if playerScores}
                            {#if accStats}
                                <div class="badges right">
                                    {#each accStats as stat} <Badge {...stat}/> {/each}
                                </div>
                            {/if}

                            {#if stats}
                                {#if activeCountry}
                                    <Badge label={$_.profile.stats.countryRank} bgColor="var(--dimmed)" fluid={true}>
                                        <span class="sspl-ranks" slot="value">
                                            {#if filteredRankedScores && filteredRankedScores.length}
                                            <div>
                                                {$_.profile.stats.best}: <Value value={stats.bestRank} digits={0} prefix="#" zero="-" /> (<Value value={stats.bestRankCnt} digits={0} zero="-" />)
                                            </div>
                                            <div>
                                                {$_.profile.stats.avg}: <Value value={stats.avgRank} digits={2} prefix="#" zero="-" />
                                            </div>
                                            {:else}
                                                -
                                            {/if}
                                        </span>
                                    </Badge>
                                {/if}

                                {#if showBadges && stats.badges}
                                    <div class="badges right">
                                        {#each stats.badges as badge (badge)}
                                            <Badge label={badge.name} value={badge.value} title={badge.title} color="white" bgColor={badge.color} digits={0}/>
                                        {/each}
                                    </div>
                                {/if}
                            {/if}
                        {/if}
                    </div>
                    {/if}
                </div>
            </div>
        </div>

        {#if showChart}
            <div class="chart">
                <Chart {profileId} history={chartHistory} />
            </div>
        {/if}
    </div>

    <div class="box has-shadow">
        <div class="content">
            {#if transformed}
                <Browser playerId={profileId} {recentPlay} />
            {:else}
                <ScoreSaberProvider
                 {players}
                 scores={prefetchedScores.scores ? prefetchedScores.scores : []}
                 pageNum={currentPage + 1}
                 totalItems={ssStats && ssStats['Play Count'] && ssStats['Play Count'].value ? ssStats['Play Count'].value : 0}
                 type={scoresType}
                 let:songs let:series let:totalItems let:isLoading let:error
                >
                    <ScoreSaberPresenter
                     bind:players
                     {songs}
                     {series}
                     {error}
                     {isLoading}
                     bind:currentPage
                     {totalItems}
                     bind:type={scoresType}
                     on:browse={onScoreBrowse}
                     isCached={!!playerScores && !!playerScores.length}
                     on:transform-profile={onTransformProfile}
                    />
                </ScoreSaberProvider>
            {/if}
        </div>
    </div>
</div>


<style>
    .player-top {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        margin: 0;
    }

    .icons {
        font-size: .7rem;
        padding-left: .25rem;
    }

    .icons :global(.buttons) {
        margin-bottom: 0;
        margin-right: .5rem;
    }

    .icons :global(button) {
        margin-bottom: 0;
    }

    .refresh {
        justify-content: flex-end;
        padding-right: .25rem;
    }

    .box {
        position: relative;
    }

    .column.avatar {
        text-align: center;
    }

    img.avatar {
        border-radius: 50%;
        width: 150px;
        height: 150px;
    }

    .player-name {
        margin-bottom: 0;
    }

    .player-name .column {
        padding-bottom: 0;
    }

    .ss-badges {
        max-width: 90%;
        display: flex;
        flex-wrap: wrap;
    }
    .ss-badges img {
        margin-right: .5rem;
        margin-bottom: .25rem;
    }

    h1.title {
        margin-bottom: .25rem;
    }

    h1 a {
        color: var(--textColor)!important;
    }

    h1 .pp {
        color: var(--ppColour) !important;
        font-size: smaller;
        border-left: 1px solid var(--dimmed);
        padding-left: .75rem;
        margin-left: .5rem;
    }

    h2.title {
        display: flex;
        margin-bottom: 1rem;
    }

    h2 a {
        border-right: 1px solid var(--dimmed);
        padding: 0 .5rem;
    }

    h2 a:first-of-type {
        padding-left: 0;
    }

    h2 a:last-of-type {
        border-right: none;
    }

    h2 a i {
        color: var(--textColor);
        font-size: smaller;
        position: relative;
        top: -1px;
    }

    h2 a img {
        margin-bottom: 2px;
    }

    .sspl-ranks {
        display: inline-flex;
        flex-wrap: wrap;
    }

    .sspl-ranks > * {
        margin-right: .5rem;
    }

    .period {
        position: absolute;
        top: 0;
        right: .25rem;
    }

    .chart {
        min-height: 300px;
    }
</style>