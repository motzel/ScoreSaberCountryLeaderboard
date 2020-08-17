import monkey from '../../monkey.config';

const LEVELS = {
    NONE: 0,
    ERROR: 1,
    WARN: 2,
    INFO: 3,
    DEBUG: 4,
    TRACE: 5
}

let currentLevel = LEVELS.INFO;

export default {
    trace: message => currentLevel >= LEVELS.TRACE ? console.debug(`[${monkey.header.name}]`, message) : null,
    debug: message => currentLevel >= LEVELS.DEBUG ? console.debug(`[${monkey.header.name}]`, message) : null,
    info: message => currentLevel >= LEVELS.INFO ? console.info(`[${monkey.header.name}]`, message) : null,
    warn: message => currentLevel >= LEVELS.WARN ? console.warn(`[${monkey.header.name}]`, message) : null,
    error: message => currentLevel >= LEVELS.ERROR ? console.error(`[${monkey.header.name}]`, message) : null,
    ...LEVELS,
    level: () => currentLevel,
    setLevel: level => {
        currentLevel = Object.values(LEVELS).find(l => l === level) ? level : currentLevel
    }
};
