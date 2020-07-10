<script>
    import {createEventDispatcher} from 'svelte';
    import Value from "./Value.svelte";

    const dispatch = createEventDispatcher();

    export let label = "";
    export let icon;
    export let color = "#dbdbdb";
    export let activeColor = "#fff";
    export let bgColor = "#3273db";
    export let activeBgColor = "#2366d1";
    export let disabled = false;
</script>

<button style="--color:{color}; --bg-color: {bgColor}; --active-color: {activeColor}; --active-bg-color: {activeBgColor}" on:click={() => dispatch('click')} {disabled}><span class="icon">{#if icon}{@html icon}{/if}</span><span>{label}</span></button>

<style>
    button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        vertical-align: top;
        padding: calc(.5em - 1px) 1em;
        margin-bottom: .5em;
        text-align: center;
        white-space: nowrap;
        border: 1px solid transparent;
        border-radius: .25em;
        font-size: inherit;
        cursor: pointer;
        color: var(--color, #dbdbdb);
        background-color: var(--bg-color, #3273dc);
        outline: none;
        box-shadow: none;
    }

    button:hover {
        color: var(--active-color, white);
    }

    button:active {
        background-color: var(--active-bg-color, #2366d1);
    }

    button[disabled] {
        cursor: not-allowed;
        opacity: .4;
        color: var(--active-color, white);
        background-color: var(--bg-color, #3273dc);
    }

    button .icon:first-child:not(:last-child) {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 1.5em;
        height: 1.5em;
        margin-left: calc(-.5em - 1px);
        margin-right: .5em;
    }

    :global(button .icon svg)  {
        display: inline-block;
        font-size: inherit;
        width: 1.5em;
        height: 1.5em;
        vertical-align: -.125em;
        overflow: visible;
        max-width :100%;
        max-height: 100%;
        fill: currentColor;
    }
</style>
