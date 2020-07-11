import download from './download';
import {getCacheAndConvertIfNeeded} from "../store";

export default async (filename = 'sspl-export.json') => download(JSON.stringify(await getCacheAndConvertIfNeeded()), filename, 'application/json;charset=utf-8;');