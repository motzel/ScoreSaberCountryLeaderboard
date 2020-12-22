<script>
    import {formatNumber, parseFormattedNumber} from '../../../utils/format';
    import {findRawPp, ppFromScore, PP_PER_STAR, getWhatIfScore} from '../../../scoresaber/pp';
    import {_, trans} from '../../stores/i18n';
    import Value from "../Common/Value.svelte";
    import Range from "../Common/Range.svelte";
    import {getRankedSongs} from "../../../scoresaber/rankeds";
    import Badge from '../Common/Badge.svelte';
    import {onMount} from 'svelte'

    export let scores = [];
    export let playerId;

    let showDetails = false;
    let boundaryStr = formatNumber(1);
    let rawPp = null;
    let error = '';

    let maxStars = 100;
    let stars = 10;
    let percent = 90;
    let rawPpFromStars = 0;
    let diffPpFromStars = 0;

    const thresholds = [90, 91, 92, 93, 94, 95];

    onMount(async () => {
        const rankeds = await getRankedSongs();
        maxStars = Math.ceil(Object.values(rankeds).reduce((max, r) => r.stars > max ? r.stars : max, 0) + 1);
        rawPp = findRawPp(scores.map(s => s.pp).sort((a, b) => b - a), parseFormattedNumber(boundaryStr));
        stars = getStarsForAcc(rawPp, thresholds[0]);
    })

    function getStarsForAcc(rawPp, acc) {
        return rawPp / PP_PER_STAR / ppFromScore(acc)
    }

    async function calcPpFromStars(stars, percent) {
        const newRawPpFromStars = PP_PER_STAR * stars * ppFromScore(percent);
        const newDiffPpFromStars = (await getWhatIfScore(playerId, -1, newRawPpFromStars)).diff;

        rawPp = newRawPpFromStars;
        boundaryStr = formatNumber(newDiffPpFromStars > 0 ? newDiffPpFromStars : 0);
    }

    function onBoundaryChange(event) {
        error = "";
        const expectedStr = event.target.value.trim()
        const parsedStr = parseFormattedNumber(expectedStr);
        rawPp = findRawPp(scores.map(s => s.pp).sort((a, b) => b - a), parsedStr);

        if (!isNaN(rawPp)) {
            stars = getStarsForAcc(rawPp, thresholds[0]);
            percent = thresholds[0];
        } else {
            error = trans('profile.onePpParseError', {
                num1: formatNumber(1),
                num2: formatNumber(21.1),
                num3: formatNumber(100.69),
                expectedStr
            });
        }
    }
</script>

{#if playerId}
    <Badge bgColor="var(--dimmed)" fluid={true}>
        <slot slot="label">
            <strong class="plus">+</strong><input class="pp-boundary" value={boundaryStr} on:input={onBoundaryChange}/>
            <strong>pp</strong>
        </slot>
        <slot slot="value">
            <Value value={rawPp} /> {$_.profile.rawNewPlay}
            <i class:details={true} class={showDetails ? "fas fa-chevron-up" : "fas fa-chevron-right"} on:click={() => showDetails = !showDetails}></i>
        </slot>
    </Badge>

    {#if !error.length}
        {#if showDetails}
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
                    <th><Value value={ getStarsForAcc(rawPp, threshold) } suffix="*" /></th>
                {/each}
            </tr>
            </tbody>
        </table>

        <div class="stars-pp">
            <Range bind:value={stars} on:change={() => calcPpFromStars(stars, percent)} min={0.1} max={maxStars} step={0.01} suffix="*" inline={true} />
            <Range bind:value={percent} on:change={() => calcPpFromStars(stars, percent)} min={70} max={100} step={0.1} suffix="%" inline={true} />
        </div>
        {/if}
    {:else}
        <div class="err">{error}</div>
    {/if}
{/if}

<style>
    .details {
        cursor: pointer;
        margin-left: .25rem;
    }

    table {
        margin-bottom: .5rem!important;
    }

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
