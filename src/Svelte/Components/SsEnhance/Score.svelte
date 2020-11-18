<script>
    import WhatIfPp from "../Song/WhatIfPp.svelte";
    import Pp from "../Common/Pp.svelte";
    import Value from "../Common/Value.svelte";
    import {_} from "../../stores/i18n";
    import {formatNumber} from "../../../utils/format";

    export let song = null;
    export let showWhatIfPp = true;
</script>

{#if song}
    <Pp pp="{song.pp}" prevPp={song.prevPp} zero={formatNumber(0)} withZeroSuffix={true} weighted={song.ppWeighted} inline={true} />
    {#if song.acc} <div><span class="scoreBottom">{$_.songBrowser.fields.acc}: <Value value="{song.acc}" withZeroSuffix={true} prevValue={song.prevAcc} inline={true} suffix={'%' + (song.mods && song.mods.length ? ' (' + song.mods + ')' : '')} /></span></div> {/if}
    {#if song.score}<div><span  class="scoreBottom">{$_.songBrowser.fields.score}: <Value value="{song.score}" prevValue={song.prevScore} inline={true} digits={0} /></span></div>{/if}
    {#if showWhatIfPp}<WhatIfPp leaderboardId={song.leaderboardId} pp={song.pp} />{/if}
{/if}