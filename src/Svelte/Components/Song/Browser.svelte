<script>
    import {onMount} from 'svelte';
    import log from '../../../utils/logger';
    import {copyToClipboard} from '../../../utils/clipboard';
    import {findRawPp, getTotalUserPp, PP_PER_STAR, ppFromScore, getWeightedPp} from "../../../scoresaber/pp";
    import {getRankedSongs, RANKED, UNRANKED} from "../../../scoresaber/rankeds";
    import {delay} from "../../../network/fetch";
    import {getCacheAndConvertIfNeeded, setCache} from "../../../store";
    import {addToDate, dateFromString, durationToMillis, millisToDuration} from "../../../utils/date";
    import {capitalize, convertArrayToObjectByKey} from "../../../utils/js";
    import debounce from '../../../utils/debounce';
    import eventBus from '../../../utils/broadcast-channel-pubsub';
    import nodeSync from '../../../network/multinode-sync';
    import {
        getAllActivePlayers,
        getCountryRanking,
        getPlayerInfo,
        getPlayerRankedScores, getPlayers,
        getPlayerScores
    } from "../../../scoresaber/players";
    import {
        extractDiffAndType,
        getHumanDiffInfo,
        getSongDiffInfo,
        getSongMaxScoreWithDiffAndType
    } from "../../../song";
    import {generateCsv, downloadCsv} from '../../../utils/csv';
    import {downloadJson} from '../../../utils/json';
    import {round} from "../../../utils/format";
    import memoize from '../../../utils/memoize';
    import {getConfig, getMainPlayerId} from "../../../plugin-config";
    import config from "../../../temp";
    import beatSaverSvg from "../../../resource/svg/beatsaver.svg";

    import Song from "./Song.svelte";
    import Pager from "../Common/Pager.svelte";
    import Range from "../Common/Range.svelte";
    import FormattedDate from "../Common/FormattedDate.svelte";
    import MultiRange from "../Common/MultiRange.svelte";

    import WhatIfPp from "./WhatIfPp.svelte";
    import Duration from "../Common/Duration.svelte";
    import Difficulty from "../Common/Difficulty.svelte";
    import Value from "../Common/Value.svelte";
    import Button from "../Common/Button.svelte";
    import Select from "../Common/Select.svelte";
    import Leaderboard from "./Leaderboard.svelte";
    import Checkbox from "../Common/Checkbox.svelte";
    import {_, trans} from "../../stores/i18n";
    import Card from "./Card.svelte";

    export let playerId;
    export let snipedIds = [];
    export let minPpPerMap = 1;

    let viewUpdates = 'keep-view';
    let currentFirstRowIdentifier = null;

    let refreshTag = 0;

    const country = config.COUNTRY;

    let selectedColumns = [];

    let showCheckboxes = false;
    let checkedSongs = [];

    const DEBOUNCE_DELAY = 400;

    const allItemsPerPage = [5, 8, 10, 12, 15, 20, 24, 25, 48, 50];

    let shownIcons = ["bsr", "bs", "preview", "twitch", "oneclick"];

    let initialized = false;
    let countryRanking = [];
    let sniperModeIds = [];
    let minStarsForSniper = 0;
    let maxStars = 100;

    let strings = {
        songTypes: [
            {id: 'all', _key: 'songBrowser.types.all'},
            {id: 'rankeds', _key: 'songBrowser.types.ranked_only'},
            {id: 'unrankeds', _key: 'songBrowser.types.unranked_only'},
            {id: 'rankeds_unplayed', _key: 'songBrowser.types.not_played_only'},
            {id: 'sniper_mode', _key: 'songBrowser.types.sniper_mode'},
        ],

        songTypeOptions: [
            {id: 'all', _key: 'songBrowser.typesOptions.all'},
            {id: 'not_best', _key: 'songBrowser.typesOptions.not_best'},
            {id: 'best', _key: 'songBrowser.typesOptions.best'},
        ],

        viewTypes: [
            {id: 'compact', _key: 'songBrowser.viewTypes.compact'},
            {id: 'tabular', _key: 'songBrowser.viewTypes.tabular'},
            {id: 'cards', _key: 'songBrowser.viewTypes.cards'},
        ],

        sortTypes: [
            {_key: 'songBrowser.fields.timeset', field: 'timeset'},
            {_key: 'songBrowser.fields.stars', field: 'stars'},
            {_key: 'songBrowser.fields.pp', field: 'pp'},
            {_key: 'songBrowser.fields.acc', field: 'acc'},
            {_key: 'songBrowser.fields.diffPp', field: 'diffPp'},
            {_key: 'songBrowser.fields.diffPp', field: 'bestDiffPp'},
        ],

        sortOrders: [
            {_key: 'songBrowser.sort.descending', order: 'desc'},
            {_key: 'songBrowser.sort.ascending', order: 'asc'}
        ],

        columns: [
            {
                _key: 'songBrowser.fields.stars',
                _keyName: 'songBrowser.fields.starsShort',
                name: '*',
                key: 'stars',
                selected: false,
                type: 'song',
                displayed: true,
                valueProps: {zero: "-", suffix: "*"}
            },
            {
                _key: 'songBrowser.fields.maxPp',
                _keyName: 'songBrowser.fields.maxPpShort',
                name: 'Max PP',
                key: 'maxPp',
                selected: false,
                type: 'song',
                displayed: true,
                valueProps: {zero: "-", suffix: "pp"}
            },
            {
                _key: 'songBrowser.fields.bpm',
                _keyName: 'songBrowser.fields.bpmShort',
                name: 'BPM',
                key: 'bpm',
                selected: false,
                type: 'song',
                displayed: true,
                valueProps: {zero: "-", suffix: "", digits: 0}
            },
            {
                _key: 'songBrowser.fields.njs',
                _keyName: 'songBrowser.fields.njsShort',
                name: 'NJS',
                key: 'njs',
                selected: false,
                type: 'song',
                displayed: true,
                valueProps: {zero: "-", suffix: "", digits: 0}
            },
            {
                _key: 'songBrowser.fields.nps',
                _keyName: 'songBrowser.fields.npsShort',
                name: 'NPS',
                key: 'nps',
                selected: false,
                type: 'song',
                displayed: true,
                valueProps: {zero: "-", suffix: ""}
            },
            {
                _key: 'songBrowser.fields.duration',
                _keyName: 'songBrowser.fields.durationShort',
                name: 'Czas',
                key: 'length',
                selected: false,
                type: 'song',
                displayed: true,
                valueProps: {zero: "-"}
            },
            {
                _key: 'songBrowser.fields.timeset',
                _keyName: 'songBrowser.fields.timesetShort',
                compactLabel: null,
                name: 'Data',
                key: 'timeset',
                selected: true,
                type: 'series',
                displayed: true,
                valueProps: {prevValue: null}
            },
            {
                _key: 'songBrowser.fields.diffPp',
                _keyName: 'songBrowser.fields.diffPpShort',
                compactLabel: null,
                name: '+PP',
                key: 'diffPp',
                selected: false,
                type: 'series',
                displayed: false,
                valueProps: {zero: "-", suffix: "pp global", withSign: true, useColorsForValue: true}
            },
            {
                _key: 'songBrowser.fields.pp',
                _keyName: 'songBrowser.fields.ppShort',
                name: 'PP',
                key: 'pp',
                selected: true,
                type: 'series',
                valueProps: {zero: "-", suffix: "pp"},
                displayed: true
            },
            {
                _key: 'songBrowser.fields.weightedPp',
                _keyName: 'songBrowser.fields.weightedPpShort',
                _keyCompactLabel: 'songBrowser.fields.weighted',
                compactLabel: 'Waż.',
                name: 'wPP',
                key: 'weightedPp',
                selected: false,
                type: 'series',
                displayed: true,
                valueProps: {zero: "-", suffix: "pp"}
            },
            {
                _key: 'songBrowser.fields.acc',
                _keyName: 'songBrowser.fields.accShort',
                compactLabel: null,
                name: 'Acc',
                key: 'acc',
                selected: true,
                type: 'series',
                displayed: true,
                valueProps: {zero: "-", suffix: "%"}
            },
            {
                _key: 'songBrowser.fields.score',
                _keyName: 'songBrowser.fields.scoreShort',
                compactLabel: null,
                name: 'Wynik',
                key: 'score',
                selected: true,
                type: 'series',
                displayed: true,
                valueProps: {digits: 0, zero: "-"}
            },
            {
                _key: 'songBrowser.fields.diff',
                _keyName: 'songBrowser.fields.diffShort',
                name: 'Różnice',
                key: 'diff',
                selected: true,
                type: 'other',
                displayed: true
            },
            {
                _key: 'songBrowser.fields.icons',
                name: '',
                key: 'icons',
                type: 'additional',
                displayed: true,
                selected: true
            },
        ],

        icons: [
            {_key: 'songBrowser.icons.bsr', id: 'bsr'},
            {_key: 'songBrowser.icons.beatsaver', id: 'bs'},
            {_key: 'songBrowser.icons.oneclick', id: 'oneclick'},
            {_key: 'songBrowser.icons.preview', id: 'preview'},
            {_key: 'songBrowser.icons.twitch', id: 'twitch'}
        ],
    }

    const getObjectFromArrayByKey = (shownColumns, value, key = 'key') => shownColumns.find(c => c[key] && c[key] === value);

    let sortTypes = [
        {
            ...getObjectFromArrayByKey(strings.sortTypes, 'timeset', 'field'),
            type: 'series',
            subtype: 0,
            field: 'timeset',
            enabled: true
        },
    ];
    let allFilters = {
        songType: strings.songTypes[0],
        songTypeOption: strings.songTypeOptions[0],
        name: "",
        starsFilter: {from: 0, to: maxStars},
        minPpDiff: 1,
        sortBy: sortTypes[0],
        sortOrder: strings.sortOrders[0]
    }
    const forceFiltersChanged = () => allFilters = Object.assign({}, allFilters);

    function translateAllStrings() {
        Object.keys(strings).forEach(key => {
            strings[key].forEach(item => {
                switch (key) {
                    case 'columns':
                        if (item._keyName) item.name = trans(item._keyName);
                        if (item._keyCompactLabel) item.compactLabel = trans(item._keyCompactLabel);
                        break;
                }

                if (item._key) item.label = trans(item._key);
            })
        });

        sortTypes.forEach(item => {
            if (item._key) item.label = trans(item._key);
        })
        sortTypes = [...sortTypes];

        strings = {...strings};

        forceFiltersChanged();
    }

    const generateRefreshTag = async (force = false) => {
        const data = await getCacheAndConvertIfNeeded(force);

        const playerIds = [playerId].concat(snipedIds);

        const newRefreshTag = playerIds.reduce((tag, pId) => tag + pId + ':' + (data.users && data.users[pId] && data.users[pId].recentPlay ? dateFromString(data.users[pId].recentPlay).getTime() : 'null'), '')

        if (refreshTag !== newRefreshTag) refreshTag = newRefreshTag;
    }

    const generateSortTypes = async _ => {
        let types = [];

        const data = (await getCacheAndConvertIfNeeded());

        if (allFilters.songType.id === 'sniper_mode')
            types.push({
                ...getObjectFromArrayByKey(strings.sortTypes, 'bestDiffPp', 'field'),
                type: 'song',
                subtype: null,
                field: 'bestDiffPp',
                enabled: true
            });

        if (allFilters.songType.id !== 'unrankeds')
            types.push({
                ...getObjectFromArrayByKey(strings.sortTypes, 'stars', 'field'),
                type: 'song',
                subtype: null,
                field: 'stars',
                enabled: true
            });

        const userIds = [playerId].concat(snipedIds);
        if (data && data.users) {
            userIds.forEach((pId, idx) => {
                const name = data.users[pId] ? data.users[pId].name : null;
                if (name) {
                    const newFields = [];
                    [
                        {
                            ...getObjectFromArrayByKey(strings.sortTypes, 'timeset', 'field'),
                            field: "timeset",
                            enabled: pId !== playerId || allFilters.songType.id !== 'rankeds_unplayed'
                        },
                        {
                            ...getObjectFromArrayByKey(strings.sortTypes, 'diffPp', 'field'),
                            field: "diffPp",
                            enabled: 'sniper_mode' === allFilters.songType.id && idx !== 0
                        },
                        {
                            ...getObjectFromArrayByKey(strings.sortTypes, 'pp', 'field'),
                            field: "pp",
                            enabled: ['rankeds', 'sniper_mode'].includes(allFilters.songType.id) || (pId !== playerId && allFilters.songType.id === 'rankeds_unplayed')
                        },
                        {
                            ...getObjectFromArrayByKey(strings.sortTypes, 'acc', 'field'),
                            field: "acc",
                            enabled: ['rankeds', 'sniper_mode'].includes(allFilters.songType.id) || (pId !== playerId && allFilters.songType.id === 'rankeds_unplayed')
                        },
                    ].forEach(field => {
                        if (field.enabled)
                            newFields.push({
                                _key: field._key,
                                label: field.label,
                                type: 'series',
                                subtype: idx,
                                field: field.field,
                                enabled: true
                            })
                    })

                    if (newFields.length) {
                        if (userIds.length > 1) types.push({label: name, type: 'label'})
                        types = types.concat(newFields);
                    }
                }
            })
        }

        sortTypes = types;

        const config = await getConfig('songBrowser');
        const sortBy = allFilters.songType.id === 'sniper_mode' ? 'bestDiffPp' : (config.defaultSort ? config.defaultSort : 'timeset');
        const defaultSort = sortTypes.find(s => s.field === sortBy);
        allFilters.sortBy = defaultSort ? defaultSort : types[0];

        await generateRefreshTag();
    }

    async function storeCurrentFirstIdentifier() {
        currentFirstRowIdentifier = null;

        if (!songsPage || !songsPage.songs.length) return;

        const currentFirstIdx = currentPage * itemsPerPage;

        const data = await calcPromised;

        if (data && data.songs[currentFirstIdx]) {
            const val = getSortValue(data.songs[currentFirstIdx], data.series, allFilters);
            if (!val) return;

            currentFirstRowIdentifier = val;
        }
    }

    async function restorePage() {
        if (currentFirstRowIdentifier) {
            const rowId = currentFirstRowIdentifier;

            const data = await calcPromised;
            if (!data) return;

            switch (viewUpdates) {
                case 'keep-view':
                    const newIdx = data.songs.findIndex(
                        s => allFilters.sortOrder.order === 'asc'
                            ? getSortValue(s, data.series, allFilters) >= rowId
                            : getSortValue(s, data.series, allFilters) <= rowId
                    );
                    const newPage = newIdx >= 0 ? Math.floor(newIdx / itemsPerPage) : 0;
                    if (newPage !== currentPage) currentPage = newPage;
                    break;

                case 'always':
                default:
                    if (currentPage !== 0) currentPage = 0;
                    break;
            }
        }
    }

    const findSort = (type, subtype, field) => sortTypes.find(st => st.type === type && st.subtype === subtype && st.field === field);

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

    const getMaxScoreExFromPlayersScores = async leaderboardId => Object.values((await getCacheAndConvertIfNeeded()).users).reduce((maxScore, player) => !maxScore && player && player.scores && player.scores[leaderboardId] && player.scores[leaderboardId].maxScoreEx ? player.scores[leaderboardId].maxScoreEx : maxScore, null)
    const getCachedMaxScoreExFromPlayersScores = memoize(getMaxScoreExFromPlayersScores);

    let calculating = true;

    let currentPage = 0;
    let itemsPerPage = 10;
    let pagerTotal = 0;

    selectedColumns = strings.columns.filter(c => c.selected && c.displayed)

    let viewType = strings.viewTypes[0];

    let users = [];

    async function updateViewUpdatesConfig() {
        const config = await getConfig('others');
        viewUpdates = config.viewUpdates ? config.viewUpdates : 'keep-view';
    }

    // initialize async values
    onMount(async () => {
        if (!playerId) playerId = await getMainPlayerId()

        const config = await getConfig('songBrowser');

        // add snipeds if not defined
        if (!snipedIds || !snipedIds.length) {
            countryRanking = await getCountryRanking(country);
            const player = countryRanking.find(p => p.id === playerId)
            if (player) {
                if (player.ssplCountryRank[country] > 1) sniperModeIds.push(countryRanking[player.ssplCountryRank[country] - 1 - 1].id);
                if (player.ssplCountryRank[country] < countryRanking.length) sniperModeIds.push(countryRanking[player.ssplCountryRank[country] + 1 - 1].id);
            }

            if (config.compareTo && Array.isArray(config.compareTo)) snipedIds = [...config.compareTo];
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

        shownIcons = config && config.showIcons ? config.showIcons : shownIcons;

        if (config.defaultView) {
            const defaultView = strings.viewTypes.find(v => v.id === config.defaultView);
            if (defaultView) viewType = defaultView;
        }

        if (config.defaultType) {
            const defaultType = strings.songTypes.find(t => t.id === config.defaultType);
            if (defaultType) allFilters.songType = defaultType;
        }

        if (config.showColumns) {
            selectedColumns = strings.columns.filter(c => config.showColumns.includes(c.key) && c.displayed)
        }

        if (config.itemsPerPage) {
            itemsPerPage = config.itemsPerPage;
        }

        await generateSortTypes();

        users = (await getAllActivePlayers(country))
                .reduce((cum, player) => {
                    if (player && player.scores) {
                        let {id, name, avatar} = player;

                        cum.push({id, label: name, avatar});
                    }
                    return cum;
                }, [])
                .sort((a, b) => a.label.toLowerCase().replace(/[^a-zAZ]/g, '').localeCompare(b.label.toLowerCase().replace(/[^a-zAZ]/g, '')))
                .filter(u => u.id !== playerId)
        ;

        const forceRefresh = async (nodeId, player) => {
            // return if not relevant for current dataset
            if (!player || !player.id || !playerId || ![playerId].concat(snipedIds).includes(player.id)) return;

            await generateRefreshTag(nodeId !== nodeSync.getId());
        }

        await updateViewUpdatesConfig();

        const playerScoresUpdatedUnsubscriber = eventBus.on('player-scores-updated', async ({nodeId, player}) => await forceRefresh(nodeId, player));
        const configChangedUnsubscriber = eventBus.on('config-changed', updateViewUpdatesConfig);

        initialized = true;

        return () => {
            playerScoresUpdatedUnsubscriber();
            configChangedUnsubscriber();
        }
    });

    const getCachedTotalPlayerPp = memoize(getTotalUserPp);
    const getScoreWithNewPp = async (playerId, newSongPp) => {
        return await getCachedTotalPlayerPp(playerId, newSongPp) - await getCachedTotalPlayerPp(playerId);
    }
    const getCachedScoreWithNewPp = memoize(getScoreWithNewPp);
    const getSeriesSong = (leaderboardId, series) => series && series.scores && series.scores[leaderboardId] ? series.scores[leaderboardId] : null;
    const findBestInSeries = (series, leaderboardId, key = 'score') => {
        let bestIdx = null;
        let bestValue = null;

        let playedByCnt = 0;
        series.forEach((s, idx) => {
            const value = s.scores[leaderboardId] && s.scores[leaderboardId][key] ? s.scores[leaderboardId][key] : null
            if (value) {
                playedByCnt++;

                if (!bestValue || value > bestValue) {
                    bestValue = value;
                    bestIdx = idx;
                }
            }
        })

        return {bestIdx, bestValue, playedByCnt};
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
    const playerIsTheBest = (leaderboardId, series) => getSeriesSong(leaderboardId, series) && !!getSeriesSong(leaderboardId, series).best
    const playerIsNotTheBest = (leaderboardId, series, playerHasScore = false) => (!getSeriesSong(leaderboardId, series) || !getSeriesSong(leaderboardId, series).best) && (!playerHasScore || !!getSeriesSong(leaderboardId, series))
    const nobodyPlayedItYet = song => song.bestIdx === null;

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
            if (data && data.twitch && data.twitch.users && data.twitch.users[playerId] && data.twitch.users[playerId].videos) {
                const songStarted = addToDate(timeset, -songLength * 1000)
                const video = data.twitch.users[playerId].videos
                        .map(v => Object.assign({}, v, {
                            created_at: dateFromString(v.created_at),
                            ended_at: addToDate(dateFromString(v.created_at), durationToMillis(v.duration))
                        }))
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
                getObjectFromArrayByKey(strings.columns, 'pp').displayed = false;
                getObjectFromArrayByKey(strings.columns, 'weightedPp').displayed = false;
                getObjectFromArrayByKey(strings.columns, 'diffPp').displayed = false;

                selectedColumns = strings.columns.filter(c => c.displayed && selectedColumns.includes(c))

                await generateSortTypes();
                break;

            case 'all':
                getObjectFromArrayByKey(strings.columns, 'pp').displayed = true;
                getObjectFromArrayByKey(strings.columns, 'weightedPp').displayed = true;
                getObjectFromArrayByKey(strings.columns, 'diffPp').displayed = false;

                selectedColumns = strings.columns.filter(c => c.displayed && selectedColumns.includes(c))

                allFilters.starsFilter.from = 0;

                await generateSortTypes();
                break;

            case 'sniper_mode':
                getObjectFromArrayByKey(strings.columns, 'pp').displayed = true;
                getObjectFromArrayByKey(strings.columns, 'weightedPp').displayed = true;
                getObjectFromArrayByKey(strings.columns, 'diffPp').displayed = true;

                selectedColumns = strings.columns.filter(c => c.displayed && (selectedColumns.includes(c) || ['diffPp', 'pp'].includes(c.key)))

                allFilters.starsFilter.from = allFilters.starsFilter.from > minStarsForSniper ? allFilters.starsFilter.from : round(minStarsForSniper, 1);

                if (!snipedIds.length) snipedIds = [...sniperModeIds];

                await generateSortTypes();
                break;

            case 'rankeds':
            default:
                getObjectFromArrayByKey(strings.columns, 'pp').displayed = true;
                getObjectFromArrayByKey(strings.columns, 'weightedPp').displayed = true;
                getObjectFromArrayByKey(strings.columns, 'diffPp').displayed = false;

                selectedColumns = strings.columns.filter(c => c.displayed && (selectedColumns.includes(c) || ['pp'].includes(c.key)))

                allFilters.starsFilter.from = 0;

                await generateSortTypes();
                break;
        }

        currentPage = 0;

        // force refresh
        strings.columns = strings.columns.splice(0);

        forceFiltersChanged()
    }

    function setColumnsSuffixes(columns, viewType) {
        columns.forEach(col => {
            if (["bpm", "njs", "nps"].includes(col.key)) {
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

    const getSortValue = (song, playersSeries, filters) => {
        switch (filters.sortBy.type) {
            case 'song':
                return song[filters.sortBy.field]

            case 'series':
            default:
                const sortIdx = filters.sortBy.subtype;
                const field = filters.sortBy.field;

                return playersSeries[sortIdx] && playersSeries[sortIdx].scores && playersSeries[sortIdx].scores[song.leaderboardId] ? playersSeries[sortIdx].scores[song.leaderboardId][field] : null
        }
    }

    async function calculate(playerId, snipedIds, filters, forceRefresh) {
        calculating = true;

        currentPage = 0;

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
                        const shouldCalculateTotalPp = filters.songType.id === 'sniper_mode';
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
            RANKED.forEach(id => {
                if (allPlayedSongsObj[id]) allRankeds = {...allRankeds, [id]: {...allPlayedSongsObj[id], stars: 0.01}};
            })
            UNRANKED.forEach(id => {
                delete allRankeds[id];
            })

            const filteredSongs = (await Promise.all((
                    filters.songType.id === 'sniper_mode'
                            ? Object.values(Object.assign(
                            convertArrayToObjectByKey(allPlayedSongs, 'leaderboardId'),
                            allRankeds
                            ))
                            : (filters.songType.id === 'rankeds_unplayed'
                                    ? Object.values(allRankeds).filter(r => !playersSeries[0].scores[r.leaderboardId])
                                    : allPlayedSongs.map(s => allRankeds[s.leaderboardId] && !s.stars ? Object.assign({}, s, {stars: allRankeds[s.leaderboardId].stars}) : s)
                            )
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

                        const {bestIdx, playedByCnt} = findBestInSeries(playersSeries, s.leaderboardId, 'score');
                        s.playedByCnt = playedByCnt;

                        if (null !== bestIdx) {
                            const bestSeries = playersSeries[bestIdx].scores[s.leaderboardId];

                            if (bestSeries) {
                                bestSeries.best = true;
                                bestSeries.playedByCnt = playedByCnt;

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
                        }

                        if (filters.songType.id === 'sniper_mode') {
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
                            (
                                    filters.songType.id === 'sniper_mode' &&
                                    (playerIsNotTheBest(s.leaderboardId, playersSeries[compareToIdx]) && bestSeriesGivesAtLeastMinPpDiff(s, filters.minPpDiff))
                            ) ||

                            (filters.songType.id !== 'sniper_mode' && (!snipedIds || !snipedIds.length)) ||

                            (
                                    'sniper_mode' !== allFilters.songType.id &&
                                    (
                                            allFilters.songTypeOption.id === 'all' ||
                                            (allFilters.songTypeOption.id === 'not_best' && playerIsNotTheBest(s.leaderboardId, playersSeries[compareToIdx], true) && s.playedByCnt >= 2) ||
                                            (allFilters.songTypeOption.id === 'best' && playerIsTheBest(s.leaderboardId, playersSeries[compareToIdx]) && s.playedByCnt >= 2)
                                    )
                            )
                    )

                    .sort((songA, songB) => {
                        const a = getSortValue(songA, playersSeries, filters);
                        const b = getSortValue(songB, playersSeries, filters);

                        return filters.sortOrder.order === 'asc' ? a - b : b - a;
                    })

            let bestTotalRealPp = playersSeries[compareToIdx].totalPp
            let bestTotalPp = playersSeries[compareToIdx].totalPp;

            if (filters.songType.id === 'sniper_mode') {
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

    async function exportPlaylist() {
        const allPlayedSongs = Object.values(Object.values(await getPlayers()).reduce((cum, u) => ({...cum, ...u.scores}), {}));
        const songs = allPlayedSongs.filter(s => checkedSongs.includes(s.leaderboardId)).map(s => ({hash: s.id}));
        const bloodTrailImg = (await import('../../../resource/img/bloodtrail-playlist.png')).default;
        const playlist = {
            playlistTitle: "SSPL playlist",
            playlistAuthor: "https://github.com/motzel/ScoreSaberCountryLeaderboard",
            playlistDescription: "",
            image: bloodTrailImg,
            songs
        }
        downloadJson("playlist-" + (new Date()).toISOString().replace(/:/g, '_') + '.json', JSON.stringify(playlist));
    }

    let comparisionModified = false;

    async function onPlayerSelected(e, seriesIdx) {
        if (snipedIds[seriesIdx - 1]) {
            snipedIds[seriesIdx - 1] = e.detail.value.id;

            await generateSortTypes();

            comparisionModified = true;
        }
    }

    async function onPlayerRemove(seriesIdx) {
        if (snipedIds[seriesIdx - 1]) {
            snipedIds = snipedIds.filter((s, idx) => idx !== seriesIdx - 1);

            await generateSortTypes();

            comparisionModified = true;
        }
    }

    async function onAddPlayerToCompare() {
        if (!users.length) return;

        snipedIds = [...snipedIds, users.filter(u => !snipedIds.includes(u.id))[0].id];

        await generateSortTypes();

        comparisionModified = true;
    }

    async function onSaveComparision() {
        const data = await getCacheAndConvertIfNeeded();
        const songBrowserConfig = await getConfig('songBrowser');
        if (songBrowserConfig) {
            songBrowserConfig.compareTo = snipedIds;

            await setCache(data);

            comparisionModified = false;
        }
    }

    function addToPlaylist(leaderboardIds) {
        checkedSongs = [...new Set(checkedSongs.concat(leaderboardIds))];
    }

    function toggleChecked(leaderboardId) {
        if (checkedSongs.includes(leaderboardId)) checkedSongs = checkedSongs.filter(cs => cs !== leaderboardId);
        else addToPlaylist([leaderboardId]);
    }

    async function checkAll() {
        addToPlaylist((await calcPromised).songs.map(s => s.leaderboardId));
    }

    async function checkPage() {
        addToPlaylist(songsPage.songs.map(s => s.leaderboardId));
    }

    function checkNone() {
        checkedSongs = [];
    }

    function onPageChanged() {
        storeCurrentFirstIdentifier();
    }

    $: shownColumns = strings.columns.filter(c => c.displayed)
    $: selectedSongCols = getSelectedCols(selectedColumns, viewType, 'song')
    $: selectedSeriesCols = getSelectedCols(selectedColumns, viewType, 'series')
    $: selectedAdditionalCols = getSelectedCols(selectedColumns, viewType, 'additional')
    $: shouldCalculateTotalPp = !!getObjectFromArrayByKey(selectedColumns, 'diffPp') && 'sniper_mode' === allFilters.songType.id
    $: calcPromised = initialized ? calculate(playerId, snipedIds, allFilters, refreshTag) : null;
    $: pagedPromised = promiseGetPage(calcPromised, currentPage, itemsPerPage)
    $: comparePossible = users.length && snipedIds.length < 3;
    $: {
        restorePage(refreshTag)
    }
    $: {
        translateAllStrings($_);
    }
</script>

{#if initialized}
    <div class="filters">
        <div>
            <header>{$_.songBrowser.typeHeader}</header>
            <Select bind:value={allFilters.songType} items={strings.songTypes} on:change={onSongTypeChange}
                    bind:option={allFilters.songTypeOption} optionItems={snipedIds && snipedIds.length && 'sniper_mode' !== allFilters.songType.id ? strings.songTypeOptions : []}
            />
        </div>

        <div class="filter-name">
            <header>{$_.songBrowser.songHeader}</header>
            <input type="text" placeholder={$_.songBrowser.songPlaceholder} on:input={onFilterNameChange}/>
        </div>

        <div class="filter-diff-pp"
             style="display: {allFilters.songType.id === 'sniper_mode' ? 'flex' : 'none'}">
            <header>{$_.songBrowser.fields.diffPp}</header>
            <Range value={allFilters.minPpDiff} min={1} max={20} step={0.1} suffix="pp" inline={true}
                   on:change={onFilterMinPlusPpChanged}/>
        </div>

        <div style="display: { allFilters.songType.id !== 'unrankeds' ? 'flex' : 'none'}">
            <header>{$_.songBrowser.fields.stars}</header>
            <MultiRange value={allFilters.starsFilter}
                        min={allFilters.songType.id === 'sniper_mode' ? round(minStarsForSniper,1) : 0}
                        max={maxStars} step={0.1} suffix="*" digits={1} disableDirectEditing={true}
                        on:change={onFilterStarsChange}/>
        </div>

        <div>
            <header>{$_.songBrowser.viewHeader}</header>
            <Select bind:value={viewType} items={strings.viewTypes}/>
        </div>

        <div class="columns">
            <div>
                <header>{$_.songBrowser.showHeader}</header>

                <Select multiple bind:value={selectedColumns} bind:items={shownColumns} noSelected={$_.common.nothingSelected}/>
            </div>
        </div>

        <div>
            <header>{$_.songBrowser.sortingHeader}</header>
            <Select bind:value={allFilters.sortBy} items={sortTypes} bind:option={allFilters.sortOrder} optionItems={strings.sortOrders}/>
        </div>

        <div class="player-compare-btns">
            <header></header>
            <Button iconFa="fas fa-balance-scale" label={$_.songBrowser.compare.label} title={$_.songBrowser.compare.add} on:click={onAddPlayerToCompare} disabled={!comparePossible} />
            {#if comparisionModified}
                <Button iconFa="fas fa-save" type="primary" label={$_.common.save} title={$_.songBrowser.compare.saveAsDefault} on:click={onSaveComparision} />
            {/if}
        </div>
    </div>

    {#await pagedPromised}
        <div class="info">
            <h3>{$_.songBrowser.transformingTheUniverse}</h3>
        </div>
    {:then calc}
        {#if songsPage.songs.length}
            {#if viewType.id === 'cards'}
            <div class="columns card-view is-multiline">
                {#each songsPage.songs as song (song.leaderboardId)}
                    <div class={"song-card column is-full is-half-tablet " + (songsPage.series > 1 ? "is-one-third-fullhd" : "is-one-quarter-widescreen is-one-third-desktop")}>
                        <Card leaderboardId={song.leaderboardId} hash={song.id} padding="1em" iconSize="0.875em"
                              songName={song.name} songAuthorName={song.songAuthor} levelAuthorName={song.levelAuthor}
                              diffInfo={song.diff}
                              stars={selectedSongCols.find(c=>c.key==='stars') ? song.stars : (song.stars ? 0 : null)}
                              maxPp={selectedSongCols.find(c=>c.key==='maxPp') ? song.maxPp : null}
                              duration={selectedSongCols.find(c=>c.key==='length') ? song.length : null}
                              bpm={selectedSongCols.find(c=>c.key==='bpm') ? song.bpm : null}
                              njs={selectedSongCols.find(c=>c.key==='njs') ? song.njs : null}
                              nps={selectedSongCols.find(c=>c.key==='nps') ? song.nps : null}
                              twitchUrl={song.video && song.video.url && shownIcons.includes('twitch') ? song.video.url : null}
                              showIcons={selectedAdditionalCols.length > 0}
                        >
                            <div slot="before-header" class="check">
                                {#if showCheckboxes}
                                    <Checkbox checked={checkedSongs.includes(song.leaderboardId)} on:click={toggleChecked(song.leaderboardId)} />
                                {/if}
                            </div>

                            <div class="scores columns is-multiline is-mobile" class:bigger={songsPage.series.length === 1} slot="main">
                                {#each songsPage.series as series, sIdx (series.id)}
                                <div class="column">
                                    <div class="score" class:best={getScoreValueByKey(series, song, 'best') && songsPage.series.length > 1}>
                                        {#if songsPage.series.length > 1}
                                            <div class="player-name">
                                            {#if sIdx > 0}
                                                <Select items={users} value={users.find(u => u.id === series.id)} right={true} on:change={(e) => onPlayerSelected(e,sIdx)}></Select>
                                                <i class="fas fa-times player-remove" title={$_.songBrowser.compare.remove} on:click={() => onPlayerRemove(sIdx)}></i>
                                            {:else}
                                                <strong>{series.name}</strong>
                                            {/if}
                                            </div>
                                        {/if}
                                        {#if getScoreValueByKey(series, song, 'score')}
                                            {#each selectedSeriesCols as col,idx (col.key)}{#if col.key !== 'diffPp' || series.id !== playerId}
                                                {#if col.key === 'timeset'}
                                                    <strong class={'compact-' + col.key + '-val'}>
                                                        <FormattedDate date={getScoreValueByKey(series, song, col.key)}
                                                                       {...col.valueProps}/>
                                                    </strong>
                                                {:else}
                                                    {#if getScoreValueByKey(series, song, col.key)}
                                                        <div>
                                                            {#if col.compactLabel}{col.compactLabel}{'acc' === col.key && getScoreValueByKey(series, song, 'mods') ? ' ('+getScoreValueByKey(series, song, 'mods')+')' : ''}
                                                            {/if}
                                                            <strong class={'compact-' + col.key + '-val'}>
                                                                <Value value={getScoreValueByKey(series, song, col.key)}
                                                                       prevValue={!!getObjectFromArrayByKey(selectedColumns, 'diff') && (allFilters.songType.id !== 'sniper_mode' || series.id !== playerId) ? getScoreValueByKey(series, song, 'prev' + capitalize(col.key)) : null}
                                                                       prevLabel={series.prevLabel} inline={true}
                                                                       {...col.valueProps}
                                                                />
                                                            </strong>
                                                        </div>
                                                    {/if}
                                                    {#if col.key === 'pp' && allFilters.songType.id !== 'sniper_mode'}
                                                        <WhatIfPp leaderboardId={song.leaderboardId}
                                                                  pp={getScoreValueByKey(series, song, col.key)}/>{/if}
                                                {/if}
                                            {/if}{/each}
                                        {:else}
                                            <span class="dec">{$_.songBrowser.noScore}</span>
                                        {/if}
                                    </div>
                                </div>
                                {/each}
                            </div>
                        </Card>
                    </div>
                {/each}
            </div>
            {:else}

            <table class="ranking sspl">
                {#if viewType.id !== 'compact' || songsPage.series.length > 1}
                    <thead>
                    <tr>
                        {#if showCheckboxes}<th class="check" rowspan={viewType.id === 'compact' ? 1 : 2}></th>{/if}
                        <th class="song" rowspan={viewType.id === 'compact' ? 1 : 2} colspan="2">{$_.songBrowser.songHeader}</th>

                        {#each selectedSongCols as col,idx (col.key)}
                            <th class={"left middle " + col.key}
                                rowspan={viewType.id === 'compact' ? 1 : 2}>{col.name}</th>
                        {/each}

                        {#each songsPage.series as series, sIdx (series.id)}
                            {#if viewType.id === 'compact'}
                                <th class="left down player-sel">
                                    {#if sIdx > 0}
                                        <Select items={users} value={users.find(u => u.id === series.id)} right={true} on:change={(e) => onPlayerSelected(e,sIdx)} />
                                        <i class="fas fa-times player-remove" title={$_.songBrowser.compare.remove} on:click={() => onPlayerRemove(sIdx)}></i>
                                    {:else}
                                        {series.name}
                                    {/if}
                                </th>
                            {:else}
                                {#if selectedSeriesCols.length > 0 && !(selectedSeriesCols.length === 1 && series.id === playerId && !!getObjectFromArrayByKey(selectedColumns, 'diffPp'))}
                                    <th colspan={series.id !== playerId ? selectedSeriesCols.length : selectedSeriesCols.length - (!!getObjectFromArrayByKey(selectedColumns, 'diffPp') ? 1 : 0)}
                                        class="series left player-sel">
                                        {#if sIdx > 0}
                                            <Select items={users} value={users.find(u => u.id === series.id)} right={true} on:change={(e) => onPlayerSelected(e,sIdx)} />
                                            <i class="fas fa-times player-remove" title="Usuń z porównania" on:click={() => onPlayerRemove(sIdx)}></i>
                                        {:else}
                                            {series.name}
                                        {/if}
                                    </th>
                                {/if}
                            {/if}
                        {/each}

                        {#each selectedAdditionalCols as col,idx (col.key)}
                            <th class={"left " + col.key} rowspan={viewType.id === 'compact' ? 1 : 2}>{col.name}</th>
                        {/each}
                    </tr>

                    {#if viewType.id !== 'compact'}
                        <tr>
                            {#each songsPage.series as series (series.id)}
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
                    <tr class="item" class:opened={!!song.leaderboardOpened}>
                        {#if showCheckboxes}
                            <td class="check">
                                <Checkbox checked={checkedSongs.includes(song.leaderboardId)} on:click={toggleChecked(song.leaderboardId)} />
                            </td>
                        {/if}

                        <td class="diff">
                            <Difficulty diff={song.diff} useShortName={true} reverseColors={true}/>
                        </td>

                        <td class="song">
                            <div class="flex-start flex-justify-between">
                                <Song song={song}>
                                    <figure>
                                        <img src="/imports/images/songs/{song.id}.png"/>
                                        <div class="songinfo">
                                            <span class="name">{song.name}</span>
                                            <div class="author">{song.songAuthor} <small>{song.levelAuthor}</small>
                                            </div>
                                        </div>
                                    </figure>
                                </Song>

                                <Button type="text" iconFa={song.leaderboardOpened ? "fas fa-chevron-down" : "fas fa-chevron-right"} on:click={() => song.leaderboardOpened = !song.leaderboardOpened} />
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

                        {#each songsPage.series as series (series.id)}
                            {#if viewType.id === 'compact'}
                                <td class="left compact series-{songsPage.series.length}"
                                    class:with-cols={selectedSongCols.length > 0}
                                    class:best={getScoreValueByKey(series, song, 'best') && songsPage.series.length > 1}>
                                    {#if getScoreValueByKey(series, song, 'score')}
                                        {#each selectedSeriesCols as col,idx (col.key)}{#if col.key !== 'diffPp' || series.id !== playerId}
                                            {#if col.key === 'timeset'}
                                                <strong class={'compact-' + col.key + '-val'}>
                                                    <FormattedDate date={getScoreValueByKey(series, song, col.key)}
                                                          {...col.valueProps}/>
                                                </strong>
                                            {:else}
                                                {#if getScoreValueByKey(series, song, col.key)}
                                                    <div>
                                                        {#if col.compactLabel}{col.compactLabel}{'acc' === col.key && getScoreValueByKey(series, song, 'mods') ? ' ('+getScoreValueByKey(series, song, 'mods')+')' : ''}
                                                        {/if}
                                                        <strong class={'compact-' + col.key + '-val'}>
                                                            <Value value={getScoreValueByKey(series, song, col.key)}
                                                                   prevValue={!!getObjectFromArrayByKey(selectedColumns, 'diff') && (allFilters.songType.id !== 'sniper_mode' || series.id !== playerId) ? getScoreValueByKey(series, song, 'prev' + capitalize(col.key)) : null}
                                                                   prevLabel={series.prevLabel} inline={true}
                                                                   {...col.valueProps}
                                                            />
                                                        </strong>
                                                    </div>
                                                {/if}
                                                {#if col.key === 'pp' && allFilters.songType.id !== 'sniper_mode'}
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
                                            <FormattedDate date={getScoreValueByKey(series, song, col.key)} {...col.valueProps}/>
                                        {:else}
                                            <Value value={getScoreValueByKey(series, song, col.key)}
                                                   prevValue={!!getObjectFromArrayByKey(selectedColumns, 'diff') && (allFilters.songType.id !== 'sniper_mode' || series.id !== playerId) ? getScoreValueByKey(series, song, 'prev' + capitalize(col.key)) : null}
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
                                    {#if shownIcons.includes('bsr')}
                                        <Button iconFa="fas fa-exclamation" title={$_.songBrowser.icons.bsrTooltip}
                                                on:click={copyToClipboard('!bsr ' + song.key)}/>
                                    {/if}
                                    {#if shownIcons.includes('bs')}
                                        <a href="https://beatsaver.com/beatmap/{song.key}" target="_blank">
                                            <Button icon={beatSaverSvg} title={$_.songBrowser.icons.beatSaverTooltip}/>
                                        </a>
                                    {/if}

                                    {#if shownIcons.includes('oneclick')}
                                        <a href="beatsaver://{song.key}">
                                            <Button iconFa="far fa-hand-pointer" title={$_.songBrowser.icons.oneclick}/>
                                        </a>
                                    {/if}

                                    {#if shownIcons.includes('preview')}
                                        <a href="https://skystudioapps.com/bs-viewer/?id={song.key}" target="_blank">
                                            <Button iconFa="fa fa-play-circle" title={$_.songBrowser.icons.preview}/>
                                        </a>
                                    {/if}
                                {/if}

                                {#if song.video && song.video.url && shownIcons.includes('twitch')}
                                    <a class="video" href="{song.video.url}" target="_blank">
                                        <Button iconFa="fab fa-twitch" type="twitch" title={$_.songBrowser.icons.twitchTooltip}/>
                                    </a>
                                {/if}
                            </td>
                        {/each}
                    </tr>
                    {#if !!song.leaderboardOpened}
                    <tr class="leaderboard" class:opened={!!song.leaderboardOpened}><td colspan={2 + selectedSongCols.length + songsPage.series.length * (viewType.id === 'compact' ? 1 : selectedSeriesCols.length) + selectedAdditionalCols.length + (showCheckboxes ? 1 : 0)}>
                        <Leaderboard leaderboardId={song.leaderboardId} tableOnly={true} showDiff={!!getObjectFromArrayByKey(selectedColumns, 'diff')} bgLeft="-2rem" bgTop="-1rem" />
                    </td></tr>
                    {/if}
                {/each}
                </tbody>

                {#if shouldCalculateTotalPp}
                    <tfoot>
                    <tr>
                        {#if showCheckboxes}<th class="check" rowspan={songsPage.series.length > 2 ? 2 : 1}></th>{/if}

                        <th class="song" rowspan={songsPage.series.length > 2 ? 2 : 1}
                            colspan={2 + selectedSongCols.length}>
                            Razem dla {songsPage.series[0].name}</th>
                        {#each songsPage.series as series, idx (series.id)}
                            {#if viewType.id === 'tabular'}
                                {#if selectedSeriesCols.length > 0 && !(selectedSeriesCols.length === 1 && series.id === playerId && !!getObjectFromArrayByKey(selectedColumns, 'diffPp'))}
                                    <th class="left"
                                        rowspan={series.id !== playerId ? 1 : (songsPage.series.length > 2 ? 2 : 1)}
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
                            <th class="left"
                                colspan={selectedSeriesCols.length * (songsPage.series.length - 1) + selectedAdditionalCols.length}>
                                <Value value={songsPage.bestTotalRealPp}
                                       prevValue={!!getObjectFromArrayByKey(selectedColumns, 'diff') ? songsPage.series[0].totalPp : null}
                                       suffix="pp"/>
                            </th>
                        {/if}
                    </tr>
                    </tfoot>
                {/if}
            </table>
            {/if}
        {:else}
            <div class="info">
                <h3>{$_.songBrowser.noData.title}</h3>
                <p>{$_.songBrowser.noData.info}</p>
            </div>
        {/if}
    {/await}

    {#if songsPage.songs && songsPage.songs.length}
        <Pager bind:currentPage={currentPage} bind:itemsPerPage={itemsPerPage} totalItems={pagerTotal}
               itemsPerPageValues={allItemsPerPage} hide={calculating} on:page-changed={onPageChanged}/>
    {/if}

    {#if !calculating}
        <div class="actions">
            <span class="button-group">
                <Button iconFa={"fas fa-eye" + (showCheckboxes ? '-slash': '')} title={showCheckboxes ? $_.songBrowser.playlist.hideChecks : $_.songBrowser.playlist.showChecks} label={checkedSongs.length ? checkedSongs.length : ''} on:click={() => showCheckboxes = !showCheckboxes}/>
                <Button iconFa="fas fa-check" title={$_.songBrowser.playlist.checkAll} on:click={checkAll}/>
                <Button iconFa="far fa-file-alt" title={$_.songBrowser.playlist.checkPage} on:click={checkPage}/>
                <Button iconFa="fas fa-broom" title={$_.songBrowser.playlist.clear} disabled={!checkedSongs.length} on:click={checkNone}/>
                <Button label={$_.songBrowser.playlist.label} iconFa="fas fa-music" title={$_.songBrowser.playlist.export} disabled={!checkedSongs.length} on:click={exportPlaylist}/>
            </span>

            <span class="button-group">
                <Button label={$_.songBrowser.csv.label} iconFa="fas fa-download" title={$_.songBrowser.csv.export} on:click={exportCsv}/>
            </span>
        </div>
    {/if}
{/if}

<style>
    .filters .columns {
        max-width: 15rem;
    }

    .card-view {
        font-size: .8rem;
    }

    .card-view.columns {
        margin-left: .5rem;
        margin-right: .5rem;
        margin-top: .5rem;
    }

    .card-view > .column {
        padding: .5rem;
    }

    .card-view .column > .song-card {
        display: flex;
        position: relative;
        min-height: 100%;
        width: 100%;
    }

    .card-view .column > .song-card :global(.box) {
        width: 100%;
    }

    .card-view .check {
        position: absolute;
        top: .5em;
        right: .5em;
    }

    .card-view .scores.bigger {
        font-size: .875rem;
    }

    .card-view .scores .column:nth-child(2n) {
        padding: .75rem .75rem .75rem .5rem;
    }

    .card-view .scores .column:nth-child(2n+1) {
        padding: .75rem .5rem .75rem .75rem;
    }

    .card-view .score {
        position: relative;
        min-width: 6.75rem;
    }

    .card-view .score :global(.dropdown-trigger button) {
        background: transparent;
        font-weight: bold;
    }

    .card-view .score.best .player-name strong, .card-view .score.best :global(.dropdown-trigger button) {
        color: var(--increase)!important;
    }

    .card-view .score :global(.what-if) {
        top: 2em;
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
        border-color: var(--textColor) !important;
    }

    th.check, td.check {
        width: 1.25rem;
    }

    thead th {
        text-align: center;
        vertical-align: bottom !important;
        border-bottom-width: 2px;
    }

    thead th.player-sel {
        max-width: 12rem;
        position: relative;
    }

    :global(thead th.player-sel .multi-select .dropdown, thead th.player-sel .multi-select .dropdown-trigger) {
        width: 100%;
    }

    thead th.player-sel .player-remove, .card-view .score .player-remove {
        display: none;
        position: absolute;
        top: .125rem;
        right: .125rem;
        color: var(--decrease, red);
        cursor: pointer;
    }

    thead th.player-sel:hover .player-remove, .card-view .score:hover .player-remove {
        display: inline;
    }
    .card-view .score:hover .player-remove {
        top: 0;
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
        font-size: .95rem;
        font-weight: 500;
    }

    tbody td.song .songinfo {
        color: var(--alternate);
    }

    tbody td.song .songinfo small {
        font-size: 0.75em;
        color: var(--ppColour);
    }

    tbody td.icons {
        width: 4.9rem;
        text-align: right;
    }

    :global(tbody td.icons button) {
        margin-bottom: .25em !important;
    }

    tbody tr.item.opened td {
        border-bottom-style: dashed;
    }

    tbody tr.leaderboard {
        display: none;
    }

    tbody tr.leaderboard.opened {
        display: table-row;
    }

    tbody tr.leaderboard td {
        padding: 1rem!important;
    }

    table.ranking tbody tr.leaderboard:hover {
        background-color: inherit!important;
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
        background: var(--highlight);
    }

    tbody td.compact {
        width: 12rem;
        text-align: center;
    }

    tbody td.compact.left.series-1:not(.with-cols) {
        border-left: none;
    }

    .compact-timeset-val {
        border-bottom: 1px dashed var(--textColor);
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
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        min-height: 4rem;
        margin: 1.5rem 0 0 1.5rem;
    }

    .filters header {
        display: block;
        text-align: center;
        color: #888;
    }

    :global(.filters input) {
        font-size: 1rem;
        color: var(--textColor);
        background: var(--foreground);
        border: none;
        border-bottom: 1px solid var(--textColor);
    }

    .filters .filter-name {
        min-width: 12rem;
    }

    .filters .filter-name input {
        width: 100%;
    }

    :global(.filters .filter-diff-pp > div) {
        position: relative;
        top: .5em;
    }

    .player-compare-btns {
        font-size: .875rem;
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
        margin-top: 1rem;
        font-size: .75rem;
    }

    .button-group {
        display: inline-block;
        margin-right: 1rem;
    }
    .button-group:last-of-type {
        margin-right: 0;
    }
</style>