<!--suppress JSUnfilteredForInLoop -->
<script>
    import Progress from './Progress.svelte';
    import Button from './Button.svelte';
    import FormattedDate from './FormattedDate.svelte';

    import {getCacheAndConvertIfNeeded, setCache, lastUpdated} from '../../../store';
    import {PLAYS_PER_PAGE} from '../../../network/scoresaber/consts';
    import config from '../../../temp';
    import {convertArrayToObjectByKey, escapeHtml, isEmpty} from '../../../utils/js';
    import log from '../../../utils/logger';

    import {getNewlyRanked, updateRankeds} from "../../../network/scoresaber/rankeds";
    import {fetchAllNewScores, fetchScores} from "../../../network/scoresaber/scores";
    import {fetchCountryPlayers} from "../../../network/scoresaber/players";
    import {dateFromString, toUTCDate} from "../../../utils/date";
    import {getMainUserId} from "../../../plugin-config";
    import {createBroadcastChannelStore} from '../../stores/broadcast-channel';
    import eventBus from '../../../utils/broadcast-channel-pubsub';
    import {getCumulativeRankedChangesSince} from "../../../scoresaber/rankeds";

    let stateObj = {
        date: null,
        started: false,
        progress: 0,
        label: '',
        subLabel: '',
        errorMsg: ''
    };
    let state = createBroadcastChannelStore('refresh-widget', stateObj);

    setLastRefershDate();

    function setLastRefershDate() {
        lastUpdated().then(d => $state.date = dateFromString(d));
    }

    function updateState(obj) {
        stateObj = {...stateObj, ...obj}
        $state = stateObj;
    }

    function updateProgress(info) {
        updateState({progress: info.percent, label: escapeHtml(info.name), subLabel: info.page.toString() + (info.wait ? ' ' + `[Czekam ${Math.floor(info.wait/1000)} s]` : '')});
    }

    async function refresh() {
        const data = Object.assign({}, await getCacheAndConvertIfNeeded());
        const oldRankeds = {...data.rankedSongs};

        updateState({subLabel: 'Pobieranie aktualnych rankedów'});
        const rankedChanges = await updateRankeds();
        if(rankedChanges && rankedChanges.length) {
            eventBus.publish('rankeds-changed', rankedChanges)
        }

        updateState({errorMsg: '', label: '', subLabel: `Pobieranie listy top 50 ${config.COUNTRY.toUpperCase()}...`});
        const users = await fetchCountryPlayers();

        updateState({label: '', subLabel: ''});

        // set all cached country players as inactive
        if(data.users) Object.keys(data.users).map(userId => {
            if(data.users[userId].ssplCountryRank) {
                data.users[userId].inactive = true;
                data.users[userId].ssplCountryRank = null;
            }
        });

        let idx = 0;
        let cache = await users.reduce(async (promisedCum, u) => {
            let cum = await promisedCum;

            u.userHistory = cum.users && cum.users[u.id] && cum.users[u.id].userHistory ? cum.users[u.id].userHistory : {};
            if(cum && cum.users && cum.users[u.id]) {
                const {rank, pp, countryRank, ssplCountryRank} = cum.users[u.id];
                u.userHistory = Object.assign({}, u.userHistory, {[toUTCDate(new Date())]: {rank, pp, countryRank, ssplCountryRank}})
            }

            const playerLastUpdated = dateFromString(cum.users[u.id] ? cum.users[u.id].lastUpdated : null);
            let newScores = await fetchAllNewScores(
                    u,
                    playerLastUpdated,
                    (info) => updateProgress(Object.assign({}, info, {percent: Math.floor((idx / users.length) * 100)}))
            );

            if(newScores && newScores.scores) {
                const prevScores = cum.users[u.id] ? cum.users[u.id].scores : {};
                Object.keys(newScores.scores).map(leaderboardId => {
                    const prevScore = prevScores[leaderboardId] ? prevScores[leaderboardId] : null;
                    if(prevScore) {
                        if (!newScores.scores[leaderboardId].history) newScores.scores[leaderboardId].history = [];

                        const {pp, rank, score, uScore, timeset} = prevScore;
                        newScores.scores[leaderboardId].history.push(
                                {pp, rank, score, uScore, timestamp: dateFromString(timeset).getTime()}
                        )
                    }
                })

                cum.users[u.id] = Object.assign({}, u, {
                    previousLastUpdated: dateFromString(u.lastUpdated ? u.lastUpdated : null),
                    lastUpdated: new Date().toISOString(),
                    recentPlay: newScores.lastUpdated,
                    scores: Object.assign(
                            {},
                            prevScores,
                            newScores.scores
                    )
                });
            } else {
                cum.users[u.id] = Object.assign({}, u, {lastUpdated: new Date().toISOString()});
            }

            if (playerLastUpdated) {
                const playerRankedChanges = (await getCumulativeRankedChangesSince(playerLastUpdated.getTime(), oldRankeds))
                        .map(s => s.leaderboardId);

                // fetch all user pages that need to be refetched
                // {pageIdx: [leaderboardId, leaderboardId...]}
                let playerScorePagesToUpdate = {};
                if (playerRankedChanges.length)
                    playerScorePagesToUpdate = Object.values(cum.users[u.id].scores)
                            .map((s) => ({
                                leaderboardId: s.leaderboardId,
                                timeset: dateFromString(s.timeset)
                            }))
                            .sort((a, b) => b.timeset.getTime() - a.timeset.getTime())
                            .reduce((cum, s, idx) => {
                                if (playerRankedChanges.includes(s.leaderboardId) && s.timeset < playerLastUpdated) {
                                    const page = Math.floor(idx / PLAYS_PER_PAGE) + 1;
                                    cum[page] = (cum && cum[page] ? cum[page] : []).concat([
                                        s.leaderboardId
                                    ]);
                                }
                                return cum;
                            }, {});

                let idxProgress = 0;
                let updatedUserScores = {};
                for (const page in playerScorePagesToUpdate) {
                    const progressInfo = {
                        id: u.id,
                        name: `Aktualizacja: ${u.name}`,
                        page: idxProgress + 1,
                        percent: stateObj.progress
                    };

                    updateProgress(progressInfo);

                    const scores = convertArrayToObjectByKey(
                            await fetchScores(
                                    u.id,
                                    page,
                                    (time) => updateProgress(Object.assign({}, progressInfo, {wait: time})),
                                    ...playerScorePagesToUpdate[page]
                            ),
                            'leaderboardId'
                    );
                    updatedUserScores = {...updatedUserScores, ...scores};

                    idxProgress++;
                }

                cum.users[u.id].scores = {...cum.users[u.id].scores, ...updatedUserScores};
            }

            idx++;

            return cum;
        }, data);

        cache.lastUpdated = new Date().toISOString();

        return cache;
    }

    async function onRefresh() {
        updateState({started: true, progress: 0});

        refresh()
                .then(async newData => {
                    await setCache(newData);

                    updateState({date: newData.lastUpdated});

                    return newData;
                })
                .then(_ => updateState({started: false}))
                .then(_ => eventBus.publish('data-refreshed', {}))
                .catch(e => {
                    updateState({started: false, errorMsg: 'Błąd pobierania danych. Spróbuj ponownie.'});
                    log.error("Can not refresh users")
                    console.error(e);
                })
        ;
    }
</script>

<div>
    {#if $state.started}
        <Progress value={$state.progress} label={$state.label} subLabel={$state.subLabel} maxWidth="16rem"/>
    {:else}
        <span class="btn-cont"><Button iconFa="fas fa-sync-alt" on:click={onRefresh} disabled={$state.started} /></span>
        {#if !$state.errorMsg || !$state.errorMsg.length}
            <strong>Data pobrania:</strong> <span><FormattedDate date={$state.date} noDate="-" /></span>
        {:else}
            <span class="err">{$state.errorMsg}</span>
        {/if}
    {/if}
</div>

<style>
    .btn-cont {
        font-size: .5rem;
    }

    .err {
        color: var(--decrease, red) !important;
    }
</style>