<script>
  import {createEventDispatcher, onMount} from 'svelte';
  import {_} from '../../../stores/i18n'
  import {SCORES_PER_PAGE} from '../../../../network/scoresaber/consts'

  import ScoreSaberScorePresenter from './ScoreSaberScore.svelte'
  import Pager from '../../Common/Pager.svelte'

  import LeaderboardCached from '../LeaderboardCached.svelte'
  import DiffChanger from '../DiffChanger.svelte'

  const dispatch = createEventDispatcher();

  export let leaderboardId;
  export let data = [];
  export let diffs = [];
  export let currentPage = 0;
  export let totalItems = 0;
  export let error = null;
  export let isPaused = false;
  export let beforeChanged;
  export let bgLeft = "0rem";
  export let bgTop = "0rem";
  export let bgWidth = "0rem";
  export let bgHeight = "0rem";
  export let showBgCover = true;
  export let type = 'live';
  export let isLoading = false;
  export let initialized = false;
  export let showDifferences = true;
  export let hash = null;

  function onPageChanged(event) {
    dispatch('browse', {currentPage: event.detail.currentPage});
  }

  async function onBeforePageChanged(page) {
    if (!beforeChanged) return true;

    return beforeChanged({leaderboardId, page, type: 'live'})
  }

  async function onBeforeDiffChanged(newDiff) {
    if (!beforeChanged) return true;

    return beforeChanged(newDiff);
  }
</script>

{#if initialized}
<DiffChanger {leaderboardId} {diffs} beforeDiffChanged={onBeforeDiffChanged} bind:type on:diff-change />

<div class="content">
{#if type === 'cached'}
  <LeaderboardCached leaderboardId={leaderboardId} tableOnly={true} showDiff={showDifferences} {showBgCover} {bgWidth} {bgHeight} {bgLeft} {bgTop} />
{:else}
  <div class="leaderboard-container" style="--background-image: url(/imports/images/songs/{showBgCover && hash && hash.length ? hash : ''}.png); --bgLeft: {bgLeft}; --bgTop: {bgTop}; --bgHeight: {bgHeight}; --bgWidth: {bgWidth}">
    {#if data && data.length}
     <table class="ranking songs sspl">
       <thead>
       <tr>
         <th class="picture"></th>
         <th class="rank">{$_.songBrowser.fields.rankShort}</th>
         <th class="player">{$_.songLeaderboard.player}</th>
         <th class="score">{$_.songBrowser.fields.score}</th>
         <th class="timeset">{$_.songBrowser.fields.timesetShort}</th>
         <th class="mods">{$_.songLeaderboard.mods}</th>
         <th class="percentage">{$_.songBrowser.fields.accShort}</th>
         <th class="pp">{$_.songBrowser.fields.pp}</th>
       </tr>
       </thead>

       <tbody>
       {#each data as score (score.playerId)}
         <slot {score}>
           <ScoreSaberScorePresenter {score}/>
         </slot>
       {/each}
       </tbody>
     </table>
    {:else if isLoading}
      <div class="loading">
        <i class="fas fa-spinner fa-spin"></i>
      </div>
    {:else if !error}
     <p>{$_.common.noData}</p>
    {/if}

    <Pager {currentPage}
         itemsPerPage={SCORES_PER_PAGE}
         {totalItems}
         itemsPerPageValues={null}
         beforePageChanged={onBeforePageChanged}
         on:page-changed={onPageChanged}
         hide={isPaused}
    />
    {#if error}
    <div class="error has-text-centered">{error}</div>
    {/if}
  </div>
{/if}
</div>
{/if}

<style>
  .loading {
    text-align: center;
    font-size: 3rem;
  }

  .leaderboard-container {position: relative;}
  .leaderboard-container:before {
    position: absolute;
    content: ' ';
    background-image: var(--background-image);
    left: var(--bgLeft, 0);
    top: var(--bgTop, 0);
    width: calc(100% + var(--bgWidth, 0) - var(--bgLeft, 0));
    height: calc(100% + var(--bgHeight, 0) - var(--bgTop, 0));
    background-repeat: no-repeat;
    background-size: cover;
    opacity: 0.1;
    pointer-events: none;
  }

  th {
    padding: .5rem !important;
    text-align: center!important;
  }

  th.picture {
    width: 2.25rem;
  }

  th.rank {
    width: 3.75rem;
  }

  th.player {
    text-align: left!important;
  }

  th.score {
    width: 5rem!important;
    min-width: auto!important;
  }

  th.timeset {
    width: 7.9rem;
  }

  th.mods {
    width: 3.75rem;
  }

  th.pp {
    width: 6rem;
  }
</style>