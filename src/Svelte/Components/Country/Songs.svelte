<script>
    import Table from '../Common/Table.svelte';

    export let country ;

    // TODO: test only
    const header = [{label:"a", key:0, className: 'a'}, {label:"b", key:1, className: 'b'}, {label:"c", key:2, className: 'c'}];
    const rows = [];
    let row = [];
    for(let i=0; i< 34;i++) {if(i > 0 && !(i % 3)) {rows.push(row); row = [];} row.push(i);}

    function onDataPage(data) {
        // 1. just return data from SYNC onDataPage function
        data[0][0] = 'xxx';
        return data;

        // 2. return PROMISE from ASYNC onDataPage function
        // await delay(1000);
        // data[0][0] = 'yyy';
        // return data;

        // 3. return SYNC data with ASYNC enhance (SYNC onDataPage function)
        // return {data, enhancePromise: async () => {await delay(1000); data[0][0] = 'zzz'; return data;}}
    }
</script>

<Table {header} {rows} itemsPerPage={5} pagesDisplayMax={7} onDataPage={onDataPage}>
    <span slot="head-col" let:col>
        parent: {col.label} {col.key}
    </span>

    <span slot="body-col" let:rowIdx let:colIdx let:col let:head>
        #row:{rowIdx} #col: {colIdx}<br />
        col: {JSON.stringify(col)}<br />
        head: {JSON.stringify(head)}
    </span>
</Table>


<style>

</style>