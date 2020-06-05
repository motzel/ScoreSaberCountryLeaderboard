import {substituteVars} from "../utils/format";

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