// TODO: remove it when config UI will be ready

export default {
    COUNTRY: 'pl',
    COUNTRY_PLAYERS_QTY: 50,
    SSE_CHECK_DELAY: 50
};

export function getSseMainUserId() {
    let user = localStorage.getItem('home_user');
    return user ? JSON.parse(user).id : null;
}