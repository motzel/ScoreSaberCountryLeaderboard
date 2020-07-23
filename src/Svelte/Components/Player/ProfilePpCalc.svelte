<script>
    import {formatNumber} from '../../../utils/format';
    import {findRawPp, ppFromScore, PP_PER_STAR} from '../../../scoresaber/pp';
    import Value from "../Common/Value.svelte";

    export let scores = [];

    let expectedStr = "1,00";
    let rawPp = null;
    let rawPpFormatted = "???";
    let error = "";

    const thresholds = [90, 91, 92, 93, 94, 95];

    $: if (/^\s*\d+((,|.)\d+)?$/.test(expectedStr)) {
        rawPp = findRawPp(scores, parseFloat(expectedStr.replace(/\s/, '').replace(',', '.')));
        rawPpFormatted = formatNumber(rawPp)
        error = "";
    } else {
        error = `Wpisz może jakąś liczbę, ok? 1 jest liczbą, 10 jest, a nawet 100. Ale "${expectedStr}"?`;
    }
</script>

<strong class="plus">+</strong><input class="pp-boundary" bind:value={expectedStr}/>
<strong>pp = </strong>
{#if !error.length}
    <span><Value value={rawPp} /></span>
    <span>raw pp new play</span>

    <table>
        <thead>
        <tr>
            {#each thresholds as threshold (threshold)}
                <th>{threshold}%</th>
            {/each}
        </tr>
        </thead>

        <tbody>
        <tr>
            {#each thresholds as threshold (threshold)}
                <th><Value value={ rawPp / PP_PER_STAR / ppFromScore(threshold)} suffix="*" /></th>
            {/each}
        </tr>
        </tbody>
    </table>
{:else}
    <span class="err">{error}</span>
{/if}

<style>
    .plus {
        vertical-align: text-bottom
    }
    .pp-boundary {
        border: none;
        background: transparent;
        font-weight: 700;
        font-size: 1rem;
        width: 3rem;
        text-align: right;
        outline: none;
        padding: 0;
    }

    .err {
        color: red;
    }

    table {
        width: auto;
    }
</style>
