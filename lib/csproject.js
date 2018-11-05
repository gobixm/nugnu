const fsPromises = require('fs').promises;
const glob = require('glob');
const xpath = require('xpath');
const dom = require('xmldom').DOMParser;

async function readProjects(path) {
    console.log(path)
    const projects = await findCsproj(path);
    let result = {};
    for (const projPath of projects) {
        console.log(`found ${projPath}`);
        const proj = await parse(projPath)
        result = { ...result, ...mapProject(proj) };
    }
    return result;
}

async function findCsproj(path) {
    return new Promise(resolve => {
        glob(`${path}/**/*.csproj`, {}, (err, matches) => resolve(matches));
    })
}

async function parse(path) {
    const content = await fsPromises.readFile(path, 'utf8');
    return new dom().parseFromString(content)
}

function mapProject(proj) {
    const packagesRef = xpath.select("//PackageReference", proj)
    let result = {};
    if (packagesRef.length) {
        for (const ref of packagesRef) {
            const name = ref.getAttribute('Include');
            const version = ref.getAttribute('Version').replace(/^(\^|~|>=|>)/, '');

            if (name === 'Microsoft.NET.Test.Sdk') {
                console.log('skipping test project');
                return {};
            }

            const id = `${name}@${version}`
            result[id] =
                {
                    name: name,
                    version: version
                };
        }
    }
    return result;
}

exports.readProjects = readProjects;