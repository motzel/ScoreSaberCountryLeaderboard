import {padNumber} from "./format";
import {isString} from "./js";

export const SECOND = 1000;
export const MINUTE = 60 * SECOND;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;

export const isValidDate = d =>d instanceof Date && !isNaN(d);

export function getClientTimezoneOffset() {
    const offset = new Date().getTimezoneOffset();
    const totalMinutes = Math.abs(offset);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const prefix = offset < 0 ? "+" : "-";

    return prefix + hours.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0');
}

export function truncateDate(date, precision = 'day') {
    const newDate = new Date(date.getTime());

    // no breaks here!
    switch(precision) {
        case 'year': newDate.setMonth(0);
        case 'month': newDate.setDate(1);
        case 'day': newDate.setHours(0);
        case 'hour': newDate.setMinutes(0);
        case 'minute': newDate.setSeconds(0);
        case 'second': newDate.setMilliseconds(0);
    }

    return newDate;
}

export function toUTCDateTimestamp(date) {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    const day = date.getUTCDate();

    return Date.UTC(year, month, day, 0, 0, 0, 0);
}

export function toSSTimestamp(date) {
    return (new Date(Date.parse(date.toLocaleString('pl-PL', { timeZone: 'Australia/Brisbane',hour12: false,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    }).replace(/(\d+)\.(\d+)\.(\d+),\s(\d+):(\d+):(\d+)/, "$3-$2-$1")))).getTime();
}

export function dayTrunc(date) {
    date = date instanceof Date ? date : dateFromString(date);

    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);

    return date;
}

export const addToDate = (date, millis) => new Date(date.getTime() + millis)
export const daysAgo = days => addToDate(new Date(), - days * DAY);

export const getFirstNotNewerThan = (timestamp, arr) =>
    arr
        .map(t => parseInt(t))
        .sort((a,b) => b - a)
        .reduce((val, t) => null === val && t <= timestamp ? t: val, null);


export const dateFromString = str => {
    // convert SS page date format to ISO
    const matches = str && isString(str) ? str.match(/^(\d{4}-\d{1,2}-\d{1,2})\s+(\d{1,2}:\d{1,2}(:\d{1,2})?)\sUTC$/) : null;
    if (matches && matches.length >= 3) {
        str = matches[1] + 'T' + matches[2] + 'Z';
    }

    const date = str ? new Date(Date.parse(str)) : null;

    return isValidDate(date) ? date : null;
}

export const timestampFromString = str => {
    const date = dateFromString(str);

    return date ? date.getTime() : null;
}

export const durationToMillis = duration => {
    const match = duration.match(/^\s*(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)\s*$/);
    if (!match) return null;

    return (match[1] ? parseInt(match[1], 10) * 1000 * 60 * 60 : 0) +
        (match[2] ? parseInt(match[2], 10) * 1000 * 60 : 0) +
        (match[3] ? parseInt(match[3], 10) * 1000 : 0);
}

export const millisToDuration = millis => {
    const hours = padNumber(Math.floor(millis / (1000 * 60 * 60)));
    millis -= hours * 1000 * 60 * 60;

    const minutes = padNumber(Math.floor(millis  / (1000 * 60)));
    millis -= minutes * 1000 * 60;

    const seconds = padNumber(Math.floor(millis / 1000));

    return `${hours}h${minutes}m${seconds}s`;
}