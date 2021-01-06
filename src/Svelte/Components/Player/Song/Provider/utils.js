import {
  getAccFromScore,
  getDiffAndTypeFromOnlyDiffName,
  getLeaderboardMaxScore,
  getSongMaxScore,
} from '../../../../../song'
import {addToDate, dateFromString, durationToMillis, millisToDuration} from '../../../../../utils/date'
import {shouldBeHidden} from '../../../../../eastereggs'
import {round} from '../../../../../utils/format'
import en from '../../../../../translations/en'

export const enhanceScore = async (score, cachedScore, maxScore, waitForMaxScore = false) => {
  let enhancedScore = {};
  try {
    const maxScoreEx = maxScore ?? (!waitForMaxScore && score.leaderboardId && score.hash && score.diffInfo ? await getLeaderboardMaxScore(score.leaderboardId, score.hash, score.diffInfo.diff) : cachedScore?.maxScoreEx);

    const ssScoreDate = dateFromString(score.timeset);
    const useDownloadedScore = cachedScore?.timeset && ssScoreDate && cachedScore?.timeset?.getTime() === ssScoreDate.getTime();
    if (useDownloadedScore) {
      enhancedScore = {...score, ...cachedScore, maxScoreEx, rank: score.rank};
    } else {
      enhancedScore = {...score};
    }

    if (maxScoreEx && enhancedScore.score && (!enhancedScore?.mods?.length || enhancedScore?.mods === "-")) enhancedScore.acc = enhancedScore.score * 100 / maxScoreEx;

    const useCurrentScoreAsPrev = (score.pp && cachedScore?.pp && round(cachedScore.pp) < round(score.pp)) ||
      (score.score && cachedScore?.score && cachedScore.score < score.score);

    if (!enhancedScore.acc && enhancedScore.score && maxScoreEx) {
      enhancedScore.acc = getAccFromScore({score: enhancedScore.score, maxScoreEx});
    }

    if(!enhancedScore.score && enhancedScore.acc) {
      enhancedScore.score = maxScoreEx ? Math.round(enhancedScore.acc * maxScoreEx / 100) : null;
      enhancedScore.scoreApproximate = true;
    }

    enhancedScore.hidden = cachedScore?.acc ? shouldBeHidden(Object.assign({}, cachedScore, {id: cachedScore.playerId, acc: cachedScore.acc})) : false;

    const history = ((Array.isArray(cachedScore?.history) && cachedScore.history.length ? cachedScore.history : []).sort((a,b) => b.score - a.score))[0];
    if (useCurrentScoreAsPrev || history) {
      enhancedScore.prevRank = useCurrentScoreAsPrev ? cachedScore.rank : history.rank;
      enhancedScore.prevPp = useCurrentScoreAsPrev ? cachedScore.pp : history.pp;
      enhancedScore.prevScore = useCurrentScoreAsPrev ? cachedScore.score : history.score;
      enhancedScore.prevTimeset = useCurrentScoreAsPrev ? dateFromString(cachedScore.timeset) : new Date(history.timestamp);
      enhancedScore.prevAcc = getAccFromScore({
        score: useCurrentScoreAsPrev ? cachedScore.score : history.score,
        uScore: useCurrentScoreAsPrev ? cachedScore.uScore : history.uScore,
        maxScoreEx,
      });
    }
  } catch (e) {} // swallow error

  return enhancedScore;
}

export async function findTwitchVideo(playerTwitchProfile, timeset, songLength) {
  if (!playerTwitchProfile || !playerTwitchProfile.videos || !timeset || !songLength) return null;

  const songStarted = addToDate(timeset, -songLength * 1000)
  const video = playerTwitchProfile.videos
    .map(v => Object.assign({}, v, {
      created_at: dateFromString(v.created_at),
      ended_at: addToDate(dateFromString(v.created_at), durationToMillis(v.duration)),
    }))
    .find(v => v.created_at <= songStarted && songStarted < v.ended_at);

  return video ? Object.assign({}, video, {url: video.url + '?t=' + millisToDuration(songStarted - video.created_at)}) : null;
}