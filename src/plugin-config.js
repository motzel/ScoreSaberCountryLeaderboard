import keyValueRepository from './db/repository/key-value';
import {ADDITIONAL_COUNTRY_PLAYERS_IDS} from './network/scoresaber/players'

const STORE_CONFIG_KEY = 'config';

export const getConfig = async (key = null) => {
  let config = await keyValueRepository().get(STORE_CONFIG_KEY);

  // return default configuration
  if (!config) config = {
    "users": {
      "main": null,
      "country": null,
      "additionalForCountry": ADDITIONAL_COUNTRY_PLAYERS_IDS,
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
    "profile": {"showOnePpCalc": true, "showTwitchIcon": true, "showChart": true},
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

export const isBackgroundDownloadEnabled = async () => {
  const config = await getConfig('others');
  return !!config.bgDownload;
}
