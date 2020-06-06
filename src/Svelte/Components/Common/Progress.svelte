<script>
    export let value = 0;
    export let max = 100;
    export let label = "";
</script>

<style>
    progress {width: 20rem; max-width: 97%;}
</style>

<div>
    <progress value={value} max={max}></progress>
    {#if label.length}
        <div>{label}</div>
    {/if}
</div>