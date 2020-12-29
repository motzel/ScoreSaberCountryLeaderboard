<script>
  import {createEventDispatcher, onMount} from 'svelte';
  import {_} from '../../../stores/i18n'
  import {PLAYS_PER_PAGE} from '../../../../network/scoresaber/consts'
  import Pager from '../../Common/Pager.svelte'
  import Button from '../../Common/Button.svelte'
  import Select from '../../Common/Select.svelte'
  import ScoreSaberScorePresenter from './ScoreSaberScore.svelte'
  import {getPlayers} from '../../../../scoresaber/players'

  const dispatch = createEventDispatcher();

  export let players;
  export let songs = [];
  export let series = [];
  export let currentPage = 0;
  export let totalItems = 0;
  export let isLoading = false;
  export let error = null;
  export let type = 'recent'
  export let isCached = false;

  let allPlayers = null;

  let initialized = false;

  async function getAllPlayers() {
    allPlayers = (await getPlayers())
     .map(player => ({label: player.name, playerId: player.id}))
     .sort((a, b) => a.label.toLowerCase().replace(/[^a-zAZ]/g, '').localeCompare(b.label.toLowerCase().replace(/[^a-zAZ]/g, '')));
  }

  onMount(async () => {
    getAllPlayers();

    initialized = true;
  })

  function onTypeChange(newType) {
    type = newType;
    currentPage = 0;

    dispatch('browse', {type, currentPage});
  }
  function onPageChanged() {
    dispatch('browse', {type, currentPage});
  }

  function onTransform() {
    dispatch('transform-profile');
  }

  function onAddPlayerToComparision() {
    if(!allPlayers || !allPlayers.length) return;

    players = players.concat([allPlayers[0]]);
  }

  function onRemovePlayerFromComparision(idx) {
    players = players.filter((p, pIdx) => pIdx !== idx);
  }

  function onPlayerSelected(e, idx) {
    if (!e || !e.detail || !e.detail.value || !players || !players[idx]) return;

    players[idx] = {playerId: e.detail.value.playerId, name: e.detail.value.label};
  }
</script>

<div class="header">
  <div class="left"></div>

  <div class="switch-types">
    <Button iconFa="fa fa-clock" type={type === 'recent' ? 'primary' : 'default'}
            label={$_.songBrowser.ssScoreType.recent}
            on:click={() => onTypeChange('recent')} disabled={type === 'recent'} />
    <Button iconFa="fa fa-cubes" type={type === 'top' ? 'primary' : 'default'} label={$_.songBrowser.ssScoreType.top}
            on:click={() => onTypeChange('top')} disabled={type === 'top'} />
    {#if isCached}
    <Button iconFa="fas fa-database" type="danger" label={$_.plugin.transformButton} on:click={onTransform} />
    {/if}
  </div>

  {#if allPlayers && allPlayers.length}
  <div class="compare">
    <Button iconFa="fas fa-balance-scale" title={$_.songBrowser.compare.add} on:click={onAddPlayerToComparision} />
  </div>
  {/if}
</div>

<table class="ranking songs sspl">
  {#if players && players.length > 1 && allPlayers && allPlayers.length}
  <thead>
  <tr>
    <th class="rank">{$_.songBrowser.fields.rank}</th>
    <th class="song" colspan="2">{$_.songBrowser.songHeader}</th>
    <th class="timeset">{$_.songBrowser.fields.timesetShort}</th>
    {#each players as player, playerIdx}
      <th class="score" class:main={playerIdx === 0}>
        {#if playerIdx > 0}
          <div class="player-header">
          <Select items={allPlayers} value={allPlayers.find(p => p.playerId === player.playerId)} right={true}
           on:change={(e) => onPlayerSelected(e, playerIdx) }></Select>
          <i class="fas fa-times player-remove" title={$_.songBrowser.compare.remove} on:click={() => onRemovePlayerFromComparision(playerIdx)}></i>
          </div>
        {:else}
          {player.name}
        {/if}
      </th>
    {/each}
  </tr>
  </thead>
  {/if}

  <tbody>
{#each songs as song, idx (song.leaderboardId)}
  <slot {song} {series}>
    <ScoreSaberScorePresenter {song} series={series[idx]}/>
  </slot>
{/each}
  </tbody>

</table>

<Pager bind:currentPage
       itemsPerPage={PLAYS_PER_PAGE}
       {totalItems}
       itemsPerPageValues={null}
       {isLoading}
       on:page-changed={onPageChanged}
/>
{#if error}
  <div class="error has-text-centered">{error}</div>
{/if}

<style>
  .switch-types {
    font-size: .75rem;
    text-align: center;
  }

  th {
    vertical-align: bottom;
  }

  th.song {
    padding-left: 0;
  }

  th.rank, th.timeset {
    text-align: center!important;
  }

  th.rank {
    width: 7rem;
  }

  th.timeset {
    width: 8.5rem;
  }

  th.score {
    width: 11rem;
  }

  th.score.main {
    width: 14rem;
  }

  .player-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .player-header i {
    color: var(--decrease);
    cursor: pointer;
    padding-top: .25rem;
    padding-left: .5rem;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .compare {
    font-size: .75rem;
  }
</style>