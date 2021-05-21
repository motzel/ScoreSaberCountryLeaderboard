<script>
    import { onMount } from 'svelte';
    import { getActiveCountry } from '../../../scoresaber/country';
    import { getManuallyAddedPlayers } from '../../../scoresaber/players';

    let friends = null;

    onMount(async () => {
        const players = await getManuallyAddedPlayers(await getActiveCountry());
        
        friends = players.map((p) => ({
            id: p.id,
            name: p.name,
            url: p.url
        }));
    });
</script>

{#if friends}
<div class="dropdown">
    <div>Friends
        <i class="fa fa-caret-down" />
    </div>

    <div class="dropdown-content">
        {#each friends as friend (friend.id)}
            <a href={friend.url}>{friend.name}</a>
        {/each}
    </div>
</div>
{/if}

<style>    
    .dropdown {
      position: relative;
      display: inline-block;
    }
    
    .dropdown-content {
        background-color: var(--background);
        display: none;
        position: absolute;
        min-width: 160px;
        max-height: 70vh;
        overflow-y: auto;
        box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
        z-index: 1;
    }

    ::-webkit-scrollbar {
        width: 10px;
    }

    ::-webkit-scrollbar-track {
        background-color: var(--background);
    }
 
    ::-webkit-scrollbar-thumb {
        background: #888;
        border-radius: 5px;
    }
    
    ::-webkit-scrollbar-thumb:hover {
        background: #555; 
    }
    
    .dropdown-content a {
      color: black;
      padding: 12px 16px;
      text-decoration: none;
      display: block;
    }
    
    .dropdown-content a:hover {
        background-color: var(--hover);
    }
    
    .dropdown:hover .dropdown-content {
        display: block;
    }

</style>
