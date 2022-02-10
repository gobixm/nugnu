import { promises as fsPromises } from 'fs';
import { Parser } from 'json2csv';
import { NugetPackageInfo } from './crawler';

const parser = new Parser({
    delimiter: ';'
});

export async function reportCsv(infoes: NugetPackageInfo[], config) {
    infoes = infoes.map(format);
    
    const csv = parser.parse(infoes);
    await fsPromises.writeFile(config.out, csv);
}

function format(info: NugetPackageInfo) {
    const result = {
        ...info
    };
    for (const key in result) {
        const value = result[key];
        result[key] = value ? value.replace(/\n/g, ' ') : ''
    }
    return result;
}