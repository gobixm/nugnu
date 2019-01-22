# Install
Node.js version >= 10.15 is required.

Install as global package
```
npm install nugnu -g
```
Set **http_proxy** environment variable

# Usage
```
nugnu --path .
```

**path** -- path to the project's root directory (default '.')

# Targets
## CSV (default)
Collected dependencies will be written into csv-file specified with **out** parameter.
```
nugnu --target csv --out 'dependencies.csv'
```
**out** -- result file name (default 'third-party.csv')

## Confluence

```
nugnu --target confluence --server https://your.confluence.server --page 1111111 --space tst --credentials bG9naW46cGFzc3dvcmQ=
```
**server** -- confluence server
**space** -- a key of the workspace
**page** -- id of the page to update
**credentials** -- base64 encoded login and password (login:password)