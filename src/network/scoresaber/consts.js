import {default as config} from "../../temp";

export const SCORESABER_URL = 'https://scoresaber.com';
export const NEW_SCORESABER_URL = 'https://new.scoresaber.com';
export const SCORESABER_API_URL = NEW_SCORESABER_URL + '/api';
export const PLAYER_INFO_URL = SCORESABER_API_URL + '/player/${userId}/full';
export const USERS_URL = SCORESABER_URL + '/global/${page}?country=' + config.COUNTRY;
export const SCORES_URL = SCORESABER_API_URL + '/player/${userId}/scores/recent/${page}';

export const SCORES_PER_PAGE = 12; // song leaderboard
export const PLAYS_PER_PAGE = 8; // top/recent plays
export const PLAYERS_PER_PAGE = 50; // global ranking
export const MAGIC_HISTORY_NUMBER = 999999; // just ask Umbra

// Don't know what rate limits are, let's assume BeatSaver ones - 50 reqs/min, max 8 at the time
export const RATE_LIMITS = {
    concurrency: 8,
    limit: 50,
    time: 60 * 1000
}