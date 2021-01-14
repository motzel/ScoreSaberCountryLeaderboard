<script>
    import {onMount, tick} from 'svelte';
    import {fade} from 'svelte/transition';
    import ProfilePpCalc from './ProfilePpCalc.svelte';
    import Badge from "../Common/Badge.svelte";
    import Select from "../Common/Select.svelte";

    import {getConfig, getMainPlayerId} from '../../../plugin-config';
    import {getAccFromRankedScore, getRankedsNotesCache, RANKED, UNRANKED} from '../../../scoresaber/rankeds';
    import {diffColors} from '../../../song';
    import eventBus from '../../../utils/broadcast-channel-pubsub';
    import {_, trans} from '../../stores/i18n';
    import {
        addToDate,
        dateFromString,
        daysAgo,
        getFirstNotNewerThan,
        timestampFromString,
        toSSTimestamp,
    } from "../../../utils/date";
    import twitch from '../../../services/twitch';
    import {PLAYERS_PER_PAGE} from '../../../network/scoresaber/consts'

    import {
        getAllPlayersHistory, getPlayerHistory,
        getPlayerInfo,
        getPlayerProfileUrl,
        getScoresByPlayerId,
        isCountryPlayer,
        isDataAvailable,
    } from '../../../scoresaber/players'
    import {getActiveCountry} from '../../../scoresaber/country'
    import {getSsplCountryRanks} from '../../../scoresaber/sspl-cache'
    import Value from '../Common/Value.svelte'
    import Refresh from './Refresh.svelte'
    import Settings from './Settings.svelte'
    import Chart from './Chart.svelte'
    import Browser from './Song/Browser.svelte'
    import ScoreSaberProvider from './Song/Provider/ScoreSaber.svelte'
    import ScoreSaberPresenter from './Song/Presenter/ScoreSaber.svelte'
    import MiniRanking from '../Country/MiniRanking.svelte'
    import {isDateObject, isEmpty} from '../../../utils/js'
    import TwitchVideosBadge from './TwitchVideosBadge.svelte'
    import {fetchSsProfilePage} from '../../../network/scoresaber/scores'
    import nodeSync from '../../../utils/multinode-sync'
    import {formatDateRelative} from '../../../utils/format'

    export let profileId;
    export let profilePage = {};
    export let autoTransform = false;

    export const MAX_COMPARE_PLAYERS = 3;

    const ONE_DAY = 1000 * 60 * 60 * 24

    let badgeStyling = "";

    let transformed = autoTransform;

    let name = profilePage && profilePage.name ? profilePage.name : '';
    let steamUrl = profilePage && profilePage.steamUrl ? profilePage.steamUrl : null;
    let avatarUrl = profilePage && profilePage.avatarUrl ? profilePage.avatarUrl : null;
    let country = profilePage && profilePage.country ? profilePage.country : null;

    let recentPlay = profilePage && profilePage.scores && profilePage.scores.length && profilePage.pageNum === 1 && profilePage.type === 'recent'
      ? dateFromString(profilePage.scores[0].timeset)
      : null;

    let chartHistory = profilePage && profilePage.chartHistory && profilePage.chartHistory.length ? profilePage.chartHistory : null;
    let ssBadges = profilePage && profilePage.ssBadges && profilePage.ssBadges.length ? profilePage.ssBadges : null;
    let ssStats = profilePage && profilePage.stats ? profilePage.stats : {}

    let playerInfo = null;
    let rank = null;
    let countryRanks = [];
    let pp = null;

    let prevPp = 0;
    let prevPpSince = null;

    let playerScores = null;

    let mainPlayerId = null;

    let playerTwitchProfile = null;

    let mode = 'pp-stars';
    let showCalc = false;
    let showChart = true;
    let defaultChartType = 'rank';

    let compareTo = [];
    let players = [];

    let selectedAccBadges = [];
    let chartRefreshTag = null;

    let anyDataIsAvailable = null;

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
    let isPlayerFromCurrentCountry = false;

    let config = null;

    let initialized = false;

    let rankedsNotesCache = null;

    function filterAccChart(score) {
        return filterByPeriod(score, values.selectedPeriod.value) && (
          !selectedAccBadges.length ||
          selectedAccBadges.reduce((result, badge) => {
              return result || ((!badge.min || badge.min <= score.acc) && (!badge.max || badge.max > score.acc))

          }, false)
        );
    }

    const refreshSsplCountryRanksCache = async () => ssplCountryRanksCache = await getSsplCountryRanks();

    function getBasicStats(ssStats, stats, allScores) {
        const basicStats = [];

        const addStdStat = (name, label, color, title = null, overriderValue = null, type = 'number', otherProps = {}) =>
          ssStats && ssStats.hasOwnProperty(name)
            ? basicStats.push({
                ...{
                    label,
                    title,
                    value: overriderValue !== null ? overriderValue : ssStats[name],
                    digits: 0,
                    bgColor: `var(--${color})`,
                    type,
                    fluid: true,
                    styling: badgeStyling
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
              styling: badgeStyling
          })
          : null;

        const addTotalScore = allScores => addStdStat('totalScore', $_.profile.stats.totalScore, 'selected', null, allScores ? allScores.reduce((sum, s) => sum + s.score, 0) : null);

        addStdStat('playCount', $_.profile.stats.playCount, 'selected', null, allScores ? allScores.length : null);

        if (playerScores && playerScores.length) {
            addSsplStat('playCount', $_.profile.stats.rankedPlayCount);
            if (badgeStyling !== 'text') addStdStat('replays', $_.profile.stats.replaysShort, 'dimmed', $_.profile.stats.replays);
            addTotalScore(allScores);
            addSsplStat('totalScore', $_.profile.stats.totalRankedScore);
            if (badgeStyling === 'text') addStdStat('replays', $_.profile.stats.replays, 'dimmed');
        } else {
            addTotalScore();
            addStdStat('replays', $_.profile.stats.replaysShort, 'dimmed', $_.profile.stats.replays);
        }

        addStdStat('role', $_.profile.stats.role, 'dimmed', null, null, 'text')

        if (ssStats.inactiveAccount) addStdStat('inactiveAccount', $_.profile.stats.inactiveAccount, 'dimmed', null, null, null, {onlyLabel: true})

        if (ssStats && ssStats.rank) rank = ssStats.rank;
        if (ssStats && ssStats.pp) pp = ssStats.pp;

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
              styling: badgeStyling
          })
          : null;
        addSsplStat('avgAcc', badgeStyling === 'text' ? $_.profile.stats.avgRankedAccuracy : $_.profile.stats.avgRankedAccuracyShort, badgeStyling === 'text' ? '' : $_.profile.stats.avgRankedAccuracy, 'selected');
        addSsplStat('medianAcc', badgeStyling === 'text' ? $_.profile.stats.medianRankedAccuracy : $_.profile.stats.medianRankedAccuracyShort, badgeStyling === 'text' ? '' : $_.profile.stats.medianRankedAccuracy, 'ppColour');
        addSsplStat('stdDeviation', badgeStyling === 'text' ? $_.profile.stats.stdDeviationRankedAccuracy : $_.profile.stats.stdDeviationRankedAccuracyShort, badgeStyling === 'text' ? '' : $_.profile.stats.stdDeviationRankedAccuracy, 'decrease');

        return accStats;
    }

    async function refreshConfig() {
        config = await getConfig();

        if (config.songBrowser && config.songBrowser.compareTo && Array.isArray(config.songBrowser.compareTo)) {
            compareTo = config.songBrowser.compareTo;
        }

        showCalc = config && config.profile && config.profile.showOnePpCalc;

        badgeStyling = config && config.profile && config.profile.statsStyle === 'text' ? 'text' : '';
    }

    function refreshChart(config, chartHistory) {
        showChart = config && config.profile && config.profile.showChart !== 'none' && chartHistory && chartHistory.length;
        defaultChartType = config && config.profile && config.profile.showChart ? config.profile.showChart : 'rank';
    }

    function setPlayers(profileId, mainPlayerId, name, compareTo) {
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
          .slice(0, MAX_COMPARE_PLAYERS);
    }

    function updatePlayerCountryRank(playerInfo, country, activeCountry, ssStats) {
        let newCountryRanks = [];

        const ssplCountryRank = playerInfo && activeCountry && playerInfo.ssplCountryRank && typeof playerInfo.ssplCountryRank === "object" && playerInfo.ssplCountryRank[activeCountry] ? playerInfo.ssplCountryRank[activeCountry] : (playerInfo && playerInfo.ssplCountryRank && typeof playerInfo.ssplCountryRank === "number" ? playerInfo.ssplCountryRank : null);
        if (ssplCountryRank) newCountryRanks =
          activeCountry === country
            ? [{
                rank: ssplCountryRank,
                subRank: ssStats && ssStats.countryRank ? ssStats.countryRank : null,
                country: activeCountry,
                type: 'active-country',
            }]
            : newCountryRanks.concat([{rank: ssplCountryRank, country: activeCountry, type: 'active-country'}]);

        if (country && ssStats && ssStats.countryRank && (!ssplCountryRank || activeCountry !== country))
            newCountryRanks = newCountryRanks
              .concat([{
                  rank: ssStats.countryRank,
                  country,
                  type: 'country',
              }]);

        countryRanks = newCountryRanks;
    }

    async function updateRankedsNotesCache() {
        rankedsNotesCache = await getRankedsNotesCache();
    }

    async function updateSsplCountryRanksCache(activeCountry) {
        if (!activeCountry) return;

        await refreshSsplCountryRanksCache();
    }

    async function updatePlayerInfo(profileId) {
        if (!profileId) return;

        playerInfo = await getPlayerInfo(profileId);
        if (!playerInfo) return;

        name = playerInfo.name;
        if (rank === null || rank === undefined) rank = playerInfo.rank;
        if (!pp) pp = playerInfo.pp;

        await updateRankedsNotesCache();

        if (activeCountry) await updateSsplCountryRanksCache(activeCountry);

        await twitch.updateVideosForPlayerId(profileId);

        playerTwitchProfile = await twitch.getProfileByPlayerId(profileId)
    }

    async function refreshPlayerScores(playerInfo) {
        if (!playerInfo) return;

        playerScores = await getScoresByPlayerId(playerInfo.id);
    }

    async function refreshProfile(playerId) {
        try {
            const pageData = await fetchSsProfilePage(playerId);
            if (!pageData || !pageData.scores) throw 'Download error';

            recentPlay = pageData.scores.length && pageData.scores[0].timeset && isDateObject(pageData.scores[0].timeset)
              ? pageData.scores[0].timeset
              : addToDate(new Date(), -ONE_DAY); // no scores at all - schedule as if player is not playing rn

            eventBus.publish('player-profile-page-parsed', {nodeId: nodeSync().getId(), playerId, profilePage: pageData});
        }
        catch {} // swallow error

        scheduleProfileRefresh(playerId);
    }

    function scheduleProfileRefresh(playerId) {
        if (!playerId) return;

        const ONE_MIUTE = 1000 * 60;
        const TEN_SECS = 1000 * 10;

        const nextUpdateIn = !recentPlay
          ? TEN_SECS
          : (
            recentPlay > addToDate(new Date(), -10 * ONE_MIUTE)
              ? ONE_MIUTE
              : 5 * ONE_MIUTE
          );

        setTimeout(() => refreshProfile(playerId), nextUpdateIn);
    }

    async function refreshPlayerDiffPp(profileId, pp, numOfDays) {
        if (!initialized || !profileId || !numOfDays || !pp || !Number.isFinite(pp)) return;

        prevPp = 0;
        prevPpSince = null;

        numOfDays = numOfDays >= ALL ? 1 : numOfDays;

        const timestampDiffAgo = toSSTimestamp(daysAgo(numOfDays));
        const playerHistory = await getPlayerHistory(profileId);
        if (!playerHistory || !playerHistory.length) return;

        const compareTo = playerHistory
          .sort((a,b) => b.timestamp - a.timestamp)
          .reduce((val, t) => t.timestamp >= timestampDiffAgo ? t : val, null);
        if (!compareTo || !Number.isFinite(compareTo.pp) || !isDateObject(compareTo.timestamp)) return;

        prevPp = compareTo.pp < pp ? compareTo.pp : 0;
        prevPpSince = formatDateRelative(compareTo.timestamp.toISOString());
    }

    onMount(async () => {
        anyDataIsAvailable = await isDataAvailable();

        mainPlayerId = await getMainPlayerId();

        activeCountry = await getActiveCountry();

        await refreshConfig();

        if (ssStats && ssStats.rank) rank = ssStats.rank;
        if (ssStats && ssStats.pp) pp = ssStats.pp;

        await updatePlayerInfo(profileId);

        const unsubscriberRankedsNotesCache = eventBus.on('rankeds-notes-cache-updated', ({rankedsNotesCache: newRankedsNotesCache}) => rankedsNotesCache = newRankedsNotesCache);
        const unsubscriberDataRefreshed = eventBus.on('data-refreshed', async () => {
            await updatePlayerInfo(profileId);
            anyDataIsAvailable = await isDataAvailable();
        });
        const unsubscriberScoresUpdated = eventBus.on('player-scores-updated', async ({playerId}) => {
            if (playerId === profileId) {
                await updatePlayerInfo(profileId);
            }

            anyDataIsAvailable = await isDataAvailable();
        })
        const unsubscriberSsplCountryRanksCacheUpdated = eventBus.on('sspl-country-ranks-cache-updated', async () => updateSsplCountryRanksCache(activeCountry));
        const unsubscriberConfigChanged = eventBus.on('config-changed', refreshConfig);
        const unsubscriberTwitchVideosUpdated = eventBus.on('player-twitch-videos-updated', async ({playerId}) => {
            if (playerId === profileId) {
                await updatePlayerInfo(profileId);
            }
        });
        const unsubscriberRecentPlayUpdated = eventBus.on('recent-play-updated', ({playerId, recentPlay: newRecentPlay}) => {
            if (playerId === profileId) recentPlay = newRecentPlay;
        });
        const unsubscriberPlayerStatsUpdated = eventBus.on('player-profile-page-parsed', async ({playerId, profilePage}) => {
            if (!playerId || playerId !== profileId) return;

            const chartHistoryFingerprint = history => history.reduce((cum, item) => cum + ':' + item, '');

            if (profilePage && profilePage.name) name = profilePage.name;
            if (profilePage && profilePage.steamUrl) steamUrl = profilePage.steamUrl;
            if (profilePage && profilePage.avatarUrl) avatarUrl = profilePage.avatarUrl;
            if (profilePage && profilePage.chartHistory && profilePage.chartHistory.length) {
                if (!chartHistory || chartHistoryFingerprint(chartHistory) !== chartHistoryFingerprint(profilePage.chartHistory))
                    chartHistory = profilePage.chartHistory;
            }
            if (profilePage && profilePage.ssBadges && profilePage.ssBadges.length) ssBadges = profilePage.ssBadges;
            if (profilePage && profilePage.stats) ssStats = profilePage.stats;

            await refreshPlayerDiffPp(profileId, pp, values.selectedPeriod.value);
        });
        const unsubscriberMainPlayerChanged = eventBus.on('main-player-changed', async ({playerId}) => {
            mainPlayerId = playerId;
            anyDataIsAvailable = await isDataAvailable();
        });

        initialized = true;

        return () => {
            unsubscriberDataRefreshed();
            unsubscriberSsplCountryRanksCacheUpdated();
            unsubscriberRankedsNotesCache();
            unsubscriberConfigChanged();
            unsubscriberScoresUpdated();
            unsubscriberTwitchVideosUpdated();
            unsubscriberRecentPlayUpdated();
            unsubscriberPlayerStatsUpdated();
            unsubscriberMainPlayerChanged();
        }
    })

    function getSsplCountryRankStats(scores, country, ssplCountryRanksCache) {
        if(!initialized || !scores || !scores.length || !country || isEmpty(ssplCountryRanksCache)) return;

        let stats = {
            bestRank: null,
            bestRankCnt: 0,
            avgRank: null,
            totalRank: 0,
        };

        if (country) country = country.toLowerCase();

        stats = scores.reduce((cum, s) => {
            const ssplCountryRank = country && ssplCountryRanksCache[s.leaderboardId] && ssplCountryRanksCache[s.leaderboardId][s.playerId] && ssplCountryRanksCache[s.leaderboardId][s.playerId][country] && ssplCountryRanksCache[s.leaderboardId][s.playerId][country];
            cum.totalRank += ssplCountryRank ? ssplCountryRank.rank : 0;

            if (ssplCountryRank && (cum.bestRank === null || ssplCountryRank.rank <= cum.bestRank)) {
                if (cum.bestRank === null || ssplCountryRank.rank < cum.bestRank) cum.bestRankCnt = 1; else cum.bestRankCnt += 1;

                cum.bestRank = ssplCountryRank.rank;
            }

            return cum;
        }, {...stats});

        stats.avgRank = stats.totalRank > 0 ? stats.totalRank / scores.length : null;

        delete stats.totalRank;

        return stats;
    }

    function getPlayerStats(scores, rankedsNotesCache) {
        if (!initialized || !scores) return;

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
            stdDeviation: 0
        };

        if (!scores || !scores.length) return stats;

        stats = scores.reduce((cum, s) => {
            if (!s.maxScoreEx) return cum;

            s.acc = getAccFromRankedScore(s, rankedsNotesCache);

            cum.totalScore += s.uScore ? s.uScore : s.score;
            cum.totalAcc += s.acc;

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

        delete stats.totalAcc;

        return stats;
    }

    const filterByPeriod = (s, period) => period === ALL || Date.now() - timestampFromString(s.timeset) <= period * ONE_DAY;

    $: allRankedScores = playerScores
      ? playerScores.filter(s => s.pp > 0 && (!UNRANKED.includes(s.leaderboardId) || RANKED.includes(s.leaderboardId)))
      : [];

    $: filteredRankedScores = allRankedScores.filter(s => filterByPeriod(s, values.selectedPeriod.value));
    $: filteredAllScores = playerScores ? playerScores.filter(s => filterByPeriod(s, values.selectedPeriod.value)) : null;

    $: stats = getPlayerStats(filteredRankedScores, rankedsNotesCache, initialized)
    $: ssplCountryRankStats = getSsplCountryRankStats(filteredRankedScores, activeCountry, ssplCountryRanksCache, initialized)

    $: basicStats = getBasicStats(ssStats, stats, filteredAllScores, badgeStyling);
    $: accStats = getAccStats(stats, badgeStyling);

    $: isPlayerFromCurrentCountry = isCountryPlayer(playerInfo, activeCountry);

    $: {
        scheduleProfileRefresh(profileId)
    }

    $: {
        setPlayers(profileId, mainPlayerId, name, compareTo);
    }

    $: {
        updatePlayerCountryRank(playerInfo, country, activeCountry, ssStats);
    }

    $: {
        refreshPlayerScores(playerInfo);
    }
    $: {
        refreshChart(config, chartHistory);
    }

    $: {
        translateAllStrings($_);
    }

    function updateChartRefreshTag(period, selectedAccBadges) {
        chartRefreshTag = period + ':' + selectedAccBadges.map(b => b.name).join(':');
    }

    $: {
        updateChartRefreshTag(values.selectedPeriod.value, selectedAccBadges);
    }

    $: {
        refreshPlayerDiffPp(profileId, pp, values.selectedPeriod.value, initialized)
    }

    let currentPage = profilePage && profilePage.pageNum ? profilePage.pageNum - 1 : 0;
    let scoresType = profilePage && profilePage.type ? profilePage.type : 'recent';

    function onScoreBrowse() {
        if (!players || !players.length) return;

        // update browser url
        const url = new URL(
          getPlayerProfileUrl(players[0].playerId, !(scoresType === 'top'), false, currentPage + 1),
        );
        history.replaceState(null, '', url.toString());
    }

    function onTransformProfile() {
        transformed = true;
    }

    function onAccBadgeClick(badge) {
        const badgeAlreadySelected = !!(selectedAccBadges.find(b => b === badge));

        if (badgeAlreadySelected) selectedAccBadges = selectedAccBadges.filter(b => b !== badge);
        else selectedAccBadges = selectedAccBadges.concat([badge]);

        defaultChartType = 'acc';
    }

    async function onBrowserTypeChanged(event) {
        transformed = false;
        await tick();

        if(ssPresenter) ssPresenter.onTypeChange(event.detail);
    }
    let ssPresenter  = null;
</script>

<div class="sspl-page-container">
    <div class="player-top">
        <div class="icons"><Settings {profileId} /></div>
        <div class="refresh"><Refresh {profileId} /></div>
    </div>
</div>

<div class="sspl-page-container">
    <main>
        <div class="box has-shadow">
            {#if playerScores && playerScores.length && accStats}
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
                                <span class="pp"><Value value={pp} suffix="pp" prevValue={prevPp}
                                                        prevLabel={prevPpSince} inline={true} /></span>
                            </h1>
                            <h2 class="title is-5 ranks">
                                <a href={rank ? "/global/" + (rank ? Math.floor((rank-1) / PLAYERS_PER_PAGE) + 1 : '') : '#'}
                                   data-type="global" data-rank={rank}>
                                    <i class="fas fa-globe-americas"></i>
                                    <Value value={rank} prefix="#" digits={0} zero="#0" />
                                </a>
                                {#each countryRanks as countryRank}
                                    <a href="/global?country={countryRank.country}"
                                       data-type={countryRank.type} data-rank={countryRank.rank} data-country={countryRank.country}
                                    >
                                        <img src="/imports/images/flags/{countryRank.country}.png">
                                        <Value value={countryRank.rank} prefix="#" digits={0} zero="#0" />
                                        {#if countryRank.subRank && countryRank.subRank !== countryRank.rank}
                                            <small>(#{ countryRank.subRank })</small>
                                        {/if}
                                    </a>
                                {/each}
                            </h2>
                        </div>

                        {#if playerScores && playerScores.length && ssBadges && ssBadges.length}
                            <div class="column">
                                <div class="badges ss-badges" transition:fade={{ duration: 2000 }}>
                                    {#each ssBadges as ssBadge}
                                        <img src={ssBadge.src} alt={ssBadge.title} title={ssBadge.title}/>
                                    {/each}
                                </div>
                            </div>
                        {/if}
                    </div>

                    <div class="columns">
                        <div class="column"><div class:flex-column-between={badgeStyling === 'text'}>
                            <div class={"badges " + badgeStyling}>
                                {#each basicStats as stat} <Badge {...stat}/> {/each}
                            </div>

                            <div class="badges std">
                                <TwitchVideosBadge {playerTwitchProfile} />

                                {#if showCalc && allRankedScores && allRankedScores.length}
                                    <ProfilePpCalc scores={allRankedScores} playerId={playerInfo.id} />
                                {/if}
                            </div>

                            {#if (!playerScores || !playerScores.length) && ssBadges && ssBadges.length}
                                <div class="badges ss-badges">
                                    {#each ssBadges as ssBadge}
                                        <img src={ssBadge.src} alt={ssBadge.title} title={ssBadge.title}/>
                                    {/each}
                                </div>
                            {/if}
                        </div></div>

                        {#if playerScores && playerScores.length}
                            <div class="column"><div class:flex-column-between={badgeStyling === 'text'}>
                                {#if accStats}
                                    <div class={"badges right " + badgeStyling}>
                                        {#each accStats as stat} <Badge {...stat}/> {/each}

                                        {#if ssplCountryRankStats}
                                        <Badge styling={badgeStyling} label={$_.profile.stats.countryRank} bgColor="var(--dimmed)" fluid={true}>
                                            <span class="sspl-ranks" slot="value">
                                                <div>
                                                    {$_.profile.stats.best}: <Value value={ssplCountryRankStats.bestRank} digits={0} prefix="#" zero="-" /> (<Value value={ssplCountryRankStats.bestRankCnt} digits={0} zero="-" />)
                                                </div>
                                                <div>
                                                    {$_.profile.stats.avg}: <Value value={ssplCountryRankStats.avgRank} digits={2} prefix="#" zero="-" />
                                                </div>
                                            </span>
                                        </Badge>
                                        {/if}
                                    </div>
                                {/if}

                                {#if stats && stats.badges}
                                    <div class="badges std right">
                                        {#each stats.badges as badge (badge)}
                                            <Badge label={badge.name} value={badge.value} title={badge.title} color="white"
                                                   bgColor={badge.color} digits={0} on:click={() => onAccBadgeClick(badge)}
                                                   clickable={true} notSelected={selectedAccBadges.length && ! (selectedAccBadges.includes(badge))} />
                                        {/each}
                                    </div>
                                {/if}
                            </div></div>
                        {/if}
                    </div>
                </div>
            </div>

            {#if showChart}
                <div class="chart">
                    <Chart {profileId} history={chartHistory} bind:type={defaultChartType} accFilterFunc={filterAccChart}
                           refreshTag={chartRefreshTag} />
                </div>
            {/if}
        </div>

        <div class="box has-shadow">
            <div class="content">
                {#if transformed}
                    <Browser playerId={profileId} {recentPlay} on:browser-type-changed={onBrowserTypeChanged} />
                {:else}
                    <ScoreSaberProvider
                      {players}
                      playerId={profilePage && profilePage.playerId ? profilePage.playerId : null}
                      scores={profilePage && profilePage.scores ? profilePage.scores : []}
                      pageNum={currentPage + 1}
                      totalItems={ssStats && ssStats.playCount ? ssStats.playCount : 0}
                      bind:type={scoresType}
                      pauseLoading={false}
                      {playerTwitchProfile}
                      {recentPlay}
                      let:songs let:series let:totalItems let:error let:beforePageChanged let:isPaused
                    >
                        <ScoreSaberPresenter
                          bind:this={ssPresenter}
                          bind:players
                          {songs}
                          {series}
                          {error}
                          bind:currentPage
                          {totalItems}
                          bind:type={scoresType}
                          {beforePageChanged}
                          on:browse={onScoreBrowse}
                          isCached={!!playerScores && !!playerScores.length}
                          {isPaused}
                          cachedRecentPlay={playerInfo ? playerInfo.recentPlay : null}
                          on:transform-profile={onTransformProfile}
                          maxComparePlayers={MAX_COMPARE_PLAYERS}
                        />
                    </ScoreSaberProvider>
                {/if}
            </div>
        </div>
    </main>

    <aside>
        {#if initialized && rank}
            <div class="box has-shadow ranking">
                <header>
                    <i class="fas fa-globe-americas"></i>
                    {$_.profile.aside.globalRanking}
                </header>
                <MiniRanking country={null} type="global" rank={rank} playerId={profileId} playerPp={pp} numOfItems={5}/>
            </div>

            {#each countryRanks as countryRank}
                <div class="box has-shadow ranking">
                    <header>
                        <img src="/imports/images/flags/{countryRank.country}.png">
                        {$_.profile.aside.countryRanking}
                    </header>
                    <MiniRanking country={countryRank.country}
                                 type={countryRank.type === 'active-country' ? 'country' : countryRank.type}
                                 rank={countryRank.rank}
                                 playerId={profileId} playerPp={pp} numOfItems={5}/>
                </div>
            {/each}
        {/if}
    </aside>
</div>

<style>
    .sspl-page-container {
        display: flex;
    }

    main {
        width: 100%;
    }

    aside {
        display: none;
        margin-left: 1rem;
        font-size: .9rem;
    }

    aside .box {
        padding: .5rem;
    }

    aside .ranking header {
        font-size: 1.1em;
        font-weight: 500;
        margin-bottom: .5em;
    }

    aside .ranking header > img, aside .ranking header > i {
        margin-right: .25em;
    }

    .player-top {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        margin: 0;
        width: 100%;
    }

    @media screen and (min-width: 1750px) {
        main, .player-top {
            width: calc(100% - 30rem);
        }

        aside {
            display: block;
            width: 29rem;
        }
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

    .ranks {
        position: relative;
    }

    .ranks small {
        font-size: .75em;
    }

    .badges.text {
        display: flex;
        flex-direction: column;
        margin-bottom: .5rem;
    }

    .flex-column-between {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        height: 100%;
    }
</style>