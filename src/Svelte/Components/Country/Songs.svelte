<script>
    import {onMount} from 'svelte';
    import eventBus from '../../../utils/broadcast-channel-pubsub';
    import nodeSync from '../../../network/multinode-sync';
    import debounce from '../../../utils/debounce';
    import {getAllActivePlayers} from "../../../scoresaber/players";
    import {dateFromString} from "../../../utils/date";
    import {extractDiffAndType, getSongDiffInfo} from "../../../song";

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
    import {getCacheAndConvertIfNeeded} from "../../../store";

    export let country;
    export let sortBy = 'timeset'
    export let min;
    export let noRank = false;
    export let itemsPerPage = 10;
    export let pagesDisplayMax = 10;

    const PLAYERS_SCORES_UPDATED_DEBOUNCE_DELAY = 2000;

    let currentPage = 0;

    const header = [
        {label: '', key: 'picture', className: 'picture'},
        {label: '#', key: 'rank', className: 'rank'},
        {label: 'Gracz', key: 'player', className: 'player'},
        {label: 'Nuta', key: 'song', className: 'song'},
        {label: 'Czas', key: 'timeset', className: 'timeset'},
        {label: '%', key: 'acc', className: 'acc'},
        {label: 'PP', key: 'pp', className: 'pp'}
    ].filter(h => !noRank || h.key !== 'rank');

    let scores = [];

    async function refreshScores() {
        scores = (await getAllActivePlayers(country))
                .reduce((cum, player) => {
                    if (player) {
                        const {id, country, name} = player;

                        if (player.scores)
                            cum = cum.concat(
                                Object.values(player.scores)
                                    .map(s => {
                                        s.scoreMult = s.uScore ? s.score / s.uScore : 1;
                                        s.acc = s.maxScoreEx ? s.score / s.maxScoreEx / s.scoreMult * 100 : null;
                                        s.diffInfo = extractDiffAndType(s.diff);

                                        return {
                                            ...s,
                                            timeset: dateFromString(s.timeset),
                                            playerInfo: {id, country, name}
                                        }
                                    })
                            )
                    }
                    return cum;
                }, [])
        ;
    }

    onMount(async () => {
        const refresh = async nodeId => {
            if (nodeId !== nodeSync.getId()) await getCacheAndConvertIfNeeded(true);

            await refreshScores();
        }

        const dataRefreshedUnsubscriber = eventBus.on('data-refreshed', async ({nodeId}) => await refresh(nodeId));
        const playerScoresUpdatedHandler = debounce(async ({nodeId, player}) => await refresh(nodeId), PLAYERS_SCORES_UPDATED_DEBOUNCE_DELAY);
        const playerScoresUpdatedUnsubscriber = eventBus.on('player-scores-updated', playerScoresUpdatedHandler)

        await refreshScores();

        return () => {
            dataRefreshedUnsubscriber();
            playerScoresUpdatedUnsubscriber();
        }
    });

    async function onDataPage(data, page) {
        const promisesToResolve = [];

        // try to get max score from cache
        for (const i in data) {
            if (!data[i].maxScoreEx) {
                try {
                    const songInfo = await getSongDiffInfo(data[i].id, data[i].diffInfo, true);
                    if (songInfo) {
                        data[i].maxScoreEx = songInfo.maxScore;
                        data[i].acc = data[i].maxScoreEx ? data[i].score / data[i].maxScoreEx / data[i].scoreMult * 100 : null;
                    } else {
                        // try to fetch song info from beat saver and populate it later
                        promisesToResolve.push({
                            promise: getSongDiffInfo(data[i].id, data[i].diffInfo, false),
                            song: data[i],
                            page
                        })
                    }
                } catch (e) {
                    // swallow error
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
                                    song.acc = song.maxScoreEx ? song.score / song.maxScoreEx / song.scoreMult * 100 : null;
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
            .filter(s => (!min || (s[sortBy] && s[sortBy] >= min)))
            .sort((a, b) => b[sortBy] - a[sortBy])
            .map((s, idx) => ({...s, rank: idx + 1}));
</script>

<Table {header} {rows} {itemsPerPage} {pagesDisplayMax} onDataPage={onDataPage} withDetails={true} bind:page={currentPage} rowIdentifierFunc={getRowIdentifier} className="ranking global sspl">
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
        <Leaderboard leaderboardId={row.leaderboardId} tableOnly={true} showDiff={false} highlight={[row.playerId]} />
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