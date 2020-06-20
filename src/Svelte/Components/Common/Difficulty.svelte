<script>
    import {getHumanDiffInfo} from "../../../song";

    export let diff;
    export let useShortName = false;
    export let reverseColors = false;

    $: diffInfo = diff ? getHumanDiffInfo(diff) : null;
</script>

<style>
    .diff {
        display: inline-block;
    }

    .reversed {
        font-weight: 600;
        padding: 0 2px;
        min-width: 1.5rem;
    }
</style>

{#if diffInfo}
    <span class="{'diff ' + (reverseColors ? 'reversed' : '')}" style="color: {reverseColors ? 'white' : diffInfo.color}; background-color: {reverseColors ? diffInfo.color : 'transparent'}" title="{useShortName && diffInfo.type !== 'Standard' ? diffInfo.type: ''}">{useShortName ? diffInfo.shortName: diffInfo.fullName}</span>
{/if}