<script>
  import {fly} from 'svelte/transition';
  import {_} from "../../../stores/i18n";
  import {formatNumber} from "../../../../utils/format";
  import WhatIfPp from "../WhatIfPp.svelte";
  import Pp from "../../Common/Pp.svelte";
  import Value from "../../Common/Value.svelte";
  import ScoreRank from '../../Common/ScoreRank.svelte'
  import Difficulty from '../../Common/Difficulty.svelte'
  import Song from '../Song.svelte'
  import FormattedDate from '../../Common/FormattedDate.svelte'

  export let song = null;
  export let series = [];
  export let showWhatIfPp = true;
</script>

{#if song}
  <tr in:fly={{ x: 200, duration: 500 }}>
    <td class="rank">
    {#each series as playerScore, idx}{#if idx === 0}
      <ScoreRank rank={playerScore.rank}
                 countryRank={playerScore.ssplCountryRank}
                 country={playerScore.country}
                 disableUpdating={true}
                 inline={false}
      />
      {/if}{/each}
    </td>
    <td class="diff"><Difficulty diff={song.diffInfo} useShortName={true} reverseColors={true}/></td>
    <td class="song">
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
    </td>

    <td class="timeset">
      <FormattedDate date={series[0].timeset} />
    </td>

    {#each series as playerScore, idx}
      <td class="score" class:main={idx === 0}>
        {#if playerScore}
          {#if playerScore.pp}
          <Pp pp="{playerScore.pp}" prevPp={idx > 0 ? null : playerScore.prevPp} zero={formatNumber(0)}
              withZeroSuffix={true} weighted={playerScore.ppWeighted} inline={true}/>
          {/if}

          {#if playerScore.acc}
            <div>
              <span class="scoreBottom">
                {$_.songBrowser.fields.acc}:
                <Value value={playerScore.acc} withZeroSuffix={true} prevValue={idx > 0 ? null : playerScore.prevAcc} inline={true}
                       suffix={'%' + (playerScore.mods && playerScore.mods.length ? ' (' + playerScore.mods + ')' : '')} suffixPrev="%"
                />
              </span>
            </div>
          {/if}

          {#if playerScore.score}
            <div>
              <span class="scoreBottom">
                {$_.songBrowser.fields.score}:
                <Value value="{playerScore.score}" prevValue={idx > 0 ? null : playerScore.prevScore} inline={true} digits={0}/>
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
  </tr>
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
    width: 14rem;
  }
</style>