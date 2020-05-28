const COUNTRY = 'pl';
const SSE_CHECK_DELAY = 500;

const SCORESABER_URL = 'https://scoresaber.com';
const USER_PROFILE_URL = SCORESABER_URL + '/u/${userId}';

export default {
    COUNTRY,
    SSE_CHECK_DELAY,

    SCORESABER_URL,
    USER_PROFILE_URL,

    SS_PLAYERS_PER_PAGE: 50, // global ranking
    MAGIC_HISTORY_NUMBER: 999999 // just ask Umbra
};

export function getMainUserId() {
    let user = localStorage.getItem('home_user');
    return user ? JSON.parse(user).id : null;
}