import {getCacheAndConvertIfNeeded} from "../store";

export const getRankedSongs = async _ => (await getCacheAndConvertIfNeeded()).rankedSongs;