// TODO: remove it when config UI will be ready

export default {
    COUNTRY: 'pl',
    SSE_CHECK_DELAY: 500
};

export function getMainUserId() {
    let user = localStorage.getItem('home_user');
    return user ? JSON.parse(user).id : null;
}