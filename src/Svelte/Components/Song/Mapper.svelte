<script>
    export let name;
</script>

{#if name}
    {name}
{:else}
    -
{/if}