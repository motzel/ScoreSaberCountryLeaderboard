<script>
    import { fade } from 'svelte/transition';
    import Value from "./Value.svelte";

    export let label;
    export let fluid = false;
    export let value = 0;
    export let color = "var(--textColor)";
    export let bgColor = "var(--background)"
    export let title;
    export let zero = "0";
    export let digits = 2;
    export let type = "number";
    export let suffix = "";
    export let onlyLabel = false;
</script>

<span class="badge" class:fluid={fluid} style="--color:{color}; --background-color:{bgColor}" title={title} transition:fade={{ duration: 1000 }}>
    <span class="label"><slot name="label">{label}</slot></span>
    {#if !onlyLabel}
        <span class="spacer"></span>
        <span class="value">
            <slot name="value">
                {#if type === 'number'}<Value value={value} {zero} {digits} {suffix} />{:else}{value}{/if}
            </slot>
        </span>
    {/if}
</span>

<style>
    .badge {
        display: inline-flex;
        justify-content: space-around;
        align-items: center;
        color: var(--color, #eee);
        background-color: var(--background-color, #222);
        margin: 0 .5em .5em 0;
        padding: .125em;
        border-radius: .25em;
    }

    .badge span {
        display: inline-block;
        width: 50%;
        text-align: center;
        min-width: 2.5em;
    }

    .badge .spacer {
        width: 1px;
        min-width: auto;
        height: .875em;
        margin-top: .075em;
        border-left: 1px solid var(--color, #eee);
    }

    .badge span.label {
        font-weight: 500;
        color: inherit;
        margin: 0;
    }

    .badge span.value {
        font-weight: 300;
    }

    .badge.fluid span {
        width: auto;
    }
    .badge.fluid span.label {
        padding: 0 .5em;
    }
    .badge.fluid span.value {
        padding: 0 .5em;
    }
</style>