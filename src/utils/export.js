import download from './download';
import {getCacheAndConvertIfNeeded} from "../store";

export const exportData = async (filename = 'export.json') => download(JSON.stringify(await getCacheAndConvertIfNeeded()), filename, 'application/json;charset=utf-8;');
export const importData = () => {};