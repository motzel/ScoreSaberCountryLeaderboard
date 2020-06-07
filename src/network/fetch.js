import {substituteVars} from "../utils/format";

export const fetchApiPage = async (url, page = 1) =>
    fetch(substituteVars(url, {page}))
        .then((r) => r.json())
        .catch((e) => null);

export const fetchHtmlPage = async (url, page = 1) =>
    new DOMParser().parseFromString(
        await (await fetch(substituteVars(url, {page}))).text(),
        'text/html'
    );