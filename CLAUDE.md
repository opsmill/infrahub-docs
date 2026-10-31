# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a **documentation aggregation repository**. It builds <https://docs.infrahub.app> with Docusaurus from documentation that lives in other OpsMill repositories. A GitHub Actions workflow in each source repository copies its docs into this repository and commits them, so most content here is overwritten on the next sync.

**Important**: Make documentation content changes in the source repository, not here. This repository owns the site itself: Docusaurus configuration, navbar, theme, redirects, landing pages and the hand-maintained Integrations section.

### Documentation Sections and Source Repositories

Each section is a `@docusaurus/plugin-content-docs` instance in `docs/docusaurus.config.ts`. The core Infrahub docs use the `classic` preset's docs plugin (plugin ID `default`).

| Section | Plugin ID | Directory | Route | Source repo |
|---------|-----------|-----------|-------|-------------|
| Core Infrahub | `default` | `docs/docs/` | `/` | `opsmill/infrahub` (`stable` branch) |
| Python SDK | `docs-python-sdk` | `docs/docs-python-sdk/python-sdk/` | `/python-sdk` | `opsmill/infrahub-sdk-python` |
| Infrahubctl | `infrahubctl` | `docs/docs-python-sdk/infrahubctl/` | `/infrahubctl` | `opsmill/infrahub-sdk-python` |
| Emma | `docs-emma` | `docs/docs-emma/` | `/emma` | `opsmill/emma` |
| VS Code extension | `docs-vscode` | `docs/docs-vscode/` | `/vscode` | `opsmill/infrahub-vscode` |
| MCP server | `docs-mcp` | `docs/docs-mcp/` | `/mcp` | `opsmill/infrahub-mcp` |
| AI skills | `docs-ai-skills` | `docs/docs-ai-skills/` | `/skills` | `opsmill/infrahub-skills` |
| Backup | `docs-backup` | `docs/docs-backup/` | `/backup` | `opsmill/infrahub-backup` |
| Integrations overview | `docs-integrations` | `docs/docs-integrations/` | `/integrations` | None, maintained in this repository |
| Ansible | `docs-ansible` | `docs/docs-ansible/` | `/ansible` | `opsmill/infrahub-ansible` |
| Exporter | `docs-exporter` | `docs/docs-exporter/` | `/exporter` | `opsmill/infrahub-exporter` |
| Infrahub Sync | `docs-sync` | `docs/docs-sync/` | `/sync` | `opsmill/infrahub-sync` |
| Nornir | `docs-nornir` | `docs/docs-nornir/` | `/nornir` | `opsmill/nornir-infrahub` |
| Schema library | `docs-schema-library` | `docs/docs-schema-library/` | `/schema-library` | `opsmill/schema-library` |
| Data center demo | `docs-demo-dc` | `docs/docs-demo-dc/` | `/demo-dc` | `opsmill/infrahub-demo-dc` |
| Service provider demo | `docs-infrahub-demo-sp` | `docs/docs-infrahub-demo-sp/` | `/infrahub-demo-sp` | `opsmill/infrahub-demo-sp` |
| Optical transport demo | `docs-demo-otn` | `docs/docs-demo-otn/` | `/demo-otn` | `opsmill/infrahub-demo-otn` |
| Service catalog demo | `docs-service-catalog` | `docs/docs-service-catalog/` | `/demo-service-catalog` | `opsmill/infrahub-demo-service-catalog` |
| AI data center reference design | `docs-infrahub-solution-ai-dc` | `docs/docs-infrahub-solution-ai-dc/` | `/infrahub-solution-ai-dc` | `opsmill/infrahub-solution-ai-dc` |
| Arista AVD reference design | `docs-arista-avd` | `docs/docs-arista-avd/` | `/arista-avd` | `opsmill/infrahub-arista-avd` |

Keep this table, the plugin list in `docs/docusaurus.config.ts` and `REPO_BY_PLUGIN_ID` in `docs/src/components/GitHubRepoNavbarItem.tsx` in step with each other.

### What Each Sync Overwrites

Each source repository has a `.github/workflows/sync-docs.yml` that deletes and re-copies its files here on every push to its main branch (`stable` for `opsmill/infrahub`). Do not edit these files in this repository:

- `opsmill/infrahub`: `docs/docs/`, `docs/sidebars.ts`, `docs/sidebar-releases.ts`, `docs/plugins/` and `docs/src/components/ReleaseFeed/`
- `opsmill/infrahub-sdk-python`: `docs/docs-python-sdk/`, `docs/sidebars-python-sdk.ts`, `docs/sidebars-infrahubctl.ts` and `docs/sidebar-utils.ts`
- Every other source repository: `docs/docs-<name>/` and `docs/sidebars-<name>.ts`

The sync workflows authenticate with a token secret in the source repository, either `GH_INFRAHUB_BOT_TOKEN` or `PAT_TOKEN` depending on the repository.

### Files Maintained in This Repository

- `docs/docusaurus.config.ts`: plugin definitions, navbar, theme, Algolia search, analytics and redirects
- `docs/redirects-*.ts`: redirect lists passed to `@docusaurus/plugin-client-redirects`
- `docs/docs-integrations/` and `docs/sidebars-integrations.ts`: the Integrations overview section
- `docs/src/pages/`: standalone pages, such as `labs.tsx` (`/labs`), with its data in `docs/src/data/labs.ts`
- `docs/src/components/`: React components, except `ReleaseFeed/`, which is synced from `opsmill/infrahub`
- `docs/src/theme/`: swizzled Docusaurus theme components:
  - `MDXComponents.js`: adds the Iconify `Icon` component to MDX
  - `NavbarItem/ComponentTypes.tsx`: registers the `custom-githubRepoLink` navbar item
  - `NotFound/`, `SearchBar/` and `Tabs/`
- `docs/src/css/custom.css`: site styling, including the navbar GitHub and Discord icons
- `docs/globalVars.js`: variables available in Markdown (`base_url: 'RELATIVE'`)
- `scripts/setup-docs-repo.py` and `scripts/templates/`: setup tooling for a new documentation section

### Git Submodule and Symlinks

`infrahub/` is a git submodule of `opsmill/infrahub` that tracks the `stable` branch. The synced core docs import files from the Infrahub repository by relative path, so the repository root has symlinks into the submodule: `development -> infrahub/development`, `models -> infrahub/models` and `utilities -> infrahub/utilities`. If a core docs page imports from another top-level Infrahub folder, the build fails with `Module not found` until a matching symlink is added here.

CI runs `git submodule update --recursive --remote` before every build, so it builds against the latest `stable`. Run the same command locally before building:

```bash
git submodule update --init --recursive --remote
```

## Development Commands

### Docusaurus

All Docusaurus commands run from the `docs/` directory:

```bash
cd docs
npm install        # Install dependencies (CI uses npm ci)
npm start          # Start the development server with hot reload (http://localhost:3000)
npm run build      # Build the static site into docs/build/
npm run serve      # Serve the built site locally
npm run typecheck  # Run TypeScript type checking
npm run clear      # Clear the Docusaurus build cache
```

### Python Task Runner (Invoke)

From the repository root, after `uv sync`:

```bash
uv run invoke docs        # Build documentation (runs npm run build in docs/)
uv run invoke lint        # Run markdownlint, yamllint, ruff and mypy
uv run invoke format      # Format and fix Python files with ruff
```

### Linting

Run from the repository root:

```bash
markdownlint "**/*.{md,mdx}"     # Markdown, skips paths in .markdownlintignore
uv run yamllint -s .             # YAML
uv run ruff format --check --diff
uv run ruff check .
uv run mypy .
```

Configuration files:

- `.markdownlint.yaml`: all default rules, except that MD013 (line length) and MD060 (table column style) are off, MD024 (duplicate headings) applies to sibling headings only, and MD025 ignores the front matter title
- `.markdownlintignore`: excludes synced content (`docs/docs/`, `docs/docs-*`), the submodule and build output
- `.yamllint.yml`: YAML rules
- `pyproject.toml`: ruff (line length 120) and mypy settings
- `lychee.toml` and `.lycheeignore`: link checker settings

Vale style checks run in the source repositories, not here. This repository has no `.vale.ini`.

## Architecture

### Key Dependencies

- Docusaurus 3.10, React 18.3, TypeScript 5.6 (see `docs/package.json`)
- `@docusaurus/plugin-client-redirects`: redirects for moved pages
- `@docusaurus/theme-mermaid`: Mermaid diagrams
- `@docusaurus/theme-search-algolia`: search across all sections
- `@signalwire/docusaurus-plugin-llms-txt`: generates `llms.txt`

### Navbar

- Sections are grouped into navbar dropdowns: Tools & SDKs, Integrations, Demos and Reference Designs. Each entry is a `docSidebar` item that names a `docsPluginId` and a `sidebarId`.
- The GitHub icon is a custom navbar item (`type: "custom-githubRepoLink"`) defined in `docs/src/components/GitHubRepoNavbarItem.tsx`. It links to the source repository of the section being viewed, looked up by plugin ID in `REPO_BY_PLUGIN_ID`. Pages outside a docs section, and plugin IDs missing from the map, link to `opsmill/infrahub`.

### Environment Variables

- `ANALYTICS`: adds the Plausible analytics script
- `DOCS_IN_APP`: sets `url` to `http://localhost:8000` and `baseUrl` to `/docs/` for docs embedded in the Infrahub app
- `GA_MEASUREMENT_ID`: overrides the Google Analytics tracking ID

### Content Conventions

- Cross-references between sections use absolute paths, for example `/python-sdk/introduction`
- Content is MDX, so pages can use React components

## Working with Documentation

### Adding a New Documentation Section

`scripts/setup-docs-repo.py` automates most of this; `README.md` has the full manual procedure. Every new section needs all of the following.

1. **In the source repository** (for example `opsmill/new-project`):
   - Run `python scripts/setup-docs-repo.py --source-repo /path/to/new-project --display-name "New Project"`. It copies `scripts/templates/` into the source repository: the Docusaurus skeleton under `docs/`, the Vale, markdownlint and yamllint configuration, and `.github/build-docs.sh`, `file-filters.yml`, `labeler.yml`, `labels.yml` and `workflows/sync-docs.yml`.
   - Add a documentation build job to the source repository's `ci.yml`. The script's `CI_WORKFLOW_JOBS` constant has an example.
   - Write the content in `docs/docs/` and the sidebar in `docs/sidebars.ts`.
   - Add the sync token secret (`PAT_TOKEN` in the template) with write access to `opsmill/infrahub-docs`.

2. **In this repository**:
   - Run `python scripts/setup-docs-repo.py --infrahub-docs-repo . --project-name <name> --source-repo-name <github-repo> --display-name "New Project"`. It creates `docs/docs-<name>/readme.mdx` and `docs/sidebars-<name>.ts`, and prints the snippets for the steps below.
   - Add the plugin to the `plugins` array in `docs/docusaurus.config.ts`, with `id: 'docs-<name>'`, `routeBasePath`, `sidebarPath` and `editUrl` pointing at the source repository.
   - Add a navbar entry in the right dropdown in `docs/docusaurus.config.ts`.
   - **Add the plugin ID and the GitHub repository name to `REPO_BY_PLUGIN_ID` in `docs/src/components/GitHubRepoNavbarItem.tsx`.** Without it, the header GitHub icon on the new section links to `opsmill/infrahub`. Check that the repository is public, so readers do not get a 404.
   - Add a row to the section table in this file.

3. **Rollout**:
   - Merge the `infrahub-docs` PR first, then the source repository PR.
   - Check that the sync workflow ran, the section renders, and the GitHub icon on a page in the new section opens the right repository.

### Local Development

- Run `npm start` from `docs/` for a development server with hot reload on `http://localhost:3000`
- Changes to MDX files refresh the browser; changes to `.ts` configuration need a server restart

### Documentation Writing Guidelines

**Applies to:** All MDX files in source repositories (changes should not be made directly in this aggregation repo)

**Framework**: All documentation follows the [Diataxis framework](https://diataxis.fr/):

- **Tutorials**: Learning-oriented, step-by-step guidance for beginners
- **How-to guides**: Task-oriented, practical solutions to specific problems
- **Explanation**: Understanding-oriented, conceptual knowledge and background
- **Reference**: Information-oriented, technical descriptions and specifications

**Writing Style**:

- Professional but approachable: plain language with technical precision
- Concise and direct: short, active sentences without filler
- Informative over promotional: explain how and why, not marketing
- Consistent structure: predictable patterns across documents

**For How-to Guides**:

- Use imperative verbs: "Configure...", "Create...", "Deploy..."
- Focus on the goal and steps to achieve it
- Include Prerequisites, Step-by-Step Instructions, and Validation sections
- Support multiple approaches with Tabs (Web UI, GraphQL, Shell/cURL)

**For Topics/Explanations**:

- Provide context, background, and rationale for design decisions
- Connect concepts to users' existing knowledge
- Include architecture diagrams where helpful
- Answer "why" questions, not just "what" or "how"

**Terminology**:

- Define new terms when first used
- Follow Infrahub's established naming conventions (branches, schemas, commits, etc.)
- Use domain-relevant language from the user's perspective

**Components Available in MDX**:

- `Tabs` and `TabItem`: Multiple implementation methods
- `CodeBlock`: Syntax-highlighted code examples
- `VideoPlayer`: Embedded video tutorials
- Callouts (notes, tips, warnings)
- Mermaid diagrams for visualizations

**Reference Files**:

- Documentation best practices: `docs/docs/development/docs.mdx` (in source repos)
- Vale style guide: `.vale/styles/` (in source repos)
- Markdown config: `.markdownlint.yaml` (repository root)

### Document Structure Patterns

**How-to Guides** (task-oriented):

1. Title and metadata (YAML frontmatter, "How to..." format)
2. Introduction (problem statement, what user will achieve)
3. Prerequisites (environment, prior knowledge)
4. Step-by-step instructions (with code snippets, screenshots, Tabs for alternatives)
5. Validation (how to verify success, troubleshooting)
6. Optional: Advanced usage and variations
7. Related resources

**Topics/Explanations** (understanding-oriented):

1. Title and metadata (consider "About..." or "Understanding..." format)
2. Introduction (overview, why it matters, questions to answer)
3. Main content:
   - Concepts and definitions
   - Background and context
   - Architecture and design (with diagrams)
   - Mental models and analogies
   - Connections to other concepts
   - Alternative approaches
4. Further reading

**Reference Documentation**:

- Structured, information-dense format
- Complete API/CLI documentation
- Technical specifications
- Code examples

See `docs/docs/development/docs.mdx` in source repositories for complete guidelines.

## CI/CD and Deployment

### GitHub Actions

`.github/workflows/ci.yml` runs on every pull request and on pushes to `main`:

1. Detects changed files with `opsmill/paths-filter` and `.github/file-filters.yml`
2. Runs ruff and mypy, yamllint and markdownlint, each only when matching files changed
3. Builds the documentation (Node.js 20, `npm ci`, then `uv run invoke docs`) after `git submodule update --recursive --remote`, with a 15-minute timeout
4. Serves the build and checks every sitemap URL with Lychee. `https://docs.infrahub.app` URLs are remapped to the local server.

`.github/workflows/notify-ci-failure.yml` sends a Slack notification when the CI workflow fails.

### Deployment

- Hosted on Cloudflare Pages at `https://docs.infrahub.app`
- Pushes to `main` trigger a deployment
- Build command: `uv run invoke docs`; output directory: `docs/build/`

## Troubleshooting

**Build fails with `Module not found` for a path outside `docs/`**:

- A synced core docs page imports a file from the Infrahub repository. Update the submodule with `git submodule update --init --recursive --remote`, and add a root-level symlink into `infrahub/` if the folder has none (see "Git Submodule and Symlinks").

**Other build failures**:

- Clear the cache: `cd docs && npm run clear`
- Reinstall dependencies: `cd docs && rm -rf node_modules && npm ci`

**Broken links**:

- Use absolute paths for cross-section references (for example `/python-sdk/introduction`)
- Add a redirect in the relevant `docs/redirects-*.ts` file when a page moves

**Markdown linting errors**:

- Check `.markdownlint.yaml` for the rule settings. Synced content is excluded by `.markdownlintignore`.

**TypeScript errors**:

- Run `npm run typecheck` in `docs/`
- Check the sidebar configuration in the `sidebars-*.ts` files
