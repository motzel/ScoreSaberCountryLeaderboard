<script>
    import {getPlayerAvatarUrl, getPlayerProfileUrl} from "../../../scoresaber/players";
    import BloodTrail from "./BloodTrail.svelte";

    export let playerId = null;
    export let url

    $: promisedUrl = url ? Promise.resolve(url) : getPlayerAvatarUrl(playerId);
</script>

<style>
    figure {
        margin: 0;
    }
</style>
{#await promisedUrl then fullUrl}
    <a href={getPlayerProfileUrl(playerId)}>
        {#if fullUrl}
            <figure class="image is-24x24"><img src={fullUrl} style="border-radius: 50%"></figure>
        {:else}
            <figure class="image is-24x24">
                <BloodTrail/>
            </figure>
        {/if}
    </a>
{/await}