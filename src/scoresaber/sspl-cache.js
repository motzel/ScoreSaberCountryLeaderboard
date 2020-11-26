import cacheRepository from '../db/repository/cache'

const SSPL_RANKS_CACHE_KEY = 'ssplCountryRanks';

export const getSsplCountryRanks = async () => await cacheRepository().get(SSPL_RANKS_CACHE_KEY) ?? {};
export const setSsplCountryRanks = async (ssplCountryRanks = {}) => cacheRepository().set(ssplCountryRanks, SSPL_RANKS_CACHE_KEY);
export const flushSsplCountryRanksCache = () => cacheRepository().flushCache();