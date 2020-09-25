import download from './download';
import {getCacheAndConvertIfNeeded} from "../store";

export default async (filename = 'sspl-export-'+(new Date()).toISOString().replace(/:/g, '_')+'.json') => {
	const data = await getCacheAndConvertIfNeeded();
	if (data?.twitch?.token) data.twitch.token = null;

	return download(JSON.stringify(data), filename, 'application/json;charset=utf-8;');
}