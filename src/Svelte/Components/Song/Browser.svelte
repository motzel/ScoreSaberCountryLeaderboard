<script>
    import log from '../../../utils/logger';
    import {
        findRawPp, getEstimatedAcc,
        getAllRankedsWithUserScores,
        getTotalUserPp,
        PP_PER_STAR,
        ppFromScore, getWeightedPp
    } from "../../../scoresaber/pp";
    import {getRankedSongs} from "../../../scoresaber/rankeds";
    import {delay} from "../../../network/fetch";
    import {getCacheAndConvertIfNeeded} from "../../../store";
    import {addToDate, dateFromString, durationToMillis, millisToDuration} from "../../../utils/date";
    import {capitalize, convertArrayToObjectByKey} from "../../../utils/js";
    import debounce from '../../../utils/debounce';
    import {
        getCountryRanking,
        getPlayerInfo,
        getPlayerRankedScores,
        getPlayerScores,
        getPlayerSongScore
    } from "../../../scoresaber/players";
    import {
        extractDiffAndType,
        getHumanDiffInfo,
        getSongDiffInfo,
        getSongMaxScore,
        getSongMaxScoreWithDiffAndType
    } from "../../../song";
    import {generateCsv, downloadCsv} from '../../../utils/csv';
    import {onMount, tick} from "svelte";
    import {round} from "../../../utils/format";
    import memoize from '../../../utils/memoize';

    import beatSaverSvg from "../../../resource/svg/beatsaver.svg";

    import Song from "./Song.svelte";
    import Pager from "../Common/Pager.svelte";
    import Range from "../Common/Range.svelte";
    import Date from "../Common/Date.svelte";
    import MultiRange from "../Common/MultiRange.svelte";

    import WhatIfPp from "./WhatIfPp.svelte";
    import Duration from "../Common/Duration.svelte";
    import Difficulty from "../Common/Difficulty.svelte";
    import Value from "../Common/Value.svelte";
    import Button from "../Common/Button.svelte";
    import Select from "../Common/Select.svelte";
    import {getMainUserId} from "../../../plugin-config";

    export let playerId;
    export let snipedIds = [];
    export let minPpPerMap = 1;

    if (!playerId)
        (async () => {playerId = await getMainUserId()})()

    let selectedColumns = [];

    const DEBOUNCE_DELAY = 400;

    let lightMode = false;
    onMount(() => {
        lightMode = getComputedStyle(document.documentElement).getPropertyValue('--background') === 'white';
    })

    let initialized = false;
    let countryRanking = [];
    let sniperModeIds = [];
    let minStarsForSniper = 0;
    let maxStars = 100;
    let songTypes = [
        {id: 'all', label: 'Wszystkie'},
        {id: 'rankeds', label: 'Tylko rankingowe'},
        {id: 'unrankeds', label: 'Tylko nierankingowe'},
        {id: 'rankeds_with_not_played', label: 'Tryb snajpera'},
    ]
    let sortTypes = [
        {label: 'Data zagrania', type: 'series', subtype: 0, field: 'timeset', order: 'desc', enabled: true},
    ]
    const generateSortTypes = async _ => {
        const types = [];

        const data = (await getCacheAndConvertIfNeeded());

        if (allFilters.songType.id === 'rankeds_with_not_played')
            types.push({label: 'PP do globala', type: 'song', subtype: null, field: 'bestDiffPp', order: 'desc', enabled: true});

        if (allFilters.songType.id !== 'unrankeds')
            types.push({label: 'Gwiazdki', type: 'song', subtype: null, field: 'stars', order: 'desc', enabled: true});

        const userIds = [playerId].concat(snipedIds.concat(!snipedIds.length && 'rankeds_with_not_played' === allFilters.songType.id ? sniperModeIds : []));
        if (data && data.users) {
            userIds.forEach((pId, idx) => {
                const name = data.users[pId] ? data.users[pId].name : null;
                if (userIds.length > 1) types.push({label: name, type: 'label'})
                if (name) {
                    [
                        {field: "timeset", label: "Data zagrania", enabled: true},
                        {field: "diffPp", label: "PP do globala", enabled: 'rankeds_with_not_played' === allFilters.songType.id && idx !== 0},
                        {field: "pp", label: "PP", enabled: ['rankeds', 'rankeds_with_not_played'].includes(allFilters.songType.id)},
                        {field: "acc", label: "Dokładność", enabled: ['rankeds', 'rankeds_with_not_played'].includes(allFilters.songType.id)},
                    ].forEach(field => {
                        if (field.enabled)
                            types.push({
                                label: field.label,
                                type: 'series',
                                subtype: idx,
                                field: field.field,
                                order: 'desc',
                                enabled: true
                            })
                    })
                }
            })
        }

        sortTypes = types;
        allFilters.sortBy = types[userIds.length > 1 && types[0].type && types[0].type === 'label' || types[0].label === 'Gwiazdki' ? 1 : 0];
    }

    const findSort = (type, subtype, field) => sortTypes.find(st => st.type === type && st.subtype === subtype && st.field === field);

    let allFilters = {
        songType: songTypes[0],
        name: "",
        starsFilter: {from: 0, to: maxStars},
        minPpDiff: 1,
        sortBy: sortTypes[0]
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
        // add snipeds if not defined
        if (!snipedIds || !snipedIds.length) {
            countryRanking = await getCountryRanking();
            const player = countryRanking.find(p => p.id === playerId)
            if (player) {
                if (player.countryRank > 1) sniperModeIds.push(countryRanking[player.countryRank - 1 - 1].id);
                if (player.countryRank < countryRanking.length) sniperModeIds.push(countryRanking[player.countryRank + 1 - 1].id);
            }
        }

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

        await generateSortTypes();

        initialized = true;
    })();

    let calculating = true;

    let currentPage = 0;
    let itemsPerPage = 10;
    let pagerTotal = 0;

    let allColumns = [
        {
            label: 'Gwiazdki',
            name: '*',
            key: 'stars',
            selected: false,
            type: 'song',
            displayed: true,
            valueProps: {zero: "-", suffix: "*"}
        },
        {
            label: 'Max PP',
            name: 'Max PP',
            key: 'maxPp',
            selected: false,
            type: 'song',
            displayed: true,
            valueProps: {zero: "-", suffix: "pp"}
        },
        {
            label: 'BPM',
            name: 'BPM',
            key: 'bpm',
            selected: false,
            type: 'song',
            displayed: true,
            valueProps: {zero: "-", suffix: "", digits: 0}
        },
        {
            label: 'NJS',
            name: 'NJS',
            key: 'njs',
            selected: false,
            type: 'song',
            displayed: true,
            valueProps: {zero: "-", suffix: "", digits: 0}
        },
        {
            label: 'NPS',
            name: 'NPS',
            key: 'nps',
            selected: false,
            type: 'song',
            displayed: true,
            valueProps: {zero: "-", suffix: ""}
        },
        {
            label: 'Czas',
            name: 'Czas',
            key: 'length',
            selected: false,
            type: 'song',
            displayed: true,
            valueProps: {zero: "-"}
        },
        {
            label: 'Data zagrania',
            compactLabel: null,
            name: 'Data',
            key: 'timeset',
            selected: true,
            type: 'series',
            displayed: true,
            valueProps: {prevValue: null}
        },
        {
            label: 'PP do globala',
            compactLabel: 'Ranking',
            name: '+PP',
            key: 'diffPp',
            selected: false,
            type: 'series',
            displayed: false,
            valueProps: {zero: "-", suffix: "pp", withSign: true, useColorsForValue: true}
        },
        {
            label: 'PP',
            name: 'PP',
            key: 'pp',
            selected: true,
            type: 'series',
            valueProps: {zero: "-", suffix: "pp"},
            displayed: true
        },
        {
            label: 'Ważone PP',
            compactLabel: 'Ważone',
            name: 'wPP',
            key: 'weightedPp',
            selected: false,
            type: 'series',
            displayed: true,
            valueProps: {zero: "-", suffix: "pp"}
        },
        {
            label: 'Dokładność',
            compactLabel: 'Acc',
            name: 'Acc',
            key: 'acc',
            selected: true,
            type: 'series',
            displayed: true,
            valueProps: {zero: "-", suffix: "%"}
        },
        {
            label: 'Wynik',
            compactLabel: 'Wynik',
            name: 'Wynik',
            key: 'score',
            selected: true,
            type: 'series',
            displayed: true,
            valueProps: {digits: 0, zero: "-"}
        },
        {
            label: 'Różnice',
            name: 'Różnice',
            key: 'diff',
            selected: true,
            type: 'other',
            displayed: true
        },
        {
            label: 'Pokazuj potencjał',
            name: 'Potencjał',
            key: 'estimate',
            type: 'other',
            displayed: false,
            selected: false
        },
        {
            label: 'Ikony akcji',
            name: '',
            key: 'icons',
            type: 'additional',
            displayed: true,
            selected: true
        },
    ]
    selectedColumns = allColumns.filter(c => c.selected && c.displayed)

    const viewTypes = [
        {id: 'compact', label: 'Kompaktowy'},
        {id: 'tabular', label: 'Tabelaryczny'}
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
    const mapHasStars = (song, minStars, maxStars = null) => song.stars && song.stars >= minStars && (!maxStars || song.stars <= maxStars);
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

    function getSongValueByKey(song, key) {
        return song[key] ? song[key] : null;
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

    let songsPage = getEmptyNewPages();

    async function promiseGetPage(promised, current, itemsPerPage) {
        completeFetchingNewPage(getEmptyNewPages());

        const data = await promised;
        if (!data) return;

        pagerTotal = data.songs.length;

        const songPage = Object.assign({}, data, {
            songs: data.songs.slice(current * itemsPerPage, (current + 1) * itemsPerPage),
            total: pagerTotal
        });

        const promisesToResolve = [];

        function updateAccFromMaxScore(song, allSeries) {
            for (const seriesKey in allSeries) {
                const series = allSeries[seriesKey];

                if (series.scores[song.leaderboardId] && song.maxScoreEx) {
                    const scoreMult = series.scores[song.leaderboardId].scoreMult ? series.scores[song.leaderboardId].scoreMult : 1;
                    const prevScoreMult = series.scores[song.leaderboardId].prevScoreMult ? series.scores[song.leaderboardId].prevScoreMult : 1;

                    series.scores[song.leaderboardId].acc = series.scores[song.leaderboardId].score / song.maxScoreEx / scoreMult * 100;
                    series.scores[song.leaderboardId].prevAcc = series.scores[song.leaderboardId].prevScore ? series.scores[song.leaderboardId].prevScore / song.maxScoreEx / prevScoreMult * 100 : null;
                }
            }
        }

        async function findTwitchVideo(playerId, timeset, songLength) {
            const data = await getCacheAndConvertIfNeeded();
            if(data && data.twitch && data.twitch.users && data.twitch.users[playerId] && data.twitch.users[playerId].videos) {
                const songStarted = addToDate(timeset, -songLength * 1000)
                const video = data.twitch.users[playerId].videos
                        .map(v => Object.assign({}, v, {created_at: dateFromString(v.created_at), ended_at: addToDate(dateFromString(v.created_at), durationToMillis(v.duration))}))
                        .find(v => v.created_at <= songStarted && songStarted < v.ended_at);

                return video ? Object.assign({}, video, {url: video.url + '?t=' + millisToDuration(songStarted - video.created_at)}) : null;
            }
        }

        for (const songsKey in songPage.songs) {
            const song = songPage.songs[songsKey];

            song.maxPp = song.stars * PP_PER_STAR * ppFromScore(100);

            if (!song.maxScoreEx || !song.bpm) {
                try {
                    // try to get max score from cache
                    const songInfo = await getSongDiffInfo(song.id, song.diff, true);
                    if (songInfo) {
                        song.maxScoreEx = songInfo.maxScore;
                        song.bpm = songInfo.bpm;
                        song.njs = songInfo.njs;
                        song.nps = songInfo.notes && songInfo.length ? songInfo.notes / songInfo.length : null;
                        song.length = songInfo.length;
                        song.key = songInfo.key;

                        if (songPage.series[0] && songPage.series[0].scores && songPage.series[0].scores[song.leaderboardId]) {
                            const video = await findTwitchVideo(songPage.series[0].id, songPage.series[0].scores[song.leaderboardId].timeset, song.length);
                            if (video) song.video = video;
                        }
                    } else {
                        // try to fetch song info from beat saver and populate it later
                        promisesToResolve.push({
                            promise: getSongDiffInfo(song.id, song.diff, false),
                            song,
                            current
                        })
                    }
                } catch (e) {
                    // swallow error
                }
            }

            updateAccFromMaxScore(song, songPage.series);
        }

        // wait for resolve all song diff info promises
        if (promisesToResolve.length)
            Promise.allSettled(promisesToResolve.map(arr => arr.promise)).then(all => {
                all.forEach(async (result, idx) => {
                    if (result.status === 'fulfilled') {
                        const songInfo = result.value;
                        const song = promisesToResolve[idx].song;

                        if (songInfo) {
                            song.maxScoreEx = songInfo.maxScore;
                            song.bpm = songInfo.bpm;
                            song.njs = songInfo.njs;
                            song.nps = songInfo.notes && songInfo.length ? songInfo.notes / songInfo.length : null;
                            song.length = songInfo.length;
                            song.key = songInfo.key;

                            if (songPage.series[0] && songPage.series[0].scores && songPage.series[0].scores[song.leaderboardId]) {
                                const video = await findTwitchVideo(songPage.series[0].id, songPage.series[0].scores[song.leaderboardId].timeset, song.length);
                                if (video) song.video = video;
                            }

                            updateAccFromMaxScore(song, songPage.series);
                        }
                    }
                })

                return all;
            }).then(_ => {
                if (promisesToResolve.length && promisesToResolve[0].current === currentPage) {
                    completeFetchingNewPage(songPage)
                }
            });

        completeFetchingNewPage(songPage);

        return songPage;
    }

    async function onSongTypeChange() {
        switch (allFilters.songType.id) {
            case 'unrankeds':
                getObjectFromArrayByKey(allColumns, 'pp').displayed = false;
                getObjectFromArrayByKey(allColumns, 'weightedPp').displayed = false;
                getObjectFromArrayByKey(allColumns, 'diffPp').displayed = false;
                getObjectFromArrayByKey(allColumns, 'estimate').displayed = false;

                selectedColumns = allColumns.filter(c => c.displayed && selectedColumns.includes(c))

                generateSortTypes();
                break;

            case 'all':
                getObjectFromArrayByKey(allColumns, 'pp').displayed = true;
                getObjectFromArrayByKey(allColumns, 'weightedPp').displayed = true;
                getObjectFromArrayByKey(allColumns, 'diffPp').displayed = false;
                getObjectFromArrayByKey(allColumns, 'estimate').displayed = false;

                selectedColumns = allColumns.filter(c => c.displayed && selectedColumns.includes(c))

                allFilters.starsFilter.from = 0;

                generateSortTypes();
                break;

            case 'rankeds_with_not_played':
                getObjectFromArrayByKey(allColumns, 'pp').displayed = true;
                getObjectFromArrayByKey(allColumns, 'weightedPp').displayed = true;
                getObjectFromArrayByKey(allColumns, 'diffPp').displayed = true;
                // getObjectFromArrayByKey(allColumns, 'estimate').displayed = true;

                selectedColumns = allColumns.filter(c => c.displayed && (selectedColumns.includes(c) || ['diffPp', 'pp'].includes(c.key)))

                allFilters.starsFilter.from = allFilters.starsFilter.from > minStarsForSniper ? allFilters.starsFilter.from : round(minStarsForSniper, 1);

                generateSortTypes();
                break;

            case 'rankeds':
            default:
                getObjectFromArrayByKey(allColumns, 'pp').displayed = true;
                getObjectFromArrayByKey(allColumns, 'weightedPp').displayed = true;
                getObjectFromArrayByKey(allColumns, 'diffPp').displayed = false;
                getObjectFromArrayByKey(allColumns, 'estimate').displayed = false;

                selectedColumns = allColumns.filter(c => c.displayed && (selectedColumns.includes(c) || ['pp'].includes(c.key)))

                allFilters.starsFilter.from = 0;

                generateSortTypes();
                break;
        }

        currentPage = 0;

        // force refresh
        allColumns = allColumns.splice(0);

        forceFiltersChanged()
    }

    function setColumnsSuffixes(columns, viewType) {
        columns.forEach(col => {
            if( ["bpm", "njs", "nps"].includes(col.key)) {
                col.valueProps.suffix = viewType.id === 'compact' ? " " + col.key.toUpperCase() : "";
            }
        })
    }

    function getSelectedCols(columns, viewType, type) {
        setColumnsSuffixes(columns, viewType);

        return columns.filter(c => type === c.type);
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
                        const {scores, stats, weeklyDiff, url, lastUpdated, userHistory, ...playerInfo} = pInfo;

                        // set all players total pp to main player's total pp
                        const shouldCalculateTotalPp = filters.songType.id === 'rankeds_with_not_played';
                        playerInfo.prevTotalPp = shouldCalculateTotalPp ? await getCachedTotalPlayerPp(playerId) : null;
                        playerInfo.totalPp = playerInfo.prevTotalPp;

                        if (!sortedRankeds[pInfo.id]) sortedRankeds[pInfo.id] = Object.values(scores).filter((s) => s.pp > 0).sort((a, b) => b.pp - a.pp);

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

                                                        s.scoreMult = score.uScore ? score.score / score.uScore : 1;

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

            const allPlayedSongsObj = convertArrayToObjectByKey(allPlayedSongs, 'leaderboardId')

            const filteredSongs = (await Promise.all((
                    filters.songType.id === 'rankeds_with_not_played'
                            ? Object.values(Object.assign(
                            convertArrayToObjectByKey(allPlayedSongs, 'leaderboardId'),
                            allRankeds
                            ))
                            : allPlayedSongs.map(s => allRankeds[s.leaderboardId] && !s.stars ? Object.assign({}, s, {stars: allRankeds[s.leaderboardId].stars}) : s)
            )
                    .filter(s =>
                            // filter by name
                            (!filters.name.length || filterBySongName(s, filters.name)) &&

                            // filter by type & stars
                            (
                                    (songIsUnranked(s) && ['unrankeds', 'all'].includes(filters.songType.id)) ||
                                    (filters.songType.id !== 'unrankeds' && mapHasStars(s, filters.starsFilter.from, filters.starsFilter.to))
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


                        playersSeries.forEach((series, idx) => {
                            if (series.scores[s.leaderboardId]) {
                                const maxScoreExScore = allPlayedSongsObj[s.leaderboardId]
                                const maxScoreEx = maxScoreExScore && maxScoreExScore.maxScoreEx ? maxScoreExScore.maxScoreEx : null;

                                const scoreMult = series.scores[s.leaderboardId].scoreMult ? series.scores[s.leaderboardId].scoreMult : 1
                                series.scores[s.leaderboardId].acc = maxScoreEx ? series.scores[s.leaderboardId].score / maxScoreEx / scoreMult * 100 : null;

                                series.scores[s.leaderboardId].diffPp = null;

                                // get previous player scores
                                if (idx === 0 && series.scores[s.leaderboardId].history && series.scores[s.leaderboardId].history.length) {
                                    series.prevLabel = "Poprzednio";

                                    ["pp", "score", "uScore"].forEach(key => {
                                        series.scores[s.leaderboardId]['prev' + capitalize(key)] = series.scores[s.leaderboardId].history[0][key];
                                    })
                                    series.scores[s.leaderboardId].prevTimeset = new Date(series.scores[s.leaderboardId].history[0]['timestamp']);

                                    series.scores[s.leaderboardId].prevScoreMult = series.scores[s.leaderboardId].prevScore && series.scores[s.leaderboardId].prevUScore ? series.scores[s.leaderboardId].prevScore / series.scores[s.leaderboardId].prevUScore : 1
                                    series.scores[s.leaderboardId].prevAcc = maxScoreEx ? series.scores[s.leaderboardId].prevScore / maxScoreEx / series.scores[s.leaderboardId].prevScoreMult * 100 : null;
                                }

                                if (idx > 0) {
                                    // get player score to compare
                                    series.prevLabel = playersSeries[0].name;

                                    const playerScoreToCompare = playersSeries[0].scores[s.leaderboardId];
                                    ["acc", "pp", "score", "timeset", "uScore"].forEach(key => {
                                        series.scores[s.leaderboardId]['prev' + capitalize(key)] = playerScoreToCompare ? playerScoreToCompare[key] : null;
                                    })
                                }
                            }
                        })

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

                        if (filters.songType.id === 'rankeds_with_not_played') {
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

                            if (s.bestIdx) s.bestDiffPp = playersSeries[s.bestIdx].scores[s.leaderboardId].diffPp;
                            if (s.bestRealIdx) s.bestRealDiffPp = playersSeries[s.bestRealIdx].scores[s.leaderboardId].diffPp;
                        }

                        return s;
                    })))

                    // filter when sniper mode, player is the best and diff > minPpDiff
                    .filter(s =>
                            filters.songType.id !== 'rankeds_with_not_played' ||
                            (playerIsNotTheBest(s.leaderboardId, playersSeries[compareToIdx]) && bestSeriesGivesAtLeastMinPpDiff(s, filters.minPpDiff))
                            || (filters.songType.id === 'rankeds_with_not_played' && nobodyPlayedItYet(s))
                    )

                    .sort((songA, songB) => {
                        let a, b;

                        switch (filters.sortBy.type) {
                            case 'song':
                                a = songA[filters.sortBy.field]
                                b = songB[filters.sortBy.field]
                                break;

                            case 'series':
                            default:
                                const sortIdx = filters.sortBy.subtype;
                                const field = filters.sortBy.field;
                                a = playersSeries[sortIdx] && playersSeries[sortIdx].scores && playersSeries[sortIdx].scores[songA.leaderboardId] ? playersSeries[sortIdx].scores[songA.leaderboardId][field] : null
                                b = playersSeries[sortIdx] && playersSeries[sortIdx].scores && playersSeries[sortIdx].scores[songB.leaderboardId] ? playersSeries[sortIdx].scores[songB.leaderboardId][field] : null
                                break;
                        }

                        return filters.sortBy.order === 'asc' ? a - b : b - a;
                    })

            let bestTotalRealPp = playersSeries[compareToIdx].totalPp
            let bestTotalPp = playersSeries[compareToIdx].totalPp;

            if (filters.songType.id === 'rankeds_with_not_played') {
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


                if (snipedIds.length >= 1) {
                    bestTotalRealPp = snipedIds.length === 1 ? playersSeries[1].totalPp : await getPlayerTotalPpWithBestScores(filteredSongs, 'bestRealPp');
                    bestTotalPp = snipedIds.length === 1 ? playersSeries[1].totalPp : await getPlayerTotalPpWithBestScores(filteredSongs, 'bestPp');
                }
            }

            calculating = false;

            return {songs: filteredSongs, series: playersSeries, bestTotalRealPp, bestTotalPp}
        } catch (err) {
            log.error(err)
        }
    }

    async function exportCsv() {
        const headers = [
            {field: 'leaderboardId', label: 'ID'},
            {field: 'name', label: 'Song'},
            {field: 'songAuthor', label: 'Song author'},
            {field: 'levelAuthor', label: 'Level author'},
            {field: 'stars', label: 'Stars'},
            {field: 'difficulty', label: 'Difficulty'},
            {field: 'maxScore', label: 'Max score'},
            {field: 'timeset', label: 'Date'},
            {field: 'score', label: 'Score'},
            {field: 'mods', label: 'Mods'},
            {field: 'uScore', label: 'Score w/mod'},
            {field: 'pp', label: 'PP'},
            {field: 'weightedPp', label: 'Weighted PP'},
        ]
        const data = await calcPromised;
        const transformedData = await Promise.all(
                data.songs.map(async s => {
                    const diffInfo = getHumanDiffInfo(s.diff);

                    let maxScore = s.maxScoreEx;
                    if (!maxScore) {
                        try {
                            // try to get max score from cache
                            maxScore = await getSongMaxScoreWithDiffAndType(s.id, s.diff, true);
                        } catch (e) {
                            // swallow error
                        }
                    }

                    return Object.assign({}, s, {
                        difficulty: diffInfo ? diffInfo.name : '',
                        maxScore: maxScore ? maxScore : '',
                        timeset: getScoreValueByKey(data.series[0], s, 'timeset'),
                        score: getScoreValueByKey(data.series[0], s, 'score'),
                        mods: getScoreValueByKey(data.series[0], s, 'mods'),
                        uScore: getScoreValueByKey(data.series[0], s, 'uScore'),
                        pp: getScoreValueByKey(data.series[0], s, 'pp'),
                        weightedPp: getScoreValueByKey(data.series[0], s, 'weightedPp'),
                    })
                })
                )
        ;
        const csv = generateCsv(transformedData, headers);

        downloadCsv("scores.csv", csv);
    }

    function copyToClipboard(text) {
        navigator.permissions.query({name: 'clipboard-write'}).then(result => {
            if (result.state === 'granted' || result.state === 'prompt') {
                navigator.clipboard.writeText(text).then(() => {});
            }
        });
    }

    $: shownColumns = allColumns.filter(c => c.displayed)
    $: selectedSongCols = getSelectedCols(selectedColumns, viewType, 'song')
    $: selectedSeriesCols = getSelectedCols(selectedColumns, viewType, 'series')
    $: selectedAdditionalCols = getSelectedCols(selectedColumns, viewType, 'additional')
    $: shouldCalculateTotalPp = !!getObjectFromArrayByKey(selectedColumns, 'diffPp') && 'rankeds_with_not_played' === allFilters.songType.id
    $: calcPromised = initialized ? calculate(playerId, snipedIds.concat(!snipedIds.length && 'rankeds_with_not_played' === allFilters.songType.id ? sniperModeIds : []), allFilters) : null;
    // $: withEstimate = getObjectFromArrayByKey(allColumns, 'estimate').selected;
    $: pagedPromised = promiseGetPage(calcPromised, currentPage, itemsPerPage)
</script>

<div class="filters">
    <div>
        <header>Rodzaj</header>
        <Select bind:value={allFilters.songType} items={songTypes} on:change={onSongTypeChange} />
    </div>

    <div class="filter-name">
        <input type="text" placeholder="Nazwa nutki..." on:input={onFilterNameChange}/>
    </div>

    <div style="display: {allFilters.songType.id === 'rankeds_with_not_played' ? 'block' : 'none'}">
        <Range label="+PP > " value={allFilters.minPpDiff} min={1} max={20} step={0.1} suffix="pp"
               on:change={onFilterMinPlusPpChanged}/>
    </div>

    <div style="display: { allFilters.songType.id !== 'unrankeds' ? 'block' : 'none'}">
        <header>Gwiazdki</header>
        <MultiRange label="Gwiazdki" value={allFilters.starsFilter}
                    min={allFilters.songType.id === 'rankeds_with_not_played' ? round(minStarsForSniper,1) : 0}
                    max={maxStars} step={0.1} suffix="*" digits={1} disableDirectEditing={true}
                    on:change={onFilterStarsChange}/>
    </div>

    <div>
        <header>Widok</header>
        <Select bind:value={viewType} items={viewTypes} />
    </div>

    <div class="columns">
        <div>
            <header>Pokazuj</header>

            <Select multiple bind:value={selectedColumns} bind:items={shownColumns} noSelected="Nic nie wybrano" />
        </div>
    </div>

    <div>
        <header>Sortowanie</header>
        <Select bind:value={allFilters.sortBy} items={sortTypes} />
    </div>
</div>

{#await pagedPromised}
    <div class="info">
        <h3>Transformacja wszechświata w toku...</h3>
    </div>
{:then calc}
    {#if songsPage.songs.length}
        <table class="ranking sspl" class:light={lightMode}>
            {#if viewType.id !== 'compact' || songsPage.series.length > 1}
                <thead>
                <tr>
                    <th class="song" rowspan={viewType.id === 'compact' ? 1 : 2} colspan="2">Nuta</th>

                    {#each selectedSongCols as col,idx (col.key)}
                        <th class={"left middle " + col.key} rowspan={viewType.id === 'compact' ? 1 : 2}>{col.name}</th>
                    {/each}

                    {#each songsPage.series as series (series.id+'_'+series.estimateId)}
                        {#if viewType.id === 'compact'}
                            <th class="left down">{series.name}</th>
                        {:else}
                            {#if selectedSeriesCols.length > 0 && !(selectedSeriesCols.length === 1 && series.id === playerId && !!getObjectFromArrayByKey(selectedColumns, 'diffPp'))}
                                <th colspan={series.id !== playerId ? selectedSeriesCols.length : selectedSeriesCols.length - (!!getObjectFromArrayByKey(selectedColumns, 'diffPp') ? 1 : 0)}
                                    class="series left">{series.name}</th>
                            {/if}
                        {/if}
                    {/each}

                    {#each selectedAdditionalCols as col,idx (col.key)}
                        <th class={"left " + col.key} rowspan={viewType.id === 'compact' ? 1 : 2}>{col.name}</th>
                    {/each}
                </tr>

                {#if viewType.id !== 'compact'}
                    <tr>
                        {#each songsPage.series as series (series.id+'_'+series.estimateId)}
                            {#each selectedSeriesCols as col,idx (col.key)}{#if col.key !== 'diffPp' || series.id !== playerId}
                                <th class={'left ' + col.key + (idx > 0 ? ' middle' : '')}>{col.name}</th>
                            {/if}{/each}
                        {/each}
                    </tr>
                {/if}
                </thead>
            {/if}

            <tbody>
            {#each songsPage.songs as song (song.leaderboardId)}
                <tr>
                    <td class="diff">
                        <Difficulty diff={song.diff} useShortName={true} reverseColors={true}/>
                    </td>

                    <td class="song">
                        <div class="flex-start">
                            <Song song={song}>
                                <figure>
                                    <img src="/imports/images/songs/{song.id}.png"/>
                                    <div class="songinfo">
                                        <span class="name">{song.name}</span>
                                        <div class="author">{song.songAuthor} <small>{song.levelAuthor}</small></div>
                                    </div>
                                </figure>
                            </Song>
                        </div>
                    </td>

                    {#each selectedSongCols as col,idx (col.key)}
                        <td class={"left middle " + col.key}>
                            {#if col.key === 'length'}
                                <Duration value={getSongValueByKey(song, col.key)} {...col.valueProps}/>
                            {:else}
                                <Value value={getSongValueByKey(song, col.key)} {...col.valueProps}/>
                            {/if}
                        </td>
                    {/each}

                    {#each songsPage.series as series (series.id+'_'+series.estimateId)}
                        {#if viewType.id === 'compact'}
                            <td class="left compact series-{songsPage.series.length}"
                                class:with-cols={selectedSongCols.length > 0}
                                class:best={getScoreValueByKey(series, song, 'best') && songsPage.series.length > 1}>
                                {#if getScoreValueByKey(series, song, 'score')}
                                    {#each selectedSeriesCols as col,idx (col.key)}{#if col.key !== 'diffPp' || series.id !== playerId}
                                        {#if col.key === 'timeset'}
                                            <strong class={'compact-' + col.key + '-val'}>
                                                <Date date={getScoreValueByKey(series, song, col.key)}
                                                      {...col.valueProps}/>
                                            </strong>
                                        {:else}
                                            {#if getScoreValueByKey(series, song, col.key)}
                                                <div>
                                                    {#if col.compactLabel}{col.compactLabel}{'acc' === col.key && getScoreValueByKey(series, song, 'mods') ? ' ('+getScoreValueByKey(series, song, 'mods')+')' : ''}
                                                        :{/if}
                                                    <strong class={'compact-' + col.key + '-val'}>
                                                        <Value value={getScoreValueByKey(series, song, col.key)}
                                                               prevValue={!!getObjectFromArrayByKey(selectedColumns, 'diff') && (allFilters.songType.id !== 'rankeds_with_not_played' || series.id !== playerId) ? getScoreValueByKey(series, song, 'prev' + capitalize(col.key)) : null}
                                                               prevLabel={series.prevLabel} inline={true}
                                                               {...col.valueProps}
                                                        />
                                                    </strong>
                                                </div>
                                            {/if}
                                            {#if col.key === 'pp' && allFilters.songType.id !== 'rankeds_with_not_played'}
                                                <WhatIfPp leaderboardId={song.leaderboardId}
                                                          pp={getScoreValueByKey(series, song, col.key)}/>{/if}
                                        {/if}
                                    {/if}{/each}
                                {:else}
                                    -
                                {/if}
                            </td>
                        {:else}
                            {#each selectedSeriesCols as col,idx (col.key)}{#if col.key !== 'diffPp' || series.id !== playerId}
                                <td class={'left ' + col.key} class:middle={idx > 0}
                                    class:best={getScoreValueByKey(series, song, 'best') && songsPage.series.length > 1}>
                                    {#if col.key === 'timeset'}
                                        <Date date={getScoreValueByKey(series, song, col.key)} {...col.valueProps}/>
                                    {:else}
                                        <Value value={getScoreValueByKey(series, song, col.key)}
                                               prevValue={!!getObjectFromArrayByKey(selectedColumns, 'diff') && (allFilters.songType.id !== 'rankeds_with_not_played' || series.id !== playerId) ? getScoreValueByKey(series, song, 'prev' + capitalize(col.key)) : null}
                                               prevLabel={series.prevLabel}
                                               {...col.valueProps}
                                        />
                                    {/if}
                                </td>
                            {/if}{/each}
                        {/if}
                    {/each}

                    {#each selectedAdditionalCols as col,idx (col.key)}
                        <td class:left={viewType.id === 'tabular' || songsPage.series.length > 1} class={col.key}>
                            {#if song.key && song.key.length}
                                <Button iconFa="fas fa-exclamation" title="Skopiuj !bsr" on:click={copyToClipboard('!bsr ' + song.key)} />
                                <a href="https://beatsaver.com/beatmap/{song.key}" target="_blank"><Button icon={beatSaverSvg} title="Przejdź na Beat Saver" /></a>
                                <a href="https://skystudioapps.com/bs-viewer/?id={song.key}" target="_blank"><Button iconFa="fa fa-play-circle" title="Podgląd mapy" /></a>
                            {/if}

                            {#if song.video && song.video.url}
                                <a class="video" href="{song.video.url}" target="_blank">
                                    <Button iconFa="fab fa-twitch" type="twitch" title="Podgląd video" />
                                </a>
                            {/if}
                        </td>
                    {/each}
                </tr>
            {/each}
            </tbody>

            {#if shouldCalculateTotalPp}
                <tfoot>
                <tr>
                    <th class="song" rowspan={songsPage.series.length > 2 ? 2 : 1}
                        colspan={2 + selectedSongCols.length}>
                        Razem dla {songsPage.series[0].name}</th>
                    {#each songsPage.series as series, idx (series.id+'_'+series.estimateId)}
                        {#if viewType.id === 'tabular'}
                            {#if selectedSeriesCols.length > 0 && !(selectedSeriesCols.length === 1 && series.id === playerId && !!getObjectFromArrayByKey(selectedColumns, 'diffPp'))}
                                <th class="left" rowspan={series.id !== playerId ? 1 : (songsPage.series.length > 2 ? 2 : 1)}
                                    colspan={series.id !== playerId ? selectedSeriesCols.length : selectedSeriesCols.length - (!!getObjectFromArrayByKey(selectedColumns, 'diffPp') ? 1 : 0)}>
                                    <Value value={series.totalPp}
                                           prevValue={!!getObjectFromArrayByKey(selectedColumns, 'diff') ? series.prevTotalPp : null}
                                           suffix="pp"/>
                                </th>
                            {/if}
                        {:else}
                            <th class="left">
                                <Value value={series.totalPp}
                                       prevValue={!!getObjectFromArrayByKey(selectedColumns, 'diff') ? series.prevTotalPp : null}
                                       suffix="pp"/>
                            </th>
                        {/if}
                    {/each}

                    {#each selectedAdditionalCols as col,idx (col.key)}
                        <th class:left={viewType.id === 'tabular' || songsPage.series.length > 1} class={col.key}>

                        </th>
                    {/each}
                </tr>
                <tr>
                    {#if selectedSeriesCols.length && songsPage.series.length > 2}
                        <th class="left" colspan={selectedSeriesCols.length * (songsPage.series.length - 1) + selectedAdditionalCols.length}>
                            <Value value={songsPage.bestTotalRealPp}
                                   prevValue={!!getObjectFromArrayByKey(selectedColumns, 'diff') ? songsPage.series[0].totalPp : null}
                                   suffix="pp"/>
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

{#if songsPage.songs && songsPage.songs.length}
    <Pager bind:currentPage={currentPage} bind:itemsPerPage={itemsPerPage} totalItems={pagerTotal} itemsPerPageValues={[5, 10, 15, 20, 25, 50]} hide={calculating}/>
{/if}

{#if !calculating}
<div class="actions">
    <Button label="CSV" iconFa="fas fa-download" on:click={exportCsv} />
</div>
{/if}

<style>
    .columns {
        max-width: 15rem;
    }

    .columns > div {
        max-width: 100%;
    }

    .columns label {
        margin-right: .25rem;
    }

    table.ranking.sspl {
        font-size: 0.875rem;
        border-width: 1px;
    }

    th, td {
        vertical-align: middle !important;
        padding: 0.25em !important;
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

    thead th.song, thead th.maxPp, thead th.bpm, thead th.njs, thead th.nps, thead th.length {
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

    thead th.bpm, thead th.njs, thead th.nps, thead th.length {
        width: 2.5rem;
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

    thead th.icons {
        width: 4.9rem;
    }

    tbody td.acc, tbody td.pp, tbody td.diffPp, tbody td.score, tbody td.weightedPp, tbody td.timeset {
        text-align: center;
    }

    tbody td.stars, tbody td.maxPp, tbody td.bpm, tbody td.njs, tbody td.nps, tbody td.length {
        text-align: center;
    }

    th.top, td.top {
        border-top-style: solid;
        border-top-width: 1px;
    }

    td.down {
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

    tbody td.song figure {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        margin: 0;
    }

    tbody td.song img {
        flex: 0 1 40px;
        width: 40px;
        height: 40px;
        margin: 0 1em 0 .5em;
    }

    tbody td.song .songinfo {
        text-align: left;
    }

    tbody td.song small {
        font-size: 0.75em;
        color: #888;
    }

    tbody td.icons {
        width: 4.9rem;
        text-align: right;
    }

    :global(tbody td.icons button) {
        margin-bottom: .25em!important;
    }

    tfoot th {
        text-align: center !important;
        vertical-align: middle !important;
        border-top-width: 2px;
    }

    tfoot th.song {
        text-align: left !important;
    }

    tbody td {
        position: relative;
    }

    tbody td.best {
        background: linear-gradient(90deg, rgba(51, 51, 51, 1) 0%, rgba(85, 85, 85, 1) 50%, rgba(51, 51, 51, 1) 100%);
    }

    table.light tbody td.best {
        background: linear-gradient(90deg, rgba(201, 201, 201, 1) 0%, rgba(255, 255, 255, 1) 50%, rgba(201, 201, 201, 1) 100%);
    }

    tbody td.compact {
        width: 12rem;
        text-align: center;
    }

    tbody td.compact.left.series-1:not(.with-cols) {
        border-left: none;
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
        color: var(--textColor, #000);
        background-color: var(--foreground, #fff);
        outline: none;
    }

    input {
        border-bottom: 1px solid var(--textColor, #000);
    }

    input::placeholder {
        color: #666;
        opacity: 1;
    }

    .actions {
        font-size: .75rem;
    }
</style>