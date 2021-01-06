<script>
  import {createEventDispatcher, onMount} from 'svelte';
  import {_} from '../../../stores/i18n'
  import {SCORES_PER_PAGE} from '../../../../network/scoresaber/consts'

  import ScoreSaberScorePresenter from './ScoreSaberScore.svelte'
  import Pager from '../../Common/Pager.svelte'

  import Leaderboard from '../../Song/Leaderboard.svelte'
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
  export let showBgCover = true;
  export let type = 'live';

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

<DiffChanger {leaderboardId} {diffs} beforeDiffChanged={onBeforeDiffChanged} bind:type on:diff-change />

<div class="content">
{#if type === 'cached'}
  <Leaderboard leaderboardId={leaderboardId} tableOnly={true} showBgCover={false} />
{:else}
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
  {:else}
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
{/if}
</div>

<style>
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
    width: 7.7rem;
  }

  th.mods {
    width: 3.75rem;
  }

  th.pp {
    width: 6rem;
  }
</style>