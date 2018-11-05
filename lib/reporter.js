const fsPromises = require('fs').promises;
const Json2csvParser = require('json2csv').Parser;

async function reportCsv(infoes, path) {
    const parser = new Json2csvParser({ delimiter: ';' });
    const csv = parser.parse(infoes);
    await fsPromises.writeFile(path, csv);
}

module.exports.reportCsv = reportCsv;