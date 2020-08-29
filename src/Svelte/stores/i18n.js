import plStrings from '../../translations/pl';
import enStrings from '../../translations/en';
import {substituteVars} from "../../utils/format";
import {writable} from "svelte/store";
import {getConfig} from "../../plugin-config";

const languages = {
    pl: {id: 'pl', name: 'Polski', strings: plStrings},
    en: {id: 'en', name: 'English', strings: enStrings}
};

let currentLang = 'pl';

export const getTranslations = () => languages[currentLang].strings;

export let _ = writable(getTranslations());

export const getSupportedLangs = () => Object.values(languages).map(l => ({id: l.id, label: l.name}));

export const getCurrentLang = () => currentLang;

export const setCurrentLang = langId => {
    if (!languages[langId]) return;

    currentLang = langId;
    _.set(getTranslations());
}

export const trans = (key, data = {}, strings = getTranslations()) => substituteVars(key.split('.').reduce((o, i) => o[i], strings), data);

export const setLangFromConfig = async () => {
    const configOthers = await getConfig('others');
    setCurrentLang(configOthers.language);
}