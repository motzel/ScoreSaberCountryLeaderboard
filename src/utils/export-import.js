import eventBus from "../utils/broadcast-channel-pubsub";
import {trans} from "../Svelte/stores/i18n";
import download from './download';
import {db} from '../db/db';
import groupsRepository from "../db/repository/groups";
import keyValueRepository from "../db/repository/key-value";
import rankedsRepository from "../db/repository/rankeds";
import playersRepository from "../db/repository/players";
import playersHistoryRepository from "../db/repository/players-history";
import rankedsChangesRepository from "../db/repository/rankeds-changes";
import scoresRepository from "../db/repository/scores";
import songsRepository from "../db/repository/songs";
import twitchRepository from "../db/repository/twitch";
import {dateFromString} from './date'
import log from './logger'

const repositories = [
	{repository: groupsRepository},
	{repository: rankedsRepository},
	{
		repository: playersRepository,
		casts: {
			date: ['recentPlay', 'profileLastUpdated', 'lastUpdated'],
		},
	},
	{
		repository: playersHistoryRepository,
		casts: {
			date: ['timestamp'],
		},
	},
	{
		repository: rankedsChangesRepository,
		casts: {
			date: ['firstSeen'],
		},
	},
	{
		repository: scoresRepository,
		casts: {
			date: ['timeset', 'lastUpdated'],
		},
	},
	{repository: songsRepository},
	{
		repository: twitchRepository,
		casts: {
			date: ['lastUpdated'],
		},
	},
	{
		repository: keyValueRepository,
		excludedKeys: ['twitchToken'],
		casts: {
			date: ['activePlayersLastUpdate', 'lastUpdated', 'rankedSongsLastUpdated'],
		},
	},
];

export const exportJsonData = async (filename = 'sspl-db-export-' + (new Date()).toISOString().replace(/:/g, '_') + '.json') => {
	const inLineKeysRepositories = getInLineKeysRepositories();
	const outOfLineRepositoriesItems = getOutOfLineKeysRepositories();

	const data = (await Promise.all(inLineKeysRepositories.map(r => r.repository).map(async repository => repository().getAll())))
		.reduce((cum, repositoryData, idx) => {
			cum.stores[inLineKeysRepositories[idx].repository().getStoreName()] = repositoryData;
			return cum;
		}, {version: db.version, stores: {}});

	await Promise.all(
		outOfLineRepositoriesItems.map(async repositoryItem => {
			const repository = repositoryItem.repository;
			const storeName = repository().getStoreName();
			const keyValueKeys = await keyValueRepository().getAllKeys();
			const keyValueValues = await keyValueRepository().getAll();
			data.stores[storeName] = keyValueKeys.reduce((cum, key, idx) => cum.concat([{
				key,
				value: (repositoryItem?.excludedKeys ?? []).includes(key) ? null : keyValueValues[idx],
			}]), []);
		}),
	);

	return download(JSON.stringify(data), filename, 'application/json;charset=utf-8;');
}

export const importJsonData = async json => {
	const availableStores = repositories.map(item => item.repository().getStoreName());

	eventBus.publish('dl-manager-pause-cmd');

	await db.runInTransaction(availableStores, async tx => {
		for(let repositoryItem of repositories) {
			const repository = repositoryItem.repository();
			const isOutOfLineRepository = repository.hasOutOfLineKey();

			const storeName = repository.getStoreName();

			if (!json?.stores?.[storeName]) {
				log.warn(`Store ${storeName} does not exists in imported JSON`);
				continue;
			}

			const items = json.stores[storeName].map(value => castFields(value, repositoryItem));

			const store = tx.objectStore(storeName);
			await store.clear();
			await Promise.all(items.map(async item => isOutOfLineRepository ? repository.set(item.value, item.key) : repository.set(item)));
		}
	});
}

const castFields = (value, repositoryItem) => {
	const isOutOfLineRepository = repositoryItem.repository().hasOutOfLineKey();

	Object.keys(repositoryItem?.casts ?? {}).forEach(castType => {
		switch(castType) {
			case 'date':
				repositoryItem.casts.date.forEach(key => {
					if (isOutOfLineRepository) {
						if (value.value && value?.key === key) value.value = dateFromString(value.value);
					} else {
						if (value[key]) value[key] = dateFromString(value[key]);
					}
				});
				break;

			default:
				log.error(`Unknown cast type ${castType} in repository ${repositoryItem.repository().getStoreName()}`)
		}
	});

	return value;
};
const getInLineKeysRepositories = () => repositories.filter(r => !r.repository().hasOutOfLineKey());
const getOutOfLineKeysRepositories = () => repositories.filter(r => r.repository().hasOutOfLineKey());

export function importDataHandler(e, onError = null, onImportCompleted = null) {
	const file = e.target.files[0];
	if (!file) {
		return;
	}
	if (file.type !== 'application/json') {
		if (onError) onError(trans('import.selectJsonFile'));
		return;
	}

	const reader = new FileReader();

	reader.onload = async function (e) {
		try {
			const json = JSON.parse(e.target.result);

			if (!json || !json.version) {
				if (onError) onError(trans('import.incorrectFile'));
				return;
			}

			if (json.version < 2) {
				if (onError) onError(trans('import.oldVerNotSupported'));
				return;
			}

			if (!json.stores) {
				if (onError) onError(trans('import.incorrectFile'));
				return;
			}

			await importJsonData(json);

			if (onImportCompleted) await onImportCompleted(json);
		} catch (e) {
			log.error(e);
			if (onError) onError(trans('import.incorrectJsonFile'));
		}
	};

	reader.readAsText(file);
}