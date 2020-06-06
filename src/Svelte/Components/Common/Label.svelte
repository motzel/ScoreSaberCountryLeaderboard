<script>
    export let label = "";
    export let subLabel = "";
    export let separator = "/";
</script>

<style>
    label {font-weight: normal}
</style>

<label>
{#if label.length || subLabel.length}
    {#if label.length}
        <strong>{label}</strong>
        {#if separator.length && subLabel.length}
            <span>&nbsp;{separator}&nbsp;</span>
        {/if}
    {/if}
    {#if subLabel.length}<span>{subLabel}</span>{/if}
{/if}
</label>