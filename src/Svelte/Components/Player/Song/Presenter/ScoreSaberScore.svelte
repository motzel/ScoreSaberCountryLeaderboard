<script>
  import {onMount} from 'svelte'
  import {fly} from 'svelte/transition';
  import {_} from "../../../../stores/i18n";
  import eventBus from '../../../../../utils/broadcast-channel-pubsub';
  import {formatNumber} from "../../../../../utils/format";
  import WhatIfPp from "../../../Song/WhatIfPp.svelte";
  import Pp from "../../../Common/Pp.svelte";
  import Value from "../../../Common/Value.svelte";
  import ScoreRank from '../../../Common/ScoreRank.svelte'
  import Difficulty from '../../../Common/Difficulty.svelte'
  import Song from '../../../Song/Song.svelte'
  import FormattedDate from '../../../Common/FormattedDate.svelte'
  import {getConfig} from '../../../../../plugin-config'
  import Icons from '../../../Song/Icons.svelte'
  import Leaderboard from '../../../Leaderboard/Leaderboard.svelte'
  import Button from '../../../Common/Button.svelte'

  export let song = null;
  export let series = [];
  export let cachedRecentPlay = null;

  let showWhatIfPp = true;
  let showDifferences = true;

  let showLeaderboard = false;

  async function updateConfig() {
    const slConfig = await getConfig('songLeaderboard');
    showWhatIfPp = !!(slConfig && slConfig.showWhatIfPp);
    showDifferences = !!(slConfig && slConfig.showDiff);
  }

  onMount(async () => {
    await updateConfig();

    return eventBus.on('config-changed', updateConfig);
  });
</script>

{#if song}
  <tr in:fly={{ x: 50, duration: 500 }}>
    <td class="rank">
    {#each series as playerScore, idx}{#if idx === 0}
      <ScoreRank rank={playerScore.rank}
                 countryRank={playerScore.ssplCountryRank}
                 country={playerScore.country}
                 disableUpdating={true}
                 timeset={playerScore.timeset}
                 {cachedRecentPlay}
                 inline={false}
      />
      {/if}{/each}
    </td>
    <td class="diff"><Difficulty diff={song.diffInfo} useShortName={true} reverseColors={true}/></td>
    <td class="song"><div>
      <Song song={song}>
        <figure>
          <img src="/imports/images/songs/{song.hash}.png"/>
          <div class="songinfo">
            <span class="name">{song.name}</span>
            <div class="author">{song.songAuthor} <small>{song.levelAuthor}</small>
            </div>
          </div>
        </figure>
      </Song>

      <Button type="text" iconFa={showLeaderboard ? "fas fa-chevron-down" : "fas fa-chevron-right"} on:click={() => showLeaderboard = !showLeaderboard} />
    </div></td>
    <td class="timeset">
      <FormattedDate date={series[0].timeset} />
    </td>

    {#each series as playerScore, idx}
      <td class="score" class:main={idx === 0}>
        {#if playerScore}
          {#if playerScore.pp}
          <Pp pp="{playerScore.pp}" prevPp={idx > 0 || !showDifferences ? null : playerScore.prevPp} zero={formatNumber(0)}
              withZeroSuffix={true} weighted={playerScore.ppWeighted} inline={true}/>
          {/if}

          {#if playerScore.acc}
            <div>
              <span class="scoreBottom">
                {$_.songBrowser.fields.acc}:
                <Value value={playerScore.acc} withZeroSuffix={true} prevValue={idx > 0 || !showDifferences ? null : playerScore.prevAcc} inline={true}
                       suffix={'%' + (playerScore.mods && playerScore.mods.length ? ' (' + playerScore.mods + ')' : '')} suffixPrev="%"
                />
              </span>
            </div>
          {/if}

          {#if playerScore.score}
            <div>
              <span class="scoreBottom">
                {$_.songBrowser.fields.score}:
                <Value value="{playerScore.score}" prevValue={idx > 0 || !showDifferences ? null : playerScore.prevScore}
                       inline={true} digits={0} prefix={playerScore.scoreApproximate ? '~' : ''}/>
              </span>
            </div>
          {/if}

          {#if showWhatIfPp}
            <WhatIfPp leaderboardId={playerScore.leaderboardId} pp={playerScore.pp}/>
          {/if}

        {:else}
          <div class="empty">-</div>
        {/if}
      </td>
    {/each}
    {#if song && song.hash}
    <td class="icons">
      <Icons hash={song.hash} twitchUrl={song.video && song.video.url ? song.video.url : null}  />
    </td>
    {/if}
  </tr>
  {#if showLeaderboard}
    <tr class="details">
      <td colspan="7" on:dblclick={() => showLeaderboard = !showLeaderboard}>
        <Leaderboard leaderboardId={song.leaderboardId} onlySelectedDiff={true}
                     startAtRank={series && series[0] && series[0].rank ? series[0].rank : 1}
                     highlight={series && series[0] && series[0].playerId ? [series[0].playerId] : []}
                     bgLeft="-2rem" bgTop="-3rem" bgWidth="2rem" bgHeight="2rem"
        />
      </td>
    </tr>
  {/if}
{/if}

<style>
  td {
    vertical-align: middle !important;
  }

  td.rank {
    width: 7rem;
    text-align: center!important;
  }

  td.diff {
    width: 1.5rem;
    padding: 0;
  }

  td.song > div {
    display: flex;
    justify-content: space-between;
  }

  tr.details:hover {
    background-color: inherit!important;
  }

  tr.details td {
    padding-top: 1rem;
    padding-bottom: 2rem;
  }

  td.song figure {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    margin: 0;
  }

  td.song img {
    flex: 0 1 40px;
    width: 40px;
    height: 40px;
    margin: 0 1em 0 .5em;
  }

  td.song .songinfo {
    text-align: left;
    font-size: .95rem;
    font-weight: 500;
  }

  td.song .songinfo {
    color: var(--alternate);
  }

  td.song .songinfo small {
    font-size: 0.75em;
    color: var(--ppColour);
  }

  td.timeset {
    width: 8.5rem;
    text-align: center;
  }

  td.score {
    position: relative;
    width: 11rem;
  }

  td.score.main {
    width: 14.5rem;
  }

  :global(td.score.main .what-if) {
    right: .5rem;
  }

  td.icons {
    font-size: 0.65rem;
    width: 4rem;
    padding-right: 0;
  }
</style>