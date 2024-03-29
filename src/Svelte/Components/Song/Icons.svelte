<script>
    import {onMount} from 'svelte';
    import eventBus from '../../../utils/broadcast-channel-pubsub';
    import {getSongByHash} from "../../../network/beatsaver";
    import {getConfig} from "../../../plugin-config";
    import {copyToClipboard} from '../../../utils/clipboard';
    import beatSaverSvg from "../../../resource/svg/beatsaver.svg";
    import {_, trans} from "../../stores/i18n";

    import Button from "../Common/Button.svelte";
    import BeatSaviorIcon from '../BeatSavior/BeatSaviorIcon.svelte'

    export let hash;
    export let twitchUrl;
    export let bsExistsForPlayer = null;

    let songKey;
    let shownIcons = ["bsr", "bs", "preview", "twitch", "oneclick", "beatsavior"];

    async function refreshConfig() {
        const config = await getConfig('songBrowser');
        shownIcons = config && config.showIcons ? config.showIcons : shownIcons;
    }

    onMount(async () => {
        await refreshConfig();

        const songInfo = await getSongByHash(hash);
        if (songInfo && songInfo.key) {
            songKey = songInfo.key;
        }

        return eventBus.on('config-changed', refreshConfig);
    });
</script>

<div>
    {#if songKey && songKey.length}
        {#if shownIcons.includes('bsr')}
            <Button iconFa="fas fa-exclamation" title={$_.songBrowser.icons.bsrTooltip}
                    on:click={copyToClipboard('!bsr ' + songKey)}/>
        {/if}
        {#if shownIcons.includes('bs')}
            <a href="https://beatsaver.com/maps/{songKey}" target="_blank">
                <Button icon={beatSaverSvg} title={$_.songBrowser.icons.beatSaverTooltip}/>
            </a>
        {/if}

        {#if shownIcons.includes('oneclick')}
            <a href="beatsaver://{songKey}">
                <Button iconFa="far fa-hand-pointer" title={$_.songBrowser.icons.oneclick}/>
            </a>
        {/if}

        {#if shownIcons.includes('preview')}
            <a href="https://skystudioapps.com/bs-viewer/?id={songKey}" target="_blank">
                <Button iconFa="fa fa-play-circle" title={$_.songBrowser.icons.preview}/>
            </a>
        {/if}

        {#if shownIcons.includes('twitch') && twitchUrl && twitchUrl.length}
            <a class="video" href="{twitchUrl}" target="_blank">
                <Button iconFa="fab fa-twitch" type="twitch" title={$_.songBrowser.icons.twitchTooltip}/>
            </a>
        {/if}

        {#if false && shownIcons.includes('beatsavior') && bsExistsForPlayer}
            <Button title={$_.songBrowser.icons.beatSaviorTooltip}>
                <BeatSaviorIcon />
            </Button>
        {/if}
    {/if}
</div>
