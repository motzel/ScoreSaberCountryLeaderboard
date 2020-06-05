<script>
    import {default as config} from '../../../config';
    import {substituteVars} from '../../../utils/format';

    export let user;

    $: userId = user && user.id ? user.id : null;
    $: userCountry = user && user.country ? user.country.toLowerCase() : config.COUNTRY;
    $: userName = user && user.name ? user.name : '???'
</script>
{#if user}
    <a href="{substituteVars(config.USER_PROFILE_URL, { userId })}">
        <img src="/imports/images/flags/{userCountry}.png"/>
        <span class="player-name">{userName}</span>
    </a>
{/if}