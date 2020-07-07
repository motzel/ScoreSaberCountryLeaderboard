<script>
    import { createEventDispatcher, onMount } from 'svelte';

    const dispatch = createEventDispatcher();

    export let totalItems = 0;
    export let currentPage = 0;
    export let itemsPerPage = 10;
    export let itemsPerPageValues = [5, 10, 15, 20, 25];
    export let displayMax = 11;
    export let hide = false;

    let displayStart = false;
    let displayEnd = false;

    function dispatchEvent(initial = false)
    {
        let to = (currentPage + 1) * itemsPerPage - 1;
        if (to > totalItems - 1) to = totalItems - 1;

        dispatch('page-changed', {currentPage, itemsPerPage, from: currentPage*itemsPerPage, to, total: totalItems, initial});
    }

    onMount(() => {
        dispatchEvent(true);
    })

    function onPageChanged(page) {
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
                                 class={'pagination-link' + (currentPage === 0 ? ' is-current' : '')}>{1}</a></li>
            <li><span class="pagination-ellipsis">…</span></li>
        {/if}

        {#each displayedPages as page}
        <li data-page={page}>
            <a href="#" on:click|preventDefault={() => onPageChanged(page-1)} class={'pagination-link' + (currentPage === page - 1 ? ' is-current' : '')}>{page}</a>
        </li>
        {/each}

        {#if displayEnd}
            <li><span class="pagination-ellipsis">…</span></li>
            <li data-page={pagesTotal - 1}><a href="#" on:click|preventDefault={() => onPageChanged(pagesTotal - 1)}
                                              class={'pagination-link' + (currentPage === pagesTotal - 1 ? ' is-current' : '')}>{pagesTotal}</a>
            </li>
        {/if}
    </ul>
    <div class="items-per-page"><select bind:value={itemsPerPage}>{#each itemsPerPageValues as ipp}<option value={ipp}>{ipp}</option>{/each}</select></div>
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
