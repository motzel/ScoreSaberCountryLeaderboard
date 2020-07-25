<script>
    import {getConfig} from "../../../plugin-config";
    import twitch from '../../../services/twitch';

    import Button from '../Common/Button.svelte';
    import {getPlayerInfo} from "../../../scoresaber/players";
    import {getCacheAndConvertIfNeeded, setCache} from "../../../store";
    import {dateFromString} from "../../../utils/date";

    export let profileId;

    let mainUserId;
    let playerInfo;

    let showTwitchBtn = true;
    let twitchBtnLabel = '';
    let twitchBtnTitle = '';
    let twitchBtnDisabled = false;

    (async () => {
        const config = await getConfig();
        mainUserId = config && config.users && config.users.main ? config.users.main : null;
        playerInfo = await getPlayerInfo(profileId)

        let twitchProfile = await twitch.getProfileName(profileId);
        if (profileId && twitchProfile) {
            const data = await getCacheAndConvertIfNeeded();

            const twitchToken = await twitch.getCurrentToken();
            const tokenExpireInDays = twitchToken ? Math.floor(twitchToken.expires_in / 1000 / 60 / 60 / 24) : null;
            const tokenExpireSoon = tokenExpireInDays <= 3;

            showTwitchBtn = config && config.profile && config.profile.showTwitchIcon || tokenExpireSoon;

            twitchBtnLabel = twitchToken ? (!tokenExpireSoon ? 'Połączono' : 'Odnów') : 'Połącz';
            twitchBtnTitle = twitchToken && tokenExpireInDays > 0 ? `Pozostało dni: ${tokenExpireInDays}` : null;
            twitchBtnDisabled = !tokenExpireSoon;

            if (!twitchProfile.id) {
                const fetchedProfile = await twitch.getProfileByUsername(twitchProfile.login);
                if (fetchedProfile) {
                    twitchProfile = Object.assign({}, twitchProfile, fetchedProfile);
                    data.twitch.users[profileId] = twitchProfile;
                }
            }

            if (twitchProfile.id) {
                const scoresRecentPlay = data.users[profileId].recentPlay ? data.users[profileId].recentPlay : data.users[profileId].lastUpdated;
                const twitchLastUpdated = twitchProfile.lastUpdated;

                if (!scoresRecentPlay || !twitchLastUpdated || dateFromString(scoresRecentPlay) > dateFromString(twitchLastUpdated)) {
                    const videos = await twitch.getVideos(twitchProfile.id);
                    if (videos && videos.data) {
                        twitchProfile.videos = videos.data;
                        twitchProfile.lastUpdated = new Date();

                        await setCache(data);
                    }
                }
            }
        }
    })()

    async function setAsMainProfile() {
        if (!profileId) return;

        const data = await getCacheAndConvertIfNeeded();
        data.config.users.main = profileId;
        await setCache(data);

        location.reload();
    }

</script>

{#if playerInfo}
    {#if showTwitchBtn}
        <Button iconFa="fab fa-twitch" label={twitchBtnLabel} title={twitchBtnTitle} disabled={twitchBtnDisabled}
                type="twitch" on:click={() => window.location.href = twitch.getAuthUrl(profileId ? profileId : '')}/>
    {/if}

    {#if profileId !== mainUserId}
        <Button iconFa="fas fa-user-check" type="primary" title="Ustaw jako główny profil" on:click={setAsMainProfile}/>
    {:else}
        <Button iconFa="fas fa-cog" title="Ustawienia"/>
    {/if}
{/if}

<style>

</style>