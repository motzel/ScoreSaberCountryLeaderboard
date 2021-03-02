import {formatNumber, round} from '../utils/format'
import {trans} from '../Svelte/stores/i18n'

export const extractBeatSaviorTrackersData = trackers => {
  if (!trackers) return null;

  let {
    winTracker: {nbOfPause = null, won = null},
    hitTracker: {maxCombo = null, miss = null, bombHit = null, nbOfWallHit = null},
    accuracyTracker: {accLeft = null, leftAverageCut = null, accRight = null, rightAverageCut = null, gridAcc = null},
  } = trackers;

  accLeft = accLeft ? round(accLeft) : null;
  accRight = accRight ? round(accRight) : null;
  leftAverageCut = leftAverageCut ? leftAverageCut.map(v => round(v)) : null;
  rightAverageCut = rightAverageCut ? rightAverageCut.map(v => round(v)) : null;

  return {accLeft, leftAverageCut, accRight, rightAverageCut, gridAcc, miss, maxCombo, bombHit, nbOfWallHit, nbOfPause, fc: won && !miss};
}

export const getAccTooltipFromTrackers = (trackers, onlyKeys = [], joinValue = ' | ') => {
  if (!trackers) return null;

  let vars = extractBeatSaviorTrackersData(trackers);
  if (vars.leftAverageCut) vars.leftAverageCut = vars.leftAverageCut.filter(c => c && Number.isFinite(c)).map(c => formatNumber(c)).join('/');
  if (vars.rightAverageCut) vars.rightAverageCut = vars.rightAverageCut.filter(c => c && Number.isFinite(c)).map(c => formatNumber(c)).join('/');

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

  return accTooltip && accTooltip.length ? accTooltip.join(joinValue).replace(joinValue + '\n' + joinValue,'\n') : null;
}