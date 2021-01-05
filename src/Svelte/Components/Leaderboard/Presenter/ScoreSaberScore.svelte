<script>
  import {onMount} from 'svelte'
  import {fly} from 'svelte/transition';
  import {_} from "../../../stores/i18n";
  import eventBus from '../../../../utils/broadcast-channel-pubsub';
  import {formatNumber} from '../../../../utils/format'
  import WhatIfPp from "../../Song/WhatIfPp.svelte";
  import Pp from "../../Common/Pp.svelte";
  import Value from "../../Common/Value.svelte";
  import {getConfig} from '../../../../plugin-config'
  import Avatar from '../../Common/Avatar.svelte'
  import Rank from '../../Common/Rank.svelte'
  import Player from '../../Common/Player.svelte'

  export let score = {};

  let showWhatIfPp = true;
  let showDifferences = true;

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

{#if score}
  <tr in:fly={{ x: 50, duration: 500 }}>

    <td class="picture">
      <Avatar playerId={score.playerId} url={score.picture} />
    </td>

    <td class="rank">
      <Rank rank={score.rank} url="" />
    </td>

    <td class="player">
      <Player user={score.playerId && score.playerName ? {id: score.playerId, name: score.playerName, country: score.country} : null }/>
    </td>

    <td class="score">
      <Value value="{score.score}" prevValue={!showDifferences ? null : score.prevScore} inline={true} digits={0}/>
    </td>

    <td class="timeset">{score.timesetAgo}</td>

    <td class="mods">{score.mods ? score.mods : '-'}</td>

    <td class="percentage">
      <Value value={score.acc ? score.acc * 100 : null} withZeroSuffix={false}
             prevValue={!showDifferences ? null : score.prevAcc}
             inline={true} suffix="%" zero="-" />
    </td>

    <td class="pp">
      <Pp pp="{score.pp}" prevPp={!showDifferences ? null : score.prevPp} zero={formatNumber(0)}
          withZeroSuffix={true} inline={true}/>
     {#if showWhatIfPp}
       <WhatIfPp leaderboardId={score.leaderboardId} pp={score.pp}/>
     {/if}
    </td>
  </tr>
{/if}

<style>
  td {
    vertical-align: middle !important;
    padding: .5rem!important;
  }

  td.picture {
    padding: .5rem 0!important;
  }

  td.score, td.pp {
    width: 6rem;
  }

  td.mods, td.percentage, td.pp {
    text-align: center;
  }

</style>