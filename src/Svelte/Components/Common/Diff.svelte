<script>
    import {getDiffColor, getHumanDiffName} from "../../../song";

    export let diff;
</script>

{#if diff}
    <span style="color: {getDiffColor(diff)}">{getHumanDiffName(diff)}</span>
{/if}