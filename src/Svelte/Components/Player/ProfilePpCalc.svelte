<script>
    import {formatNumber, parseFormattedNumber} from '../../../utils/format';
    import {findRawPp, ppFromScore, PP_PER_STAR, getWhatIfScore} from '../../../scoresaber/pp';
    import {_, trans} from '../../stores/i18n';
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

    $: if (mode === 'pp-stars') {
        rawPp = findRawPp(scores, parseFormattedNumber(expectedStr.trim()));
        if (!isNaN(rawPp)) {
            rawPpFormatted = formatNumber(rawPp)
            error = "";

            if (stars === 10) stars = getStarsForAcc(thresholds[0]);
        } else {
            error = trans('profile.onePpParseError', {
                num1: formatNumber(1),
                num2: formatNumber(21.1),
                num3: formatNumber(100.69),
                expectedStr
            });
        }
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
    <span>{$_.profile.rawNewPlay}</span>

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
        <div>{trans('profile.mapToPp', {stars: formatNumber(stars), acc: formatNumber(percent), rawPp: formatNumber(rawPpFromStars), pp: formatNumber(diffPpFromStars)})}</div>
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
