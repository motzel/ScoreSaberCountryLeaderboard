<script>
    import Value from "./Value.svelte";

    export let label = "";
    export let value = 0;
    export let min = 0;
    export let max = 100;
    export let step = 1;
    export let suffix = "";
    export let disabled = false;
</script>

<style>
    .disabled {
        color: #888;
    }
</style>

<div class={disabled ? 'disabled' : ''}>
    {label} <Value value={value} suffix={suffix} />
    <div><input {disabled} type="range" min={min} max={max} step={step} bind:value={value} /></div>
</div>
