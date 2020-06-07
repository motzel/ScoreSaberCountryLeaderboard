import log from "./utils/logger";

const ENABLE_EASTER_EGGS = true;

const easterEggConditions = [
    [
        { field: 'id', value: '76561198165064325', cond: '===' },
        { field: 'percent', value: 0.85, cond: '<' }
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