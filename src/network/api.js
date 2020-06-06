import {substituteVars} from "../utils/format";
import {getCacheAndConvertIfNeeded} from "../store";
import {arrayIntersection, nullIfUndefined} from "../utils/js";

export const convertFetchedRankedSongsToObj = (songs) =>
    songs.length
        ? songs.reduce((cum, s) => {
            cum[s.leaderboardId] = s;
            return cum;
        }, {})
        : null;

function extractDiffAndType(ssDiff) {
    const match = /^_([^_]+)_Solo(.*)$/.exec(ssDiff);
    if (!match) return null;

    return {
        diff: match[1].toLowerCase().replace('plus', 'Plus'),
        type: match[2] ?? 'Standard'
    };
}

export const fetchApiPage = async (url, page = 1) =>
    fetch(substituteVars(url, {page}))
        .then((r) => r.json())
        .catch((e) => null);

export const fetchRankedSongsArray = async () =>
    fetchApiPage(
        'https://scoresaber.com/api.php?function=get-leaderboards&cat=1&page=1&limit=5000&ranked=1'
    ).then((songs) =>
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

    const oldRankedSongs = data.rankedSongs;

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