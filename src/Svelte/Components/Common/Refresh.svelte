<script>
    import Progress from './Progress.svelte';

    import {formatDate} from '../../../utils/format';
    import {getCacheAndConvertIfNeeded, setCache, lastUpdated} from '../../../store';
    import {PLAYS_PER_PAGE} from '../../../network/scoresaber/consts';
    import {default as config, getMainUserId} from '../../../temp';
    import {convertArrayToObjectByKey, escapeHtml, isEmpty} from '../../../utils/js';
    import log from '../../../utils/logger';

    import { createEventDispatcher } from 'svelte';
    import {getNewlyRanked} from "../../../network/scoresaber/rankeds";
    import {fetchAllNewScores, fetchScores} from "../../../network/scoresaber/scores";
    import {fetchUsers} from "../../../network/scoresaber/players";
    import {dateFromString, toUTCDate} from "../../../utils/date";

    const dispatch = createEventDispatcher();

    let label = "";
    let subLabel = "";
    let progress = 0;
    let started = false;

    let date = null;
    setLastRefershDate();

    function setLastRefershDate() {
        lastUpdated().then(d => date = dateFromString(d));
    }

    function updateProgress(info) {
        progress = info.percent;
        label = escapeHtml(info.name);
        subLabel = info.page.toString();
    }

    async function updateNewRankedsPpScores(progressCallback = null) {
        const data = await getCacheAndConvertIfNeeded();

        label = "";
        subLabel = "";

        // check if scores has been updated max 1 minute ago
        const MAX_TIME_AFTER_UPDATE = 60 * 1000;
        if (
                new Date().getTime() -
                dateFromString(data.lastUpdated).getTime() >
                MAX_TIME_AFTER_UPDATE
        ) {
            log.error('Please update song data first');
            return null;
        }

        label = "";
        subLabel = 'Pobieranie nowych rankedów';

        const newlyRanked = await getNewlyRanked();
        if (!newlyRanked) return null;

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

            label = "";
            subLabel = 'Aktualizacja wyników nowych rankedów';

            const totalPages = Object.values(usersToUpdate).reduce((sum, u) => (sum += Object.keys(u).length), 0);

            let idxGlobal = 0;
            for (const userId in usersToUpdate) {
                let idxLocal = 0;
                for (const page in usersToUpdate[userId]) {
                    const scores = convertArrayToObjectByKey(
                            await fetchScores(
                                    userId,
                                    page,
                                    ...usersToUpdate[userId][page]
                            ),
                            'leaderboardId'
                    );
                    users[userId].scores = Object.assign(
                            {},
                            users[userId].scores,
                            scores
                    );

                    if (progressCallback)
                        progressCallback({
                            id: userId,
                            name: users[userId].name,
                            page: idxLocal + 1,
                            percent: Math.floor((idxGlobal / totalPages) * 100)
                        });

                    idxLocal++;
                    idxGlobal++;
                }
            }
        }

        data.rankedSongs = newlyRanked.allRanked;
        data.rankedSongsLastUpdated = JSON.parse(JSON.stringify(new Date()));

        await setCache(data);

        return newlyRanked;
    }

    async function updateNewRankeds(newlyRanked) {
        dispatch('new-rankeds', []);

        const data = await getCacheAndConvertIfNeeded();

        if (!data.flags.rankedSongsAvailable || !newlyRanked) return;

        const sseUserId = getMainUserId();
        if (!sseUserId) return;

        if (newlyRanked.newRanked.length !== Object.keys(newlyRanked.allRanked).length)
            dispatch(
                    'new-rankeds',
                    newlyRanked.newRanked.concat(newlyRanked.changed)
                            .sort((a, b) => b.stars - a.stars)
                            .map((m) =>
                                    Object.assign({}, m, {
                                        pp: data && data.users && data.users[sseUserId] && data.users[sseUserId].scores && data.users[sseUserId].scores[m.leaderboardId]
                                                ? data.users[sseUserId].scores[m.leaderboardId].pp
                                                : null
                                    })
                            )
            );
    }

    async function refresh() {
        label = "";
        subLabel = "Pobieranie listy top 50 " + config.COUNTRY.toUpperCase() + '...';

        const users = await fetchUsers();

        label = "";
        subLabel = "";

        const data = await getCacheAndConvertIfNeeded();

        // set all cached users as inactive
        if(data.users) Object.keys(data.users).map(userId => data.users[userId].inactive = true);

        let idx = 0;
        let cache = await users.reduce(async (promisedCum, u) => {
            let cum = await promisedCum;

            u.userHistory = cum.users && cum.users[u.id] && cum.users[u.id].userHistory ? cum.users[u.id].userHistory : {};
            if(cum && cum.users && cum.users[u.id]) {
                const {rank, pp, countryRank} = cum.users[u.id];
                u.userHistory = Object.assign({}, u.userHistory, {[toUTCDate(new Date())]: {rank, pp, countryRank}})
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
                    lastUpdated: newScores.lastUpdated,
                    scores: Object.assign(
                            {},
                            prevScores,
                            newScores.scores
                    )
                });
            }

            idx++;

            return cum;
        }, data);

        cache.lastUpdated = new Date().toISOString();
        date = cache.lastUpdated;

        await setCache(cache);

        dispatch('data-refreshed', {})
    }

    async function onRefresh() {
        started = true;

        progress = 0;

        refresh()
                .then(_ => updateNewRankedsPpScores(updateProgress))
                .then(newlyRanked => updateNewRankeds(newlyRanked))
                .then(_ => started = false)
                .catch(e => {
                    started = false
                    log.error("Can not refresh users", e)
                })
        ;
    }
</script>

<style>
</style>

<div>
    {#if started}
        <Progress value={progress} label={label} subLabel={subLabel} maxWidth="16rem"/>
    {:else}
        <button title="Odśwież" on:click={onRefresh} disabled={started}>↻</button>
        <strong>Data pobrania:</strong> <span>{date ? formatDate(date) : '-'}</span>
    {/if}
</div>