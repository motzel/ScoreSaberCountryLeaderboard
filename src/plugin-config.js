import keyValueRepository from './db/repository/key-value';

const STORE_CONFIG_KEY = 'config';

export const getConfig = async (key = null, refreshCache = false) => {
  const config = await keyValueRepository().get(STORE_CONFIG_KEY, refreshCache);

  // return default configuration
  if (!config) return {
    "users": {
      "main": null,
      "country": null,
      "additionalForCountry": {},
    },
    "songBrowser": {
      "autoTransform": false,
      "defaultView": "cards",
      "defaultType": "all",
      "defaultSort": "timeset",
      "showColumns": ["stars", "maxPp", "bpm", "njs", "nps", "length", "timeset", "rank", "pp", "acc", "score", "diff", "icons"],
      "showIcons": ["bsr", "bs", "oneclick", "preview", "twitch"],
      "compareTo": [],
      "itemsPerPage": 12,
    },
    "songLeaderboard": {"showDiff": true, "showWhatIfPp": true, "showBgCover": true, "defaultType": "country"},
    "profile": {"enlargeAvatar": true, "showOnePpCalc": true, "showTwitchIcon": true, "showChart": true},
    "others": {"theme": "darkss", "bgDownload": true, "viewsUpdate": "keep-view", "language": "en", "locale": "en-US"},
    "ssSong": {"enhance": true, "showDiff": true, "showWhatIfPp": true},
  };

  return key ? (config[key] ? config[key] : null) : config;
}

export const setConfig = async config => keyValueRepository().set(config, STORE_CONFIG_KEY);

export const getMainPlayerId = async () => {
  const usersConfig = await getConfig('users');
  return usersConfig && usersConfig.main ? usersConfig.main : null;
}

export const isBackgroundDownloadEnabled = async (refreshCache = false) => {
  const config = await getConfig('others', refreshCache);
  return !!config.bgDownload;
}
