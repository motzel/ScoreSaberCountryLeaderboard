import {getFirstRegexpMatch} from "../utils/js";
import {SCORESABER_URL} from "../network/scoresaber/consts";
import {getCacheAndConvertIfNeeded, setCache} from "../store";
import {dateFromString} from "../utils/date";
import {
    getAuthUrl,
    validateToken,
    getProfileByUsername as apiGetProfileByUsername,
    getVideos as apiGetVideos,
    getStreams as apiGetStreams
} from "../network/twitch";

const users = {
    '76561198059659922': 'patian25',
    '76561198028768705': 'thejanez',
    '1994101560659098': 'xoxobluff',
    '76561198138327464': 'altrowilddog',
    '76561198165064325': 'solace_to_ziomal',
    '76561198855288628': 'inbourne',
    '76561198136177445': 'riviengt',
    '76561198967371424': 'sinkingship1991',
    '76561199004224834': 'thanos2137',
    '76561198023909718': 'danielduel',
    '76561198212019365': 'fnyt',
    '76561197980434129': 'meldi__',
    '76561198067150351': 'koxsik3',
    '76561197966674102': 'majikkuuu',
    '76561198025451538': 'drakonno',
    '76561197994110158': 'sanorek',
    '76561198108580962': 'coggers',
    '76561198034203862': 'vr_agent',
    '76561198093469724': 'sebanan',
    '3702342373170767': 'xjedam',
    '76561197995161445': 'mediekore',
    '76561198035381239': 'motzel'
}

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

const createTwitchUsersCache = async () => {
    const data = await getCacheAndConvertIfNeeded();
    if (!data) return;

    if (!data.twitch) data.twitch = {token: null};

    if (!data.twitch.users) data.twitch.users = {};

    Object.entries(users).forEach(entry => {
        if (!data.twitch.users[entry[0]]) data.twitch.users[entry[0]] = {login: entry[1], lastUpdated: null};
    })
}

export default {
    getAuthUrl,
    getCurrentToken,
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
    },
    createTwitchUsersCache
}