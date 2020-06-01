<script>
    import {formatNumber} from '../../utils/format';
    import {findRawPp} from '../../pp';

    export let scores = [];

    let expectedStr = "1,00";
    let rawPp = "???";
    let error = "";

    $: if (/^\s*\d+((,|.)\d+)?$/.test(expectedStr)) {
        rawPp = formatNumber(findRawPp(scores, parseFloat(expectedStr.replace(/\s/, '').replace(',', '.'))))
        error = "";
    } else {
        error = `Wpisz może jakąś liczbę, ok? 1 jest liczbą, 10 jest, a nawet 100. Ale "${expectedStr}"?`;
    }
</script>

<style>
    .pp-boundary {
        border: none;
        background: transparent;
        font-weight: 700;
        font-size: 1rem;
        width: 3rem;
        text-align: center;
        margin-right: .25rem;
        outline: none;
    }

    .err {
        color: red;
    }
</style>

<strong>+</strong><input class="pp-boundary" bind:value={expectedStr}/>
<strong>pp: </strong>
{#if !error.length}
    <span>{rawPp}</span>
    raw pp new play
{:else}
    <span class="err">{error}</span>
{/if}