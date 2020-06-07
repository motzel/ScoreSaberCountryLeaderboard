<script>
    import {SCORESABER_URL} from "../../../network/scoresaber/consts";

    export let song;
</script>

{#if song}
    <a href="{SCORESABER_URL + '/leaderboard/' + encodeURIComponent(song.leaderboardId)}">{song.songAuthor} - {song.name}</a>
{/if}