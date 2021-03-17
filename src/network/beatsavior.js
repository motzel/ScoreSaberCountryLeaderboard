import {fetchApiPage, SsplError} from "./fetch";
import {substituteVars} from "../utils/format";
import queue from "./queue";
import eventBus from '../utils/broadcast-channel-pubsub'
import nodeSync from '../utils/multinode-sync'
import {
  getPlayerScoresForBeatSaviorMatching,
  IMPORT_ONLY_SS_SCORES,
  parseBeatSaviorLine, storeBeatSaviorData,
} from '../scoresaber/beatsavior'

// TODO: enable when API supports CORS
export const IS_BEAT_SAVIOR_API_ENABLED = false;

const BEAT_SAVIOR_API_URL = 'https://www.beatsavior.io/api/livescores/player/${playerId}'
export const fetchBeatSaviorData = async (playerId, rateLimitCallback) => fetchApiPage(queue.BEATSAVIOR, substituteVars(BEAT_SAVIOR_API_URL, {playerId}), 1, rateLimitCallback)
  .catch(err => {
    if (err instanceof TypeError) return []; // fetch failed because of lack of CORS headers

    throw err;
  });

export const updateBeatSaviorData = async (playerId, emitEvents = true) => {
  if (!IS_BEAT_SAVIOR_API_ENABLED) return null;

  try {
    const data = await fetchBeatSaviorData(playerId);
    if (!data || !data.length) return null;

    const playerScores = await getPlayerScoresForBeatSaviorMatching(playerId);

    const matchedBsData = data
      .map(line => parseBeatSaviorLine(line, playerScores))
      .filter(play => !IMPORT_ONLY_SS_SCORES || (play && play.ssScore))

    if (!matchedBsData.length) return null;

    await storeBeatSaviorData(matchedBsData);

    if (emitEvents) {
      eventBus.publish('player-beat-savior-updated', {nodeId: nodeSync().getId(), playerId, matchedBsData});
    }
  } catch (err) {
    if (err instanceof SsplError) return null; // networking err

    throw err;
  }
}
