<script>
    import {onMount} from 'svelte';
    import {extractDiffAndType, getSongDiffInfo, getSongScores} from "../../../song";
    import {getConfig} from "../../../plugin-config";

    import Icons from "./Icons.svelte";
    import Value from "../Common/Value.svelte";
    import Difficulty from "../Common/Difficulty.svelte";
    import Duration from "../Common/Duration.svelte";

    import {createEventDispatcher} from 'svelte';
    import {getAllActivePlayers, getPlayerSongScore} from "../../../scoresaber/players";
    import {_} from '../../stores/i18n';
    import {getActiveCountry} from "../../../scoresaber/country";

    const dispatch = createEventDispatcher();

    export let leaderboardId;
    export let songInfo;
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

    let diffInfo;
    let shownIcons = ["bsr", "bs", "preview", "twitch", "oneclick"];

    onMount(async () => {
        const config = await getConfig('songBrowser');
        shownIcons = config && config.showIcons ? config.showIcons : shownIcons;
        showBgCover = config.showBgCover !== false;

        diffInfo = {diff: difficulty, type: 'Standard'};
        if (leaderboardId) {
            const leaderboardScores = await getSongScores(leaderboardId);
            if (leaderboardScores && leaderboardScores.length) diffInfo = leaderboardScores[0].diffInfo;
        }

        if (hash && hash.length && diffInfo) {
            const bsSongInfo = await getSongDiffInfo(hash, diffInfo);
            if (bsSongInfo) songInfo = bsSongInfo;
        }

        if (songInfo && songInfo.length && songInfo.notes) {
            songInfo.nps = songInfo.length ? songInfo.notes / songInfo.length : null;
        }
    });
</script>

{#if songInfo}
    <div class="is-square">
        <div class="box has-shadow">
            <div class="song-card"
                 style="--background-image: url(/imports/images/songs/{showBgCover && hash && hash.length ? hash : ''}.png); --bgLeft: {bgLeft}; --bgTop: {bgTop}">
                <header>
                    <h1 class="title is-4">{songInfo.metadata.songName} {songInfo.metadata.songSubName ? songInfo.metadata.songSubName : ''}</h1>
                    <h2 class="title is-5">
                        {songInfo.metadata.songAuthorName}
                        <small>{songInfo.metadata.levelAuthorName}</small></h2>
                    <h3 class="title is-6" class:unranked={status && status !== 'Ranked'}>
                        {#if status}{status}{/if}
                        {#if stars}<Value value={stars} digits={2} zero="" suffix="★"/>{/if}
                        {#if diffInfo}<span class="diff"><Difficulty diff={diffInfo} reverseColors={true}/></span>{/if}
                        {#if songInfo.length}
                        <span class="time">
                            <i class="fas fa-clock"></i> <Duration value={songInfo.length}/>
                        </span>
                        {/if}
                    </h3>
                </header>

                <main>
                    <slot name="main">
                        {#if scores || totalScores}

                        <div>
                            {#if scores} <i class="fas fa-align-justify"></i> {$_.songCard.scores}: <strong><Value value={scores} digits={0}/></strong> {/if}
                            {#if scores !== totalScores}&nbsp;/ <strong><Value value={totalScores} digits={0}/></strong>{/if}
                        </div>
                        {/if}

                        {#if songInfo.notes || noteCount}
                        <div><i class="fas fa-music"></i> {$_.songCard.notes}: <strong>
                            <Value value={songInfo.notes || noteCount} digits={0}/>
                        </strong></div>
                        {/if}

                        {#if songInfo.bpm || bpm}
                        <div><i class="fas fa-drum"></i> {$_.songBrowser.fields.bpm}: <strong>
                            <Value value={songInfo.bpm || bpm} digits={0}/>
                        </strong></div>
                        {/if}

                        {#if songInfo.njs}
                        <div><i class="fas fa-tachometer-alt"></i> {$_.songBrowser.fields.njs}: <strong>
                            <Value value={songInfo.njs} digits={0}/>
                        </strong></div>
                        {/if}

                        {#if songInfo.nps}
                        <div><i class="fas fa-fire"></i> {$_.songBrowser.fields.nps}: <strong>
                            <Value value={songInfo.nps} digits={2}/>
                        </strong></div>
                        {/if}

                        {#if songInfo.bombs}
                        <div><i class="fas fa-bomb"></i> {$_.songCard.bombs}: <strong>
                            <Value value={songInfo.bombs} digits={0} zero="0"/>
                        </strong></div>
                        {/if}

                        {#if songInfo.obstacles}
                        <div><i class="fas fa-skull"></i> {$_.songCard.obstacles}: <strong>
                            <Value value={songInfo.obstacles} digits={0} zero="0"/>
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