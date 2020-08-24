import {getCacheAndConvertIfNeeded} from "./store";

export const getConfig = async (key = null, refreshCache = false) => {
    const data = await getCacheAndConvertIfNeeded(refreshCache);

    if (!data && data.config) return null;

    return key ? (data.config[key] ? data.config[key] : null) : data.config;
}

export const getMainPlayerId = async () => {
    const usersConfig = await getConfig('users');
    return usersConfig && usersConfig.main ? usersConfig.main : null;
}

export const isBackgroundDownloadEnabled = async (refreshCache = false) => {
    const config =await getConfig('others', refreshCache);
    return !!config.bgDownload;
}
