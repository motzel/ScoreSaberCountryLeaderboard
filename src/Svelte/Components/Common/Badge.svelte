<script>
    import Value from "./Value.svelte";

    export let name;
    export let value = 0;
    export let color = "var(--textColor)";
    export let bgColor = "var(--background)"
    export let title;
    export let zero = "0,00";
    export let digits = 2;
</script>

<span class="badge" style="--color:{color}; --background-color:{bgColor}" title={title}>
    <span class="name">{name}</span>
    <span class="spacer"></span>
    <span class="value"><Value value={value} {zero} {digits} /></span>
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

    .badge span.name {
        font-weight: 500;
    }

    .badge span.value {
        font-weight: 300;
    }
</style>