<script>
    import {isPromise} from "../../../utils/js";

    import Pager from "./Pager.svelte";
    import Button from "../Common/Button.svelte";

    export let header = [];
    export let rows = [];
    export let footer = [];

    export let paged = true;
    export let onDataPage = null;
    export let pagesDisplayMax;
    export let page = 0;
    export let itemsPerPage = 10;
    export let itemsPerPageValues = [5, 10, 15, 20, 25, 50];
    if (itemsPerPageValues.length && !itemsPerPageValues.find(v => v === itemsPerPage)) itemsPerPage = itemsPerPageValues[0];
    export let total = rows.length;
    export let className;
    export let withDetails = false;

    let tableHeader;
    let tableFooter;

    const mapHeadOrFooter = (th, idx) => {
        if (!!th && typeof th === 'object' && th.label !== undefined) {
            return th;
        }

        return {key: idx, label: th}
    };

    $: if (Array.isArray(header) && header.length) {
        tableHeader = header.map(mapHeadOrFooter)
    } else {
        tableHeader = Array(rows.length && Array.isArray(rows[0]) ? rows[0].length : 0).fill(null).map(mapHeadOrFooter);
    }
    $: if (Array.isArray(footer) && footer.length) {
        tableFooter = footer.map(mapHeadOrFooter)
    }

    let detailsOpened = [];
    function onDetailsButtonClick(idx) {
        const rowIdx = idx + page * itemsPerPage;
        const alreadyOpened = detailsOpened.includes(rowIdx);

        if (!alreadyOpened) detailsOpened = [...detailsOpened, rowIdx];
        else detailsOpened = detailsOpened.filter(d => d !== rowIdx);
    }

    let dataPage = []

    async function getDataPage(data, page, itemsPerPage) {
        dataPage = data.slice(page * itemsPerPage, (page + 1) * itemsPerPage)

        if (!onDataPage) return dataPage;

        let promisedData = onDataPage(dataPage, page, itemsPerPage);

        if (isPromise(promisedData)) {
            dataPage = await promisedData;

            if (Array.isArray(dataPage)) return dataPage;
            else promisedData = dataPage;
        }

        if (promisedData && promisedData.enhancePromise && typeof promisedData.enhancePromise === 'function') {
            promisedData.enhancePromise().then(data => {
                if (data) dataPage = data
            });
        }

        if (promisedData && promisedData.data) {
            dataPage = promisedData.data;
        } else {
            dataPage = promisedData;
        }

        return dataPage;
    }

    $: currentPageDataPromise = getDataPage(rows, page, itemsPerPage);
    $: totalItems = rows.length;
</script>

{#await currentPageDataPromise then _}
    {#if dataPage.length}
        <table class={className}>
            <thead>
            <slot name="head">
                {#if tableHeader && tableHeader.length && tableHeader[0].label !== null}
                    <tr>
                        {#if withDetails}<th class="col--details-btn"></th>{/if}
                        {#each tableHeader as col (col)}
                            <th class={col.className ? col.className : ''}>
                                <slot name="head-col" col={col}>{col.label}</slot>
                            </th>
                        {/each}
                    </tr>
                {/if}
            </slot>
            </thead>

            <tbody>
            <slot name="body">
                {#if dataPage && dataPage.length}
                    {#each dataPage as row, rowIdx (row)}
                        <tr>
                            {#if withDetails}
                                <td class="col--details-btn">
                                    <Button type="text" iconFa={detailsOpened.includes(rowIdx + page * itemsPerPage) ? "fas fa-chevron-down" : "fas fa-chevron-right"}
                                            on:click={() => onDetailsButtonClick(rowIdx)} />
                                </td>
                            {/if}
                            {#each tableHeader as head, colIdx (head)}
                                <td class={row[head.key + '_className'] ? row[head.key + '_className'] : (head.className ? head.className : '')}>
                                    <slot name="body-col"
                                          key={head.key}
                                          rowIdx={rowIdx + page * itemsPerPage}
                                          {colIdx}
                                          {row}
                                          col={row[head.key] !== undefined ? row[head.key] : null}
                                          {head}>
                                        {row[head.key] ? row[head.key] : ''}
                                    </slot>
                                </td>
                            {/each}
                        </tr>
                        {#if withDetails}
                        <tr class="row--details" style="display: {detailsOpened.includes(rowIdx + page * itemsPerPage) ? 'table-row' : 'none'}">
                            <td class="col--details" colspan={tableHeader.length + 1}>
                                <slot name="details" rowIdx={rowIdx + page * itemsPerPage} {row}></slot>
                            </td>
                        </tr>
                        {/if}
                    {/each}
                {/if}
            </slot>
            </tbody>

            <tfoot>
            <slot name="foot">
                {#if tableFooter && tableFooter.length}
                    <tr>
                        {#each tableFooter as col (col)}
                            <th class={col.className ? col.className : ''}>
                                <slot name="foot-col" {col}>{col.label}</slot>
                            </th>
                        {/each}
                    </tr>
                {/if}
            </slot>
            </tfoot>
        </table>
    {:else}
    <slot name="empty">Brak danych</slot>
    {/if}
{/await}

{#if paged && totalItems > itemsPerPage}
    <Pager bind:currentPage={page} bind:itemsPerPage={itemsPerPage} {totalItems} {itemsPerPageValues}
           displayMax={pagesDisplayMax}/>
{/if}

<style>
    tbody td {
        vertical-align: middle;
    }

    .col--details {
        border-top-style: dotted;
        padding: 0;
    }

    .row--details:hover {
        background-color: inherit!important;
    }

    .col--details-btn {
        width: 2rem;
        padding-left: 0;
        padding-right: .25rem;
    }
</style>