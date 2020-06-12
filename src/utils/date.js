export function todayUTC() {
    const d = new Date();
    const year = d.getUTCFullYear();
    const month = d.getUTCMonth();
    const day = d.getUTCDate();

    return Date.UTC(year, month, day, 0, 0, 0, 0);
}

export const dateFromString = (str) => (str ? new Date(Date.parse(str)) : null);