import log from "./utils/logger";
import {dateFromString, dayTrunc} from './utils/date'

const ENABLE_EASTER_EGGS = true;

const easterEggConditions = [
    [
        { field: 'id', value: '76561198165064325', cond: '===' },
        { field: 'acc', value: 85, cond: '<' }
    ]
];

export function shouldBeHidden(data) {
    return (
        ENABLE_EASTER_EGGS &&
        easterEggConditions.reduce((ret, conditions) => {
            return (
                ret ||
                conditions.reduce((subret, cond) => {
                    let userFieldValue = data?.[cond?.field];
                    let currentConditionFulfilled = true;
                    switch (cond?.cond) {
                        case '===':
                            currentConditionFulfilled =
                                userFieldValue === cond?.value;
                            break;
                        case '<':
                            currentConditionFulfilled =
                                userFieldValue < cond?.value;
                            break;
                        case '>':
                            currentConditionFulfilled =
                                userFieldValue > cond?.value;
                            break;
                        default:
                            log.error(
                                'Unknown condition: ',
                                cond?.cond
                            );
                            currentConditionFulfilled = false;
                    }
                    return subret && currentConditionFulfilled;
                }, true)
            );
        }, false)
    );
}

const APRIL_FOOLS_RANKING = [
    `Hi, are you looking for the other side?`,
    `Feel like nothing ever seems quite right?`,
    `Are you circling the drain pipe, getting off on pain like`,
    `You're corrupted?`,
    `I need to know where your loyalties lie`,
    `Tell me, are you gonna bark or bite?`,
    `Do you really want to twist the knife`,
    `In the belly of the monster?`,
    `Get the fuck up, wake the fuck up`,
    `Wipe the system, and back the fuck up`,
    `You're a puppet when they cut your strings off`,
    `Don't come crawling back`,
    `Kingslayer`,
    `Destroying castles in the sky`,
    `Kingslayer`,
    `Forevermore the apple of my eye`,
    `I'd sacrifice my life to find you`,
    `Angel of the flame`,
    `Kingslayer`,
    `Come and collect us from the night`,
    `暗い この見えない世界`,
    `まだ消えない未来`,
    `ただ手に入れたい another world`,
    `System failure`,
    `Life is encrypted, genome modified`,
    `Like a virus in a lullaby`,
    `Artificial 'til the day you die, silly program`,
    `You're corrupted`,
    `Get the fuck up, wake the fuck up`,
    `Wipe the system, and back the fuck up`,
    `You're a puppet when they cut your strings off`,
    `Don't come crawling back, you're on your own`,
    `さあ 時の`,
    `扉を開けて`,
    `行こうよ`,
    `Kingslayer`,
    `Destroying castles in the sky`,
    `Kingslayer`,
    `I'll fight for you until I die`,
    `Kingslayer`,
    `Destroying castles in the sky`,
    `Kingslayer`,
    `Forevermore the apple of my eye`,
    `I'd sacrifice it all to guide you`,
    `Never have to battle alone`,
    `Kingslayer`,
    `Come and collect us from the night`,
    `This is your wake up call`,
    `We're going down the rabbit hole`,
    `Are you ready?`,
    `I can't feel you`,
    `Is this what you want?`,
    `This is what you'll fucking get`,
    `You motherfucking shit`,
];
const APRIL_FOOLS_DATE = "2021-04-01";
export const isEasterEggDay = () => dayTrunc(new Date()).getTime() === dayTrunc(dateFromString(APRIL_FOOLS_DATE)).getTime();
export const getPlayerName = (name, rank) => {
    if (!isEasterEggDay()) return name;

    return APRIL_FOOLS_RANKING[rank % APRIL_FOOLS_RANKING.length];
}