<script>
    import Song from "./Song.svelte";
    import Mapper from "./Mapper.svelte";
    import Pp from '../Common/Pp.svelte';
    import Diff from '../Common/Diff.svelte';
    import Stars from "./Stars.svelte";

    export let rankeds = [];
</script>

<style>
    table {margin-bottom: 2rem;}
    table th, table td {text-align: center;}
    table tbody tr td:nth-child(1) {text-align: left;}
</style>

{#if rankeds && rankeds.length}
<h3>Nowe/zmienione rankedy</h3>

<table class="ranking sspl">
    <thead>
    <tr>
        <th>Nuta</th>
        <th>Mapper</th>
        <th>Trudność</th>
        <th>PP</th>
        <th>*</th>
        <th>Stare *</th>
    </tr>
    </thead>

    <tbody>
    {#each rankeds as item, idx (item.leaderboardId)}
        <tr>
            <td><Song song={item} /></td>
            <td><Mapper name={item.levelAuthor} /></td>
            <td><Diff diff={item.diff} /></td>
            <td><Pp pp={item.pp} /></td>
            <td><Stars stars={item.stars} /></td>
            <td><Stars stars={item.oldStars} /></td>
        </tr>
    {/each}
    </tbody>
</table>
{/if}