<script>
    export let url;
</script>

<style>
    figure {
        margin: 0;
    }
</style>

{#if url}
    <figure class="image is-24x24"><img src={url} style="border-radius: 50%"></figure>
{/if}