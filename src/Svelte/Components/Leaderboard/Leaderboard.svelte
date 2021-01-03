<script>
  import Card from '../Song/LeaderboardCard.svelte'

  export let leaderboardId;
  export let leaderboardPage = {};

  const getSongProp = name => leaderboardPage && leaderboardPage.song && leaderboardPage.song[name] ? leaderboardPage.song [name]: null;
  const difficulty = leaderboardPage && leaderboardPage.currentDiff ? leaderboardPage.currentDiff : null;

  const song = leaderboardPage && leaderboardPage.song ? leaderboardPage.song : null;
  const songInfo = song ? {metadata: song} : null;
</script>

<div class="columns">
  <div class="column">
    <div class="box has-shadow">
      MAIN
    </div>
  </div>

  <div class="column is-one-third-desktop">
    <Card {leaderboardId} {difficulty} {songInfo} {...song} />
  </div>
</div>

<style>

</style>