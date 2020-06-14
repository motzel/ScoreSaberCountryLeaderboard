export const DAY = 24 * 60 * 60 * 1000;

export function toUTCDate(date) {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    const day = date.getUTCDate();

    return Date.UTC(year, month, day, 0, 0, 0, 0);
}

export const daysAgo = days => new Date((new Date()).getTime() - days * DAY);

export const getFirstNotNewerThan = (timestamp, arr) =>
    arr
        .map(t => parseInt(t))
        .sort((a,b) => b - a)
        .reduce((val, t) => null === val && t <= timestamp ? t: val, null);


export const dateFromString = (str) => (str ? new Date(Date.parse(str)) : null);