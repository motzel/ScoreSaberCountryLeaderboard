<script>
  import {createEventDispatcher, onMount} from 'svelte';
  import {_} from '../../../../stores/i18n'
  import {PLAYS_PER_PAGE} from '../../../../../network/scoresaber/consts'
  import Pager from '../../../Common/Pager.svelte'
  import Button from '../../../Common/Button.svelte'
  import Select from '../../../Common/Select.svelte'
  import ScoreSaberScorePresenter from './ScoreSaberScore.svelte'
  import {getPlayers} from '../../../../../scoresaber/players'
  import {getConfig, getMainPlayerId, setConfig} from '../../../../../plugin-config'

  const dispatch = createEventDispatcher();

  export let players;
  export let songs = [];
  export let series = [];
  export let currentPage = 0;
  export let totalItems = 0;
  export let error = null;
  export let type = 'recent'
  export let isCached = false;
  export let isPaused = false;
  export let cachedRecentPlay;
  export let beforePageChanged;
  export let maxComparePlayers = 4;

  let allPlayers = null;
  let mainPlayerId = null;

  let initialized = false;

  async function getAllPlayers() {
    allPlayers = (await getPlayers())
     .map(player => ({label: player.name, playerId: player.id}))
     .sort((a, b) => a.label.toLowerCase().replace(/[^a-zAZ]/g, '').localeCompare(b.label.toLowerCase().replace(/[^a-zAZ]/g, '')));
  }

  onMount(async () => {
    getAllPlayers();
    mainPlayerId = await getMainPlayerId();

    initialized = true;
  })

  export function onTypeChange(newType) {
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

  let comparisionModified = false;
  function onAddPlayerToComparision() {
    if(!allPlayers || !allPlayers.length || !players || players.length >= maxComparePlayers) return;

    players = players.concat([allPlayers[0]]).slice(0, maxComparePlayers);

    comparisionModified = true;
  }

  function onRemovePlayerFromComparision(idx) {
    players = players.filter((p, pIdx) => pIdx !== idx);

    comparisionModified = true;
  }

  function onPlayerSelected(e, idx) {
    if (!e || !e.detail || !e.detail.value || !players || !players[idx]) return;

    players[idx] = {playerId: e.detail.value.playerId, name: e.detail.value.label};

    comparisionModified = true;
  }

  async function onSaveComparision() {
    comparisionModified = false;

    if (!players) return;

    const playersIds = players.map(p => p.playerId).slice(1).filter(pId => pId !== mainPlayerId);

    const config = await getConfig()
    if (!config) return;

    if (!config.songBrowser) config.songBrowser = {};

    config.songBrowser.compareTo = playersIds;

    await setConfig(config);
  }
</script>

<div class="header">
  <div class="left"></div>

  <div class="switch-types">
    <Button iconFa="fa fa-clock" type={type === 'recent' ? 'primary' : 'default'}
            label={$_.songBrowser.ssScoreType.recent}
            on:click={() => onTypeChange('recent')} notSelected={type !== 'recent'} />
    <Button iconFa="fa fa-cubes" type={type === 'top' ? 'primary' : 'default'} label={$_.songBrowser.ssScoreType.top}
            on:click={() => onTypeChange('top')} notSelected={type !== 'top'} />
    {#if isCached}
    <Button iconFa="fas fa-database" type="danger" label={$_.plugin.cachedButton} on:click={onTransform} notSelected={true} />
    {/if}
  </div>

  <div class="compare">
  {#if allPlayers && allPlayers.length}
    {#if players && players.length < maxComparePlayers}
    <Button iconFa="fas fa-balance-scale" title={$_.songBrowser.compare.add} on:click={onAddPlayerToComparision} />
    {/if}
    {#if comparisionModified && isCached}
      <Button iconFa="fas fa-save" type="primary" title={$_.songBrowser.compare.saveAsDefault} on:click={onSaveComparision} />
    {/if}
  {/if}
  </div>
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
    <th class="icons"></th>
  </tr>
  </thead>
  {/if}

  <tbody>
  {#each songs as song, idx (song.leaderboardId)}
    <slot {song} {series}>
      <ScoreSaberScorePresenter {song} series={series[idx]} {cachedRecentPlay} />
    </slot>
  {/each}
  </tbody>
</table>

<Pager bind:currentPage
       itemsPerPage={PLAYS_PER_PAGE}
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
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .compare {
    font-size: .75rem;
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
    width: 14.5rem;
  }

  th.icons {
    width: 4rem;
    padding-right: 0;
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
</style>