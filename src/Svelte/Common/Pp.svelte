<script>
    import Value from './Value.svelte';

    export let pp = 0;
    export let zero = '-';
</script>

<span class="scoreTop ppValue"><Value value="{pp}" {zero}/></span>
{#if pp}
    <span class="scoreTop ppLabel">pp</span>
{/if}