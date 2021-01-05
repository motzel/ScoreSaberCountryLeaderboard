<script>
  import {createEventDispatcher, onMount} from 'svelte';
  import {_} from '../../../stores/i18n'
  import {SCORES_PER_PAGE} from '../../../../network/scoresaber/consts'
  import {getMainPlayerId} from '../../../../plugin-config'

  import ScoreSaberScorePresenter from './ScoreSaberScore.svelte'
  import Pager from '../../Common/Pager.svelte'
  import Button from '../../Common/Button.svelte'
  import Leaderboard from '../../Song/Leaderboard.svelte'

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
  export let type = 'live';

  let mainPlayerId = null;

  onMount(async () => {
    mainPlayerId = await getMainPlayerId();
  });

  function onPageChanged() {
    dispatch('browse', {currentPage});
  }

  function onCached() {
    type = 'cached';
  }

  function onDiffChange(diffId) {
    dispatch('diff-change', {leaderboardId: diffId, page: 0})

    type = 'live';
  }
</script>

{#if (diffs && (diffs.length > 1 || (diffs.length === 1 && diffs[0].id !== leaderboardId))) || mainPlayerId }
  <div class="header">
    <div class="left"></div>

    <div class="switch-types">
      {#if diffs && diffs.length}
        {#each diffs as diff (diff.id)}
          <Button label={diff.name} color="#dbdbdb" bgColor={diff.color} on:click={() => onDiffChange(diff.id)} notSelected={diff.id !== leaderboardId || type !== 'live'}/>
        {/each}
      {/if}
      {#if mainPlayerId}<Button iconFa="fas fa-database" type="danger" label={$_.plugin.cachedButton} on:click={onCached} notSelected={type !== 'cached'}/>{/if}
    </div>

    <div class="right"></div>
  </div>
{/if}

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
{/if}
</div>

<style>
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .switch-types {
    display: flex;
    font-size: .75rem;
    text-align: center;
  }

  :global(.switch-types button) {
    font-weight: 500;
    margin-right: .125rem!important;
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
    width: 7.7rem;
  }

  th.mods {
    width: 3.75rem;
  }

  th.pp {
    width: 6rem;
  }
</style>