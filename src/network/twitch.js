import {queueFetchJson} from "./fetch";
import {default as queue} from "./queue";
import {SCORESABER_URL} from "./scoresaber/consts";

const clientId = 'c60s8xch3rksxz2i2rtuof3mczskzc';

export const getAuthUrl = (state = '', scopes = '') => `https://id.twitch.tv/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(SCORESABER_URL + '/')}&response_type=token&scope=${encodeURIComponent(scopes)}&state=${encodeURIComponent(state)}`;

export const validateToken = async accessToken => queueFetchJson(queue.TWITCH, 'https://id.twitch.tv/oauth2/validate', {headers: {'Authorization': 'OAuth ' + accessToken}});