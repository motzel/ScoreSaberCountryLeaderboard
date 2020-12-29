export const SCORESABER_URL = 'https://scoresaber.com';
export const NEW_SCORESABER_URL = 'https://new.scoresaber.com';
export const SCORESABER_API_URL = NEW_SCORESABER_URL + '/api';
export const PLAYER_INFO_URL = SCORESABER_API_URL + '/player/${userId}/full';
export const GLOBAL_URL = SCORESABER_URL + '/global/${page}';
export const PLAYERS_URL = SCORESABER_URL + '/global/${page}?country=${country}';
export const PLAYER_PROFILE_URL = SCORESABER_URL + '/u/${playerId}';
export const SCORES_URL = SCORESABER_API_URL + '/player/${playerId}/scores/recent/${page}';

export const SCORES_PER_PAGE = 12; // song leaderboard
export const PLAYS_PER_PAGE = 8; // top/recent plays
export const PLAYERS_PER_PAGE = 50; // global ranking
export const MAGIC_HISTORY_NUMBER = 999999; // just ask Umbra