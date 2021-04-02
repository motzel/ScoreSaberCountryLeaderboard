import {gmFetch, SsplError} from "./fetch";
import {substituteVars} from "../utils/format";
import eventBus from '../utils/broadcast-channel-pubsub'
import nodeSync from '../utils/multinode-sync'
import {
  getPlayerScoresForBeatSaviorMatching,
  IMPORT_ONLY_SS_SCORES,
  parseBeatSaviorLine, storeBeatSaviorData,
} from '../scoresaber/beatsavior'
import {getPlayerInfo, updatePlayer} from '../scoresaber/players'
import {dateFromString, HOUR} from '../utils/date'

export const IS_BEAT_SAVIOR_API_ENABLED = true;

const BEAT_SAVIOR_API_URL = 'https://www.beatsavior.io/api/livescores/player/${playerId}'
export const fetchBeatSaviorData = async (playerId) => gmFetch(substituteVars(BEAT_SAVIOR_API_URL, {playerId}));

export const shouldBeatSaviorBeUpdated = async playerId => {
  const REFRESH_INTERVAL = HOUR;

  const playerInfo = await getPlayerInfo(playerId);
  if (!playerInfo) return false;

  const beatSaviorLastUpdated = dateFromString(playerInfo?.beatSaviorLastUpdated ?? null);

  return (!beatSaviorLastUpdated || beatSaviorLastUpdated.getTime() < (new Date()).getTime() - REFRESH_INTERVAL);
}
export const updateBeatSaviorData = async (playerId, emitEvents = true) => {
  if (!IS_BEAT_SAVIOR_API_ENABLED) return null;

  try {
    if (! await shouldBeatSaviorBeUpdated(playerId)) return null;

    const playerInfo = await getPlayerInfo(playerId);

    const data = await fetchBeatSaviorData(playerId);
    if (!data || !data.length) return null;

    const playerScores = await getPlayerScoresForBeatSaviorMatching(playerId);

    const matchedBsData = data
      .map(line => parseBeatSaviorLine(line, playerScores))
      .filter(play => !IMPORT_ONLY_SS_SCORES || (play && play.ssScore))

    if (!matchedBsData.length) return null;

    await storeBeatSaviorData(matchedBsData);

    await updatePlayer({...playerInfo, beatSaviorLastUpdated: new Date()})

    if (emitEvents) {
      eventBus.publish('player-beat-savior-updated', {nodeId: nodeSync().getId(), playerId, matchedBsData});
    }
  } catch (err) {
    if (err instanceof SsplError) return null; // networking err

    throw err;
  }
}
