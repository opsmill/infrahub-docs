# Infrahub documentation website

This folder contains the source code and documentation powering [https://docs.infrahub.app](https://docs.infrahub.app).

This website is built using [Docusaurus](https://docusaurus.io/), a modern static website generator.

## Getting started

### Installation

```shell
npm install
```

### Local development

```shell
npm start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

### Build

```shell
npm run build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

### Serve

```shell
npm run serve
```

## How to Setup a New Repo

- Create a branch
- Copy over these files & directories from another repo, like `emma` repo:

```console
docs/
.vale
.vale.ini
.markdownlint.yml
.yamllint.yml
tasks.py
.github/
  build-docs.sh
  file-filters.yml
  labeler.yml
  labels.yml
  workflows/
    ci.yml (only adding part)
    sync-docs.yml
```

- Modify the following:

```console
docs/
  docusaurus.config.ts
  sidebars.ts
  docs/<projectname>  <— Put docs here
.github/
  workflows/
    ci.yml (only adding part)
    sync-docs.yml (paths)
```

- Setup Cloudflare Pages Integration
- Create PR and test
