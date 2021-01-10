<script>
    import {onMount, createEventDispatcher} from 'svelte';
    import { fly, fade } from 'svelte/transition';
    import { tweened } from 'svelte/motion';
    import { cubicOut } from 'svelte/easing';
    import {getSongDiffInfo, getSongScores} from "../../../song";
    import {getConfig} from "../../../plugin-config";
    import eventBus from '../../../utils/broadcast-channel-pubsub'
    import {_} from '../../stores/i18n';

    import Icons from "../Song/Icons.svelte";
    import Value from "../Common/Value.svelte";
    import Difficulty from "../Common/Difficulty.svelte";
    import Duration from "../Common/Duration.svelte";

    const dispatch = createEventDispatcher();

    export let leaderboardId;
    export let songInfo;
    export let hash;
    export let scores = 0;
    export let totalScores = 0;
    export let status;
    export let stars = 0;
    export let bpm = 0;
    export let noteCount = 0;
    export let difficulty;
    export let bgLeft = "0rem";
    export let bgTop = "0rem";

    let showBgCover = true;

    let diffInfo;
    let shownIcons = ["bsr", "bs", "preview", "twitch", "oneclick"];

    const starsTweened = tweened(0, {duration: 500, easing: cubicOut});
    const totalScoresTweened = tweened(0, {duration: 500, easing: cubicOut});
    const scoresTweened = tweened(0, {duration: 500, easing: cubicOut});
    const notesTweened = tweened(0, {duration: 500, easing: cubicOut});
    const bpmTweened = tweened(0, {duration: 500, easing: cubicOut});
    const njsTweened = tweened(0, {duration: 500, easing: cubicOut});
    const npsTweened = tweened(0, {duration: 500, easing: cubicOut});
    const bombsTweened = tweened(0, {duration: 500, easing: cubicOut});
    const obstaclesTweened = tweened(0, {duration: 500, easing: cubicOut});

    async function refreshConfig() {
        const config = await getConfig('songBrowser');
        shownIcons = config && config.showIcons ? config.showIcons : shownIcons;
        showBgCover = config.showBgCover !== false;
    }

    function refreshDifficulty(difficulty) {
        if (difficulty) {
            diffInfo = {diff: difficulty, type: 'Standard'};
        }
    }

    async function refreshSongInfo(hash, diffInfo) {
        if (hash && hash.length && diffInfo) {
            const bsSongInfo = await getSongDiffInfo(hash, diffInfo);
            if (bsSongInfo) songInfo = bsSongInfo;
        }

        if (songInfo && songInfo.length && songInfo.notes) {
            songInfo.nps = songInfo.length ? songInfo.notes / songInfo.length : null;
        }
    }

    async function refreshLeaderboard(leaderboardId) {
        if (leaderboardId) {
            const leaderboardScores = await getSongScores(leaderboardId);
            if (leaderboardScores && leaderboardScores.length) diffInfo = leaderboardScores[0].diffInfo;
        }
    }

    onMount(async () => {
        await refreshConfig();

        return eventBus.on('config-changed', refreshConfig);
    });

    $: {
        refreshDifficulty(difficulty);
    }

    $: {
        refreshLeaderboard(leaderboardId);
    }

    $: {
        refreshSongInfo(hash, diffInfo);
    }

    $: {starsTweened.set(stars);}
    $: {scoresTweened.set(scores);}
    $: {totalScoresTweened.set(totalScores);}
    $: {notesTweened.set(songInfo && songInfo.notes ? songInfo.notes : noteCount);}
    $: {bpmTweened.set(songInfo && songInfo.bpm ? songInfo.bpm : bpm);}
    $: {njsTweened.set(songInfo && songInfo.njs ? songInfo.njs : 0);}
    $: {npsTweened.set(songInfo && songInfo.nps ? songInfo.nps : 0);}
    $: {bombsTweened.set(songInfo && songInfo.bombs ? songInfo.bombs : 0);}
    $: {obstaclesTweened.set(songInfo && songInfo.obstacles ? songInfo.obstacles : 0);}

</script>

{#if songInfo}
    <div class="is-square">
        <div class="box has-shadow">
            <div class="song-card"
                 style="--background-image: url(/imports/images/songs/{showBgCover && hash && hash.length ? hash : ''}.png); --bgLeft: {bgLeft}; --bgTop: {bgTop}">
                <header>
                    <h1 class="title is-4">{songInfo.metadata.songName} {songInfo.metadata.songSubName ? songInfo.metadata.songSubName : ''}</h1>
                    <h2 class="title is-5">
                        <span>{songInfo.metadata.songAuthorName}</span>
                        <small>{songInfo.metadata.levelAuthorName}</small></h2>
                    <h3 class="title is-6" class:unranked={status && status !== 'Ranked'}>
                        {#if status}<span>{status}</span>{/if}
                        {#if $starsTweened}<Value value={$starsTweened} digits={2} zero="" suffix="★"/>{/if}
                        {#if diffInfo}<span class="diff"><Difficulty diff={diffInfo} reverseColors={true}/></span>{/if}
                        {#if songInfo.length}
                        <span class="time" transition:fade={{duration: 500}}>
                            <i class="fas fa-clock"></i> <Duration value={songInfo.length}/>
                        </span>
                        {/if}
                    </h3>
                </header>

                <main>
                    <slot name="main">
                        {#if $scoresTweened || $totalScoresTweened}
                        <div transition:fly={{x:100, duration: 500}}>
                            {#if $scoresTweened} <i class="fas fa-align-justify"></i> {$_.songCard.scores}: <strong><Value value={$scoresTweened} digits={0}/></strong> {/if}
                            {#if $scoresTweened !== $totalScoresTweened}&nbsp;/ <strong><Value value={$totalScoresTweened} digits={0}/></strong>{/if}
                        </div>
                        {/if}

                        {#if $notesTweened}
                        <div transition:fly={{x:100, duration: 500}}><i class="fas fa-music"></i> {$_.songCard.notes}: <strong>
                            <Value value={$notesTweened} digits={0}/>
                        </strong></div>
                        {/if}

                        {#if $bpmTweened}
                        <div transition:fly={{x:100, duration: 500}}><i class="fas fa-drum"></i> {$_.songBrowser.fields.bpm}: <strong>
                            <Value value={$bpmTweened} digits={0}/>
                        </strong></div>
                        {/if}

                        {#if $njsTweened}
                        <div transition:fly={{x:100, duration: 500}}><i class="fas fa-tachometer-alt"></i> {$_.songBrowser.fields.njs}: <strong>
                            <Value value={$njsTweened} digits={0}/>
                        </strong></div>
                        {/if}

                        {#if $npsTweened}
                        <div transition:fly={{x:100, duration: 500}}><i class="fas fa-fire"></i> {$_.songBrowser.fields.nps}: <strong>
                            <Value value={$npsTweened} digits={2}/>
                        </strong></div>
                        {/if}

                        {#if $bombsTweened}
                        <div transition:fly={{x:100, duration: 500}}><i class="fas fa-bomb"></i> {$_.songCard.bombs}: <strong>
                            <Value value={$bombsTweened} digits={0} zero="0"/>
                        </strong></div>
                        {/if}

                        {#if $obstaclesTweened}
                        <div transition:fly={{x:100, duration: 500}}><i class="fas fa-skull"></i> {$_.songCard.obstacles}: <strong>
                            <Value value={$obstaclesTweened} digits={0} zero="0"/>
                        </strong></div>
                        {/if}
                    </slot>
                </main>

                <footer>
                    {#if hash} <Icons {hash}/> {/if}
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
        font-size: 1.5em!important;
        margin-bottom: .5em;
    }

    header h2 {
        font-size: 1.25em!important;
        margin-top: 0;
        margin-bottom: .5em;
    }

    header h3.title {
        font-size: 1em!important;
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
        padding: .1em .25em .25em .25em;
        margin-left: .5em;
        margin-right: .5em;
        border-radius: .25em;
    }

    main i {
        width: 1em;
        text-align: center;
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