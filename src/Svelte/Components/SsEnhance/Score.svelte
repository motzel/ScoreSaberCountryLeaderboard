<script>
    import WhatIfPp from "../Song/WhatIfPp.svelte";
    import Pp from "../Common/Pp.svelte";
    import Value from "../Common/Value.svelte";

    export let song = null;
</script>

{#if song}
    <Pp pp="{song.pp}" prevPp={song.prevPp} zero="0,00" withZeroSuffix={true} weighted={song.ppWeighted} inline={true} />
    {#if song.percent} <div><span class="scoreBottom">Accuracy: <Value value="{song.percent*100}" zero="0,00" withZeroSuffix={true} prevValue={song.prevPercent*100} inline={true} suffix="%" /></span></div> {/if}
    {#if song.score}<div><span  class="scoreBottom">Score: <Value value="{song.score}" zero="0,00" prevValue={song.prevScore} inline={true} digits={0} /></span></div>{/if}
    <WhatIfPp leaderboardId={song.leaderboardId} pp={song.pp} />
{/if}