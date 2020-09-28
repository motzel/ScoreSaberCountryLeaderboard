import {getFirstRegexpMatch} from "../utils/js";

export const parseSsInt = text => parseInt(getFirstRegexpMatch(/([0-9,]+)$/, text).replace(/[^\d]/g, ''), 10)