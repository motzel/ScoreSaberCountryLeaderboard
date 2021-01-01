<script>
  import {slide} from 'svelte/transition';
  import {_} from '../../stores/i18n';
  import Badge from '../Common/Badge.svelte'
  import Value from '../Common/Value.svelte'
  import FormattedDate from '../Common/FormattedDate.svelte'

  export let playerTwitchProfile;

  let showDetails = false;
</script>

{#if playerTwitchProfile && playerTwitchProfile.videos}
  <Badge label={$_.profile.twitch.vodsBadge} fluid={true} color="#dbdbdb" bgColor="#9146ff">
    <span slot="value">
      <Value value={playerTwitchProfile.videos.length} digits={0} />

     {#if playerTwitchProfile.videos.length > 0}
       <i class={showDetails ? "fas fa-chevron-up details" : "fas fa-chevron-right details"}
          on:click={() => showDetails = !showDetails}></i>
     {/if}
    </span>
  </Badge>

  {#if playerTwitchProfile.videos.length > 0 && showDetails}
  <div class="content" transition:slide={{duration: 500}}>
    <table>
      <thead>
      <tr>
        <th class="date">{$_.songBrowser.fields.timesetShort}</th>
        <th>{$_.profile.twitch.video}</th>
      </tr>
      </thead>
      <tbody>
      {#each playerTwitchProfile.videos as video}
      <tr>
        <td><FormattedDate date={video.created_at} /></td>
        <td><a href={video.url} target="_blank" rel="noopener">{video.title}</a></td>
      </tr>
      {/each}
      </tbody>
    </table>
  </div>
  {/if}
{/if}

<style>
  .details {
    cursor: pointer;
    margin-left: .25rem;
  }

  table {
    font-size: 0.75em;
  }

  th.date {
    width: 7em;
  }
</style>