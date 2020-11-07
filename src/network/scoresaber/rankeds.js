import {fetchApiPage} from "../fetch";
import {getCacheAndConvertIfNeeded, setCache} from "../../store";
import {arrayDifference, nullIfUndefined} from "../../utils/js";
import {PLAYS_PER_PAGE, SCORESABER_URL} from "./consts";
import {default as queue} from "../queue";
import {extractDiffAndType} from "../../song";
import eventBus from "../../utils/broadcast-channel-pubsub"
import nodeSync from "../multinode-sync";

const convertFetchedRankedSongsToObj = (songs) =>
    songs.length
        ? songs.reduce((cum, s) => {
            cum[s.leaderboardId] = s;
            return cum;
        }, {})
        : null;

const fetchRankedSongsArray = async () =>
    fetchApiPage(queue.SCORESABER, SCORESABER_URL + '/api.php?function=get-leaderboards&cat=1&page=1&limit=5000&ranked=1')
        .then((songs) =>
            songs?.songs
                ? songs?.songs.map((s) => ({
                    leaderboardId: s.uid,
                    id: s.id,
                    name: s.name,
                    subName: s.songSubName,
                    songAuthor: s.songAuthorName,
                    levelAuthor: s.levelAuthorName,
                    diff: extractDiffAndType(s.diff),
                    stars: s.stars,
                    oldStars: null
                }))
                : []
        );

export async function updateRankeds(persist = true) {
    let fetchedRankedSongs;
    try {
        fetchedRankedSongs = await fetchRankedSongsArray();
        if (!fetchedRankedSongs || !fetchedRankedSongs.length) return null;
    } catch (e) {
        return null;
    }

    const data = await getCacheAndConvertIfNeeded(true);

    // add firstSeen property
    fetchedRankedSongs = convertFetchedRankedSongsToObj(
        fetchedRankedSongs.map(s => ({...s, firstSeen: data?.[s.leaderboardId]?.firstSeen ?? Date.now()}))
    );

    const oldRankedSongs = data.rankedSongs ? data.rankedSongs : {};

    // find differences between old and new ranked songs
    const changed =
        // concat new rankeds...
        arrayDifference(
            Object.keys(fetchedRankedSongs),
            Object.keys(oldRankedSongs)
        ).map(leaderboardId => ({
            leaderboardId: parseInt(leaderboardId, 10),
            oldStars: null,
            stars: fetchedRankedSongs[leaderboardId].stars
        }))
            // ... with changed rankeds
            .concat(
                Object.values(oldRankedSongs)
                    .filter((s) => s.stars !== fetchedRankedSongs?.[s.leaderboardId]?.stars)
                    .map(s => ({
                            leaderboardId: s.leaderboardId,
                            oldStars: s.stars,
                            stars: nullIfUndefined(fetchedRankedSongs?.[s.leaderboardId]?.stars)
                        })
                    )
            )
    ;

    // store all new ranked songs
    data.rankedSongs = fetchedRankedSongs;
    data.rankedSongsLastUpdated = new Date().toISOString();

    // store changes
    if (changed.length) {
        if (!data.rankedSongsChanges) data.rankedSongsChanges = {};
        data.rankedSongsChanges[Date.now()] = changed;
    }

    if (persist) {
        await setCache(data);
    }

    if (changed.length) {
        eventBus.publish('rankeds-changed', {nodeId: nodeSync.getId(), changed, allRankeds: fetchedRankedSongs});
    }

    return changed;
}