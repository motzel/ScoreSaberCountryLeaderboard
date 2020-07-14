<script>
    import {NEW_SCORESABER_URL} from "../../../network/scoresaber/consts";

    export let url;

    $: fullUrl = url.startsWith('http') ? url : NEW_SCORESABER_URL + url;
</script>

<style>
    figure {
        margin: 0;
    }
</style>

{#if url}
    <figure class="image is-24x24"><img src={fullUrl} style="border-radius: 50%"></figure>
{/if}