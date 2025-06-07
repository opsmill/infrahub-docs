# Infrahub documentation website

This folder contains the source code and documentation powering [https://docs.infrahub.app](https://docs.infrahub.app).

This website is built using [Docusaurus](https://docusaurus.io/), a modern static website generator.

## Getting started

### Installation

```console
cd docs
npm install
```

### Local development

```console
npm start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

### Build

```console
npm run build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

### Serve

```console
npm run serve
```

## How to Setup a New Repo

- Create a branch in the <project> to have it's docs built locally
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
    ci.yml ## only adding part
    sync-docs.yml
```

- Modify the following:

```console
docs/
  docusaurus.config.ts
  sidebars.ts
  docs/  ## Put docs here
.github/
  workflows/
    ci.yml ## only adding part
    sync-docs.yml ## paths
```

- `chmod 755 .github/build-docs.sh`

### In `infrahub-docs` modify the following

```console
touch docs/sidebars-<projectname>.ts
mkdir docs/docs-<projectname>
touch docs/docs-<projectname>/readme.mdx ### Placeholder
vi docs/docusaurus.config.ts ### Add a plugin and navbar entry
```

### Remaining tasks

- Setup Cloudflare Pages Integration
- Create PRs and test
