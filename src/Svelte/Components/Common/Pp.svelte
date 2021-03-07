<script>
    import {onMount} from 'svelte'
    import {_} from "../../stores/i18n"
    import {getWhatIfScore} from '../../../scoresaber/pp'
    import {round} from '../../../utils/format'
    import Value from './Value.svelte'

    export let pp = 0;
    export let prevPp = null;
    export let zero = '-';
    export let withZeroSuffix = false;
    export let weighted = null;
    export let playerId = null;
    export let leaderboardId = null;

    let ppAttribution = null;

    onMount(async () => {
      if (playerId) {
        const diff = await getWhatIfScore(playerId, leaderboardId, 0);
        if (diff.diff) ppAttribution = round(-diff.diff);
      }
    });
</script>

<span class="scoreTop ppValue"><Value value="{pp}" {zero} {withZeroSuffix} prevValue={prevPp} suffix="pp" {...$$restProps} /></span>
{#if weighted !== null && weighted !== undefined}
<span class="scoreTop ppWeightedValue">(<Value value="{weighted}" {zero} {withZeroSuffix} suffix="pp" {...$$restProps} prevValue={weighted-ppAttribution} prevTitle={$_.profile.ppAttribution}/>)</span>
{/if}