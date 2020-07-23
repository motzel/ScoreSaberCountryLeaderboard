<script>
    import {formatNumber} from '../../../utils/format';
    import {findRawPp, ppFromScore, PP_PER_STAR, getWhatIfScore} from '../../../scoresaber/pp';
    import Value from "../Common/Value.svelte";
    import Range from "../Common/Range.svelte";
    import {getRankedSongs} from "../../../scoresaber/rankeds";

    export let scores = [];
    export let playerId;
    export let mode = 'pp-stars';

    let expectedStr = "1,00";
    let rawPp = null;
    let rawPpFormatted = "???";
    let error = '';

    let maxStars = 100;
    let stars = 10;
    let percent = 90;
    let rawPpFromStars = 0;
    let diffPpFromStars = 0;
    (async () => {
        const rankeds = await getRankedSongs();
        maxStars = Math.ceil(Object.values(rankeds).reduce((max, r) => max = r.stars > max ? r.stars : max, 0) + 1);
    })()

    const thresholds = [90, 91, 92, 93, 94, 95];

    function getStarsForAcc(acc) {
        return rawPp / PP_PER_STAR / ppFromScore(acc)
    }

    async function calcPpFromStars(stars, percent) {
        const newRawPpFromStars = PP_PER_STAR * stars * ppFromScore(percent);
        const newDiffPpFromStars = (await getWhatIfScore(playerId, 0, newRawPpFromStars)).diff;

        rawPpFromStars = newRawPpFromStars;
        diffPpFromStars = newDiffPpFromStars;
    }

    $: if (mode === 'pp-stars' && /^\s*\d+((,|.)\d+)?$/.test(expectedStr)) {
        rawPp = findRawPp(scores, parseFloat(expectedStr.replace(/\s/, '').replace(',', '.')));
        rawPpFormatted = formatNumber(rawPp)
        error = "";

        if(stars === 10) stars = getStarsForAcc(thresholds[0]);
    } else {
        error = `Wpisz może jakąś liczbę, ok? 1 jest liczbą, 10 jest, a nawet 100. Ale "${expectedStr}"?`;
    }

    $: if(playerId && mode === 'stars-pp') {
        calcPpFromStars(stars, percent);
    }
</script>

{#if mode === 'pp-stars' || !playerId}
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
                <th><Value value={ getStarsForAcc(threshold) } suffix="*" /></th>
            {/each}
        </tr>
        </tbody>
    </table>
{:else}
    <span class="err">{error}</span>
{/if}
{:else}
    <div class="stars-pp">
        <Range bind:value={stars} min={0.1} max={maxStars} step={0.01} suffix="*" inline={true} />
        <Range bind:value={percent} min={70} max={100} step={0.1} suffix="%" inline={true} />
        <div>
            Mapa <Value value={stars} suffix="*" /> przy <Value value={percent} suffix="%" /> da <Value value={rawPpFromStars} withZeroSuffix={true} suffix="pp raw" /> i <Value value={diffPpFromStars} withSign={true} withZeroSuffix={true} suffix="pp global" />
        </div>
    </div>
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

    .stars-pp {
    }
</style>
