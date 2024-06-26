import { promises as fsPromises } from 'fs';
import globPkg from 'glob';
import { select } from 'xpath';
import { DOMParser } from '@xmldom/xmldom';

const dom = new DOMParser();
const { glob } = globPkg;

export interface CsProjPackageInfo {
    id: string;
    name: string;
    version: string;
}

export async function readProjects(path: string): Promise<CsProjPackageInfo[]> {
    console.log(path)
    const projects = findCsproj(path);
    const packagesProps = await getPackagesProps(path)

    const packageMap = new Map<string, CsProjPackageInfo>();

    for (const projPath of projects) {
        console.log(`found ${projPath}`);
        const proj = await parse(projPath)
        mapProject(proj, packagesProps).forEach(p => packageMap.set(p.id, p));
    }

    return Array.from(packageMap.values());
}

function findCsproj(path: string): string[] {
    return glob.sync(`${path}/**/*.csproj`);
}

async function getPackagesProps(path: string): Promise<Document> {
    const packagesPropsPath = glob.sync(`${path}/**/Directory.Packages.props`);
    
    if (packagesPropsPath?.length > 0){
        console.log(`found props ${packagesPropsPath[0]}`);
        return await parse(packagesPropsPath[0]);
    }
}

async function parse(path: string): Promise<Document> {
    const content = await fsPromises.readFile(path, 'utf8');
    return dom.parseFromString(content)
}

function getAttribute(ref: Element, name: string): string | undefined {
    const attribute = ref?.getAttribute(name);

    if (attribute) {
        return attribute;
    }

    const attributeElement = ref?.getElementsByTagName(name);
    if (attributeElement?.length > 0) {
        return attributeElement[0].textContent;
    }

}

function mapProject(proj: Node, packagesProps: Node): CsProjPackageInfo[] {
    const packagesRef = select("//PackageReference", proj);
    const result: CsProjPackageInfo[] = [];
    if (packagesRef.length) {
        for (const ref of packagesRef) {
            const el = ref as Element;
            const name = getAttribute(el, 'Include');
            let version = getAttribute(el, 'Version') ?? getAttribute(getPackageVersionElement(name, packagesProps), 'Version');
            const privateAssets = getAttribute(el, 'PrivateAssets') ?? getAttribute(getPackageVersionElement(name, packagesProps), 'PrivateAssets');

            if (!version) {
                continue;
            }

            if (privateAssets) {
                console.log(`skipping dev dependency ${name}.${version}`)
                continue;
            }

            version = version.replace(/^(\^|~|>=|>)/, '');

            if (name === 'Microsoft.NET.Test.Sdk') {
                console.log('skipping test project');
                return [];
            }

            const id = `${name}@${version}`
            result.push({ id, name, version });
        }
    }
    return result;
}

function getPackageVersionElement(name: string, packagesProps: Node): Element | undefined {
    if (!packagesProps){
        return;
    }

    const packageVersionRef = select(`//PackageVersion[@Include='${name}']`, packagesProps);
    if (packageVersionRef?.length > 0) {
        return packageVersionRef[0] as Element;
    }
}
