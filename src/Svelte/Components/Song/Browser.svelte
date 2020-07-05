<script>
    import {
        findRawPp, getEstimatedAcc,
        getAllRankedsWithUserScores,
        getTotalUserPp,
        PP_PER_STAR,
        ppFromScore, getWeightedPp
    } from "../../../scoresaber/pp";
    import {getRankedSongs} from "../../../scoresaber/rankeds";
    import {delay} from "../../../network/fetch";
    import {getMainUserId} from "../../../temp";
    import {getCacheAndConvertIfNeeded} from "../../../store";
    import {dateFromString} from "../../../utils/date";
    import {capitalize, convertArrayToObjectByKey} from "../../../utils/js";
    import debounce from '../../../utils/debounce';
    import Difficulty from "../Common/Difficulty.svelte";
    import Value from "../Common/Value.svelte";
    import {
        getPlayerInfo,
        getPlayerRankedScores,
        getPlayerScores,
        getPlayerSongScore
    } from "../../../scoresaber/players";
    import memoize from '../../../utils/memoize';
    import Song from "./Song.svelte";
    import Pager from "../Common/Pager.svelte";
    import Range from "../Common/Range.svelte";
    import {extractDiffAndType, getSongMaxScore, getSongMaxScoreWithDiffAndType} from "../../../song";
    import Date from "../Common/Date.svelte";
    import MultiRange from "../Common/MultiRange.svelte";
    import {tick} from "svelte";
    import {round} from "../../../utils/format";

    export let playerId = getMainUserId();
    export let snipedIds = [];
    export let minPpPerMap = 1;

    const DEBOUNCE_DELAY = 400;

    let initialized = false;
    let minStarsForSniper = 0;
    let maxStars = 100;
    let songTypes = [
        {id: 'all', text: 'Wszystkie'},
        {id: 'rankeds', text: 'Tylko rankingowe'},
        {id: 'unrankeds', text: 'Tylko nierankingowe'},
        {id: 'rankeds_with_not_played', text: 'Tryb snajpera'},
    ]
    let allFilters = {
        songType: songTypes[0],
        name: "",
        starsFilter: {from: 0, to: maxStars},
        minPpDiff: 1,
        sortBy: {type: 'series', subtype: 0, field: 'timeset', order: 'desc'}
    }
    const forceFiltersChanged = () => allFilters = Object.assign({}, allFilters);
    let allRankeds = {};

    const getAllScoresByType = async (playerId, rankedOnly = true) => {
        return rankedOnly ? await getPlayerRankedScores(playerId) : await getPlayerScores();
    }
    const getCachedAllScoresByType = memoize(getAllScoresByType);
    const getMinStars = async (playerId, boundary = minPpPerMap, maxAcc = 95) => {
        const playerPpScores = (await getCachedAllScoresByType(playerId, true))
                .sort((a, b) => b.pp - a.pp)
                .map(s => s.pp);

        const onePpBoundary = findRawPp(playerPpScores, boundary);

        return onePpBoundary / PP_PER_STAR / ppFromScore(maxAcc);
    }
    const getCachedMinStars = memoize(getMinStars);

    const getMaxScoreExFromPlayersScores = async leaderboardId => Object.values((await getCacheAndConvertIfNeeded()).users).reduce((maxScore, player) => !maxScore && player.scores && player.scores[leaderboardId] && player.scores[leaderboardId].maxScoreEx ? player.scores[leaderboardId].maxScoreEx : maxScore, null)
    const getCachedMaxScoreExFromPlayersScores = memoize(getMaxScoreExFromPlayersScores);

            // initialize async values
    (async () => {
        allRankeds = await getRankedSongs();
        maxStars = (await Promise.all(
                Object.values(allRankeds)
                        .map(async r => {
                            allRankeds[r.leaderboardId].maxScoreEx = await getCachedMaxScoreExFromPlayersScores(r.leaderboardId);

                            return r.stars
                        })
        ))

                .reduce((max, stars) => max = stars > max ? stars : max, 0);

        allFilters.starsFilter = Object.assign({}, allFilters.starsFilter, {to: maxStars});

        minStarsForSniper = await getCachedMinStars(playerId, minPpPerMap)

        initialized = true;
    })();

    let calculating = true;

    let currentPage = 0;
    let itemsPerPage = 10;
    let pagerTotal = 0;

    let allColumns = [
        {label: 'Gwiazdki', name: '*', key: 'stars', selected: false, isColumn: false, displayed: true},
        {label: 'Max PP', name: 'Max PP', key: 'maxPp', selected: false, isColumn: false, displayed: true},
        {
            label: 'Data zagrania',
            compactLabel: null,
            name: 'Data',
            key: 'timeset',
            selected: false,
            isColumn: true,
            displayed: true,
            valueProps: {prevValue: null}
        },
        {
            label: 'PP do globala',
            compactLabel: 'Ranking',
            name: '+PP',
            key: 'diffPp',
            selected: false,
            isColumn: true,
            displayed: false,
            valueProps: {zero: "-", suffix: "pp", withSign: true, useColorsForValue: true}
        },
        {
            label: 'PP',
            name: 'PP',
            key: 'pp',
            selected: true,
            isColumn: true,
            valueProps: {zero: "-", suffix: "pp"},
            displayed: true
        },
        {
            label: 'Ważone PP',
            compactLabel: 'Ważone',
            name: 'wPP',
            key: 'weightedPp',
            selected: false,
            isColumn: true,
            displayed: true,
            valueProps: {zero: "-", suffix: "pp"}
        },
        {
            label: 'Dokładność',
            compactLabel: 'Acc',
            name: 'Acc',
            key: 'acc',
            selected: true,
            isColumn: true,
            displayed: true,
            valueProps: {zero: "-", suffix: "%"}
        },
        {
            label: 'Wynik punktowy',
            compactLabel: 'Wynik',
            name: 'Wynik',
            key: 'score',
            selected: true,
            isColumn: true,
            displayed: true,
            valueProps: {digits: 0, zero: "-"}
        },
        {
            label: 'Różnice względem gracza',
            name: 'Różnice',
            key: 'diff',
            selected: true,
            isColumn: false,
            displayed: true
        },
        {
            label: 'Pokazuj potencjał gracza',
            name: 'Potencjał',
            key: 'estimate',
            selected: true,
            isColumn: false,
            displayed: false
        },
    ]
    const viewTypes = [
        {id: 'compact', text: 'Kompaktowy'},
        {id: 'tabular', text: 'Tabelaryczny'}
    ]
    let viewType = viewTypes[0];

    const getObjectFromArrayByKey = (shownColumns, value, key = 'key') => shownColumns.find(c => c[key] && c[key] === value);

    const getCachedTotalPlayerPp = memoize(getTotalUserPp);
    const getScoreWithNewPp = async (playerId, newSongPp) => {
        return await getCachedTotalPlayerPp(playerId, newSongPp) - await getCachedTotalPlayerPp(playerId);
    }
    const getCachedScoreWithNewPp = memoize(getScoreWithNewPp);
    const getPlayerSongEstimate = async (playerId, leaderboardId, stars) => {
        const userScore = await getCachedSeriesSongScore(playerId, leaderboardId, null)
        const userRankedScores = await getAllRankedsWithUserScores(playerId);

        const userEstimatedAcc = getEstimatedAcc(stars, userRankedScores) * 100;
        const useEstimated = !userScore.acc || userScore.acc < userEstimatedAcc
        const pp = useEstimated ? stars * PP_PER_STAR * ppFromScore(userEstimatedAcc) : userScore.pp;

        const maxScore = userScore.maxScoreEx ? userScore.maxScoreEx : 0;
        const score = useEstimated ? userEstimatedAcc * maxScore / 100 : userScore.score;

        return {
            leaderboardId,
            acc: useEstimated ? userEstimatedAcc : userScore.acc,
            prevAcc: userScore.acc,
            score,
            prevScore: userScore.score,
            pp,
            prevPp: userScore.pp,
            timeset: !useEstimated ? userScore.timeset : null,
            diff: useEstimated
                    ? await getCachedScoreWithNewPp(playerId, {[leaderboardId]: {pp}})
                    : 0,
            best: false
        }
    }
    const getCachedPlayerSongEstimate = memoize(getPlayerSongEstimate);
    const getSeriesSong = (leaderboardId, series) => series && series.scores && series.scores[leaderboardId] ? series.scores[leaderboardId] : null;
    const findBestInSeries = (series, leaderboardId, withEstimated = true, key = 'score') => {
        let bestIdx = null;
        let bestValue = null;

        series.forEach((s, idx) => {
            // skip estimated scores
            if (!withEstimated && s.estimateId) return null;

            const value = s.scores[leaderboardId] && s.scores[leaderboardId][key] ? s.scores[leaderboardId][key] : null
            if (value && (!bestValue || value > bestValue)) {
                bestValue = value;
                bestIdx = idx;
            }
        })

        return bestIdx;
    }
    async function getPlayerTotalPpWithBestScores(songs, key = 'bestRealPp') {
        const bestScores = convertArrayToObjectByKey(songs.filter(s => s[key]).map(s => ({
            leaderboardId: s.leaderboardId,
            pp: s[key]
        })), 'leaderboardId');

        return await getCachedTotalPlayerPp(playerId, bestScores);
    }

    // pre-filters
    const mapHasStars = (song, minStars, maxStars = null) => song.stars && song.stars > minStars && (!maxStars || song.stars < maxStars);
    const filterBySongName = (song, name) => {
        if (!name.length) return true;

        const songName = song.name + ' ' + song.songAuthor + ' ' + song.levelAuthor;
        return songName.toLowerCase().includes(name.toLowerCase());
    }
    const songIsUnranked = song => !song.stars;
    // const noPlayerScore = r => !r?.user?.acc;

    // post-filters
    const bestSeriesGivesAtLeastMinPpDiff = (song, minPpDiff = 1) => song.bestDiffPp && song.bestDiffPp > minPpDiff;
    const playerDoesNotPlaySongYet = (leaderboardId, series) => !getSeriesSong(leaderboardId, series)
    const playerIsNotTheBest = (leaderboardId, series) => !getSeriesSong(leaderboardId, series) || !getSeriesSong(leaderboardId, series).best
    const nobodyPlayedItYet = song => song.bestIdx === null;
    const playerAccIsLowerThanEstimated = (leaderboardId, playerSeries, estSeries, minDiff = 1) => {
        const playerScore = getSeriesSong(leaderboardId, playerSeries);
        const estScore = getSeriesSong(leaderboardId, estSeries);

        return !playerScore || (estScore && playerScore.acc < estScore.acc && estScore.diff > minDiff);
    }

    function getScoreValueByKey(series, song, key, prev = false) {
        const valueKey = prev ? 'prev' + capitalize(key) : key;
        return series.scores && series.scores[song.leaderboardId] && series.scores[song.leaderboardId][valueKey] ? series.scores[song.leaderboardId][valueKey] : null
    }

    function getEmptyNewPages() {
        return {songs: [], series: []}
    }
    function completeFetchingNewPage(data) {
        songsPage = data;
    }

    let songsPage = getEmptyNewPages();``
    async function promiseGetPage(promised, current, itemsPerPage) {
        completeFetchingNewPage(getEmptyNewPages());

        const data = await promised;
        if(!data) return;

        pagerTotal = data.songs.length;

        const songPage = Object.assign({}, data, {
            songs: data.songs.slice(current * itemsPerPage, (current + 1) * itemsPerPage - 1),
            total: pagerTotal
        });

        for (const songsKey in songPage.songs) {
            const song = songPage.songs[songsKey];

            for (const seriesKey in songPage.series) {
                const series = songPage.series[seriesKey];

                if (series.scores[song.leaderboardId]) {
                    if (!song.maxScoreEx) {
                        try {
                            // try to get max score from cache
                            song.maxScoreEx = await getSongMaxScoreWithDiffAndType(song.id, song.diff, true);
                        } catch (e) {
                            // swallow error
                        }
                    }

                    if (song.maxScoreEx) {
                        series.scores[song.leaderboardId].acc = series.scores[song.leaderboardId].score / song.maxScoreEx * 100;
                    } else {
                        // try to fetch song info from beat saver and populate it later
                        getSongMaxScoreWithDiffAndType(song.id, song.diff, false, true).then(async maxScoreEx => {
                            if (maxScoreEx) {
                                song.maxScoreEx = maxScoreEx;
                                series.scores[song.leaderboardId].acc = series.scores[song.leaderboardId].score / song.maxScoreEx * 100;

                                // if page has not been changed during song fetch
                                if (current === currentPage) completeFetchingNewPage(songPage)
                            }
                        }).catch(e => {
                        })
                    }
                }
            }
        }

        completeFetchingNewPage(songPage);

        return songPage;
    }

    function onSongTypeChange() {
        switch (allFilters.songType.id) {
            case 'unrankeds':
                getObjectFromArrayByKey(allColumns, 'timeset').selected = false;
                getObjectFromArrayByKey(allColumns, 'score').selected = true;
                getObjectFromArrayByKey(allColumns, 'acc').selected = true;
                getObjectFromArrayByKey(allColumns, 'pp').selected = false;
                getObjectFromArrayByKey(allColumns, 'diffPp').selected = false;
                getObjectFromArrayByKey(allColumns, 'diffPp').displayed = false;
                // getObjectFromArrayByKey(allColumns, 'estimate').displayed = false;

                allFilters.sortBy =  {type: 'series', subtype: 0, field: 'timeset', order: 'desc'}
                break;

            case 'all':
                getObjectFromArrayByKey(allColumns, 'timeset').selected = false;
                getObjectFromArrayByKey(allColumns, 'score').selected = true;
                getObjectFromArrayByKey(allColumns, 'acc').selected = true;
                getObjectFromArrayByKey(allColumns, 'pp').selected = true;
                getObjectFromArrayByKey(allColumns, 'diffPp').selected = false;
                getObjectFromArrayByKey(allColumns, 'diffPp').displayed = false;
                // getObjectFromArrayByKey(allColumns, 'estimate').displayed = false;

                allFilters.starsFilter.from = 0;
                allFilters.sortBy =  {type: 'series', subtype: 0, field: 'timeset', order: 'desc'}
                break;

            case 'rankeds_with_not_played':
                getObjectFromArrayByKey(allColumns, 'timeset').selected = true;
                getObjectFromArrayByKey(allColumns, 'score').selected = false;
                getObjectFromArrayByKey(allColumns, 'acc').selected = true;
                getObjectFromArrayByKey(allColumns, 'pp').selected = true;
                getObjectFromArrayByKey(allColumns, 'diffPp').selected = true;
                getObjectFromArrayByKey(allColumns, 'diffPp').displayed = true;
                // getObjectFromArrayByKey(allColumns, 'estimate').displayed = true;

                allFilters.starsFilter.from = allFilters.starsFilter.from > minStarsForSniper ? allFilters.starsFilter.from : round(minStarsForSniper,1);
                allFilters.sortBy =  {type: 'song', subtype: null, field: 'bestDiffPp', order: 'desc'}
                break;

            case 'rankeds':
            default:
                getObjectFromArrayByKey(allColumns, 'timeset').selected = false;
                getObjectFromArrayByKey(allColumns, 'score').selected = false;
                getObjectFromArrayByKey(allColumns, 'acc').selected = true;
                getObjectFromArrayByKey(allColumns, 'pp').selected = true;
                getObjectFromArrayByKey(allColumns, 'diffPp').selected = false;
                getObjectFromArrayByKey(allColumns, 'diffPp').displayed = false;
                // getObjectFromArrayByKey(allColumns, 'estimate').displayed = false;

                allFilters.starsFilter.from = 0;
                allFilters.sortBy =  {type: 'series', subtype: 0, field: 'timeset', order: 'desc'}
                break;
        }

        // force refresh
        allColumns = allColumns.splice(0);

        forceFiltersChanged()
    }

    const onFilterNameChange = debounce(e => allFilters.name = e.target.value, DEBOUNCE_DELAY);
    const onFilterStarsChange = debounce(e => allFilters.starsFilter = Object.assign({}, allFilters.starsFilter), DEBOUNCE_DELAY);
    const onFilterMinPlusPpChanged = debounce(e => allFilters.minPpDiff = e.detail, DEBOUNCE_DELAY * 2);

    async function calculate(playerId, snipedIds, filters) {
        calculating = true;

        await delay(0);

        // main player series index
        const compareToIdx = 0;

        try {
            const sortedRankeds = {};

            let playerIds = [playerId].concat(snipedIds);

            const playerInfos = (await Promise.all(playerIds.map(async pId => getPlayerInfo(pId))))
            const playersSeries = await Promise.all(playerInfos
                    .map(async pInfo => {
                        const {lastPlay, recentPlay, scores, stats, weeklyDiff, url, lastUpdated, userHistory, ...playerInfo} = pInfo;

                        // set all players total pp to main player's total pp
                        const shouldCalculateTotalPp = allFilters.songType.id === 'rankeds_with_not_played';
                        playerInfo.prevTotalPp = shouldCalculateTotalPp ? await getCachedTotalPlayerPp(playerId) : null;
                        playerInfo.totalPp = playerInfo.prevTotalPp;

                        if(!sortedRankeds[pInfo.id]) sortedRankeds[pInfo.id] = Object.values(scores).filter((s) => s.pp > 0).sort((a, b) => b.pp - a.pp);

                        return Object.assign(
                                {},
                                playerInfo,
                                {
                                    lastUpdated: lastUpdated ? dateFromString(lastUpdated) : null,
                                    scores: convertArrayToObjectByKey(
                                            Object.values(scores)
                                                    .map(s => {
                                                        const {id, name, songSubName, songAuthorName, levelAuthorName, diff, stars, oldStars, maxScoreEx, playerId, ...score} = s;
                                                        score.timeset = dateFromString(s.timeset);

                                                        if (score.pp > 0 && !score.weightedPp) {
                                                            score.weightedPp = getWeightedPp(sortedRankeds[playerId], s.leaderboardId, true);
                                                            s.weightedPp = score.weightedPp; // in order to cache for next iteration
                                                        }

                                                        return score;
                                                    }),
                                            'leaderboardId'
                                    )
                                }
                        )
                    }))
            const allPlayedSongs =
                    await Promise.all(
                            Object.values(playerInfos.reduce((cum, player) => Object.assign({}, cum, player.scores), {}))
                                    .map(async s => {
                                        const maxScoreEx = s.maxScoreEx ? s.maxScoreEx : await getCachedMaxScoreExFromPlayersScores(s.leaderboardId);

                                        return {
                                            leaderboardId: s.leaderboardId,
                                            id: s.id,
                                            name: (s.name + ' ' + s.songSubName).trim(),
                                            songAuthor: s.songAuthorName,
                                            levelAuthor: s.levelAuthorName,
                                            diff: extractDiffAndType(s.diff),
                                            stars: s.stars ? s.stars : null,
                                            oldStars: null,
                                            maxScoreEx
                                        }
                                    })
                    )

            const filteredSongs = (await Promise.all((
                    allFilters.songType.id === 'rankeds_with_not_played'
                            ? Object.values(Object.assign(
                            convertArrayToObjectByKey(allPlayedSongs, 'leaderboardId'),
                            allRankeds
                            ))
                            : allPlayedSongs.map(s => allRankeds[s.leaderboardId] && !s.stars ? Object.assign({}, s, {stars: allRankeds[s.leaderboardId].stars}) : s)
            )
                    .filter(s =>
                            // filter by name
                            (!allFilters.name.length || filterBySongName(s, allFilters.name)) &&

                            // filter by type & stars
                            (
                                    (songIsUnranked(s) && ['unrankeds', 'all'].includes(allFilters.songType.id)) ||
                                    mapHasStars(s, allFilters.starsFilter.from, allFilters.starsFilter.to)
                            )
                    )

                    .map(async s => {
                        s.bestIdx = null;
                        s.bestRealIdx = null;
                        s.bestAcc = 0;
                        s.bestRealAcc = 0;
                        s.bestScore = 0;
                        s.bestRealScore = 0;
                        s.bestPp = 0;
                        s.bestRealPp = 0;
                        s.bestDiffPp = 0;
                        s.bestRealDiffPp = 0;

                        if(s.maxScoreEx) {
                            playersSeries.forEach((series, idx) => {
                                if(series.scores[s.leaderboardId]) {
                                    series.scores[s.leaderboardId].acc = series.scores[s.leaderboardId].score / s.maxScoreEx * 100;
                                    series.scores[s.leaderboardId].diffPp = null;
                                }
                            })
                        }

                        const bestIdx = findBestInSeries(playersSeries, s.leaderboardId, true, 'score');
                        if (null !== bestIdx) {
                            const bestSeries = playersSeries[bestIdx].scores[s.leaderboardId];
                            const isBestEstimated = playersSeries[bestIdx];

                            if (bestSeries) {
                                bestSeries.best = !isBestEstimated;

                                s.bestIdx = bestIdx;
                                s.bestAcc = bestSeries.acc;
                                s.bestScore = bestSeries.score;
                                s.bestPp = bestSeries.pp;
                                s.bestDiffPp = bestSeries.diffPp;

                                s.bestRealIdx = bestIdx;
                                s.bestRealAcc = bestSeries.acc;
                                s.bestRealScore = bestSeries.score;
                                s.bestRealPp = bestSeries.pp;
                                s.bestRealDiffPp = bestSeries.diffPp;
                            }

                            if (isBestEstimated) {
                                const bestIdx = findBestInSeries(playersSeries, s.leaderboardId, false, 'score');
                                if (null !== bestIdx) {
                                    const bestSeries = playersSeries[bestIdx].scores[s.leaderboardId];
                                    if (bestSeries) {
                                        bestSeries.best = true;

                                        s.bestRealIdx = bestIdx;
                                        s.bestRealAcc = bestSeries.acc;
                                        s.bestRealScore = bestSeries.score;
                                        s.bestRealPp = bestSeries.pp;
                                        s.bestRealDiffPp = bestSeries.diffPp;
                                    }
                                }
                            }
                        }

                        if (allFilters.songType.id === 'rankeds_with_not_played') {
                            for (const idx in playersSeries) {
                                // skip calculating if player is the best - will be filtered belowe
                                if (playersSeries[0].scores[s.leaderboardId] && playersSeries[compareToIdx].scores[s.leaderboardId].best) continue;

                                const series = playersSeries[idx];

                                if (series.scores[s.leaderboardId]) {
                                    series.scores[s.leaderboardId].diffPp = series.scores[s.leaderboardId].pp > 0 && idx !== compareToIdx
                                            ? await getCachedScoreWithNewPp(playersSeries[compareToIdx].id, {[s.leaderboardId]: {pp: series.scores[s.leaderboardId].pp}})
                                            : null;
                                }
                            }

                            if(s.bestIdx) s.bestDiffPp = playersSeries[s.bestIdx].scores[s.leaderboardId].diffPp;
                            if(s.bestRealIdx) s.bestRealDiffPp = playersSeries[s.bestRealIdx].scores[s.leaderboardId].diffPp;
                        }

                        return s;
                    })))

                    // filter when sniper mode, player is the best and diff > minPpDiff
                    .filter(s =>
                            allFilters.songType.id !== 'rankeds_with_not_played' ||
                            (playerIsNotTheBest(s.leaderboardId, playersSeries[compareToIdx]) && bestSeriesGivesAtLeastMinPpDiff(s, allFilters.minPpDiff))
                            || (allFilters.songType.id === 'rankeds_with_not_played' && nobodyPlayedItYet(s))
                    )

                    .sort((songA, songB) => {
                        let a, b;

                        switch(allFilters.sortBy.type) {
                            case 'song':
                                a = songA[allFilters.sortBy.field]
                                b = songB[allFilters.sortBy.field]
                                break;

                            case 'series':
                            default:
                                const sortIdx = allFilters.sortBy.subtype;
                                const field = allFilters.sortBy.field;
                                a = playersSeries[sortIdx] && playersSeries[sortIdx].scores && playersSeries[sortIdx].scores[songA.leaderboardId] ? playersSeries[sortIdx].scores[songA.leaderboardId][field] : null
                                b = playersSeries[sortIdx] && playersSeries[sortIdx].scores && playersSeries[sortIdx].scores[songB.leaderboardId] ? playersSeries[sortIdx].scores[songB.leaderboardId][field] : null
                                break;
                        }

                        return allFilters.sortBy.order === 'asc' ? a - b : b - a;
                    })

            let bestTotalRealPp = 0
            let bestTotalPp = 0;

            if (allFilters.songType.id === 'rankeds_with_not_played') {
                const filteredSongsIds = filteredSongs.map(s => s.leaderboardId);
                for (const p of playersSeries) {
                    const betterScores = convertArrayToObjectByKey(
                            Object.values(p.scores)
                                    .filter(s => filteredSongsIds.includes(s.leaderboardId) && (!playersSeries[compareToIdx].scores[s.leaderboardId] || s.pp > playersSeries[compareToIdx].scores[s.leaderboardId].pp))
                                    .map(s => ({leaderboardId: s.leaderboardId, pp: s.pp})),
                            'leaderboardId'
                    );
                    p.totalPp = await getCachedTotalPlayerPp(playerId, betterScores);
                }


                if (snipedIds.length > 1) {
                    bestTotalRealPp = await getPlayerTotalPpWithBestScores(filteredSongs, 'bestRealPp');
                    bestTotalPp = await getPlayerTotalPpWithBestScores(filteredSongs, 'bestPp');
                }
            }

            calculating = false;

            return {songs: filteredSongs, series: playersSeries, bestTotalRealPp, bestTotalPp}
        } catch(err) {
            console.error(err)
        }
    }

    $: shownColumns = allColumns.filter(c => c.displayed)
    $: columnsQty = allColumns.reduce((sum, c) => sum + (c.isColumn && c.selected ? 1 : 0), 0);
    $: selectedCols = allColumns.filter(c => c.isColumn && c.selected)
    $: shouldCalculateTotalPp = getObjectFromArrayByKey(allColumns, 'diffPp').selected && 'rankeds_with_not_played' === allFilters.songType.id
    $: calcPromised = initialized ? calculate(playerId, snipedIds, allFilters) : null;
    // $: withEstimate = getObjectFromArrayByKey(allColumns, 'estimate').selected;
    $: pagedPromised = promiseGetPage(calcPromised, currentPage, itemsPerPage)
</script>

<div class="filters">
    <div>
        <header>Rodzaj</header>
        <select bind:value={allFilters.songType} on:change={onSongTypeChange}>
            {#each songTypes as st}
                <option value={st}>{st.text}</option>
            {/each}
        </select>
    </div>

    <div class="filter-name">
        <input type="text" placeholder="Nazwa nutki..." on:input={onFilterNameChange} />
    </div>

    <div style="display: {allFilters.songType.id === 'rankeds_with_not_played' ? 'block' : 'none'}">
        <Range label="+PP > " value={allFilters.minPpDiff} min={1} max={20} step={0.1} suffix="pp" on:change={onFilterMinPlusPpChanged} />
    </div>

    <div style="display: { allFilters.songType.id !== 'unrankeds' ? 'block' : 'none'}">
        <header>Gwiazdki</header>
        <MultiRange label="Gwiazdki" value={allFilters.starsFilter} min={allFilters.songType.id === 'rankeds_with_not_played' ? round(minStarsForSniper,1) : 0} max={maxStars} step={0.1} suffix="*" digits={1} disableDirectEditing={true} on:change={onFilterStarsChange}/>
    </div>

    <div>
        <header>Widok</header>
        <select bind:value={viewType}>
            {#each viewTypes as vt}
                <option value={vt}>{vt.text}</option>
            {/each}
        </select>
    </div>

    <div class="columns">
        <div>
            {#each shownColumns as col (col.key)}
                <label title={col.label ? col.label: ''}><input type="checkbox" bind:checked={col.selected}/> {col.name}
                </label>
            {/each}
        </div>
    </div>
</div>

{#await pagedPromised}
    <div class="info">
        <h3>Transformacja wszechświata w toku...</h3>
    </div>
{:then calc}
    {#if songsPage.songs.length}
        <table class="ranking sspl">
            <thead>
            <tr>
                <th class="song" rowspan={viewType.id === 'compact' ? 1 : 2} colspan="2">Nuta</th>
                {#if allFilters.songType.id !== 'unrankeds' && getObjectFromArrayByKey(allColumns, 'stars').selected}
                    <th class="stars left middle" rowspan={viewType.id === 'compact' ? 1 : 2}>*</th>
                {/if}
                {#if allFilters.songType.id !== 'unrankeds' && getObjectFromArrayByKey(allColumns, 'maxPp').selected}
                    <th class="maxPp left middle" rowspan={viewType.id === 'compact' ? 1 : 2}>Max PP</th>
                {/if}
                {#each songsPage.series as series (series.id+'_'+series.estimateId)}
                    {#if viewType.id === 'compact'}
                        <th class="left down">{series.name}</th>
                    {:else}
                        {#if selectedCols.length > 0 && !(selectedCols.length === 1 && series.id === playerId && getObjectFromArrayByKey(allColumns, 'diffPp').selected)}
                            <th colspan={series.id !== playerId ? selectedCols.length : selectedCols.length - (getObjectFromArrayByKey(allColumns, 'diffPp').selected ? 1 : 0)}
                                class="series left">{series.name}</th>
                        {/if}
                    {/if}
                {/each}
            </tr>

            {#if viewType.id !== 'compact'}
                <tr>
                    {#each songsPage.series as series (series.id+'_'+series.estimateId)}
                        {#each selectedCols as col,idx (col.key)}{#if col.key !== 'diffPp' || series.id !== playerId}
                            <th class={'left ' + col.key + (idx > 0 ? ' middle' : '')}>{col.name}</th>
                        {/if}{/each}
                    {/each}
                </tr>
            {/if}
            </thead>

            <tbody>
            {#each songsPage.songs as song (song.leaderboardId)}
                <tr>
                    <td class="diff">
                        <Difficulty diff={song.diff} useShortName={true} reverseColors={true}/>
                    </td>
                    <td class="song">
                        <Song song={song}>
                            {song.name}
                            <div>
                                {song.songAuthor} <small>{song.levelAuthor}</small>
                            </div>
                        </Song>
                    </td>
                    {#if allFilters.songType.id !== 'unrankeds' && getObjectFromArrayByKey(allColumns, 'stars').selected}<td class="stars left middle"><Value value={song.stars} suffix="*" zero="" /></td>{/if}
                    {#if allFilters.songType.id !== 'unrankeds' && getObjectFromArrayByKey(allColumns, 'maxPp').selected}<td class="maxPp left middle"><Value value={song.stars * PP_PER_STAR * ppFromScore(100)} suffix="pp" zero="-" /></td>{/if}
                    {#each songsPage.series as series (series.id+'_'+series.estimateId)}
                        {#if viewType.id === 'compact'}
                            <td class="left compact" class:best={getScoreValueByKey(series, song, 'best') && songsPage.series.length > 1}>
                                {#if getScoreValueByKey(series, song, 'score')}
                                    {#each selectedCols as col,idx (col.key)}{#if col.key !== 'diffPp' || series.id !== playerId}
                                        {#if col.key === 'timeset'}
                                            <strong class={'compact-' + col.key + '-val'}><Date date={getScoreValueByKey(series, song, col.key)} {...col.valueProps}/></strong>
                                        {:else}
                                            {#if getScoreValueByKey(series, song, col.key)}
                                                <div>
                                                    {#if col.compactLabel}{col.compactLabel}{'acc' === col.key && getScoreValueByKey(series, song, 'mods') ? ' ('+getScoreValueByKey(series, song, 'mods')+')' : ''}:{/if}
                                                    <strong class={'compact-' + col.key + '-val'}>
                                                        <Value value={getScoreValueByKey(series, song, col.key)}
                                                               prevValue={getObjectFromArrayByKey(allColumns, 'diff').selected ? getScoreValueByKey(songsPage.series[0], song, col.key) : null}
                                                               prevLabel={songsPage.series[0].name} inline={true}
                                                               {...col.valueProps}
                                                        />
                                                    </strong>
                                                </div>
                                            {/if}
                                        {/if}
                                    {/if}{/each}
                                {:else}
                                    -
                                {/if}
                            </td>
                        {:else}
                            {#each selectedCols as col,idx (col.key)}{#if col.key !== 'diffPp' || series.id !== playerId}
                                <td class={'left ' + col.key} class:middle={idx > 0} class:best={getScoreValueByKey(series, song, 'best') && songsPage.series.length > 1}>
                                    {#if col.key === 'timeset'}
                                        <Date date={getScoreValueByKey(series, song, col.key)} {...col.valueProps}/>
                                    {:else}
                                        <Value value={getScoreValueByKey(series, song, col.key)}
                                           prevValue={getObjectFromArrayByKey(allColumns, 'diff').selected ? getScoreValueByKey(songsPage.series[0], song, col.key) : null}
                                            {...col.valueProps}
                                           />
                                    {/if}
                                </td>
                            {/if}{/each}
                        {/if}
                    {/each}
                </tr>
            {/each}
            </tbody>

            {#if shouldCalculateTotalPp}
            <tfoot>
            <tr>
                <th class="song" rowspan="2" colspan={allFilters.songType.id !== 'unrankeds' ? 2 + (getObjectFromArrayByKey(allColumns, 'stars').selected ? 1 : 0) + (getObjectFromArrayByKey(allColumns, 'maxPp').selected ? 1 : 0) : 2}>Razem dla {songsPage.series[0].name}</th>
                {#each songsPage.series as series, idx (series.id+'_'+series.estimateId)}
                    {#if viewType.id === 'tabular'}
                        {#if selectedCols.length > 0 && !(selectedCols.length === 1 && series.id === playerId && getObjectFromArrayByKey(allColumns, 'diffPp').selected)}
                            <th class="left" rowspan={series.id !== playerId ? 1 : 2}
                                colspan={series.id !== playerId ? selectedCols.length : selectedCols.length - (getObjectFromArrayByKey(allColumns, 'diffPp').selected ? 1 : 0)}>
                                <Value value={series.totalPp} prevValue={getObjectFromArrayByKey(allColumns, 'diff').selected ? series.prevTotalPp : null}
                                       suffix="pp"/>
                            </th>
                        {/if}
                    {:else}
                        <th class="left">
                            <Value value={series.totalPp} prevValue={getObjectFromArrayByKey(allColumns, 'diff').selected ? series.prevTotalPp : null}
                                   suffix="pp"/>
                        </th>
                    {/if}
                {/each}
            </tr>
            <tr>
                {#if selectedCols.length}
                    <th class="left" colspan={selectedCols.length * (songsPage.series.length - 1)}>
                        <Value value={songsPage.bestTotalRealPp} prevValue={getObjectFromArrayByKey(allColumns, 'diff').selected ? songsPage.series[0].totalPp : null} suffix="pp"/>
                    </th>
                {/if}
            </tr>
            </tfoot>
            {/if}
        </table>
    {:else}
        <div class="info">
            <h3>Strasznie tu pusto</h3>
            <p>Wygląda na to, że żadna nutka nie spełnia wszystkich wybranych wymagań. Zmień coś może?</p>
        </div>
    {/if}
{/await}

<Pager bind:currentPage={currentPage} bind:itemsPerPage={itemsPerPage} totalItems={pagerTotal} hide={calculating} />

<style>
    .columns label {
        margin-right: .25rem;
    }
    table.ranking.sspl {
        font-size: 0.875rem;
        border-width: 1px;
    }

    th, td {
        vertical-align: middle !important;
        padding: 0.5em !important;
        border-color: #666 !important;
    }

    thead th {
        text-align: center;
        vertical-align: bottom !important;
        border-bottom-width: 2px;
    }

    thead th.song, thead th.stars {
        vertical-align: middle !important;
    }

    thead th.song, thead th.maxPp {
        vertical-align: middle !important;
    }

    th.diff, td.diff {
        width: 1.5rem;
        padding: 0;
    }

    thead th.series {
        width: 6rem;
        overflow-x: hidden;
        border-bottom-style: dotted;
        border-bottom-width: 1px;
    }

    thead th.stars {
        width: 2rem;
    }

    thead th.maxPp {
        width: 3rem;
    }

    thead th.acc, thead th.pp, thead th.diffPp, thead th.score, thead th.weightedPp {
        width: 3rem;
    }

    thead th.timeset {
        width: 5.5rem;
    }

    tbody td.acc, tbody td.pp, tbody td.diffPp, tbody td.score, tbody td.weightedPp, tbody td.timeset {
        text-align: center;
    }

    tbody td.stars {
        text-align: center;
    }

    tbody td.maxPp {
        text-align: center;
    }

    th.top, td.top {
        border-top-style: solid;
        border-top-width: 1px;
    }

    th.down, td.down {
        border-bottom-style: solid;
        border-bottom-width: 1px;
    }

    th.series.down {
        border-bottom-width: 2px;
        border-bottom-style: solid;
    }

    th.left, td.left {
        border-left-style: solid;
        border-left-width: 1px;
    }

    th.left.middle, td.left.middle {
        border-left-style: dotted;
        border-left-width: 1px;
    }

    tbody td.song small {
        font-size: 0.75em;
        color: #888;
    }

    tfoot th {
        text-align: center !important;
        vertical-align: middle !important;
        border-top-width: 2px;
    }
    tfoot th.song {
        text-align: left !important;
    }

    tbody td.best {
        background: linear-gradient(90deg, rgba(51,51,51,1) 0%, rgba(85,85,85,1) 50%, rgba(51,51,51,1) 100%);
    }

    tbody td.compact {
        width: 12rem;
    }

    .compact-timeset-val {
        border-bottom: 1px dashed #666;
    }
    .compact-diffPp-val {
        font-size: 1.25em;
    }
    .compact-pp-val {
        font-size: 1.15em;
        color: var(--ppColour) !important;
    }
    .compact-acc-val {
        font-size: 1.1em;
    }

    .filters {
        display: flex;
        flex-wrap: wrap;
        margin: -1.5rem 0 1rem -1.5rem;
        width: calc(100% + 1.5rem);
        align-items: flex-end;
    }
    .filters > :global(*) {
        margin: 1.5rem 0 0 1.5rem;
    }

    .filters header {
        display: block;
        text-align: center;
        color: #888;
    }

    .filters .filter-name {
        width: 12rem;
    }

    .filters .filter-name input {
        width: 100%;
    }

    div.info {
        padding-top: 2rem;
        text-align: center;
    }

    select, input {
        font-size: 1rem;
        border: none;
        color: var(--textColor,#000);
        background-color: var(--foreground,#fff);
        outline: none;
    }

    input {
        border-bottom: 1px solid var(--textColor, #000);
    }

    input::placeholder {
        color: #666;
        opacity: 1;
    }
</style>