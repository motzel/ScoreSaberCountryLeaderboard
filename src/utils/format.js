import {dateFromString} from "./date";
import {getCurrentLang, getCurrentLocale} from '../Svelte/stores/i18n';
import {NumberParser} from "./number-parser";

export function formatNumberWithSuffix(num, suffix, digits = 2, addSign = false) {
    return (num ? formatNumber(num, digits, addSign) : '-') + (num && suffix ? suffix : '');
}

export function formatNumber(num, digits = 2, addSign = false) {
    return (
        (addSign && num > 0 ? '+' : '') +
        num.toLocaleString(getCurrentLocale(), {
            minimumFractionDigits: digits,
            maximumFractionDigits: digits
        })
    );
}

export function parseFormattedNumber(value) {
    return new NumberParser(getCurrentLocale()).parse(value);
}

export function formatDate(val) {
    const rtf = new Intl.DateTimeFormat(getCurrentLocale(), {
        localeMatcher: 'best fit',
        dateStyle: 'short',
        timeStyle: 'medium',
    });

    return rtf.format(val);
}

export function formatDateRelativeInUnits(val, unit = 'day') {
    const rtf = new Intl.RelativeTimeFormat(getCurrentLang(), {
        localeMatcher: 'best fit',
        numeric: 'auto',
        style: 'long'
    });

    return rtf.format(val, 'day');
}

export function formatDateRelative(val, roundFunc = Math.round) {
    const rtf = new Intl.RelativeTimeFormat(getCurrentLang(), {
        localeMatcher: 'best fit',
        numeric: 'auto',
        style: 'long'
    });

    const diffInSecs = (Date.now() - dateFromString(val)) / 1000;

    if (diffInSecs < 60)
        return rtf.format(-roundFunc(diffInSecs), 'second');
    else if (diffInSecs < 60 * 60)
        return rtf.format(-roundFunc(diffInSecs / 60), 'minute');
    else if (diffInSecs < 60 * 60 * 24)
        return rtf.format(-roundFunc(diffInSecs / (60 * 60)), 'hour');
    else if (diffInSecs < 60 * 60 * 24 * 30)
        return rtf.format(-roundFunc(diffInSecs / (60 * 60 * 24)), 'day');
    else if (diffInSecs < 60 * 60 * 24 * 365)
        return rtf.format(
            -roundFunc(diffInSecs / (60 * 60 * 24 * 30)),
            'month'
        );
    else
        return rtf.format(
            -roundFunc(diffInSecs / (60 * 60 * 24 * 365)),
            'year'
        );
}

export function substituteVars(url, vars) {
    return Object.keys(vars).reduce(
        (cum, key) =>
            cum.replace(new RegExp('\\${' + key + '}', 'gi'), vars[key]),
        url
    );
}

export const round = (val, places = 2) => {
    const mult = Math.pow(10, places);
    return Math.round((val + Number.EPSILON) * mult) / mult;
};

export function roundToPrecision(num, precision = 0.1) {
    return round(Math.floor(num / precision) * precision);
}

export const padNumber = (num, pad = 2) => (Array(pad).fill('0').join('') + num).slice(-pad);