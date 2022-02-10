import fetch from 'node-fetch';
import httpProxyAgent from 'https-proxy-agent';
import { CsProjPackageInfo } from './csproject';
const { HttpsProxyAgent } = httpProxyAgent;
const proxyAgent = new HttpsProxyAgent(process.env.http_proxy);

export interface NugetPackageInfo extends CsProjPackageInfo {
    latest: string;
    description: string;
    repository: string,
    license: string,
    homepage: string
}

export async function getPackagesInfo(packages: CsProjPackageInfo[]): Promise<NugetPackageInfo[]> {
    const infoes = [];
    for (const id in packages) {
        const meta = await getMeta(packages[id]);
        if (meta) {
            infoes.push(meta);
        }
    }
    return infoes;
}

async function getMeta(packageInfo: CsProjPackageInfo): Promise<NugetPackageInfo> {
    try {
        const url = `https://api-v2v3search-1.nuget.org/query?q=PackageId:${packageInfo.name.toLowerCase()}&prerelease=false`;
        console.log(`GET ${url}`);
        const response = await fetch(url, {
            agent: proxyAgent
        });
        const body = await response.json() as any;
        if (!body.data || !body.data.length) {
            console.log(`failed to get info from nuget registry for package "${packageInfo.name}"`);
            return;
        }

        const data = body.data[0];

        return {
            ...packageInfo,
            latest: data.version,
            description: data.description,
            repository: data.projectUrl,
            license: data.licenseUrl,
            homepage: data.projectUrl
        }
    } catch (err) {
        console.warn(`failed to get info from nuget registry for package "${packageInfo.name}"`, err)
    }
}