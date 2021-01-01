import {getFirstRegexpMatch} from "../utils/js";

export const parseSsInt = text => parseInt(getFirstRegexpMatch(/([0-9,]+)\s*$/, text)?.replace(/[^\d]/g, '') ?? null, 10)
export const parseSsFloat = text => parseFloat(getFirstRegexpMatch(/([0-9,.]+)\s*$/, text?.replace(/[^\d.]/g, '')) ?? null)