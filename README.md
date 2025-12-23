# Infrahub documentation website

⚠️ **Important Notice**: This repository is a **documentation aggregation site** that combines documentation from multiple Infrahub repositories. Most of the documentation content here is **read-only** and automatically synced from other repositories.

## Before opening an issue or pull request

**Please do not open issues or pull requests for documentation content in this repository.** Instead, please open them in the appropriate source repository where the documentation actually lives:

- **Infrahub core documentation**: [opsmill/infrahub](https://github.com/opsmill/infrahub) repository
- **Python SDK documentation**: [opsmill/infrahub-sdk-python](https://github.com/opsmill/infrahub-sdk-python) repository  
- **Ansible collection documentation**: [opsmill/infrahub-ansible](https://github.com/opsmill/infrahub-ansible) repository
- **Service catalog documentation**: [opsmill/infrahub-demo-service-catalog](https://github.com/opsmill/infrahub-demo-service-catalog) repository
- **Nornir integration documentation**: [opsmill/nornir-infrahub](https://github.com/opsmill/nornir-infrahub) repository
- **Schema library documentation**: [opsmill/schema-library](https://github.com/opsmill/schema-library) repository
- **Infrahub Sync documentation**: [opsmill/infrahub-sync](https://github.com/opsmill/infrahub-sync) repository
- **Emma documentation**: [opsmill/emma](https://github.com/opsmill/emma) repository

This repository only aggregates and builds the documentation website. Changes made here will be overwritten during the next sync from the source repositories.

## About this repository

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

## How to Setup Documentation for a New Repository

This guide walks through setting up documentation syncing from a new OpsMill repository to this aggregation site.

### Automated Setup (Recommended)

Use the setup script to automate most of the configuration:

```bash
# Setup both source repo and infrahub-docs at once
python scripts/setup-docs-repo.py \
  --source-repo /path/to/my-new-project \
  --infrahub-docs-repo /path/to/infrahub-docs \
  --display-name "My New Project"

# Setup source repo only
python scripts/setup-docs-repo.py \
  --source-repo /path/to/my-new-project \
  --display-name "My New Project"

# Setup infrahub-docs only
python scripts/setup-docs-repo.py \
  --infrahub-docs-repo /path/to/infrahub-docs \
  --project-name my-new-project \
  --display-name "My New Project"
```

The script will:

- Copy all required template files to the source repository
- Update configuration files with your project name
- Create placeholder files in infrahub-docs
- Generate the plugin configuration snippets to add

Run `python scripts/setup-docs-repo.py --help` for all options.

### Manual Setup

If you prefer to set things up manually, follow the steps below.

### Prerequisites

- A new OpsMill GitHub repository that needs documentation
- Access to create GitHub Actions secrets (for `PAT_TOKEN`)
- Cloudflare Pages access (for the integration)

### Part 1: Configure the Source Repository

These steps are performed in your new repository (e.g., `opsmill/my-new-project`).

#### Step 1: Copy required files from an existing repo

Use `infrahub-bundle-dc` as a template. Copy these files and directories:

**Documentation framework:**

```text
docs/                         # Docusaurus site
├── .docusaurus/              # (auto-generated, gitignored)
├── .gitignore
├── babel.config.js
├── docs/                     # Your documentation content goes here
│   └── readme.mdx            # At minimum, create an index page
├── docusaurus.config.ts      # Site configuration (modify this)
├── package.json
├── sidebars.ts               # Sidebar navigation (modify this)
├── src/
│   └── css/
│       └── custom.css
├── static/
│   └── img/
│       ├── favicon.ico
│       ├── infrahub-hori.svg
│       └── infrahub-hori-dark.svg
└── tsconfig.json
```

**Linting configuration (copy to repo root):**

```text
.vale/                        # Vale style rules
.vale.ini                     # Vale configuration
.markdownlint.yaml            # Markdown linting rules
.yamllint.yml                 # YAML linting rules (optional)
tasks.py                      # Invoke tasks (optional, for local builds)
```

**GitHub Actions (copy to `.github/`):**

```text
.github/
├── build-docs.sh             # Build script for CI
├── file-filters.yml          # Path filters for CI jobs
├── labeler.yml               # PR labeling rules
├── labels.yml                # Label definitions
└── workflows/
    ├── ci.yml                # CI pipeline (add docs job)
    └── sync-docs.yml         # Syncs docs to infrahub-docs
```

#### Step 2: Make the build script executable

```bash
chmod 755 .github/build-docs.sh
```

#### Step 3: Customize the documentation configuration

**Edit `docs/docusaurus.config.ts`:**

- Update `title` and `tagline` for your project
- Update `projectName` to match your repository name
- Update `editUrl` to point to your repository
- Update the `sidebarId` in navbar items to match your sidebar name
- Update the GitHub link `href` to your repository

**Edit `docs/sidebars.ts`:**

- Rename the sidebar (e.g., `MyProjectSidebar`)
- Define your documentation structure

**Edit `docs/package.json`:**

- Update the `name` field to match your project

#### Step 4: Configure the sync workflow

**Edit `.github/workflows/sync-docs.yml`:**

Update the paths to match your project name:

```yaml
- name: Sync folders
  run: |
    rm -rf target-repo/docs/docs-<projectname>/*
    rm -f target-repo/docs/sidebars-<projectname>.ts
    cp -r source-repo/docs/docs/* target-repo/docs/docs-<projectname>/
    cp source-repo/docs/sidebars.ts target-repo/docs/sidebars-<projectname>.ts
    cd target-repo
    git config user.name github-actions
    git config user.email github-actions@github.com
    git add .
    if ! (git diff --quiet && git diff --staged --quiet); then git commit -m "Sync docs from <projectname> repo" && git push; fi
```

#### Step 5: Add documentation CI job (if not present)

Ensure your `.github/workflows/ci.yml` includes:

1. **File change detection** for documentation files (in `file-filters.yml`):

   ```yaml
   doc_files: &doc_files
     - "docs/**"
     - package.json
     - package-lock.json

   documentation_all:
     - *doc_files
     - *markdown_all
   ```

2. **Documentation build job** to verify docs build successfully before merge

3. **Vale style validation job** (optional but recommended)

#### Step 6: Add the PAT_TOKEN secret

The sync workflow requires a `PAT_TOKEN` secret with write access to `opsmill/infrahub-docs`. Request this from a repository admin.

### Part 2: Configure the Aggregation Repository (infrahub-docs)

These steps are performed in this repository (`opsmill/infrahub-docs`).

#### Step 1: Create placeholder files

```bash
# Create the docs directory for synced content
mkdir -p docs/docs-<projectname>

# Create a placeholder file (will be overwritten by sync)
touch docs/docs-<projectname>/readme.mdx

# Create the sidebar configuration file (will be overwritten by sync)
touch docs/sidebars-<projectname>.ts
```

#### Step 2: Add plugin configuration

Edit `docs/docusaurus.config.ts` to add your new documentation section.

**Add the sidebar import** at the top of the file:

```typescript
import sidebars<ProjectName> from "./sidebars-<projectname>";
```

**Add a new plugin** in the `plugins` array:

```typescript
[
  "@docusaurus/plugin-content-docs",
  {
    id: "<projectname>",
    path: "docs-<projectname>",
    routeBasePath: "<projectname>",
    sidebarPath: "./sidebars-<projectname>.ts",
    editUrl: "https://github.com/opsmill/<source-repo>/tree/main/docs",
  },
],
```

**Add a navbar entry** in `themeConfig.navbar.items`:

```typescript
{
  type: "docSidebar",
  sidebarId: "<ProjectName>Sidebar",  // Must match sidebar name in source repo
  docsPluginId: "<projectname>",
  position: "left",
  label: "<Display Name>",
},
```

Or add to an existing dropdown menu if appropriate.

### Part 3: Final Setup

#### Step 1: Set up Cloudflare Pages integration

Configure Cloudflare Pages to build and deploy the documentation site. Contact the SRE team for access or help.

#### Step 2: Create pull requests and test

1. Create a PR in your source repository with the documentation setup
2. Create a PR in `infrahub-docs` with the plugin configuration
3. Merge the `infrahub-docs` PR first
4. Merge the source repository PR
5. Verify the sync workflow runs and documentation appears on the site

### Troubleshooting

**Sync workflow fails with permission errors:**

- Verify the `PAT_TOKEN` secret is configured and has write access to `infrahub-docs`

**Documentation build fails in CI:**

- Run `cd docs && npm install && npm run build` locally to debug
- Check for broken links or invalid MDX syntax

**Content not appearing after sync:**

- Verify the plugin ID and sidebar configuration match
- Check that the sync workflow completed successfully
