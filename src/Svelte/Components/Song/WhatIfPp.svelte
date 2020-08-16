<script>
    import {hoverable} from '../../Actions/hoverable';
    import {getWhatIfScore, getUserSongScore} from '../../../scoresaber/pp';
    import {formatNumber, round} from '../../../utils/format';
    import {getMainUserId} from "../../../plugin-config";

    export let leaderboardId;
    export let pp = 0;

    let buttonEl;
    let tooltip;

    let score = {currentTotalPp: 0, newTotalPp: 0, diff: 0};

    let userPp;
    let mainUserId;
    (async _ => {
        mainUserId = await getMainUserId();
        if (mainUserId) {
            const score = await getUserSongScore(mainUserId, leaderboardId);
            userPp = undefined !== score ? score.pp : undefined;
        }
    })();

    async function onHover(event) {
        const wi = await getWhatIfScore(await getMainUserId(), leaderboardId, pp);
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
        background-color: var(--foreground);
        border: 1px solid var(--textColor);
    }

    strong {
        color: inherit !important;
        background-color: inherit !important;
    }

    .inc {color: #42b129!important}
</style>

{#if mainUserId && undefined !== userPp}
    {#if round(pp) > round(userPp)}
        <button bind:this={buttonEl} use:hoverable on:hover={onHover} on:unhover={onUnhover} class="what-if">?
        </button>
        <div bind:this={tooltip} class="tooltip">
            Jeśli tak zagrasz: {formatNumber(score.currentTotalPp)} + <strong>{formatNumber(score.diff)}</strong> =
            <strong class="inc">{formatNumber(score.newTotalPp)}pp</strong>
        </div>
    {/if}
{/if}