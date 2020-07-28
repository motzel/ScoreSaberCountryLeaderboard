import {getCacheAndConvertIfNeeded} from "../store";

export const getRankedSongs = async _ => (await getCacheAndConvertIfNeeded()).rankedSongs;

// errors in API
export const UNRANKED = [97223];
export const RANKED = [102179, 102180]