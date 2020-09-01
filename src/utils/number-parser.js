// https://observablehq.com/@mbostock/localized-number-parsing
export class NumberParser {
    constructor(locale) {
        const parts = new Intl.NumberFormat(locale).formatToParts(1234567.89);
        const numerals = [...new Intl.NumberFormat(locale, {useGrouping: false}).format(9876543210)].reverse();
        const index = new Map(numerals.map((d, i) => [d, i]));

        // modification to original code in order to support both non-breaking space (160) and std space (32)
        let groupChar = parts.find(d => d.type === "group").value;
        if (groupChar.length && groupChar.length === 1 && groupChar.charCodeAt(0) === 160)
            groupChar = '(' + groupChar + '| )';
        else
            groupChar = `[${groupChar}]`

        this._group = new RegExp(groupChar, "g");
        this._decimal = new RegExp(`[${parts.find(d => d.type === "decimal").value}]`);
        this._numeral = new RegExp(`[${numerals.join("")}]`, "g");
        this._index = d => index.get(d);
    }

    parse(string) {
        return (string = string.trim()
            .replace(this._group, "")
            .replace(this._decimal, ".")
            .replace(this._numeral, this._index)) ? +string : NaN;
    }
}