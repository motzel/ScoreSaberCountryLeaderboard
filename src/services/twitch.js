import {getFirstRegexpMatch} from "../utils/js";
import {SCORESABER_URL} from "../network/scoresaber/consts";
import {getCacheAndConvertIfNeeded, setCache} from "../store";
import {dateFromString} from "../utils/date";
import {getAuthUrl, validateToken, getProfileByUsername as apiGetProfileByUsername, getVideos as apiGetVideos, getStreams as apiGetStreams} from "../network/twitch";

const getTwitchTokenFromUrl = () => {
    const hash = getFirstRegexpMatch(/scoresaber.com\/#(.*)$/, window.location.href);
    if (!hash) return null;

    const accessTokenMatch = /access_token=(.*?)(&|$)/.exec(hash);
    if (!accessTokenMatch) return null;

    const stateMatch = /state=(.*?)(&|$)/.exec(hash);

    return {accessToken: accessTokenMatch[1], url: stateMatch ? SCORESABER_URL + '/u/' + stateMatch[1] : ''};
}

const getCurrentToken = async () => {
    const data = await getCacheAndConvertIfNeeded();
    if (!data || !data.twitch || !data.twitch.token) return null;

    const expires = dateFromString(data.twitch.token.expires);
    const expiresIn = expires - (new Date());

    return Object.assign({}, data.twitch.token, {expires, expires_in: expiresIn > 0 ? expiresIn : 0});
}

const getProfileByUsername = async userName => {
    const token = (await getCurrentToken());
    if (!token || !token.expires_in || token.expires_in <= 0) return null;

    const profile = await apiGetProfileByUsername(token.accessToken, userName)

    return profile && profile.data && profile.data.length ? profile.data[0] : null;
}

const getVideos = async (userId, type = 'archive') => {
    const token = (await getCurrentToken());
    if (!token || !token.expires_in || token.expires_in <= 0) return null;

    return apiGetVideos(token.accessToken, userId, type)
}

const getStreams = async userId => {
    const token = (await getCurrentToken());
    if (!token || !token.expires_in || token.expires_in <= 0) return null;

    return apiGetStreams(token.accessToken, userId)
}

export default {
    getAuthUrl,
    getProfileByUsername,
    getVideos,
    getStreams,
    processTokenIfAvailable: async () => {
        const twitchToken = getTwitchTokenFromUrl();
        if (twitchToken) {
            const data = await getCacheAndConvertIfNeeded();
            if (!data.twitch) data.twitch = {token: null};

            // validate token
            const tokenValidation = await validateToken(twitchToken.accessToken);

            const expiresIn = tokenValidation.expires_in * 1000;

            data.twitch.token = Object.assign(
                {},
                data.twitch.token,
                tokenValidation,
                {
                    accessToken: twitchToken.accessToken,
                    expires: (new Date(Date.now() + expiresIn)).toISOString(),
                    expires_in: expiresIn
                }
            );

            await setCache(data);

            if (twitchToken.url) window.location.href = twitchToken.url;
        }
    }
}