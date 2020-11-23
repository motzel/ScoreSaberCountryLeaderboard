<script>
    import {onMount} from 'svelte';
    import eventBus from '../../../utils/broadcast-channel-pubsub';
    import nodeSync from '../../../network/multinode-sync';
    import debounce from '../../../utils/debounce';
    import {
        flushScoresCache,
        getAllActivePlayers, getAllActivePlayersIds,
        getAllScoresSince,
        getAllScoresWithPpOver,
        getPlayerScores,
    } from "../../../scoresaber/players";
    import {getAccFromScore, getSongDiffInfo} from "../../../song";
    import {trans} from "../../stores/i18n";

    import Table from '../Common/Table.svelte';
    import Avatar from "../Common/Avatar.svelte";
    import Rank from "../Common/Rank.svelte";
    import Player from "../Common/Player.svelte";
    import Pp from "../Common/Pp.svelte";
    import FormattedDate from "../Common/FormattedDate.svelte";
    import Song from "../Song/Song.svelte";
    import Value from "../Common/Value.svelte";
    import Difficulty from "../Common/Difficulty.svelte";
    import Leaderboard from "../Song/Leaderboard.svelte";
    import {convertArrayToObjectByKey} from '../../../utils/js'

    export let country;
    export let sortBy = 'timeset'
    export let min;
    export let noRank = false;
    export let itemsPerPage = 10;
    export let pagesDisplayMax = 10;
    export let filterFunc = null;
    export let refreshTag = null;

    const PLAYERS_SCORES_UPDATED_DEBOUNCE_DELAY = 2000;

    let currentPage = 0;

    const header = [
        {label: '', key: 'picture', className: 'picture'},
        {label: '#', key: 'rank', className: 'rank'},
        {label: trans('dashboard.ranking.header.player'), key: 'player', className: 'player'},
        {label: trans('dashboard.ranking.header.song'), key: 'song', className: 'song'},
        {label: trans('dashboard.ranking.header.timeset'), key: 'timeset', className: 'timeset'},
        {label: trans('dashboard.ranking.header.acc'), key: 'acc', className: 'acc'},
        {label: trans('dashboard.ranking.header.pp'), key: 'pp', className: 'pp'}
    ].filter(h => !noRank || h.key !== 'rank');

    let scores = [];

    async function refreshScores() {
        if (refreshTag === null) return;
        const playersScores = sortBy === 'timeset'
         ? await getAllScoresSince(min ? min : undefined)
         : (
          sortBy === 'pp'
           ? await getAllScoresWithPpOver(min ? min : undefined)
           : await getAllScoresSince()
         )
        ;

        const allPlayersArr = await getAllActivePlayers(country);
        const allPlayers = allPlayersArr ? convertArrayToObjectByKey(allPlayersArr, 'id') : {};
        const allPlayersIds = Object.keys(allPlayers);

        scores = playersScores
         .filter(s => allPlayersIds.includes(s.playerId))
         .map(s => {
             const player = allPlayers[s.playerId];
             const {id, country, name} = player;

             return {...s, playerInfo: {id, country, name}}
         });
    }

    onMount(async () => {
        const refresh = async nodeId => {
            if (nodeId !== nodeSync.getId()) flushScoresCache();
            await refreshScores();
        }

        // TODO: check if it still works
        const dataRefreshedUnsubscriber = eventBus.on('data-refreshed', async ({nodeId}) => await refresh(nodeId));
        const playerScoresUpdatedHandler = debounce(async ({nodeId}) => await refresh(nodeId), PLAYERS_SCORES_UPDATED_DEBOUNCE_DELAY);
        const playerScoresUpdatedUnsubscriber = eventBus.on('player-scores-updated', playerScoresUpdatedHandler)

        return () => {
            dataRefreshedUnsubscriber();
            playerScoresUpdatedUnsubscriber();
        }
    });

    async function onDataPage(data, page) {
        const promisesToResolve = [];

        // try to get max score from cache
        for (const i in data) {
            if(!data[i].acc) {
                if (!data[i].maxScoreEx && data[i].diffInfo) {
                    try {
                        const songInfo = await getSongDiffInfo(data[i].hash, data[i].diffInfo, true);
                        if (songInfo) {
                            data[i].maxScoreEx = songInfo.maxScore;
                            data[i].acc = getAccFromScore(data[i]);
                        } else {
                            // try to fetch song info from beat saver and populate it later
                            promisesToResolve.push({
                                promise: getSongDiffInfo(data[i].hash, data[i].diffInfo, false),
                                song: data[i],
                                page
                            })
                        }
                    } catch (e) {
                        // swallow error
                    }
                } else {
                    data[i].acc = getAccFromScore(data[i]);
                }
            }
        }

        return {
            data,
            enhancePromise: async () => {
                // wait for resolve all song diff info promises
                if (promisesToResolve.length)
                    await Promise.allSettled(promisesToResolve.map(arr => arr.promise)).then(all => {
                        all.forEach(async (result, idx) => {
                            if (result.status === 'fulfilled') {
                                const songInfo = result.value;
                                const song = promisesToResolve[idx].song;

                                if (songInfo) {
                                    song.maxScoreEx = songInfo.maxScore;
                                    song.acc = getAccFromScore(song);
                                }
                            }
                        })

                        return all;
                    })

                return promisesToResolve.length && promisesToResolve[0].page === currentPage
                        ? data
                        : null;
            }
        }
    }

    const getRowIdentifier = row => !!row[sortBy] ? row[sortBy] : null;

    $: rows = scores
            .filter(s => (min === undefined || min === null || (s[sortBy] && s[sortBy] >= min)) && (!filterFunc || filterFunc(s)))
            .sort((a, b) => b[sortBy] - a[sortBy])
            .map((s, idx) => ({...s, rank: idx + 1}));

    $: {
        refreshScores(sortBy, min, refreshTag);
    }
</script>

<Table {header} {rows} {refreshTag} {itemsPerPage} {pagesDisplayMax} onDataPage={onDataPage} withDetails={true} bind:page={currentPage} rowIdentifierFunc={getRowIdentifier} className="ranking global sspl">
    <span slot="head-col" let:col>{col.label}</span>

    <span slot="body-col" let:key let:row>
        {#if key === 'picture'}
            <Avatar playerId={row.playerId}/>
        {:else if key === 'rank'}
            <Rank rank={row.rank}/>
        {:else if key === 'player'}
            <Player user={row.playerInfo}/>
        {:else if key === 'song'}
            <div class="song-cont">
                <Difficulty diff={row.diffInfo} useShortName={true} reverseColors={true}/>
                <Song song={row}>
                    <figure>
                        <div class="songinfo">
                            <span class="name">{row.name}</span>
                            <div class="author">{row.songAuthorName}
                                <small>{row.levelAuthorName}</small>
                            </div>
                        </div>
                    </figure>
                </Song>
            </div>
        {:else if key === 'timeset'}
            <FormattedDate date={row.timeset}/>
        {:else if key === 'acc'}
            <Value value={row.acc} zero="-" suffix="%"/>
        {:else if key === 'pp'}
            <Pp pp="{row.pp}" zero="-"/>
        {/if}
    </span>

    <span slot="details" let:row>
        <Leaderboard leaderboardId={row.leaderboardId} {country} tableOnly={true} showDiff={false} highlight={[row.playerId]} />
    </span>
</Table>

<style>
    :global(.sspl tbody) {
        padding-bottom: 2rem;
        font-size: .95rem;
    }

    :global(.sspl th), :global(.sspl td) {
        padding: .5rem;
    }

    :global(.sspl .picture) {
        padding: .5rem 0;
        width: 1.5rem;
    }

    :global(.sspl thead th.rank) {
        width: 2rem;
    }

    :global(.sspl thead th.player) {
        min-width: 8.2rem;
        max-width: 10rem;
    }

    :global(.sspl tbody td.player .player-name) {
        font-size: inherit !important;
    }

    .song-cont {
        display:flex;
        align-items: center;
    }

    :global(.song-cont figure) {
        margin-left: .5rem;
    }

    :global(.sspl td.song .songinfo) {
        text-align: left;
        font-weight: 500;
    }

    :global(.sspl td.song .songinfo) {
        color: var(--alternate);
    }

    :global(.sspl td.song .songinfo small) {
        font-size: 0.75em;
        color: var(--ppColour);
    }

    :global(.sspl thead th.timeset) {
        width: 9.5rem;
    }

    :global(.sspl thead th), :global(.sspl tbody td.acc), :global(.sspl tbody td.pp) {
        text-align: center;
    }

    :global(.sspl .pp) {
        width: 6rem;
    }
</style>