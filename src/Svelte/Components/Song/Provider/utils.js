import {getAccFromScore, getDiffAndTypeFromOnlyDiffName, getSongMaxScore} from '../../../../song'
import {dateFromString} from '../../../../utils/date'
import {shouldBeHidden} from '../../../../eastereggs'
import {round} from '../../../../utils/format'

export const enhanceScore = async (score, cachedScore, showDiff = true) => {
  try {
    const maxSongScore = await getSongMaxScore(
      cachedScore?.hash ? cachedScore.hash : score.hash,
      cachedScore?.diffInfo ? cachedScore.diffInfo : getDiffAndTypeFromOnlyDiffName(score.songDiff)
    );

    const maxScoreEx = maxSongScore ?? cachedScore?.maxScoreEx;

    const ssScoreDate = dateFromString(score.timeset);
    const useDownloadedScore = cachedScore?.timeset && ssScoreDate && cachedScore?.timeset?.getTime() === ssScoreDate.getTime();
    if (useDownloadedScore) {
      score = {...score, ...cachedScore, maxScoreEx, percent: maxScoreEx && cachedScore?.score ? cachedScore.score / maxScoreEx : score.percent};
    }

    const useCurrentScoreAsPrev = (score.pp && cachedScore?.pp && round(cachedScore.pp) < round(score.pp)) ||
      (score.score && cachedScore?.score && cachedScore.score < score.score);

    if (!score.acc && score.score && maxScoreEx) {
      score.acc = getAccFromScore({score: score.score, maxScoreEx});
    }

    if(!score.score && score.percent) {
      score.score = maxScoreEx ? Math.round(score.percent * maxScoreEx) : null;
    }

    score.hidden = cachedScore?.acc ? shouldBeHidden(Object.assign({}, cachedScore, {id: cachedScore.playerId, acc: cachedScore.acc})) : false;

    const history = ((Array.isArray(cachedScore?.history) && cachedScore.history.length ? cachedScore.history : []).sort((a,b) => b.score - a.score))[0];
    if (showDiff && (useCurrentScoreAsPrev || history)) {
      score.prevRank = useCurrentScoreAsPrev ? cachedScore.rank : history.rank;
      score.prevPp = useCurrentScoreAsPrev ? cachedScore.pp : history.pp;
      score.prevScore = useCurrentScoreAsPrev ? cachedScore.score : history.score;
      score.prevTimeset = dateFromString(useCurrentScoreAsPrev ? cachedScore.timeset : history.timeset);
      score.prevAcc = getAccFromScore({
        score: useCurrentScoreAsPrev ? cachedScore.score : history.score,
        uScore: useCurrentScoreAsPrev ? cachedScore.uScore : history.uScore,
        maxScoreEx,
      });
    }
  } catch (e) {} // swallow error

  return score;
}