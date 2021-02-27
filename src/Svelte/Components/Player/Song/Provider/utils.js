import {getAccFromScore} from '../../../../../song'
import {addToDate, dateFromString, durationToMillis, millisToDuration} from '../../../../../utils/date'
import {shouldBeHidden} from '../../../../../eastereggs'
import {round} from '../../../../../utils/format'
import {trans} from '../../../../stores/i18n';

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

    const useCurrentScoreAsPrev = score.timeset && cachedScore?.timeset && cachedScore.timeset < score.timeset;

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

    if (cachedScore?.beatSavior?.trackers ) {
      let {
        winTracker: {nbOfPause = null},
        hitTracker: {maxCombo = null, miss = null, bombHit = null, nbOfWallHit = null},
        accuracyTracker: {accLeft = null, leftAverageCut = null, accRight = null, rightAverageCut = null}
      } = cachedScore.beatSavior.trackers;

      accLeft = accLeft ? round(accLeft) : null;
      accRight = accRight ? round(accRight) : null;
      leftAverageCut = leftAverageCut ? leftAverageCut.map(v => round(v)).join('/') : null;
      rightAverageCut = rightAverageCut ? rightAverageCut.map(v => round(v)).join('/') : null;

      let vars = {accLeft, leftAverageCut, accRight, rightAverageCut, miss, maxCombo, bombHit, nbOfWallHit, nbOfPause};

      const bsKey = 'beatSavior';
      const accTooltip =
        [
          {key: 'accLeftShort', val: 'accLeft'},
          {key: 'accRightShort', val: 'accRight'},
          '\n',
          {key: 'missesShort', val: 'miss'},
          {key: 'maxComboShort', val: 'maxCombo'},
          {key: 'pausesShort', val: 'nbOfPause'},
          {key: 'bombHitShort', val: 'bombHit'},
          {key: 'wallHitShort', val: 'nbOfWallHit'},
        ].map(e => {
          if (!e.key) return e;

          if (vars[e.val] === undefined || isNaN(vars[e.val])) return null;

          return trans(bsKey + '.' + e.key) + ': ' + vars[e.val] + (
            ['accLeftShort', 'accRightShort'].includes(e.key)
            ? ' (' + (e.key === 'accLeftShort' && vars['leftAverageCut'] ? vars['leftAverageCut'] : (vars['rightAverageCut'] ? vars['rightAverageCut'] : '')) + ')'
              : ''
          );
        })
          .filter(v => v)
          .join(' | ')
          .replace(' | \n | ', '\n');

      enhancedScore.accTooltip = accTooltip && accTooltip.length ? accTooltip : null;
      enhancedScore.beatSavior = cachedScore.beatSavior;
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