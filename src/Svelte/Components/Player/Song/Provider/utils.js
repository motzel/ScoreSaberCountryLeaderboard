import {getAccFromScore} from '../../../../../song'
import {addToDate, dateFromString, durationToMillis, millisToDuration} from '../../../../../utils/date'
import {round} from '../../../../../utils/format'
import {getRankedSongs} from '../../../../../scoresaber/rankeds'
import {PP_PER_STAR, ppCurve, ppFactorFromAcc} from '../../../../../scoresaber/pp'
import cacheRepository from '../../../../../db/repository/cache';

export const enhanceScore = async (score, cachedScore, maxScore) => {
  let enhancedScore = {};
  try {
    const maxScoreEx = maxScore ?? cachedScore?.maxScoreEx;

    const ssScoreDate = dateFromString(score.timeset);
    const useDownloadedScore = cachedScore?.timeset && ssScoreDate && cachedScore?.timeset?.getTime() === ssScoreDate.getTime() && (
      cachedScore?.pp && score.pp && Math.abs(round(cachedScore.pp) - round(score.pp)) <= 0.015 // rounding differences mitigation on the SS page
    );
    if (useDownloadedScore) {
      enhancedScore = {...score, ...cachedScore, maxScoreEx, rank: score.rank, pp: cachedScore.pp ? cachedScore.pp : score.pp};
    } else {
      enhancedScore = {...score};
    }

    if (maxScoreEx && enhancedScore.score && (!enhancedScore?.mods?.length || enhancedScore?.mods === "-")) enhancedScore.acc = enhancedScore.score * 100 / maxScoreEx;

    if (!enhancedScore.acc && enhancedScore.score && maxScoreEx) {
      enhancedScore.acc = getAccFromScore({score: enhancedScore.score, maxScoreEx});
    }

    if(!enhancedScore.score && enhancedScore.acc) {
      enhancedScore.score = maxScoreEx ? Math.round(enhancedScore.acc * maxScoreEx / 100) : null;
      enhancedScore.scoreApproximate = true;
    }

    if (!enhancedScore.pp) return enhancedScore;

    if (!enhancedScore.acc) {
      console.warn('No acc found for', enhancedScore)
      return enhancedScore
    }

    // recalc against new curve
    const allRankeds = await getRankedSongs();
    const stars = allRankeds?.[enhancedScore.leaderboardId]?.stars ?? 0

    if (!stars) {
      console.warn('No stars found for', enhancedScore);
      return enhancedScore;
    }

    const newCurve = (await cacheRepository().get('ppCurve')) ?? null;
    const newCurve2 = (await cacheRepository().get('ppCurve2')) ?? null;

    enhancedScore.prevPp = score.pp;
    enhancedScore.pp = round(PP_PER_STAR * stars * ppFactorFromAcc(enhancedScore.acc, newCurve),3)
    enhancedScore.pp2 = round(PP_PER_STAR * stars * ppFactorFromAcc(enhancedScore.acc, newCurve2),3)
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