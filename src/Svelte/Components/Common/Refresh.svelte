<script>
    import Progress from './Progress.svelte';

    import {formatDate, dateFromString} from '../../../utils/format';
    import {getCacheAndConvertIfNeeded, setCache, lastUpdated} from '../../../store';
    import {fetchUsers, fetchAllNewScores, SS_PLAYS_PER_PAGE, fetchScores} from '../../../network/scoresaber';
    import {default as config, getMainUserId} from '../../../config';
    import {convertArrayToObjectByKey, escapeHtml, isEmpty} from '../../../utils/js';
    import {getNewlyRanked} from '../../../network/api';
    import log from '../../../utils/logger';

    import { createEventDispatcher } from 'svelte';
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
        subLabel = 'Pobieranie wyników nowych rankedów';

        // check if scores has been updated max 1 minute ago
        if (
                new Date().getTime() -
                dateFromString(data.lastUpdated).getTime() >
                60000
        ) {
            log.error('Please update song data first');
            return null;
        }

        const newlyRanked = await getNewlyRanked();
        if (!newlyRanked) return null;

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
                            const page = Math.floor(idx / SS_PLAYS_PER_PAGE) + 1;
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

        let idx = 0;
        let cache = await users.reduce(async (promisedCum, u) => {
            let cum = await promisedCum;

            let newScores = await fetchAllNewScores(
                    u,
                    dateFromString(
                            cum.users[u.id] ? cum.users[u.id].lastUpdated : null
                    ),
                    (info) =>
                            updateProgress(
                                    Object.assign({}, info, {
                                        percent: Math.floor((idx / users.length) * 100)
                                    })
                            )
            );

            cum.users[u.id] = Object.assign({}, u, {
                lastUpdated: newScores.lastUpdated,
                scores: Object.assign(
                        {},
                        cum.users[u.id] ? cum.users[u.id].scores : {},
                        newScores.scores
                )
            });

            idx++;

            return cum;
        }, await getCacheAndConvertIfNeeded());

        cache.lastUpdated = new Date().toISOString();
        date = cache.lastUpdated;

        await setCache(cache);
    }

    async function onRefresh() {
        started = true;

        progress = 0;

        refresh()
                .then(_ => updateNewRankedsPpScores(updateProgress))
                .then(newlyRanked => updateNewRankeds(newlyRanked))
                .then(_ => started = false)
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