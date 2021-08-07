import {fetchApiPage} from "../fetch";
import {arrayDifference, nullIfUndefined} from "../../utils/js";
import {SCORESABER_URL} from "./consts";
import {default as queue} from "../queue";
import {extractDiffAndType} from "../../song";
import eventBus from "../../utils/broadcast-channel-pubsub"
import nodeSync from "../../utils/multinode-sync";
import {
  getRankedSongs,
  setRankedSongsLastUpdated,
  storeRankeds,
  storeRankedsChanges,
} from '../../scoresaber/rankeds'
import {db} from "../../db/db";

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
                    hash: s.id,
                    name: s.name + (s.songSubName && s.songSubName.length ? ' ' + s.songSubName : ''),
                    songAuthor: s.songAuthorName,
                    levelAuthor: s.levelAuthorName,
                    diffInfo: extractDiffAndType(s.diff),
                    stars: s.stars,
                    oldStars: null,
                }))
                : []
        );

export async function updateRankeds() {
  let fetchedRankedSongs;
  try {
    fetchedRankedSongs = await fetchRankedSongsArray();
    if (!fetchedRankedSongs || !fetchedRankedSongs.length) return null;
  } catch (e) {
    return null;
  }

  const oldRankedSongs = await getRankedSongs() ?? {};

  // add firstSeen property
  fetchedRankedSongs = convertFetchedRankedSongsToObj(
    fetchedRankedSongs.map(s => ({...s, firstSeen: oldRankedSongs?.[s.leaderboardId]?.firstSeen ?? new Date()})),
  );

  // find differences between old and new ranked songs
  const newRankeds = arrayDifference(
    Object.keys(fetchedRankedSongs),
    Object.keys(oldRankedSongs),
  ).map(leaderboardId => ({
    leaderboardId: parseInt(leaderboardId, 10),
    oldStars: null,
    stars: fetchedRankedSongs[leaderboardId].stars,
    timestamp: Date.now(),
  }));

  const changed =
    // concat new rankeds with changed rankeds
    newRankeds
      .concat(
        Object.values(oldRankedSongs)
          .filter((s) => s.stars !== fetchedRankedSongs?.[s.leaderboardId]?.stars)
          .map(s => ({
              leaderboardId: s.leaderboardId,
              oldStars: s.stars,
              stars: nullIfUndefined(fetchedRankedSongs?.[s.leaderboardId]?.stars),
              timestamp: Date.now()
            }),
          ),
      )
  ;

  const changedLeaderboards = changed
    .map(s => ({
      ...(fetchedRankedSongs?.[s.leaderboardId] ? fetchedRankedSongs[s.leaderboardId] : oldRankedSongs?.[s.leaderboardId]), ...s
    }))
    .filter(s => s.hash)
    .map(l => {
      const {oldStars, timestamp, ...leaderboard} = l;
      return leaderboard;
    });

  try {
    await db.runInTransaction(['rankeds', 'rankeds-changes', 'key-value'], async _ => {
      await storeRankeds(changedLeaderboards);
      await storeRankedsChanges(changed);
      await setRankedSongsLastUpdated(new Date());
    });

    if (changed.length) {
      eventBus.publish('rankeds-changed', {nodeId: nodeSync().getId(), changed, allRankeds: fetchedRankedSongs});
    }

    return changed;
  } catch (e) {
    return null;
  }
}