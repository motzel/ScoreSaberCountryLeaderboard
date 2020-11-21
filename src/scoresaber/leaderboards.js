import leaderboardsRepository from "../db/repository/leaderboards";

export const storeLeaderboard = async leaderboard => leaderboardsRepository().set(leaderboard);
export const storeLeaderboards = async leaderboards => Promise.all(leaderboards.map(async l => storeLeaderboard(l)));