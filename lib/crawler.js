const axios = require('axios');
const fetch = require('node-fetch');
const HttpsProxyAgent = require('https-proxy-agent');

async function getPackagesInfo(packages) {
    let infoes = [];
    for (const id in packages) {
        const meta = await getMeta(packages[id]);
        if (meta) {
            infoes.push(meta);
        }
    }
    return infoes;
}

async function getMeta(package) {
    try {
        const proxy = process.env.http_proxy;
        const url = `https://api-v2v3search-1.nuget.org/query?q=PackageId:${package.name.toLowerCase()}&prerelease=false`;
        console.log(`GET ${url}`);
        const response = await fetch(url, {
            agent: new HttpsProxyAgent(proxy)
        });
        const body = await response.json();
        if (!body.data || !body.data.length) {
            console.log(`failed to get info from npm registry for package "${package.name}"`);
            return;
        }

        const data = body.data[0];

        return {
            ...package,
            latest: data.version,
            description: data.description,
            repository: data.projectUrl,
            license: data.licenseUrl,
            homepage: data.projectUrl
        }
    } catch (err) {
        console.warn(`failed to get info from npm registry for package "${package.name}"`, err)
    }
}

module.exports.getPackagesInfo = getPackagesInfo;