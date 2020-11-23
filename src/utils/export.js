import download from './download';

import groupsRepository from "../db/repository/groups";
import keyValueRepository from "../db/repository/key-value";
import leaderboardsRepository from "../db/repository/leaderboards";
import playersRepository from "../db/repository/players";
import playersHistoryRepository from "../db/repository/players-history";
import rankedsChangesRepository from "../db/repository/rankeds-changes";
import scoresRepository from "../db/repository/scores";
import songsRepository from "../db/repository/songs";
import twitchRepository from "../db/repository/twitch";

export default async (filename = 'sspl-db-export-'+(new Date()).toISOString().replace(/:/g, '_')+'.json') => {
	const repositories = [groupsRepository, leaderboardsRepository, playersRepository, playersHistoryRepository, rankedsChangesRepository, scoresRepository, songsRepository, twitchRepository];
	const data = (await Promise.all(repositories.map(async repository => repository().getAll())))
		.reduce((cum, repositoryData, idx) => {
			cum[repositories[idx]().getStoreName()] = repositoryData;
			return cum;
		}, {});

	// keyValueRepository has out-of-line keys, special treatment is needed
	const keyValueKeys = await keyValueRepository().getAllKeys();
	const keyValueValues = await keyValueRepository().getAll();
	data['key-value'] = keyValueKeys.reduce((cum, key, idx) => cum.concat([{key, value: key === 'twitchToken' ? null : keyValueValues[idx]}]), []);

	return download(JSON.stringify(data), filename, 'application/json;charset=utf-8;');
}