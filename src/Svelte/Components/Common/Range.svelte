<script>
    import {createEventDispatcher} from 'svelte';
    import Value from "./Value.svelte";

    const dispatch = createEventDispatcher();

    export let label = "";
    export let value = 0;
    export let min = 0;
    export let max = 100;
    export let step = 1;
    export let suffix = "";
    export let disabled = false;

    function onChange() {
        dispatch('change', value)
    }
</script>

<style>
    .disabled {
        color: #888;
    }
</style>

<div class={disabled ? 'disabled' : ''}>
    <span>{label} <Value value={value} suffix={suffix} /></span>
    <div><input {disabled} type="range" min={min} max={max} step={step} bind:value={value} on:input={onChange} /></div>
</div>
