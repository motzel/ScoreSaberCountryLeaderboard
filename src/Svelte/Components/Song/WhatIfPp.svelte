<script>
    import {onMount} from 'svelte';
    import {hoverable} from '../../Actions/hoverable';
    import {getWhatIfScore, getUserSongScore} from '../../../scoresaber/pp';
    import {formatNumber, round} from '../../../utils/format';
    import {getMainPlayerId} from "../../../plugin-config";
    import {_} from '../../stores/i18n';
    import {getPlayerScores} from "../../../scoresaber/players";

    export let leaderboardId;
    export let pp = 0;

    let buttonEl;
    let tooltip;

    let score = {currentTotalPp: 0, newTotalPp: 0, diff: 0};

    let userPp;
    let mainPlayerId;
    let mainPlayerScores;
    onMount(async _ => {
        mainPlayerId = await getMainPlayerId();
        if (mainPlayerId) {
            mainPlayerScores = await getPlayerScores(mainPlayerId);

            const score = await getUserSongScore(mainPlayerId, leaderboardId);
            userPp = undefined !== score ? score.pp : undefined;
        }
    });

    async function onHover(event) {
        const wi = await getWhatIfScore(await getMainPlayerId(), leaderboardId, pp);
        score = Object.assign({}, score, wi);

        tooltip.style.display = 'inline-block';
    }

    function onUnhover(event) {
        tooltip.style.display = 'none';
    }
</script>

{#if mainPlayerId && mainPlayerScores && (!userPp || round(pp) > round(userPp))}
    <button bind:this={buttonEl} use:hoverable on:hover={onHover} on:unhover={onUnhover} class="what-if">?
    </button>
    <div bind:this={tooltip} class="tooltip">
        {$_.whatif.label} {formatNumber(score.currentTotalPp)} + <strong>{formatNumber(score.diff)}</strong> =
        <strong class="inc">{formatNumber(score.newTotalPp)}pp</strong>
    </div>
{/if}

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