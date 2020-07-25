<script>
    import {createEventDispatcher} from 'svelte';

    const dispatch = createEventDispatcher();

    export let label = "";
    export let icon;
    export let iconFa;
    export let disabled = false;
    export let type = 'default';
    export let cls = "";
    export let title;
    export let noMargin = false;

    const types = {
        default: {
            color: "#444",
            activeColor: "#222",
            bgColor: "#dbdbdb",
            activeBgColor: "#aaa",
            border: "transparent",
            activeBorder: "transparent"
        },
        primary: {
            color: "#dbdbdb",
            activeColor: "#fff",
            bgColor: "#3273db",
            activeBgColor: "#2366d1",
            border: "transparent",
            activeBorder: "transparent"
        },
        twitch: {
            color: "#dbdbdb",
            activeColor: "#fff",
            bgColor: "#9146ff",
            activeBgColor: "#8333ff",
            border: "transparent",
            activeBorder: "transparent"
        },
    }
    let selectedType = types[type] ? types[type] : types.default
    let margin = label && label.length ? ".45em" : "1px"
    let btnPadding = label && label.length ? "calc(.45em - 1px) 1em" : "calc(.45em - 1px) .25em";
    let btnMargin = noMargin ? 0 : "0 0 .45em 0";
</script>

<button style="--color:{selectedType.color}; --bg-color: {selectedType.bgColor}; --border: {selectedType.border};--active-color: {selectedType.activeColor}; --active-bg-color: {selectedType.activeBgColor}; --active-border: {selectedType.activeBorder}; --margin: {margin}; --btn-padding: {btnPadding}; --btn-margin: {btnMargin}" on:click={() => dispatch('click')} {disabled} {title} class={'button ' + (type?type:'default') + ' ' + cls}>
    {#if icon}<span class="icon">{@html icon}</span>{/if}
    {#if iconFa}<i class={iconFa}></i>{/if}
    <span>{label}</span>
    <slot></slot>
</button>

<style>
    button {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: flex-start;
        vertical-align: top;
        padding: var(--btn-padding, calc(.45em - 1px) 1em);
        margin: var(--btn-margin, 0 0 .45em 0);
        text-align: center;
        white-space: nowrap;
        border: 1px solid var(--border, #dbdbdb);
        border-radius: .2em;
        font-size: inherit;
        cursor: pointer;
        color: var(--color, #363636);
        background-color: var(--bg-color, #3273dc);
        outline: none;
        box-shadow: none;
    }

    button:hover {
        color: var(--active-color, #fff);
        border-color: var(--active-border, #b5b5b5)
    }

    button:active {
        background-color: var(--active-bg-color, #fff);
    }

    button[disabled] {
        cursor: not-allowed;
        opacity: .4;
        color: var(--active-color, white);
        background-color: var(--bg-color, #3273dc);
    }

    button .icon:first-child:not(:last-child), button i:first-child:not(:last-child) {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 1.3em;
        height: 1.3em;
        margin-left: calc(- var(--margin, .45em) - 1px);
        margin-right: var(--margin, .45em);
    }

    :global(.button.is-loading::after) {
        border-color: transparent transparent rgba(0,0,0,.7) rgba(0,0,0,.7)!important;
    }

    :global(.button.twitch.is-loading::after) {
        border-color: transparent transparent rgba(219,219,219,1) rgba(219,219,219,1)!important;
    }

    :global(button .icon svg, button i) {
        display: inline-block;
        width: 1.3em;
        height: 1.3em;
        vertical-align: -.125em;
        overflow: visible;
        max-width: 100%;
        max-height: 100%;
        fill: currentColor;
    }
</style>
