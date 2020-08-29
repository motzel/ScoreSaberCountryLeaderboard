import plStrings from '../../translations/pl';
import enStrings from '../../translations/en';
import {substituteVars} from "../../utils/format";
import {writable} from "svelte/store";
import {getConfig} from "../../plugin-config";

const languages = {
    pl: {id: 'pl', name: 'Polski', strings: plStrings},
    en: {id: 'en', name: 'English', strings: enStrings}
};

const locales = {
    'pl-PL': {id: 'pl-PL', name: 'Polska'},
    'en-US': {id: 'en-US', name: 'United States'},
    'en-GB': {id: 'en-GB', name: 'United Kingdom'},
    'de-DE': {id: 'de-DE', name: 'Deutschland'},
    'es-ES': {id: 'es-ES', name: 'España'},
};

let currentLang = 'pl';
let currentLocale = 'pl';

export const getTranslations = () => languages[currentLang].strings;

export let _ = writable(getTranslations());

export const getSupportedLangs = () => Object.values(languages).map(l => ({id: l.id, label: l.name}));
export const getSupportedLocales = () => Object.values(locales).map(l => ({id: l.id, label: l.name}));

export const getCurrentLang = () => currentLang;

export const getCurrentLocale = () => currentLocale;

export const setCurrentLang = langId => {
    if (!languages[langId]) return;

    currentLang = langId;
    _.set(getTranslations());
}

export const setCurrentLocale = locale => {
    if (!locales[locale]) return;

    currentLocale = locale;
}

export const trans = (key, data = {}, strings = getTranslations()) => substituteVars(key.split('.').reduce((o, i) => o[i], strings), data);

export const setLangFromConfig = async () => {
    const configOthers = await getConfig('others');
    setCurrentLang(configOthers.language);
    setCurrentLocale(configOthers.locale);
}