import {getCacheAndConvertIfNeeded} from "../store";

export const getRankedMaps = async _ => (await getCacheAndConvertIfNeeded()).rankedSongs;