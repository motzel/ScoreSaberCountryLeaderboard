import {fetchApiPage} from "../fetch";
import {getCacheAndConvertIfNeeded} from "../../store";
import {arrayIntersection, nullIfUndefined} from "../../utils/js";
import {SCORESABER_URL} from "./consts";
import {default as queue} from "../queue";
import {extractDiffAndType} from "../../song";

export const convertFetchedRankedSongsToObj = (songs) =>
    songs.length
        ? songs.reduce((cum, s) => {
            cum[s.leaderboardId] = s;
            return cum;
        }, {})
        : null;

export const fetchRankedSongsArray = async () =>
    fetchApiPage(queue.SCORESABER_API, SCORESABER_URL + '/api.php?function=get-leaderboards&cat=1&page=1&limit=5000&ranked=1')
        .then((songs) =>
            songs?.songs
                ? songs?.songs.map((s) => ({
                    leaderboardId: s.uid,
                    id: s.id,
                    name: s.name + ' ' + s.songSubName,
                    songAuthor: s.songAuthorName,
                    levelAuthor: s.levelAuthorName,
                    diff: extractDiffAndType(s.diff),
                    stars: s.stars,
                    oldStars: null
                }))
                : []
        );

export const fetchRankedSongs = async () => convertFetchedRankedSongsToObj(await fetchRankedSongsArray());

export async function getNewlyRanked() {
    const fetchedRankedSongs = await fetchRankedSongs();
    if (!fetchedRankedSongs) return null;

    const data = await getCacheAndConvertIfNeeded();

    const oldRankedSongs = data.rankedSongs ? data.rankedSongs : {};

    // find differences between old and new ranked songs
    return {
        allRanked: fetchedRankedSongs,
        newRanked: arrayIntersection(
            Object.keys(fetchedRankedSongs),
            Object.keys(oldRankedSongs)
        ).map((k) => fetchedRankedSongs[k]),
        changed: Object.values(oldRankedSongs)
            .filter((s) => s.stars !== fetchedRankedSongs?.[s.leaderboardId]?.stars)
            .map((s) =>
                Object.assign({}, s, {
                    oldStars: s.stars,
                    stars: nullIfUndefined(fetchedRankedSongs?.[s.leaderboardId]?.stars)
                })
            )
    };
}