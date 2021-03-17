import {formatNumber, round} from '../utils/format'
import {trans} from '../Svelte/stores/i18n'
import {getScoresByPlayerId} from './players'
import {dateFromString, truncateDate} from '../utils/date'
import {db} from '../db/db'
import scoresRepository from '../db/repository/scores'

export const IMPORT_ONLY_SS_SCORES = true;

export const DATA_TYPE = {
  'None': 0,
  'Pass': 1,
  'Fail': 2,
  'Practice mode': 3,
  'Replay': 4,
  'Campaign': 5,
};

export const extractBeatSaviorTrackersData = (trackers, rounded = true) => {
  if (!trackers) return null;

  const roundFunc = rounded ? round : v => v;

  let {
    winTracker: {nbOfPause = null, won = null} = {nbOfPause: null, won: null},
    hitTracker: {maxCombo = null, miss = null, bombHit = null, nbOfWallHit = null} = {
      maxCombo: null,
      miss: null,
      bombHit: null,
      nbOfWallHit: null,
    },
    accuracyTracker: {
      accLeft = null,
      leftAverageCut = null,
      accRight = null,
      rightAverageCut = null,
      gridAcc = null,
    } = {accLeft: null, leftAverageCut: null, accRight: null, rightAverageCut: null, gridAcc: null},
    scoreGraphTracker: {graph = null} = {graph: null},
  } = trackers;

  accLeft = accLeft ? roundFunc(accLeft) : null;
  accRight = accRight ? roundFunc(accRight) : null;
  leftAverageCut = leftAverageCut && Array.isArray(leftAverageCut) ? leftAverageCut.map(v => Number.isFinite(v) ? roundFunc(v) : 0) : null;
  rightAverageCut = rightAverageCut && Array.isArray(rightAverageCut) ? rightAverageCut.map(v => Number.isFinite(v) ? roundFunc(v) : 0) : null;

  gridAcc = gridAcc && Array.isArray(gridAcc) && gridAcc.length === 12
    ? gridAcc.slice(-4).concat(gridAcc.slice(4, 8)).concat(gridAcc.slice(0, 4))
    : null;

  graph = graph && Object.keys(graph).length ? graph : null

  return {
    accLeft,
    leftAverageCut,
    accRight,
    rightAverageCut,
    gridAcc,
    graph,
    miss,
    maxCombo,
    bombHit,
    nbOfWallHit,
    nbOfPause,
    fc: won && !miss,
  };
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
  if (accTooltip && accTooltip.length && accTooltip[accTooltip.length - 1] === joinValue) accTooltip.pop();

  return accTooltip && accTooltip.length ? 'Beat Savior\n' + accTooltip.join(joinValue).replace(joinValue + '\n' + joinValue, '\n') : null;
}
export const getPlayerScoresForBeatSaviorMatching = async playerId =>
  (await getScoresByPlayerId(playerId))
    .reduce((cum, s) => {
      if (!s.timeset || !s.hash || !s.diffInfo || !s.diffInfo.diff) return cum;

      const currentTzTimestamp = truncateDate(dateFromString(s.timeset), 'day').getTime();
      const diff = s.diffInfo.diff.toLowerCase();

      if (!cum[s.hash]) cum[s.hash] = {};
      if (!cum[s.hash][diff]) cum[s.hash][diff] = {};
      if (!cum[s.hash][diff][currentTzTimestamp]) cum[s.hash][diff][currentTzTimestamp] = [];

      cum[s.hash][diff][currentTzTimestamp].push({...s});

      return cum;
    }, {});

export const parseBeatSaviorLine = (line, playerScores, lineIdx = null, saberAColor = null, saberBColor = null, fileId = null, fileName = null, fileTimestamp = null) => {
  const {deepTrackers, ...lineData} = line;

  let {
    playerID: playerId,
    songID: hash, songName, songArtist: songAuthorName, songMapper: levelAuthorName,
    songDataType: dataType, songDifficulty: difficultyName, songDuration: duration, songSpeed: speed,
    songStartTime: start,
    trackers,
    timeSet,
    _id,
  } = lineData;

  if (!timeSet && (!lineIdx || !fileTimestamp))
    throw 'lineIdx and fileTimestamps are required if there is no timeSet field in line data';

  const timeset = timeSet ? dateFromString(timeSet) : new Date(fileTimestamp + lineIdx * 1000);
  _id = _id ?? playerId + '_' + timeset.getTime();

  if (dataType && [DATA_TYPE.None, DATA_TYPE.Replay].includes(dataType))
    throw 'Unsupported data type';

  const notesCount =
    trackers && trackers.winTracker && trackers.winTracker.won && trackers.hitTracker &&
    trackers.hitTracker.leftNoteHit !== undefined && trackers.hitTracker.rightNoteHit !== undefined &&
    trackers.hitTracker.miss !== undefined
      ? trackers.hitTracker.leftNoteHit + trackers.hitTracker.rightNoteHit + trackers.hitTracker.miss
      : null;


  const playData = {
    beatSaviorId: _id,
    leaderboardId: null,
    songId: playerId + '_' + hash + '_' + difficultyName,
    timeset,
    fileId,
    fileName,
    playerId,
    start,
    speed,
    notesCount,
    hash,
    difficultyName,
    songName,
    songAuthorName,
    levelAuthorName,
    duration,
    dataType,
    saberAColor,
    saberBColor,
    trackers,
  };

  // check file timestamp and next day if BS session started on one day and lasts for the next
  const dayTimestamp = truncateDate(timeset, 'day').getTime();
  for (let timestamp of [dayTimestamp, dayTimestamp + 1000 * 60 * 60 * 24, dayTimestamp - 1000 * 60 * 60 * 24]) {
    if (
      start === 0 &&
      trackers?.scoreTracker?.score &&
      playerScores?.[hash]?.[difficultyName]?.[timestamp]
    ) {
      const score = playerScores[hash][difficultyName][timestamp].find(s => s.score === trackers.scoreTracker.score);

      // skip if score already has Beat Savior data
      if (score && score.beatSavior) return playData;

      if (score) {
        playData.ssScore = score;
        if (score.leaderboardId) playData.leaderboardId = score.leaderboardId;
        if (score.diffInfo) playData.diffInfo = score.diffInfo;

        return playData;
      }
    }
  }

  return playData;
}

export const storeBeatSaviorData = async (plays, fileData = null) => {
  // -- START OF TRANSACTION --

  const tx = db.transaction(['beat-savior', 'beat-savior-files', 'scores'], 'readwrite', {durability: 'strict'});

  let bsStore;
  if (fileData) {
    // store current file
    const bsFilesStore = tx.objectStore('beat-savior-files');
    await bsFilesStore.put({...fileData, importedOn: new Date()});

    bsStore = tx.objectStore('beat-savior');

    // remove previously imported data for current file
    let cursor = await bsStore.index('beat-savior-fileId').openCursor(IDBKeyRange.bound(fileData.fileId, fileData.fileId));
    while (cursor) {
      await cursor.delete();
      cursor = await cursor.continue();
    }
  } else {
    bsStore = tx.objectStore('beat-savior');
  }

  // store new plays - only with matched scores for now
  await Promise.all(plays.filter(play => !IMPORT_ONLY_SS_SCORES || play.ssScore).map(async play => {
    const {ssScore, ...playData} = play;

    bsStore.put(playData);
  }));

  // store scores
  let scoresToSave = [];

  const scoresStore = tx.objectStore('scores');
  await Promise.all(plays.filter(play => play.ssScore).map(async play => {
    const {ssScore, ...playData} = play;
    const scoreData = {...ssScore, beatSavior: playData};

    scoresStore.put(scoreData);
    scoresToSave.push(scoreData);
  }));

  await tx.done;

  // -- END OF TRANSACTION --

  scoresRepository().addToCache(scoresToSave);

  return scoresToSave;
}