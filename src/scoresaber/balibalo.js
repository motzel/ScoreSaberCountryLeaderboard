import {dateFromString} from '../utils/date'
import {convertArrayToObjectByKey} from '../utils/js'
import {PP_PER_STAR, ppFactorFromAcc} from './pp'

export default () => {
  const DECAY = 1000 * 60 * 60 * 24 * 15;

  let weightedPpUpToIdx = [];
  let allRankeds = null;
  let sortedPlayerScores = [];
  let recentRankedPlay = null;

  let playerScoresIndex = {};
  let playerScoresObj = {};
  let maxScoresStars = 0;
  let totalPp = 0;

  let initializedAtTimestamp = null;

  function getTotalPpFromSortedScores(sortedScores, startFromIdx = null) {
    const sumPp = (score, cum, idx) => cum + Math.pow(0.965, idx) * score.pp;

    // get precalculated sum from index
    const indexAlreadyCreated = weightedPpUpToIdx && weightedPpUpToIdx.length
    const startWithPp = startFromIdx >= 1 && indexAlreadyCreated ? weightedPpUpToIdx[startFromIdx - 1] : 0
    startFromIdx = startFromIdx > 0 ? startFromIdx : 0;

    return !indexAlreadyCreated
      ? sortedScores.reduce((cum, score, idx) => {
        cum = sumPp(score, cum, idx);

        weightedPpUpToIdx[idx] = cum;

        return cum;
      }, 0)
      : sortedScores.reduce((cum, score, idx) => sumPp(score, cum, idx + startFromIdx), startWithPp);
  }

  // each score has to have three fields at least: acc, stars and timeCoeff (=1 + Math.max(now - timeset, 0) / DECAY)
  function getEstimatedAcc(stars, scores, maxScoresStars) {
    let data = scores.reduce((o, score) => {
      let d = 2 * Math.abs(stars - score.stars);
      let front = stars > score.stars ? d * d * d : 1;
      let weight = 1 / (1 + d * score.timeCoeff * front);
      o.weight += weight;
      o.sum += score.acc * weight;
      return o;
    }, {weight: 0, sum: 0});
    let result = data.weight ? data.sum / data.weight : 0;
    if (stars > maxScoresStars) {
      let d = 2 * Math.abs(stars - maxScoresStars);
      result /= (1 + d * d);
    }
    return result;
  }

  return {
    init: (playerScores, rankedSongs) => {
      if (!rankedSongs || !playerScores || !playerScores.length) return false;

      const onlyRankedPlayerScores = playerScores.filter(s => s.pp).map(s => ({
        ...s,
        timeset: dateFromString(s.timeset),
      }));

      const newRecentRankedPlay = onlyRankedPlayerScores.reduce((recent, s) => s.timeset > recent ? s.timeset : recent, null);
      if (!newRecentRankedPlay || newRecentRankedPlay <= recentRankedPlay) return false;

      recentRankedPlay = newRecentRankedPlay;

      weightedPpUpToIdx = [];

      allRankeds = {...rankedSongs};

      sortedPlayerScores = onlyRankedPlayerScores
        .map(s => ({
          leaderboardId: s.leaderboardId,
          timeCoeff: 1 + Math.max(initializedAtTimestamp - s.timeset, 0) / DECAY,
          stars: allRankeds?.[s.leaderboardId]?.stars,
          acc: s?.acc ?? (s?.maxScoreEx ? (s.uScore ?? s.score) / s.maxScoreEx * 100 : null),
          pp: s.pp,
        }))
        .filter(s => s.stars && s.acc)
        .sort((a, b) => b.pp - a.pp);

      playerScoresIndex = sortedPlayerScores.reduce((cum, score, idx) => {
        cum[score.leaderboardId] = idx;
        return cum;
      }, {});
      playerScoresObj = convertArrayToObjectByKey(sortedPlayerScores, 'leaderboardId');
      maxScoresStars = Math.max(...sortedPlayerScores.map(e => e.stars));
      totalPp = getTotalPpFromSortedScores(sortedPlayerScores);

      initializedAtTimestamp = Date.now();

      return true;
    },

    estimate: function () {
      if (!initializedAtTimestamp) throw 'Estimator has not been initialized yet';

      return {
        recentRankedPlay,
        scores: Object.values(allRankeds)
          .map(r => {
            const score = playerScoresObj?.[r.leaderboardId];
            const acc = score?.acc ?? null;
            const pp = score?.pp ?? null;
            const estimatedAcc = getEstimatedAcc(r.stars, sortedPlayerScores, maxScoresStars);
            const estimatedPp = PP_PER_STAR * r.stars * ppFactorFromAcc(estimatedAcc);

            let newTotalPp = totalPp;
            if (estimatedPp && (!pp || pp < estimatedPp)) {
              // insert new score without array re-sorting
              let scoresWithoutLeaderboard = sortedPlayerScores;
              if (score) {
                const leaderboardIdx = playerScoresIndex?.[r.leaderboardId] ?? -1;
                if (leaderboardIdx >= 0) scoresWithoutLeaderboard = sortedPlayerScores.slice(0, leaderboardIdx).concat(sortedPlayerScores.slice(leaderboardIdx + 1));
              }

              const firstLowerScoreIdx = scoresWithoutLeaderboard.findIndex(s => s.pp < estimatedPp);

              const sortedScoresFromStartingWithNew = firstLowerScoreIdx >= 0
                ? [{pp: estimatedPp}].concat(scoresWithoutLeaderboard.slice(firstLowerScoreIdx))
                : [{pp: estimatedPp}]

              newTotalPp = estimatedPp && (!pp || pp < estimatedPp)
                ? getTotalPpFromSortedScores(sortedScoresFromStartingWithNew, firstLowerScoreIdx < 0 ? scoresWithoutLeaderboard.length : firstLowerScoreIdx)
                : 0;
            }

            return {
              ...r,
              acc,
              pp,
              estimatedAcc,
              estimatedPp,
              ppDiff: Math.max(newTotalPp - totalPp, 0),
              totalPp,
              newTotalPp,
            }
          }),
      };
    },
  }
}