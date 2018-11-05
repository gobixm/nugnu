const axios = require('axios');

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
        const url = `https://api-v2v3search-0.nuget.org/query?q=PackageId:${package.name.toLowerCase()}&prerelease=false`;
        console.log(`GET ${url}`);
        const meta = await axios.get(url);
        if (!meta || !meta.data || !meta.data.data) {
            console.log(`failed to get info from npm registry for package "${package.name}"`);
            return;
        }

        const data = meta.data.data[0];

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