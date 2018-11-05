const fsPromises = require('fs').promises;
const Json2csvParser = require('json2csv').Parser;

async function reportCsv(infoes, path) {
    infoes = infoes.map(format);

    const parser = new Json2csvParser({
        delimiter: ';'
    });
    const csv = parser.parse(infoes);
    await fsPromises.writeFile(path, csv);
}

function format(info) {
    let result = { ...info
    };
    for (const key in result) {
        const value = result[key];
        result[key] = value ? value.replace(/\n/g, ' ') : ''
    }
    return result;
}

module.exports.reportCsv = reportCsv;