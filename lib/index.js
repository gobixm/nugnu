const package = require('./csproject');
const crawler = require('./crawler');
const reporter = require('./reporter');

const config = require('rc')('tp-report', {
    path: '.',
    out: './third-party.csv'
});

async function run() {
    const packages = await package.readProjects(config.path);
    const infoes = await crawler.getPackagesInfo(packages);
    await reporter.reportCsv(infoes, config.out);
}

module.exports.run = run;
