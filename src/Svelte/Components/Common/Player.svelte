<script>
    import {getPlayerProfileUrl} from "../../../scoresaber/players";

    export let user;

    $: userId = user && user.id ? user.id : null;
    $: userCountry = user && user.country ? user.country.toLowerCase() : null;
    $: userName = user && user.name ? user.name : '???'
</script>
{#if user}
    <a href="{getPlayerProfileUrl(userId, true)}">
        {#if userCountry}<img src="/imports/images/flags/{userCountry}.png"/>{/if}
        <span class="player-name">{userName}</span>
    </a>
{/if}