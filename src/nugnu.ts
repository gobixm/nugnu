import { readProjects } from './csproject.js';
import { getPackagesInfo, NugetPackageInfo } from './crawler.js';
import { reportCsv } from './csv-reporter.js';
import { reportConfluence } from './confluence-reporter.js';
import rc from 'rc';

const config = rc('tp-report', {
    path: '.',
    out: './third-party.csv',
    target: 'csv'
});

export async function run() {
    console.log(JSON.stringify(config));

    const packages = await readProjects(config.path);
    const infoes = await getPackagesInfo(packages);

    let reporter: (infoes: NugetPackageInfo[], config: any) => Promise<void> = null;
    switch (config.target) {
        case 'csv':
            reporter = reportCsv;
            break;

        case 'confluence':
            reporter = reportConfluence;
            break;
        default:
            reporter = reportCsv;
            break;
    }
    await reporter(infoes, config);
}