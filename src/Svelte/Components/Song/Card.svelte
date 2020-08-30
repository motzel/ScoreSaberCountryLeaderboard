<script>
    import {onMount} from 'svelte';
    import {extractDiffAndType, getSongDiffInfo} from "../../../song";
    import {getConfig} from "../../../plugin-config";

    import Icons from "./Icons.svelte";
    import Value from "../Common/Value.svelte";
    import Difficulty from "../Common/Difficulty.svelte";
    import Duration from "../Common/Duration.svelte";

    import {createEventDispatcher} from 'svelte';
    import {getAllActivePlayers} from "../../../scoresaber/players";
    import {_} from '../../stores/i18n';

    const dispatch = createEventDispatcher();

    export let leaderboardId;
    export let hash;
    export let scores;
    export let totalScores;
    export let status;
    export let stars;
    export let bpm;
    export let noteCount;
    export let difficulty;
    export let bgLeft = "0rem";
    export let bgTop = "0rem";

    let showBgCover = true;

    let songInfo;
    let diffInfo;
    let shownIcons = ["bsr", "bs", "preview", "twitch", "oneclick"];

    onMount(async () => {
        const config = await getConfig('songBrowser');
        shownIcons = config && config.showIcons ? config.showIcons : shownIcons;
        showBgCover = config.showBgCover !== false;

        diffInfo = {diff: difficulty, type: 'Standard'};
        if (leaderboardId) {
            const diff = (await getAllActivePlayers(config.COUNTRY))
                    .map(player => player && player.scores && player.scores[leaderboardId] ? player.scores[leaderboardId].diff : null)
                    .filter(diff => diff)
                    .slice(0, 1)
            ;
            if(diff && diff.length) diffInfo = extractDiffAndType(diff[0]);
        }

        songInfo = await getSongDiffInfo(hash, diffInfo);
        if (songInfo) {
            songInfo.nps = songInfo.length ? songInfo.notes / songInfo.length : '?';

            dispatch('initialized', true);
        } else {
            dispatch('initialized', false);
        }
    });
</script>

{#if songInfo}
    <div class="is-square">
        <div class="box has-shadow">
            <div class="song-card"
                 style="--background-image: url(/imports/images/songs/{showBgCover && hash && hash.length ? hash : ''}.png); --bgLeft: {bgLeft}; --bgTop: {bgTop}">
                <header>
                    <h1 class="title is-4">{songInfo.metadata.songName} {songInfo.metadata.songSubName}</h1>
                    <h2 class="title is-5">
                        {songInfo.metadata.songAuthorName}
                        <small>{songInfo.metadata.levelAuthorName}</small></h2>
                    <h3 class="title is-6" class:unranked={status && status !== 'Ranked'}>
                        {status}
                        <Value value={stars} digits={2} zero="" suffix="★"/>
                        <span class="diff"><Difficulty diff={diffInfo} reverseColors={true}/></span>
                        <span class="time">
                            <i class="fas fa-clock"></i> <Duration value={songInfo.length}/>
                        </span>
                    </h3>
                </header>

                <main>
                    <div><i class="fas fa-align-justify"></i> {$_.songCard.scores}: <strong>
                        <Value value={scores} digits={0}/>
                    </strong>{#if scores !== totalScores}&nbsp;/ <strong>
                        <Value value={totalScores} digits={0}/>
                    </strong>{/if}</div>
                    <div><i class="fas fa-music"></i> {$_.songCard.notes}: <strong>
                        <Value value={songInfo.notes || noteCount} digits={0}/>
                    </strong></div>
                    <div><i class="fas fa-drum"></i> {$_.songBrowser.fields.bpm}: <strong>
                        <Value value={songInfo.bpm || bpm} digits={0}/>
                    </strong></div>
                    <div><i class="fas fa-tachometer-alt"></i> {$_.songBrowser.fields.njs}: <strong>
                        <Value value={songInfo.njs} digits={0}/>
                    </strong></div>
                    <div><i class="fas fa-fire"></i> {$_.songBrowser.fields.nps}: <strong>
                        <Value value={songInfo.nps} digits={2}/>
                    </strong></div>
                    <div><i class="fas fa-bomb"></i> {$_.songCard.bombs}: <strong>
                        <Value value={songInfo.bombs} digits={0} zero="0"/>
                    </strong></div>
                    <div><i class="fas fa-skull"></i> {$_.songCard.obstacles}: <strong>
                        <Value value={songInfo.obstacles} digits={0} zero="0"/>
                    </strong></div>
                </main>

                <footer>
                    <Icons {hash}/>
                </footer>
            </div>
        </div>
    </div>
{/if}

<style>
    @media screen and (min-width: 1216px) {
        .is-square {
            position: relative;
            padding-top: 100%;
            overflow: hidden;
        }

        .box {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        }
    }

    @media screen and (max-width: 1215px) {
        .box {
            position: relative;
        }
    }

    .song-card {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        height: 100%;
    }

    .song-card:before {
        position: absolute;
        content: ' ';
        background-image: var(--background-image);
        left: var(--bgLeft, 0);
        top: var(--bgTop, 0);
        width: calc(100% - var(--bgLeft) - var(--bgLeft));
        height: calc(100% - var(--bgTop) - var(--bgTop));
        background-repeat: no-repeat;
        background-size: cover;
        opacity: 0.1;
        pointer-events: none;
    }

    header {
        color: var(--alternate);
    }

    header .title {
        color: inherit !important;
    }

    header h1 {
        margin-bottom: .5rem;
    }

    header h2 {
        margin-top: 0;
        margin-bottom: .5rem;
    }

    header h3.title {
        margin-top: 0;
        color: var(--increase, #42b129) !important;
    }

    header h3.title.unranked {
        color: var(--decrease, #f94022) !important;
    }

    header .time {
        color: var(--textColor, #fff) !important;
    }

    header small {
        font-size: 0.75em;
        color: var(--ppColour);
    }

    header .diff :global(.reversed) {
        display: inline-block;
        padding: .1rem .25em .25em .25em;
        margin-left: .5em;
        margin-right: .5em;
        border-radius: .25em;
    }

    footer {
        text-align: right;
    }

    footer > :global(div) {
        margin-top: 0;
    }

    footer :global(button) {
        margin-bottom: 0;
    }
</style>