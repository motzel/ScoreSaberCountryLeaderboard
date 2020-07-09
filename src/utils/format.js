import config from '../temp';
import {dateFromString} from "./date";

export function formatNumberWithSuffix(num, suffix, digits = 2, addSign = false) {
    return (num ? formatNumber(num, digits, addSign) : '-') + (num && suffix ? suffix : '');
}

export function formatNumber(num, digits = 2, addSign = false) {
    return (
        (addSign && num > 0 ? '+' : '') +
        num.toLocaleString(config.COUNTRY, {
            minimumFractionDigits: digits,
            maximumFractionDigits: digits
        })
    );
}

export function formatDate(val) {
    const rtf = new Intl.RelativeTimeFormat(config.COUNTRY, {
        localeMatcher: 'best fit',
        numeric: 'auto',
        style: 'long'
    });

    const diffInSecs = (Date.now() - dateFromString(val)) / 1000;

    if (diffInSecs < 60)
        return rtf.format(-Math.ceil(diffInSecs), 'second');
    else if (diffInSecs < 60 * 60)
        return rtf.format(-Math.ceil(diffInSecs / 60), 'minute');
    else if (diffInSecs < 60 * 60 * 24)
        return rtf.format(-Math.ceil(diffInSecs / (60 * 60)), 'hour');
    else if (diffInSecs < 60 * 60 * 24 * 30)
        return rtf.format(-Math.ceil(diffInSecs / (60 * 60 * 24)), 'day');
    else if (diffInSecs < 60 * 60 * 24 * 365)
        return rtf.format(
            -Math.ceil(diffInSecs / (60 * 60 * 24 * 30)),
            'month'
        );
    else
        return rtf.format(
            -Math.floor(diffInSecs / (60 * 60 * 24 * 365)),
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