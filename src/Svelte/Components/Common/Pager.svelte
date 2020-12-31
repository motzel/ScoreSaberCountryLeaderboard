<script>
    import { createEventDispatcher, onMount } from 'svelte';

    const dispatch = createEventDispatcher();

    export let totalItems = 0;
    export let currentPage = 0;
    export let itemsPerPage = 10;
    export let itemsPerPageValues = [5, 10, 15, 20, 25];
    export let displayMax;
    if (!displayMax) displayMax = 11;
    export let hide = false;
    export let beforePageChanged;

    let displayStart = false;
    let displayEnd = false;
    let prevItemsPerPage = itemsPerPage;

    let currentlyLoadedPage = null;

    console.warn(`currentPage=${currentPage}, total=${totalItems}, itemsPerPage=${itemsPerPage}`)

    function dispatchEvent(initial = false)
    {
        let to = (currentPage + 1) * itemsPerPage - 1;
        if (to > totalItems - 1) to = totalItems - 1;

        dispatch('page-changed', {currentPage, itemsPerPage, from: currentPage*itemsPerPage, to, total: totalItems, initial});
    }

    onMount(() => {
        dispatchEvent(true);
    })

    async function onPageChanged(page) {
        if (beforePageChanged) {
            currentlyLoadedPage = page;

            const shouldContinue = await beforePageChanged(page);

            currentlyLoadedPage = null;

            if (!shouldContinue) return;
        }

        currentPage = page

        dispatchEvent(false);
    }

    function calcPages(total, current, max)
    {
        const needToDisplayFacetedPages = total > max;

        const middle = Math.floor(max / 2);
        const startPage = current > middle && needToDisplayFacetedPages ? current - middle + 1 : 0;

        displayStart = current > middle && needToDisplayFacetedPages;
        displayEnd = current + middle + 1 < total && needToDisplayFacetedPages;

        if(currentPage > pagesTotal - 1) currentPage = pagesTotal - 1;
        if(currentPage < 0) currentPage = 0;

        return allPages.slice(startPage - (needToDisplayFacetedPages && !displayEnd ? middle - total + current + 1 : 0), startPage + max - (displayStart ? 1 : 0) - (displayEnd ? 1 : 0));
    }

    function getEnd(currentPage, itemsPerPage, totalItems) {
        const end = (currentPage+1) * itemsPerPage;

        return end > totalItems ? totalItems : end;
    }

    function onItemsPerPageChanged() {
        const firstItem = prevItemsPerPage * currentPage

        prevItemsPerPage = itemsPerPage;
        currentPage = Math.floor(firstItem / itemsPerPage);
    }

    $: pagesTotal = Math.ceil(totalItems / itemsPerPage);
    $: allPages = Array(pagesTotal).fill(null).map((val, idx) => idx + 1)
    $: displayedPages = calcPages(pagesTotal, currentPage, displayMax);
    $: startItem = currentPage * itemsPerPage + 1;
    $: endItem = getEnd(currentPage, itemsPerPage, totalItems);
</script>

{#if pagesTotal > 1 && !hide}
<nav class="pagination">
    <div class="position">{startItem} - {endItem} / {totalItems}</div>
    <ul class="pagination-list">
        {#if displayStart}
            <li data-page={0}><a href="#" on:click|preventDefault={() => onPageChanged(0)}
                                 class={'pagination-link' + (currentPage === 0 ? ' is-current' : '')}>
                {#if currentlyLoadedPage === 0}<i class="fas fa-spinner fa-spin"></i>{:else}{1}{/if}
            </a></li>
            <li><span class="pagination-ellipsis">…</span></li>
        {/if}

        {#each displayedPages as page}
        <li data-page={page}>
            <a href="#" on:click|preventDefault={() => onPageChanged(page-1)} class={'pagination-link' + (currentPage === page - 1 ? ' is-current' : '')}>
                {#if currentlyLoadedPage === page - 1}<i class="fas fa-spinner fa-spin"></i>{:else}{page}{/if}
            </a>
        </li>
        {/each}

        {#if displayEnd}
            <li><span class="pagination-ellipsis">…</span></li>
            <li data-page={pagesTotal - 1}><a href="#" on:click|preventDefault={() => onPageChanged(pagesTotal - 1)}
                                              class={'pagination-link' + (currentPage === pagesTotal - 1 ? ' is-current' : '')}>
                {#if currentlyLoadedPage === pagesTotal -1}<i class="fas fa-spinner fa-spin"></i>{:else}{pagesTotal}{/if}
            </a></li>
        {/if}
    </ul>
    {#if itemsPerPageValues && itemsPerPageValues.length}
    <div class="items-per-page"><select bind:value={itemsPerPage} on:change={onItemsPerPageChanged}>{#each itemsPerPageValues as ipp}<option value={ipp}>{ipp}</option>{/each}</select></div>
    {/if}
</nav>
{/if}

<style>
    select {
        font-size: 1em;
        border: none;
        color: var(--textColor, #000);
        background-color: var(--foreground, #fff);
        outline: none;
    }

    .pagination {
        margin-top: 1em;
    }
    .pagination-list {
        max-width: none !important;
        justify-content: center;
        margin-top: 0;
        margin-bottom: 0!important;
    }
    .pagination-previous, .pagination-next, .pagination-link {
        border-color: var(--alternate);
    }
    .pagination-link.is-current {
        color: var(--textColor);
        background-color: var(--selected);
        border-color: var(--selected);
    }
    .pagination-link:focus {
        border-color: #dbdbdb !important;
    }
    .position {
        order: 0
    }
    .pagination-list {
        order: 1
    }
    .items-per-page {
        order: 2
    }
</style>
