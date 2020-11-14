import keyValueRepository from './db/repositorry/key-value';

const STORE_CONFIG_KEY = 'config';

export const getConfig = async (key = null, refreshCache = false) => {
  const config = await keyValueRepository.get(STORE_CONFIG_KEY, refreshCache);

  if (!config) return null;

  return key ? (config[key] ? config[key] : null) : config;
}

export const setConfig = async config => keyValueRepository.set(STORE_CONFIG_KEY, config);

export const getMainPlayerId = async () => {
  const usersConfig = await getConfig('users');
  return usersConfig && usersConfig.main ? usersConfig.main : null;
}

export const isBackgroundDownloadEnabled = async (refreshCache = false) => {
  const config = await getConfig('others', refreshCache);
  return !!config.bgDownload;
}
