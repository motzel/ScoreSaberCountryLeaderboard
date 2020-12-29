<script>
    import Value from './Value.svelte';

    export let pp = 0;
    export let prevPp = null;
    export let zero = '-';
    export let withZeroSuffix = false;
    export let weighted = null;
</script>

<span class="scoreTop ppValue"><Value value="{pp}" {zero} {withZeroSuffix} prevValue={prevPp} suffix="pp" {...$$restProps} /></span>
{#if weighted !== null && weighted !== undefined}
<span class="scoreTop ppWeightedValue">(<Value value="{weighted}" {zero} {withZeroSuffix} suffix="pp" {...$$restProps} />)</span>
{/if}