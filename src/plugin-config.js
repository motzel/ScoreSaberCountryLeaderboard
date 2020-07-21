import {getCacheAndConvertIfNeeded} from "./store";

export const getConfig = async (key = null) => {
    const data = await getCacheAndConvertIfNeeded();

    if (!data && data.config) return null;

    return data.config[key] ? data.config[key] : null;
}

export const getMainUserId = async () => {
    const usersConfig = await getConfig('users');
    return usersConfig && usersConfig.main ? usersConfig.main : null;
}
