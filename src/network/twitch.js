import {queueFetchJson} from "./fetch";
import {default as queue} from "./queue";
import {SCORESABER_URL} from "./scoresaber/consts";

const clientId = 'c60s8xch3rksxz2i2rtuof3mczskzc';

const fetchApi = (url, token) => queueFetchJson(
    queue.TWITCH,
    url,
    {
        headers: {
            'Client-ID': clientId,
            'Authorization': `Bearer ${token}`
        }
    }
);

export const getAuthUrl = (state = '', scopes = '') => `https://id.twitch.tv/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(SCORESABER_URL + '/')}&response_type=token&scope=${encodeURIComponent(scopes)}&state=${encodeURIComponent(state)}`;

export const validateToken = async accessToken => queueFetchJson(queue.TWITCH, 'https://id.twitch.tv/oauth2/validate', {headers: {'Authorization': 'OAuth ' + accessToken}});

export const getProfileByUsername = async (token, userName) => fetchApi(`https://api.twitch.tv/helix/users?login=${encodeURIComponent(userName)}`, token);

export const getVideos = async (token, userId, type = 'archive') => fetchApi(`https://api.twitch.tv/helix/videos?user_id=${encodeURIComponent(userId)}&type=${encodeURIComponent(type)}`, token)

export const getStreams = async (token, userId) => fetchApi(`https://api.twitch.tv/helix/streams?user_id=${encodeURIComponent(userId)}`, token)