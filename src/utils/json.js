import download from "./download";

export const downloadJson = (filename, json) => download(json, filename, 'application/json;charset=utf-8;');