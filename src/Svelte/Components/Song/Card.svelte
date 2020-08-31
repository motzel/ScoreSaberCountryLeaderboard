<script>
    import {onMount} from 'svelte';
    import {extractDiffAndType, getSongDiffInfo} from "../../../song";
    import {getConfig} from "../../../plugin-config";
    import {SCORESABER_URL} from "../../../network/scoresaber/consts";
    import {_} from '../../stores/i18n';

    import Icons from "./Icons.svelte";
    import Value from "../Common/Value.svelte";
    import Difficulty from "../Common/Difficulty.svelte";
    import Duration from "../Common/Duration.svelte";

    export let leaderboardId;
    export let hash;
    export let songName = '';
    export let songSubName = '';
    export let songAuthorName = '';
    export let levelAuthorName = '';
    export let stars = null;
    export let maxPp;
    export let diffInfo;
    export let duration;
    export let bpm;
    export let njs;
    export let nps;
    export let twitchUrl;
    export let showIcons = true;
    export let bgLeft = "0rem";
    export let bgTop = "0rem";
    export let padding = "1.25em";
    export let iconSize = "1em";

    let showBgCover = true;

    let songInfo;
    let shownIcons = ["bsr", "bs", "preview", "twitch", "oneclick"];

    onMount(async () => {
        const config = await getConfig();
        shownIcons = config && config.songBrowser && config.songBrowser.showIcons ? config.songBrowser.showIcons : shownIcons;
        showBgCover = config && config.songLeaderboard && config.songLeaderboard.showBgCover !== false;
    });
</script>

{#if songName && songName.length}
        <div class="box has-shadow" style="--padding: {padding}; --iconSize: {iconSize}">
            <div class="song-card"
                 style="--background-image: url(/imports/images/songs/{showBgCover && hash && hash.length ? hash : ''}.png); --bgLeft: {bgLeft}; --bgTop: {bgTop};">
                <slot name="before-header"></slot>

                <header>
                    <h1 class="title is-4">
                        <a href="{ SCORESABER_URL + '/leaderboard/' + encodeURIComponent(leaderboardId)}">
                            {songName} {songSubName}
                        </a>
                    </h1>
                    <h2 class="title is-5">
                        {songAuthorName}
                        <small>{levelAuthorName}</small></h2>
                    <h3 class="title is-6">
                        {#if diffInfo}<span class="diff block"><Difficulty diff={diffInfo} reverseColors={true}/></span>{/if}

                        <span class="status block" class:unranked={stars === null || stars === undefined}>
                            {stars !== null && stars !== undefined ? $_.songLeaderboard.ranked : $_.songLeaderboard.unranked}
                            <Value value={stars} digits={2} zero="" suffix="★"/>
                            {#if maxPp}(<Value value={maxPp} digits={2} zero="" suffix={$_.songLeaderboard.maxPpSuffix} />){/if}
                        </span>

                        <div class="stats">
                            {#if duration}
                                <span class="time block"><i class="fas fa-clock"></i> <Duration value={duration}/></span>
                            {/if}

                            {#if bpm}
                                <span class="bpm block"><i class="fas fa-drum"></i> <strong><Value value={bpm} digits={0} suffix={$_.songBrowser.fields.bpmShort.toLowerCase()} /></strong></span>
                            {/if}

                            {#if njs}
                                <span class="njs block"><i class="fas fa-tachometer-alt"></i> <strong><Value value={njs} digits={0} suffix={$_.songBrowser.fields.njsShort.toLowerCase()} /></strong></span>
                            {/if}

                            {#if nps}
                                <span class="nps block"><i class="fas fa-fire"></i> <strong><Value value={nps} digits={2} suffix={$_.songBrowser.fields.npsShort.toLowerCase()} /></strong></span>
                            {/if}
                        </div>
                    </h3>
                </header>

                <main>
                    <slot name="main">
                    </slot>
                </main>

                <footer>
                    {#if showIcons}<Icons {hash} {twitchUrl} />{/if}
                </footer>
            </div>
        </div>
{/if}

<style>
    .box {
        position: relative;
        height: 100%;
        padding: var(--padding);
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
        margin-bottom: .25em;
    }

    header h2 {
        font-size: 1.25em!important;
        margin-top: 0;
        margin-bottom: .5em;
    }

    header h3.title {
        font-size: 1em!important;
        margin-top: 0;
    }

    header h3.title .status {
        color: var(--increase, #42b129) !important;
    }

    header h3.title .status.unranked {
        color: var(--decrease, #f94022) !important;
    }

    header .block {
        display: inline-block;
        margin-right: .5em;
        margin-bottom: .5em;
        color: var(--textColor, #fff) !important;
    }

    header small {
        font-size: 0.75em;
        color: var(--ppColour);
    }

    header .diff :global(.reversed) {
        display: inline-block;
        padding: .1em .25em .25em .25em;
        border-radius: .25em;
    }

    header .stats {
        display: flex;
        justify-content: space-around;
    }

    main {
        margin: .75em 0 1.25em;
    }

    footer {
        font-size: var(--iconSize);
        text-align: right;
    }

    footer > :global(div) {
        margin-top: 0;
    }

    footer :global(button) {
        margin-bottom: 0;
    }
</style>