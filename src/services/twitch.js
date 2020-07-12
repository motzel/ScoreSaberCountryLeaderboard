import {getFirstRegexpMatch} from "../utils/js";
import {SCORESABER_URL} from "../network/scoresaber/consts";
import {getCacheAndConvertIfNeeded, setCache} from "../store";
import {getAuthUrl, validateToken} from "../network/twitch";

const getTwitchTokenFromUrl = () => {
    const hash = getFirstRegexpMatch(/scoresaber.com\/#(.*)$/, window.location.href);
    if (!hash) return null;

    const accessTokenMatch = /access_token=(.*?)(&|$)/.exec(hash);
    if (!accessTokenMatch) return null;

    const stateMatch = /state=(.*?)(&|$)/.exec(hash);

    return {accessToken: accessTokenMatch[1], url: stateMatch ? SCORESABER_URL + '/u/' + stateMatch[1] : ''};
}

export default {
    getAuthUrl,

    processTokenIfAvailable: async () => {
        const twitchToken = getTwitchTokenFromUrl();
        if (twitchToken) {
            const data = await getCacheAndConvertIfNeeded();
            if (!data.twitch) data.twitch = {token: null};

            // validate token
            const tokenValidation = await validateToken(twitchToken.accessToken);
            data.twitch.token = Object.assign(
                {},
                data.twitch.token,
                tokenValidation,
                {
                    accessToken: twitchToken.accessToken,
                    expires: (new Date(Date.now() + tokenValidation.expires_in * 1000)).toISOString()
                }
            );

            await setCache(data);

            if (twitchToken.url) window.location.href = twitchToken.url;
        }
    }
}