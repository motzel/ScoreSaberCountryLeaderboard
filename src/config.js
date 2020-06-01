const COUNTRY = 'pl';
const SSE_CHECK_DELAY = 500;

const SCORESABER_URL = 'https://scoresaber.com';
const NEW_SCORESABER_URL = 'https://new.scoresaber.com';
const SCORESABER_API_URL = NEW_SCORESABER_URL + '/api';

const USER_PROFILE_URL = SCORESABER_URL + '/u/${userId}';

export default {
    COUNTRY,
    SSE_CHECK_DELAY,

    SCORESABER_URL,
    NEW_SCORESABER_URL,
    SCORESABER_API_URL,
    USER_PROFILE_URL,

    SS_PLAYERS_PER_PAGE: 50, // global ranking
    MAGIC_HISTORY_NUMBER: 999999, // just ask Umbra
    SS_SCORES_PER_PAGE: 12, // song leaderboard
    SS_PLAYS_PER_PAGE: 8 // top/recent plays
};

export function getMainUserId() {
    let user = localStorage.getItem('home_user');
    return user ? JSON.parse(user).id : null;
}