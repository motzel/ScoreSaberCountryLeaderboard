<script>
    import {createEventDispatcher} from 'svelte';

    const dispatch = createEventDispatcher();

    export let disabled;
    export let multiple = false;
    export let value = multiple ? [] : null
    export let items = [];
    export let noSelected = 'No item selected';

    function onMenuClick(e) {
        const item = e.target.closest('.dropdown-item');
        if (!item) return;

        const idx = item.dataset.idx;
        if (idx < 0 || idx >= items.length) return;

        if(multiple) {
            const itemValueIdx = value ? value.findIndex(v => v === items[idx]) : -1;
            let newValue = [];
            if (itemValueIdx >= 0) {
                newValue = value.filter((v,idx) => idx !== itemValueIdx)
            } else {
                newValue = value.concat([items[idx]])
            }

            items.forEach((item, idx) => {
                const v = newValue.find(v => v === item)
                if(v) v.idx = idx;
            })

            value = newValue.sort((a,b) => a.idx - b.idx)
        } else {
            value = value === items[idx] ? null : items[idx];
        }

        dispatch('change', value);
    }

    $: current = value && (!Array.isArray(value) || value.length) ? (Array.isArray(value) ? value : [value.label ? value: {label:value}]).map(v => v.label).join(', ') : noSelected
</script>

<div class="multi-select" class:disabled={disabled}>
    <div class="dropdown is-hoverable">
        <div class="dropdown-trigger">
            <button class="button" title={current}>
                <span>{current}</span>
                <span class="icon is-small"><i class="fas fa-angle-down" aria-hidden="true"></i></span>
            </button>
        </div>
        <div class="dropdown-menu" role="menu" on:click={onMenuClick}>
            <div class="dropdown-content">
                {#each items as item, idx (item)}
                    {#if item.type === 'divider'}
                        <hr class="dropdown-divider">
                    {:else if item.type === 'label'}
                        <div class="menu-label">{item.label}</div>
                    {:else}
                    <div class="dropdown-item" class:is-active={value && (value === item || (Array.isArray(value) && value.includes(item)))} data-idx={idx}>
                        <span>{item.label}</span>
                        {#if value && (value === item || (Array.isArray(value) && value.includes(item)))}
                            <span class="icon is-small"><i class="fas fa-check" aria-hidden="true"></i></span>
                        {/if}
                    </div>
                    {/if}
                {/each}
            </div>
        </div>
    </div>
</div>

<style>
    .multi-select {
        max-width: 100%;
        font-size: inherit;
    }

    .dropdown {
        max-width: 100%;
    }

    .dropdown-trigger {
        max-width: 100%;
    }

    .dropdown-trigger .button {
        max-width: 100%;
        height: 2em;
        font-size: inherit;
        padding-left: .5em;
        padding-right: 1.25em;
        padding-bottom: 0;
        color: var(--textColor, #000);
        background-color: var(--foreground, #fff);
        border-color: transparent;
    }

    .dropdown-trigger .button:active, .dropdown-trigger .button:focus {
        outline: none;
        box-shadow: none;
    }

    .dropdown-trigger .button span {
        overflow-x: hidden;
        text-overflow: ellipsis;
    }

    .dropdown-trigger .button .icon {
        position: absolute;
        top: .5em;
        right: .25em;
    }

    .dropdown-menu {
        right: 0;
    }

    .dropdown-content {
        color: var(--textColor, #000);
        background-color: var(--foreground, #fff);
        padding-top: 0;
        box-shadow: 0 2px 3px rgba(200, 200, 00, 0.1), 0 0 0 1px rgba(200, 200, 200, 0.1);
    }

    .dropdown-content .menu-label {
        text-align: center;
    }

    .dropdown-content .menu-label:not(:first-child) {
        margin-top: .5em;
    }

    .dropdown-content .menu-label:not(:last-child) {
        margin-bottom: .5em;
    }

    .dropdown-item {
        white-space: nowrap;
        padding: .25em 2.5em .25em 1em;
        font-size: inherit;
        color: inherit;
        overflow-x: hidden;
        text-overflow: ellipsis;
        cursor: pointer;
        line-height: 1.25;
    }

    .dropdown-item:hover {
        background-color: #2f2f2f;
        border-color: transparent;
        color: whitesmoke;
    }

    .dropdown-item.is-active, .dropdown-item.is-active:hover {
        color: white;
        background-color: #3273dc;
    }

    .dropdown-item .icon {
        position: absolute;
        top: .5em;
        right: .5em;
        font-size: smaller;
    }
</style>