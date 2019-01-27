const axios = require('axios');
const fetch = require('node-fetch');
const htmlEncode = require('js-htmlencode').htmlEncode;
const Https = require('https');

async function report(infoes, config) {
    const columnMapping = {
        name: 'Name',
        version: 'Version',
        latest: 'Latest',
        description: 'Description',
        repository: 'Repository',
        license: 'License',
        homepage: 'Link'
    };

    await execute();

    async function execute() {
        const pageContent = `<table>${buildHeader()}${buildBody()}</table>`

        const page = await getPage();

        await updatePage(page, pageContent);
    }

    function buildHeader() {
        const columns = [];
        for (let prop in columnMapping) {
            columns.push(`<th>${columnMapping[prop]}</th>`);
        }

        return `<tr>${columns.join('')}</tr>`;
    }

    function buildBody() {
        return infoes
            .map(buildRow)
            .join('');
    }

    function buildRow(package) {
        const columns = [];

        columns.push(buildTextCell(package.name));
        columns.push(buildTextCell(package.version));
        columns.push(buildTextCell(package.latest));
        columns.push(buildTextCell(package.description));
        columns.push(buildLinkCell('link', package.repository));
        columns.push(buildLinkCell('link', package.license));
        columns.push(buildLinkCell('link', package.homepage));

        return `<tr>${columns.join('')}</tr>`
    }

    function buildTextCell(text) {
        return `<td>${htmlEncode(text || '')}</td>`;
    }

    function buildLinkCell(text, url) {
        return `<td><a href="${url || ''}">${htmlEncode(text || '')}</a></td>`
    }

    async function getPage() {
        const url = `${config.server}/rest/api/content/${config.page}`;
        console.log('Quering page state...');
        const response = await fetch(url, {
            method: 'GET',
            agent: new Https.Agent({ rejectUnauthorized: false }),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${config.credentials}`
            }
        });

        const body = await response.json();
        console.log('Page state received');

        return body;
    }

    async function updatePage(page, pageContent) {
        const url = `${config.server}/rest/api/content/${config.page}`;

        const body = {
            id: config.page,
            type: 'page',
            space: { key: config.space },
            title: page.title,
            body: {
                storage: {
                    value: pageContent,
                    representation: 'storage'
                }
            },
            version: { number: page.version.number + 1 },
        };

        console.log('Updating page...');
        const response = await fetch(url, {
            method: 'PUT',
            agent: new Https.Agent({ rejectUnauthorized: false }),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${config.credentials}`
            },
            body: JSON.stringify(body)
        });
        console.log(`Update finished with staus code ${response.status}`);
    }
}

module.exports.report = report;