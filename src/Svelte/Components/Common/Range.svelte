<script>
    import Value from "./Value.svelte";

    export let label = "";
    export let value = 0;
    export let min = 0;
    export let max = 100;
    export let step = 1;
    export let suffix = "";
</script>

<style>
</style>

<div>
    {label} <Value value={value} suffix={suffix} />
    <div><input type="range" min={min} max={max} step={step} bind:value={value} /></div>
</div>
