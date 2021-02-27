import {round} from '../utils/format'
import {trans} from '../Svelte/stores/i18n'

export const getAccTooltipFromTrackers = trackers => {
  if (!trackers) return null;

  let {
    winTracker: {nbOfPause = null},
    hitTracker: {maxCombo = null, miss = null, bombHit = null, nbOfWallHit = null},
    accuracyTracker: {accLeft = null, leftAverageCut = null, accRight = null, rightAverageCut = null},
  } = trackers;

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

  return accTooltip && accTooltip.length ? accTooltip : null;
}