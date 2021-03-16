import {formatNumber, round} from '../utils/format'
import {trans} from '../Svelte/stores/i18n'

export const DATA_TYPE = {
  'None': 0,
  'Pass': 1,
  'Fail': 2,
  'Practice mode': 3,
  'Replay': 4,
  'Campaign': 5
};

export const extractBeatSaviorTrackersData = (trackers, rounded = true) => {
  if (!trackers) return null;

  const roundFunc = rounded ? round : v => v;

  let {
    winTracker: {nbOfPause = null, won = null} = {nbOfPause: null, won: null},
    hitTracker: {maxCombo = null, miss = null, bombHit = null, nbOfWallHit = null} = {maxCombo: null, miss: null, bombHit: null, nbOfWallHit: null},
    accuracyTracker: {accLeft = null, leftAverageCut = null, accRight = null, rightAverageCut = null, gridAcc = null} = {accLeft: null, leftAverageCut: null, accRight: null, rightAverageCut: null, gridAcc: null},
    scoreGraphTracker: {graph = null} = {graph: null}
  } = trackers;

  accLeft = accLeft ? roundFunc(accLeft) : null;
  accRight = accRight ? roundFunc(accRight) : null;
  leftAverageCut = leftAverageCut && Array.isArray(leftAverageCut) ? leftAverageCut.map(v => Number.isFinite(v) ? roundFunc(v) : 0) : null;
  rightAverageCut = rightAverageCut && Array.isArray(rightAverageCut) ? rightAverageCut.map(v => Number.isFinite(v) ? roundFunc(v) : 0) : null;

  gridAcc = gridAcc && Array.isArray(gridAcc) && gridAcc.length === 12
    ? gridAcc.slice(-4).concat(gridAcc.slice(4, 8)).concat(gridAcc.slice(0, 4))
    : null;

  graph = graph && Object.keys(graph).length ? graph : null

  return {accLeft, leftAverageCut, accRight, rightAverageCut, gridAcc, graph, miss, maxCombo, bombHit, nbOfWallHit, nbOfPause, fc: won && !miss};
}

export const getAccTooltipFromTrackers = (trackers, onlyKeys = [], joinValue = ' | ') => {
  if (!trackers) return null;

  let vars = extractBeatSaviorTrackersData(trackers);
  if (vars.leftAverageCut) vars.leftAverageCut = vars.leftAverageCut.filter(c => Number.isFinite(c)).map(c => formatNumber(c)).join('/');
  if (vars.rightAverageCut) vars.rightAverageCut = vars.rightAverageCut.filter(c => Number.isFinite(c)).map(c => formatNumber(c)).join('/');

  const bsKey = 'beatSavior';
  const accTooltip =
    [
      {key: 'accLeftShort', val: 'accLeft'},
      {key: 'accRightShort', val: 'accRight'},
      '\n',
      {key: 'maxComboShort', val: 'maxCombo'},
      {key: 'pausesShort', val: 'nbOfPause'},
      {key: 'missesShort', val: 'miss'},
      {key: 'bombHitShort', val: 'bombHit'},
      {key: 'wallHitShort', val: 'nbOfWallHit'},
    ]
      .filter(i => !onlyKeys || !onlyKeys.length || (!i.val || onlyKeys.includes(i.val)))
      .map(e => {
      if (!e.key) return e;

      if (vars[e.val] === undefined || isNaN(vars[e.val])) return null;

      return trans(bsKey + '.' + e.key) + ': ' + (Number.isFinite(vars[e.val]) ? formatNumber(vars[e.val], ['accLeft', 'accRight'].includes(e.val) ? 2 : 0) : '-') + (
        ['accLeftShort', 'accRightShort'].includes(e.key)
          ? ' (' + (e.key === 'accLeftShort' && vars['leftAverageCut'] ? vars['leftAverageCut'] : (vars['rightAverageCut'] ? vars['rightAverageCut'] : '')) + ')'
          : ''
      );
    })
      .filter((v, idx) => v && (v !== '\n' || idx));
  if(accTooltip && accTooltip.length && accTooltip[accTooltip.length - 1] === joinValue) accTooltip.pop();

  return accTooltip && accTooltip.length ? 'Beat Savior:\n' + accTooltip.join(joinValue).replace(joinValue + '\n' + joinValue,'\n') : null;
}