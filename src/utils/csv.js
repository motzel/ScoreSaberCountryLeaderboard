import download from './download';

const processRow = (row, headers, delimiter = ',') => {
    return headers.map(h => {
        let val = row[h.field] ? row[h.field] : '';

        switch (true) {
            case val instanceof Date: val = val.toISOString(); break;
            case val === null || val === undefined: val = ''; break;
            default:
                // noinspection JSObjectNullOrUndefined
                val = val.toString(); break;
        }

        val = val.replace(/"/g, '""')

        return val.match(/("|,|\\n)/) ? `"${val}"` : val;
    }).join(delimiter);
}

export const generateCsv = (data, headers, delimiter = ',') => {
    const headersRow = headers.reduce((cum, h) => (cum[h.field] = h.label, cum), {})

    return processRow(headersRow, headers, delimiter) + '\n' +
        data.map(row => processRow(row, headers, delimiter)).join('\n')
}

export const downloadCsv = (filename, csv) => download(csv, filename, 'text/csv;charset=utf-8;');