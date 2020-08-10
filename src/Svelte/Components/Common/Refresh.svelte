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

    import {getNewlyRanked} from "../../../network/scoresaber/rankeds";
    import {fetchAllNewScores, fetchScores} from "../../../network/scoresaber/scores";
    import {fetchUsers} from "../../../network/scoresaber/players";
    import {dateFromString, toUTCDate} from "../../../utils/date";
    import {getMainUserId} from "../../../plugin-config";
    import {createBroadcastChannelStore} from '../../stores/broadcast-channel';
    import eventBus from '../../../utils/broadcast-channel-pubsub';

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
        updateState({progress: info.percent, label: escapeHtml(info.name), subLabel: info.wait ? '[Czekam ' + Math.floor(info.wait/1000) + 's]' : info.page.toString()});
    }

    async function updateNewRankedsPpScores(data, progressCallback = null) {
        updateState({label: '', subLabel: '', errorMsg: ''});

        // check if scores has been updated max 1 minute ago
        const MAX_TIME_AFTER_UPDATE = 60 * 1000;
        if (
                new Date().getTime() -
                dateFromString(data.lastUpdated).getTime() >
                MAX_TIME_AFTER_UPDATE
        ) {
            log.error('Please update song data first');
            throw 'Please update song data first';
        }

        updateState({subLabel: 'Pobieranie nowych rankedów'});

        const newlyRanked = await getNewlyRanked();
        if (!newlyRanked) return {data, newlyRanked};

        // if not first fetch
        if(newlyRanked.newRanked.length !== Object.keys(newlyRanked.allRanked).length) {
            const leaderboardsToUpdate = newlyRanked.newRanked
                    .map((s) => s.leaderboardId)
                    .concat(newlyRanked.changed.map((s) => s.leaderboardId));

            const users = data.users;

            // fetch all user pages that need to be fetched
            // {userId: {pageId: [leaderboardId, leaderboardId...]}}
            const usersToUpdate = Object.values(users).reduce((cum, u) => {
                const userScoresToUpdate = Object.values(u.scores)
                        .map((s) => ({
                            leaderboardId: s.leaderboardId,
                            timeset: dateFromString(s.timeset)
                        }))
                        .sort((a, b) => b.timeset.getTime() - a.timeset.getTime())
                        .reduce((scum, s, idx) => {
                            if (leaderboardsToUpdate.includes(s.leaderboardId)) {
                                const page = Math.floor(idx / PLAYS_PER_PAGE) + 1;
                                scum[page] = (scum && scum[page] ? scum[page] : []).concat([
                                    s.leaderboardId
                                ]);
                            }
                            return scum;
                        }, {});

                if (!isEmpty(userScoresToUpdate)) {
                    cum[u.id] = userScoresToUpdate;
                }

                return cum;
            }, {});

            updateState({label: '', subLabel: 'Aktualizacja wyników nowych rankedów'});

            const totalPages = Object.values(usersToUpdate).reduce((sum, u) => (sum += Object.keys(u).length), 0);

            let idxGlobal = 0;
            for (const userId in usersToUpdate) {
                let idxLocal = 0;
                for (const page in usersToUpdate[userId]) {
                    const progressInfo = {
                        id: userId,
                        name: users[userId].name,
                        page: idxLocal + 1,
                        percent: Math.floor((idxGlobal / totalPages) * 100)
                    };

                    const scores = convertArrayToObjectByKey(
                            await fetchScores(
                                    userId,
                                    page,
                                    (time) => {
                                        if (progressCallback) progressCallback(Object.assign({}, progressInfo, {wait: time}))
                                    },
                                    ...usersToUpdate[userId][page]
                            ),
                            'leaderboardId'
                    );
                    users[userId].scores = Object.assign(
                            {},
                            users[userId].scores,
                            scores
                    );

                    if (progressCallback) progressCallback(progressInfo);

                    idxLocal++;
                    idxGlobal++;
                }
            }
        }

        data.rankedSongs = newlyRanked.allRanked;
        data.rankedSongsLastUpdated = JSON.parse(JSON.stringify(new Date()));

        return {data, newlyRanked};
    }

    async function updateNewRankeds(newData) {
        eventBus.publish('new-rankeds', []);

        const data = newData.data
        const newlyRanked = newData.newlyRanked;

        if (!newlyRanked) return;

        const mainUserId = await getMainUserId();
        if (!mainUserId) return;

        if (newlyRanked.newRanked.length !== Object.keys(newlyRanked.allRanked).length)
            eventBus.publish(
                    'new-rankeds',
                    newlyRanked.newRanked.concat(newlyRanked.changed)
                            .sort((a, b) => b.stars - a.stars)
                            .map((m) =>
                                    Object.assign({}, m, {
                                        pp: data && data.users && data.users[mainUserId] && data.users[mainUserId].scores && data.users[mainUserId].scores[m.leaderboardId]
                                                ? data.users[mainUserId].scores[m.leaderboardId].pp
                                                : null
                                    })
                            )
            );
    }

    async function refresh() {
        updateState({errorMsg: '', label: '', subLabel:"Pobieranie listy top 50 " + config.COUNTRY.toUpperCase() + '...'});

        const users = await fetchUsers();

        updateState({label: '', subLabel: ''});

        const data = Object.assign({}, await getCacheAndConvertIfNeeded());

        // set all cached users as inactive
        if(data.users) Object.keys(data.users).map(userId => data.users[userId].inactive = true);

        let idx = 0;
        let cache = await users.reduce(async (promisedCum, u) => {
            let cum = await promisedCum;

            u.userHistory = cum.users && cum.users[u.id] && cum.users[u.id].userHistory ? cum.users[u.id].userHistory : {};
            if(cum && cum.users && cum.users[u.id]) {
                const {rank, pp, countryRank, ssplCountryRank} = cum.users[u.id];
                u.userHistory = Object.assign({}, u.userHistory, {[toUTCDate(new Date())]: {rank, pp, countryRank, ssplCountryRank}})
            }

            let newScores = await fetchAllNewScores(
                    u,
                    dateFromString(cum.users[u.id] ? cum.users[u.id].lastUpdated : null),
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

            idx++;

            return cum;
        }, data);

        cache.lastUpdated = new Date().toISOString();

        return cache;
    }

    async function onRefresh() {
        updateState({started: true, progress: 0});

        refresh()
                .then(newData => updateNewRankedsPpScores(newData, updateProgress))
                .then(async newData => {
                    await setCache(newData.data);

                    updateState({date: newData.data.lastUpdated});

                    return newData;
                })
                .then(newData => updateNewRankeds(newData))
                .then(_ => updateState({started: false}))
                .then(_ => eventBus.publish('data-refreshed', {}))
                .catch(e => {
                    updateState({started: false, errorMsg: 'Błąd pobierania danych. Spróbuj ponownie.'});
                    log.error("Can not refresh users", e)
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