<script>
    import {onMount} from 'svelte';
    import {getSongByHash} from "../../../network/beatsaver";
    import {getConfig} from "../../../plugin-config";
    import {copyToClipboard} from '../../../utils/clipboard';
    import beatSaverSvg from "../../../resource/svg/beatsaver.svg";

    import Button from "../Common/Button.svelte";

    export let hash;

    let songKey;
    let shownIcons = ["bsr", "bs", "preview", "twitch", "oneclick"];

    onMount(async () => {
        const config = await getConfig('songBrowser');
        shownIcons = config && config.showIcons ? config.showIcons : shownIcons;

        const songInfo = await getSongByHash(hash);
        if (songInfo && songInfo.key) {
            songKey = songInfo.key;
        }
    });
</script>

<div>
    {#if songKey && songKey.length}
        {#if shownIcons.includes('bsr')}
            <Button iconFa="fas fa-exclamation" title="Skopiuj !bsr"
                    on:click={copyToClipboard('!bsr ' + songKey)}/>
        {/if}
        {#if shownIcons.includes('bs')}
            <a href="https://beatsaver.com/beatmap/{songKey}" target="_blank">
                <Button icon={beatSaverSvg} title="Przejdź na Beat Saver"/>
            </a>
        {/if}

        {#if shownIcons.includes('oneclick')}
            <a href="beatsaver://{songKey}">
                <Button iconFa="far fa-hand-pointer" title="OneClick&trade; Install"/>
            </a>
        {/if}

        {#if shownIcons.includes('preview')}
            <a href="https://skystudioapps.com/bs-viewer/?id={songKey}" target="_blank">
                <Button iconFa="fa fa-play-circle" title="Podgląd mapy"/>
            </a>
        {/if}
    {/if}
</div>

<style>
    div {
        margin-top: 1rem;
    }
</style>