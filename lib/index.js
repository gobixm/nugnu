const package = require('./csproject');
const crawler = require('./crawler');
const csvReporter = require('./csv-reporter');
const confluenceReporter = require('./confluence-reporter');

const config = require('rc')('tp-report', {
    path: '.',
    out: './third-party.csv',
    target: 'csv'
});

async function run() {
    console.log(JSON.stringify(config));

    const packages = (await package.readProjects(config.path));
    const infoes = await crawler.getPackagesInfo(packages);

    let reporter = null;
    switch (config.target) {
        case 'csv':
            reporter = csvReporter;
            break;

        case 'confluence':
            reporter = confluenceReporter;
            break;
    }
    await reporter.report(infoes, config);
}

module.exports.run = run;
