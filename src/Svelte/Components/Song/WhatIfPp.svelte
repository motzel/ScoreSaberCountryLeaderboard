<script>
    import {hoverable} from '../../Actions/hoverable';
    import {getMainUserId} from '../../../temp';
    import {getWhatIfScore, getUserSongScore} from '../../../scoresaber/pp';
    import {formatNumber, round} from '../../../utils/format';

    export let leaderboardId;
    export let pp = 0;

    let mainUserId = getMainUserId();
    let buttonEl;
    let tooltip;

    let score = {currentTotalPp: 0, newTotalPp: 0, diff: 0};

    let userPp = 0;
    (async _ => {const score = await getUserSongScore(mainUserId, leaderboardId); userPp = undefined !== score ? score.pp : 0;})();

    async function onHover(event) {
        const wi = await getWhatIfScore(mainUserId, leaderboardId, pp);
        score = Object.assign({}, score, wi);

        tooltip.style.display = 'inline-block';
    }

    function onUnhover(event) {
        tooltip.style.display = 'none';
    }
</script>

<style>
    .tooltip {
        display: none;
        position: absolute;
        top: 0;
        right: 1rem;
        z-index: 10;
        width: 21rem;
        padding: .25rem;
        font-size: .875rem;
        font-weight: normal;
        text-align: center;
        color: var(--textColor);
        background-color: var(--background);
        border: 1px solid var(--foreground);
    }

    strong {
        color: inherit !important;
        background-color: inherit !important;
    }

    .inc {color: #42b129!important}
</style>

{#if mainUserId}
    {#if round(pp) > round(userPp)}
        <button bind:this={buttonEl} use:hoverable on:hover={onHover} on:unhover={onUnhover} class="what-if">?
        </button>
        <div bind:this={tooltip} class="tooltip">
            Jeśli tak zagrasz: {formatNumber(score.currentTotalPp)} + <strong>{formatNumber(score.diff)}</strong> =
            <strong class="inc">{formatNumber(score.newTotalPp)}pp</strong>
        </div>
    {/if}
{/if}