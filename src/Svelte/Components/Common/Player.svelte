<script>
    import {substituteVars} from '../../../utils/format';
    import {USER_PROFILE_URL} from "../../../network/scoresaber/consts";

    export let user;

    $: userId = user && user.id ? user.id : null;
    $: userCountry = user && user.country ? user.country.toLowerCase() : null;
    $: userName = user && user.name ? user.name : '???'
</script>
{#if user}
    <a href="{substituteVars(USER_PROFILE_URL, { userId })}">
        {#if userCountry}<img src="/imports/images/flags/{userCountry}.png"/>{/if}
        <span class="player-name">{userName}</span>
    </a>
{/if}