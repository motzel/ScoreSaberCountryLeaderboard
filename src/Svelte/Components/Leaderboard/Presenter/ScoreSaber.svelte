<script>
  import {createEventDispatcher, onMount} from 'svelte';
  import {_} from '../../../stores/i18n'
  import {SCORES_PER_PAGE} from '../../../../network/scoresaber/consts'

  import ScoreSaberScorePresenter from './ScoreSaberScore.svelte'
  import Pager from '../../Common/Pager.svelte'
  import {getMainPlayerId} from '../../../../plugin-config'


  const dispatch = createEventDispatcher();

  export let leaderboardId;
  export let data = [];
  export let diffs = [];
  export let currentPage = 0;
  export let totalItems = 0;
  export let error = null;
  export let isPaused = false;
  export let beforePageChanged;
  export let bgLeft = "0rem";
  export let bgTop = "0rem";
  export let showBgCover = true;

  let mainPlayerId = null;

  onMount(async () => {
    mainPlayerId = await getMainPlayerId();
  });

  function onPageChanged() {
    dispatch('browse', {currentPage});
  }
</script>

<div class="content">
  {#if (diffs && (diffs.length > 1 || (diffs.length === 1 && diffs[0].id !== leaderboardId))) || mainPlayerId }
  TODO: difficulties buttons {JSON.stringify(diffs)} + CACHED leaderbaord
  {/if}

 {#if data && data.length}
   <table class="ranking songs sspl">
     <thead>
     <tr>
       <th class="picture"></th>
       <th class="rank">{$_.songBrowser.fields.rank}</th>
       <th class="player">{$_.songLeaderboard.player}</th>
       <th class="score">{$_.songBrowser.fields.score}</th>
       <th class="timeset">{$_.songBrowser.fields.timesetShort}</th>
       <th class="mods">{$_.songLeaderboard.mods}</th>
       <th class="percentage">{$_.songBrowser.fields.accShort}</th>
       <th class="pp">{$_.songBrowser.fields.pp}</th>
     </tr>
     </thead>

     <tbody>
     {#each data as score}
       <slot {score}>
         <ScoreSaberScorePresenter {score}/>
       </slot>
     {/each}
     </tbody>
   </table>
 {:else}
   <p>{$_.common.noData}</p>
 {/if}
</div>

<Pager bind:currentPage
       itemsPerPage={SCORES_PER_PAGE}
       {totalItems}
       itemsPerPageValues={null}
       {beforePageChanged}
       on:page-changed={onPageChanged}
       hide={isPaused}
/>
{#if error}
  <div class="error has-text-centered">{error}</div>
{/if}

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