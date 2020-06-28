<script>
    import {
        findRawPp, getEstimatedAcc,
        getAllRankedsWithUserScores,
        getTotalUserPp,
        PP_PER_STAR,
        ppFromScore
    } from "../../../scoresaber/pp";
    import {getRankedMaps} from "../../../scoresaber/rankeds";
    import {delay} from "../../../network/fetch";
    import {getMainUserId} from "../../../temp";
    import {getCacheAndConvertIfNeeded} from "../../../store";
    import {dateFromString} from "../../../utils/date";
    import {convertArrayToObjectByKey} from "../../../utils/js";
    import Difficulty from "../Common/Difficulty.svelte";
    import Value from "../Common/Value.svelte";
    import {
        getPlayerRankedScores,
        getPlayerScores,
        getPlayerSongScore
    } from "../../../scoresaber/players";
    import memoize from '../../../utils/memoize';
    import Song from "./Song.svelte";
    import Pager from "../Common/Pager.svelte";
    import Range from "../Common/Range.svelte";

    export let playerId = getMainUserId();
    export let snipedIds = [];
    export let minPpPerMap = 1;
    export let withEstimate = true;

    let minPpDiff = 1;

    let currentPage = 0;
    let itemsPerPage = 10;
    let pagerTotal = 0;

    let sortBy = 'best';
    let showColumns = {acc: true, pp: true, diffPp: true, diff: true}

    const getAllScoresByType = async (playerId, rankedOnly = true) => {
        return rankedOnly ? await getPlayerRankedScores(playerId) : await getPlayerScores();
    }
    const getCachedAllScoresByType = memoize(getAllScoresByType);
    const getCachedTotalPlayerPp = memoize(getTotalUserPp);

    const getMinStars = async (playerId, boundary = minPpPerMap, maxAcc = 95) => {
        const playerPpScores = (await getCachedAllScoresByType(playerId, true))
                .sort((a, b) => b.pp - a.pp)
                .map(s => s.pp);

        const onePpBoundary = findRawPp(playerPpScores, boundary);

        return onePpBoundary / PP_PER_STAR / ppFromScore(maxAcc);
    }
    const getCachedMinStars = memoize(getMinStars);

    const getCachedPlayerSongScore = memoize(getPlayerSongScore);
    const getScoreWithNewPp = async (playerId, newSongPp) => {
        return await getCachedTotalPlayerPp(playerId, newSongPp) - await getCachedTotalPlayerPp(playerId);
    }
    const getCachedScoreWithNewPp = memoize(getScoreWithNewPp);
    const getSeriesSongScore = async (playerId, leaderboardId, withDiffToPlayerId = null) => {
        const score = await getCachedPlayerSongScore(playerId, leaderboardId);
        const prevScore = withDiffToPlayerId ? await getCachedPlayerSongScore(withDiffToPlayerId, leaderboardId) : null;
        if (score) {
            const percent = score.maxScoreEx ? score.score / score.maxScoreEx : null;
            const prevPercent = prevScore && prevScore.maxScoreEx ? prevScore.score / prevScore.maxScoreEx : null

            return {
                leaderboardId,
                acc: percent * 100,
                prevAcc: prevPercent ? prevPercent * 100 : null,
                pp: score.pp,
                prevPp: prevScore ? prevScore.pp : null,
                timeset: dateFromString(score.timeset),
                diff: withDiffToPlayerId ? await getCachedScoreWithNewPp(withDiffToPlayerId, {[leaderboardId]: {pp: score.pp}}) : null,
                best: false
            }
        } else {
            return {leaderboardId, acc: null, pp: null, timeset: null, diff: null}
        }
    }
    const getPlayerSongEstimate = async (playerId, leaderboardId, stars) => {
        const userScore = await getCachedSeriesSongScore(playerId, leaderboardId, null)
        const userRankedScores = await getAllRankedsWithUserScores(playerId);

        const userEstimatedAcc = getEstimatedAcc(stars, userRankedScores) * 100;
        const useEstimated = !userScore.acc || userScore.acc < userEstimatedAcc
        const pp = useEstimated ? stars * PP_PER_STAR * ppFromScore(userEstimatedAcc) : userScore.pp;

        return {
            leaderboardId,
            acc: useEstimated ? userEstimatedAcc : userScore.acc,
            prevAcc: userScore.acc,
            pp,
            prevPp: userScore.pp,
            timeset: !useEstimated ? userScore.timeset : null,
            diff: useEstimated
                    ? await getCachedScoreWithNewPp(playerId, {[leaderboardId]: {pp}})
                    : 0,
            best: false
        }
    }
    const getCachedSeriesSongScore = memoize(getSeriesSongScore);
    const getCachedPlayerSongEstimate = memoize(getPlayerSongEstimate);
    const getSeries = async (playerId, songs, comparePlayerId = null, estimated = true, estimateName = 'Potencjał') => {
        const data = await getCacheAndConvertIfNeeded();

        return {
            id: estimated ? null : playerId,
            estimateId: estimated ? playerId : null,
            name: estimated ? estimateName : (data.users && data.users[playerId] ? data.users[playerId].name : null),
            totalPp: 0,//estimated ? 0 : await getCachedTotalPlayerPp(playerId),
            prevTotalPp: 0,//comparePlayerId ? await getCachedTotalPlayerPp(comparePlayerId) : null,
            scores: convertArrayToObjectByKey(await Promise.all(songs.map(async song => estimated
                    ? await getCachedPlayerSongEstimate(playerId, song.leaderboardId, song.stars)
                    : await getCachedSeriesSongScore(playerId, song.leaderboardId, comparePlayerId)
            )), 'leaderboardId')
        }
    }
    const getAllSeries = async (playersIds, songs, comparePlayerId = null, withEstimate = [playerId], estimateName = 'Potencjał') => {
        return Promise.all(
            playersIds
                    .reduce((cum, pId) => {
                        const shouldBeEstimated = withEstimate && withEstimate.includes(pId);

                        cum.push({
                            id: pId,
                            comparePlayerId: pId !== comparePlayerId ? comparePlayerId : null,
                            estimated: false,
                            estimateName
                        })

                        if (shouldBeEstimated)
                            cum.push({
                                id: pId,
                                comparePlayerId: pId,
                                estimated: shouldBeEstimated,
                                estimateName
                            })

                        return cum;
                    }, [])
                    .map(async p => getSeries(p.id, songs, p.comparePlayerId, p.estimated, p.estimateName))
        );
    }
    const getSeriesSong = (leaderboardId, series) => series && series.scores && series.scores[leaderboardId] ? series.scores[leaderboardId] : null;

    // pre-filters
    const mapIsMinStar = (song, stars) => song.stars && song.stars > stars;
    // const noPlayerScore = r => !r?.user?.acc;

    const getPreFilteredSongs = async (playerId, minStars) => Object.values(await getRankedMaps())
            .filter(r => mapIsMinStar(r, minStars))

    // post-filters
    const playerIsNotTheBest = (leaderboardId, series) => !getSeriesSong(leaderboardId, series) || !getSeriesSong(leaderboardId, series).best
    const playerAccIsLowerThanEstimated = (leaderboardId, playerSeries, estSeries, minDiff = 1) => {
        const playerScore = getSeriesSong(leaderboardId, playerSeries);
        const estScore = getSeriesSong(leaderboardId, estSeries);

        return !playerScore || (estScore && playerScore.acc < estScore.acc && estScore.diff > minDiff);
    }
    const bestSeriesGivesAtLeastMinPpDiff = (song, minPpDiff = 1) => song.bestDiff && song.bestDiff > minPpDiff;

    const findBestInSeries = (series, leaderboardId, withEstimated = true, key = 'acc') => {
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

    async function calc(playerId, snipedIds, minStarsPromise, minPpDiff = 1, withEstimate = withEstimate, sortedBy = sortBy) {
        await delay(0);

        const minStars = await minStarsPromise;

        let songs = await getPreFilteredSongs(playerId, minStars)

        const series = await getAllSeries([playerId].concat(snipedIds), songs, playerId, withEstimate ? [playerId] : null);

        songs.forEach(s => {
            s.bestPp = 0;
            s.bestRealPp = 0;
            s.bestAcc = 0;
            s.bestRealAcc = 0;
            s.bestDiff = 0;
            s.bestRealDiff = 0;

            const bestIdx = findBestInSeries(series, s.leaderboardId, true, 'acc');
            if (null !== bestIdx) {
                const bestSeries = series[bestIdx].scores[s.leaderboardId];
                const isBestEstimated = series[bestIdx].estimateId !== null;

                if (bestSeries) {
                    bestSeries.best = !isBestEstimated;

                    s.bestPp = bestSeries.pp;
                    s.bestAcc = bestSeries.acc;
                    s.bestDiff = bestSeries.diff;

                    s.bestRealPp = bestSeries.pp;
                    s.bestRealAcc = bestSeries.acc;
                    s.bestRealDiff = bestSeries.diff;
                }

                if (isBestEstimated) {
                    const bestIdx = findBestInSeries(series, s.leaderboardId, false, 'acc');
                    if (null !== bestIdx) {
                        const bestSeries = series[bestIdx].scores[s.leaderboardId];
                        if (bestSeries) {
                            bestSeries.best = true;

                            s.bestRealPp = bestSeries.pp;
                            s.bestRealAcc = bestSeries.acc;
                            s.bestRealDiff = bestSeries.diff;
                        }
                    }
                }
            }
        })

        const filteredSongs = songs
                .filter(s =>
                        (
                                playerIsNotTheBest(s.leaderboardId, series[0])
                                || (withEstimate && playerAccIsLowerThanEstimated(s.leaderboardId, series[0], series[1]))
                        ) && bestSeriesGivesAtLeastMinPpDiff(s, minPpDiff)
                )
                .sort((a, b) => {
                    if (typeof sortedBy === 'number') {
                        const scoreA = series[sortedBy] && series[sortedBy].scores && series[sortedBy].scores[a.leaderboardId] ? series[sortedBy].scores[a.leaderboardId] : null
                        const scoreB = series[sortedBy] && series[sortedBy].scores && series[sortedBy].scores[a.leaderboardId] ? series[sortedBy].scores[b.leaderboardId] : null

                        return (scoreB ? scoreB.diff : 0) - (scoreA ? scoreA.diff : 0)

                    }

                    return b.bestDiff - a.bestDiff
                })
        ;

        const filteredSongsIds = filteredSongs.map(s => s.leaderboardId);
        for (const p of series) {
            if (p.id === playerId) {
                p.totalPp = await getCachedTotalPlayerPp(p.id);
                continue;
            }

            const betterScores = convertArrayToObjectByKey(
                    Object.values(p.scores)
                            .filter(s => filteredSongsIds.includes(s.leaderboardId) && (!series[0].scores[s.leaderboardId] || s.pp > series[0].scores[s.leaderboardId].pp))
                            .map(s => ({leaderboardId: s.leaderboardId, pp: s.pp})),
                    'leaderboardId'
            );
            p.totalPp = await getCachedTotalPlayerPp(playerId, betterScores);
            p.prevTotalPp = series[0].totalPp;
        }

        let bestTotalPp = 0;
        if (snipedIds.length > 1) {
            const bestScores = convertArrayToObjectByKey(filteredSongs.filter(s => s.bestPp).map(s => ({
                leaderboardId: s.leaderboardId,
                pp: s.bestPp
            })), 'leaderboardId');
            bestTotalPp = await getCachedTotalPlayerPp(playerId, bestScores);
        }

        console.log(filteredSongs, series);

        return Object.assign(
                {
                    songs: filteredSongs,
                    series
                },

                series.reduce((cum, s) => {
                    if (s.id === playerId || s.estimateId === playerId) cum.playerSeries++;
                    else cum.otherSeries++;
                    return cum;
                }, {playerSeries: 0, otherSeries: 0}),

                {bestTotalPp}
        )
    }

    async function getPage(promised, currentPage, itemsPerPage) {
        const data = await promised;

        pagerTotal = data.songs.length;

        return Object.assign({}, data, {songs: data.songs.slice(currentPage*itemsPerPage, (currentPage+1)*itemsPerPage - 1), total: pagerTotal});
    }

    $: promised = calc(playerId, snipedIds, getCachedMinStars(playerId, minPpPerMap), minPpDiff, withEstimate, sortBy);
    $: pagedPromised = getPage(promised, currentPage, itemsPerPage)
    $: columnsQty = (showColumns.acc ? 1 : 0) + (showColumns.pp ? 1 : 0) + (showColumns.diffPp ? 1 : 0);
</script>

<style>
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

    thead th.song {
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

    thead th.acc, thead th.pp {
        width: 3rem;
    }

    tbody td.acc, tbody td.pp {
        text-align: center;
    }

    th.top, td.top {
        border-top-style: solid;
        border-top-width: 1px;
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

    td.best {
        background-color: #555;
    }

    .filters {
        display: flex;
        flex-wrap: wrap;
        margin: -1.5rem 0 0 -1.5rem;
        width: calc(100% + 1.5rem);
        align-items: flex-end;
    }
    .filters > :global(*) {
        margin: 1.5rem 0 0 1.5rem;
    }
</style>

<div class="filters">
    <Range label="+PP > " bind:value={minPpDiff} min={0.1} max={20} step={0.1} suffix="pp" />

    <div>
        <div>Pokazuj</div>
        <label><input type="checkbox" bind:checked={withEstimate}/> Potencjał</label>
        <label><input type="checkbox" bind:checked={showColumns.acc} /> Acc</label>
        <label><input type="checkbox" bind:checked={showColumns.pp} /> PP</label>
        <label><input type="checkbox" bind:checked={showColumns.diffPp}/> +PP</label>
        <label><input type="checkbox" bind:checked={showColumns.diff} /> Różnice</label>
    </div>
</div>

{#await pagedPromised}
    <p>Obliczanie...</p>
{:then calc}
    {#if calc.songs.length}
        <table class="ranking sspl">
            <thead>
            <tr>
                <th class="song" rowspan="2" colspan="2">Nuta</th>
                {#each calc.series as series (series.id+'_'+series.estimateId)}
                    {#if columnsQty > 0 && !(columnsQty === 1 && series.id === playerId && showColumns.diffPp)}
                        <th colspan={series.id !== playerId ? columnsQty : columnsQty - (showColumns.diffPp ? 1 : 0)}
                            class="series left">{series.name}</th>
                    {/if}
                {/each}
            </tr>

            <tr>
                {#each calc.series as series (series.id+'_'+series.estimateId)}
                    {#if showColumns.acc}
                        <th class="acc left">Acc</th>{/if}
                    {#if showColumns.pp}
                        <th class={'pp left' + (showColumns.acc ? ' middle' : '')}>PP</th>{/if}
                    {#if showColumns.diffPp && series.id !== playerId }
                        <th class={'pp left' + (showColumns.acc || showColumns.pp ? ' middle' : '')}>+PP</th>
                    {/if}
                {/each}
            </tr>
            </thead>

            <tbody>
            {#each calc.songs as song (song.leaderboardId)}
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
                    {#each calc.series as series, idx (series.id+'_'+series.estimateId)}
                        {#if showColumns.acc}
                            <td class={'acc left' + (series.scores && series.scores[song.leaderboardId] && series.scores[song.leaderboardId].best ? ' best' : '')}>
                                <Value value={series.scores && series.scores[song.leaderboardId] ? series.scores[song.leaderboardId].acc : null}
                                       prevValue={showColumns.diff && series.scores && series.scores[song.leaderboardId] ? series.scores[song.leaderboardId].prevAcc : null}
                                       zero="-" suffix="%"/>
                            </td>
                        {/if}
                        {#if showColumns.pp}
                            <td class={'pp left' + (series.scores && series.scores[song.leaderboardId] && series.scores[song.leaderboardId].best ? ' best' : '') + (showColumns.acc ? ' middle' : '')}>
                                <Value value={series.scores && series.scores[song.leaderboardId] ? series.scores[song.leaderboardId].pp : null}
                                       prevValue={showColumns.diff && series.scores && series.scores[song.leaderboardId] ? series.scores[song.leaderboardId].prevPp : null}
                                       zero="-" suffix="pp"/>
                            </td>
                        {/if}
                        {#if showColumns.diffPp && series.id !== playerId }
                            <td class={'pp left' + (series.scores && series.scores[song.leaderboardId] && series.scores[song.leaderboardId].best ? ' best' : '') + (showColumns.acc || showColumns.pp ? ' middle' : '')}>
                                <Value value={series.scores && series.scores[song.leaderboardId] ? series.scores[song.leaderboardId].diff : null}
                                       withSign={true} useColorsForValue={true} zero="-" suffix="pp"/>
                            </td>
                        {/if}
                    {/each}
                </tr>
            {/each}
            </tbody>

            <tfoot>
            <tr>
                <th class="song" rowspan="2" colspan="2">Razem dla {calc.series[0].name}</th>
                {#each calc.series as series, idx (series.id+'_'+series.estimateId)}
                    {#if columnsQty > 0 && !(columnsQty === 1 && series.id === playerId && showColumns.diffPp)}
                        <th class="left" rowspan={series.id !== playerId && series.estimateId !== playerId ? 1 : 2}
                            colspan={series.id !== playerId ? columnsQty : columnsQty - (showColumns.diffPp ? 1 : 0)}>
                            <Value value={series.totalPp} prevValue={showColumns.diff ? series.prevTotalPp : null} suffix="pp"/>
                        </th>
                    {/if}
                {/each}
            </tr>
            <tr>
                {#if calc.otherSeries && snipedIds.length > 1}
                    <th class="pp left top" colspan={calc.otherSeries * columnsQty}>
                        <Value value={calc.bestTotalPp} prevValue={showColumns.diff ? calc.series[0].totalPp: null} suffix="pp"/>
                    </th>
                {/if}
            </tr>
            </tfoot>
        </table>
    {:else}
        <div>
            <h3>Strasznie tu pusto</h3>
            <p>Wygląda na to, że żadna nutka nie spełnia wszystkich wybranych wymagań. Zmień coś może?</p>
        </div>
    {/if}
{/await}

<Pager bind:currentPage={currentPage} bind:itemsPerPage={itemsPerPage} totalItems={pagerTotal} />