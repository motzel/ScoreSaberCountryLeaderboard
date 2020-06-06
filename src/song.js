import {capitalize} from "./utils/js";

export function getDiffColor(diffInfo) {
    const colors = {
        easy: 'MediumSeaGreen',
        normal: '#59b0f4',
        hard: 'tomato',
        expert: '#bf2a42',
        expertPlus: '#8f48db'
    };
    return colors[diffInfo.diff] ? colors[diffInfo.diff] : null;
}

export function getHumanDiffName(diffInfo) {
    return (
        capitalize(diffInfo.diff).replace('ExpertPlus', 'Expert+') +
        (diffInfo.type !== 'Standard' ? '/' + diffInfo.type : '')
    );
}