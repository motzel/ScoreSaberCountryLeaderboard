import monkey from '../../monkey.config';
import {arrayUnique} from "./js";

const LEVELS = {
    NONE: 0,
    ERROR: 1,
    WARN: 2,
    INFO: 3,
    DEBUG: 4,
    TRACE: 5
}

let currentLevel = LEVELS.INFO;

export let enabledTypes = [];

export default {
    table: (data, level = LEVELS.TRACE, type = null) => (!enabledTypes.length || enabledTypes.includes(type)) && currentLevel >= level
        ? console.table(data)
        : null,

    trace: (message, type = null) => (!enabledTypes.length || enabledTypes.includes(type)) && currentLevel >= LEVELS.TRACE
        ? console.debug(`[${monkey.header.name}${type ? ` / ${type}` : ''}]`, message)
        : null,

    debug: (message, type = null) => (!enabledTypes.length || enabledTypes.includes(type)) && currentLevel >= LEVELS.DEBUG
        ? console.debug(`[${monkey.header.name}${type ? ` / ${type}` : ''}]`, message)
        : null,

    info: (message, type = null) => (!enabledTypes.length || enabledTypes.includes(type)) && currentLevel >= LEVELS.INFO
        ? console.info(`[${monkey.header.name}${type ? ` / ${type}` : ''}]`, message)
        : null,

    warn: (message, type = null) => (!enabledTypes.length || enabledTypes.includes(type)) && currentLevel >= LEVELS.WARN
        ? console.warn(`[${monkey.header.name}${type ? ` / ${type}` : ''}]`, message)
        : null,

    error: (message, type = null) => (!enabledTypes.length || enabledTypes.includes(type)) && currentLevel >= LEVELS.ERROR
        ? console.error(`[${monkey.header.name}${type ? ` / ${type}` : ''}]`, message)
        : null,

    ...LEVELS,
    level: () => currentLevel,
    setLevel: level => {
        currentLevel = Object.values(LEVELS).find(l => l === level) ? level : currentLevel
    },
    logOnly: types => enabledTypes = arrayUnique(enabledTypes.concat(Array.isArray(types) ? types : [types])),
    logAll: () => enabledTypes = []
};
