import {getCacheAndConvertIfNeeded} from "../store";

export const getRankedSongs = async (force = false) => (await getCacheAndConvertIfNeeded(force)).rankedSongs;
export const getRankedChanges = async _ => (await getCacheAndConvertIfNeeded()).rankedSongsChanges ?? {};
export const getCumulativeRankedChangesSince = async since => {
    const currentRankeds = await getRankedSongs();
    const changes = await getRankedChanges();

    const matchingTimestamps = Object.keys(changes).filter(c => c > since).sort((a, b) => a - b);

    return Object.values(
        matchingTimestamps
            .reduce((cum, timestamp) => {
                changes[timestamp].forEach(change => {
                    if (!cum[change.leaderboardId]) cum[change.leaderboardId] = {
                        leaderboardId: change.leaderboardId,
                        stars: null
                    };
                    cum[change.leaderboardId].stars = change.stars;
                })

                return cum;
            }, {})
    )
        .filter(c => c.stars !== currentRankeds?.[c.leaderboardId]?.stars)
        .map(c => ({...c, oldStars: currentRankeds?.[c.leaderboardId]?.stars ?? null}))
}

// errors in API
export const UNRANKED = [97223, 20506];
export const RANKED = [102179, 102180]