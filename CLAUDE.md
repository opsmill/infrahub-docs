# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a **documentation aggregation repository** that combines documentation from multiple Infrahub-related projects into a single documentation website using Docusaurus. The content here is mostly read-only and automatically synced from source repositories via git submodules and GitHub Actions workflows.

**Important**: Most documentation changes should be made in the source repositories, not here. Direct edits to synced content in this repository will be overwritten during the next sync cycle.

### Source Repositories

Documentation is synced from these upstream repositories:

- Core Infrahub docs: `opsmill/infrahub`
- Python SDK docs: `opsmill/infrahub-sdk-python`
- Ansible collection docs: `opsmill/infrahub-ansible`
- Service catalog docs: `opsmill/infrahub-demo-service-catalog`
- Nornir integration docs: `opsmill/nornir-infrahub`
- Schema library docs: `opsmill/schema-library`
- Infrahub Sync docs: `opsmill/infrahub-sync`
- Emma docs: `opsmill/emma`

### Git Submodules

The repository uses a git submodule at `infrahub/` that tracks the `stable` branch from `opsmill/infrahub`. Update submodules with:

```bash
git submodule update --recursive --remote
```

## Development Commands

### Quick Start

All Docusaurus commands run from the `docs/` directory:

```bash
cd docs
npm install        # Install dependencies (first time or after package.json changes)
npm start          # Start local development server with hot reload (http://localhost:3000)
npm run build      # Build static site for production
npm run serve      # Serve built site locally
npm run typecheck  # Run TypeScript type checking
npm run clear      # Clear Docusaurus build cache
```

### Python Task Runner (Invoke)

From the repository root, use Python invoke tasks:

```bash
invoke docs        # Build documentation (runs npm run build in docs/)
invoke lint        # Run all linters (ruff + yamllint)
invoke format      # Format Python files with ruff
invoke lint-yaml   # Check YAML files
invoke lint-ruff   # Check Python files with ruff
```

**Note**: Requires Poetry installation. Run `poetry install` to set up Python dependencies.

### Linting and Quality Checks

Run from the repository root:

```bash
# Markdown linting
markdownlint --config .markdownlint.yaml docs/**/*.mdx docs/**/*.md

# Documentation style validation (requires Vale installation)
vale --glob='!{docs/docs-schema-library/reference/*}' $(find ./docs -type f \( -name "*.mdx" -o -name "*.md" \) )

# Python linting and formatting
ruff check .
ruff format .                    # Auto-format Python files
ruff format --check --diff       # Check formatting without changes

# YAML linting
yamllint -s .
```

### Linting Configuration Files

- `.markdownlint.yaml`: Markdown linting rules (repository root)
  - Disables line length limits (MD013)
  - Allows inline HTML (MD033)
  - Permits duplicate headings for tabs (MD024)
- `.vale.ini`: Documentation style rules and vocabulary (in submodules)
- `.yamllint.yml`: YAML formatting and style rules
- `pyproject.toml`: Ruff configuration (line-length: 120)

## Architecture

### Multi-Plugin Documentation Structure

This site uses multiple Docusaurus plugin instances to combine documentation from different sources. Each plugin creates an independent documentation section with its own URL path and sidebar.

**Plugin Architecture**:

- Each documentation section is defined as a plugin in `docs/docusaurus.config.ts`
- Each plugin has its own `docs-<name>/` directory and `sidebars-<name>.ts` file
- Plugins are configured with unique IDs, route paths, and edit URLs pointing to source repositories

**Documentation Sections**:

| Section | Directory | Route | Source Repo |
|---------|-----------|-------|-------------|
| Core Infrahub | `docs/docs/` | `/` | `opsmill/infrahub` |
| Python SDK | `docs/docs-python-sdk/python-sdk/` | `/python-sdk` | `opsmill/infrahub-sdk-python` |
| Infrahubctl | `docs/docs-python-sdk/infrahubctl/` | `/infrahubctl` | `opsmill/infrahub-sdk-python` |
| Ansible | `docs/docs-ansible/` | `/ansible` | `opsmill/infrahub-ansible` |
| Infrahub Sync | `docs/docs-sync/` | `/sync` | `opsmill/infrahub-sync` |
| Nornir | `docs/docs-nornir/` | `/nornir` | `opsmill/nornir-infrahub` |
| DC Fabric Demo | `docs/docs-demo/` | `/demo` | Demo content |
| Service Catalog | `docs/docs-service-catalog/` | `/demo-service-catalog` | `opsmill/infrahub-demo-service-catalog` |
| Schema Library | `docs/docs-schema-library/` | `/schema-library` | `opsmill/schema-library` |
| Emma | `docs/docs-emma/` | `/emma` | `opsmill/emma` |
| VS Code Extension | `docs/docs-vscode/` | `/vscode` | VS Code extension docs |
| MCP Server | `docs/docs-mcp/` | `/mcp` | MCP integration docs |
| Integrations | `docs/docs-integrations/` | `/integrations` | Integration guides |
| Exporter | `docs/docs-exporter/` | `/exporter` | Exporter documentation |

### Key Configuration Files

- `docs/docusaurus.config.ts`: Main configuration with all plugin definitions, navbar, theme, redirects, and analytics
- `docs/sidebars-*.ts`: Individual sidebar configurations for each documentation section (auto-generated or manually defined)
- `docs/globalVars.js`: Global variables used across documentation (`base_url: 'RELATIVE'`)
- `docs/package.json`: Node.js dependencies (Docusaurus 3.9.2, React 18, theme packages)
- `docs/src/css/custom.css`: Custom theme styling

### Content Organization

- Each documentation section has its own `docs-<name>/` directory within `docs/`
- Sidebar configuration is managed separately for each section in `sidebars-<name>.ts`
- Cross-references between sections use absolute paths (e.g., `/python-sdk/introduction`)
- Media files are stored in section-specific directories
- MDX format is used for documentation files (supports React components)

### Key Features

- **Multi-section navigation**: Dropdown menus in navbar organize different documentation types
- **Search integration**: Algolia search across all documentation sections (configured with site verification)
- **Redirects**: Plugin handles URL changes from previous documentation structure (see `@docusaurus/plugin-client-redirects`)
- **Variable substitution**: Global variables from `globalVars.js` can be used in Markdown
- **Analytics**: Plausible analytics integration when `ANALYTICS` env var is set
- **Mermaid diagrams**: Theme support for Mermaid diagrams via `@docusaurus/theme-mermaid`
- **LLMs.txt**: Plugin for LLM-friendly documentation format via `@signalwire/docusaurus-plugin-llms-txt`

## Working with Documentation

### Adding New Documentation Sections

When adding a new documentation section to this aggregation site:

1. **In the source repository** (e.g., `opsmill/new-project`):
   - Copy these files/directories from an existing repo (like `emma`):
     - `docs/` directory structure
     - `.vale/`, `.vale.ini`, `.markdownlint.yml`, `.yamllint.yml`
     - `tasks.py`
     - `.github/build-docs.sh` (make executable: `chmod 755`)
     - `.github/workflows/sync-docs.yml` (update paths)
     - `.github/workflows/ci.yml` (add docs build section)
     - `.github/file-filters.yml`, `labeler.yml`, `labels.yml`
   - Modify `docs/docusaurus.config.ts` and `docs/sidebars.ts` in source repo
   - Place documentation content in `docs/docs/`

2. **In this repository** (`infrahub-docs`):
   - Create placeholder: `touch docs/docs-<projectname>/readme.mdx`
   - Create sidebar: `touch docs/sidebars-<projectname>.ts`
   - Edit `docs/docusaurus.config.ts`:
     - Add new plugin configuration
     - Add navbar entry
   - Optionally add as git submodule or configure sync workflow

3. **Infrastructure setup**:
   - Configure Cloudflare Pages integration
   - Create PRs and test sync workflow

### Local Development

- Use `npm start` (from `docs/` directory) for live development with hot reload
- The site runs on `http://localhost:3000` by default
- Changes to MDX files trigger automatic browser refresh
- Configuration changes (`.ts` files) require server restart
- Environment variables:
  - `ANALYTICS`: Enable Plausible analytics
  - `DOCS_IN_APP`: Adjust base URL for embedded docs

### Content Synchronization

Documentation content is automatically synced from source repositories via:

- **Git submodules**: Main `infrahub` repository is tracked as submodule
- **GitHub Actions**: CI workflows sync documentation on push to source repos
- **Update submodules**: Run `git submodule update --recursive --remote` to pull latest

**Warning**: Manual changes to synced content in `docs/docs-*/` directories will be overwritten during the next sync cycle. Always edit in the source repository.

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

### GitHub Actions Workflows

The repository uses GitHub Actions for CI/CD:

- **`.github/workflows/ci.yml`**: Main CI pipeline
  - Detects file changes (documentation, Python, YAML)
  - Runs appropriate linters (ruff, yamllint, markdownlint)
  - Builds documentation with Node.js 20
  - Updates submodules before build
  - Link checking (currently disabled)

**Key CI Steps**:

1. File change detection via `opsmill/paths-filter`
2. Parallel linting jobs for Python and YAML (if files changed)
3. Documentation build job (depends on lint jobs passing)
4. Link checking with Lychee (disabled, can be re-enabled)

### Deployment

- Hosted on Cloudflare Pages
- Production URL: `https://docs.infrahub.app`
- Deployment triggered by pushes to `main` branch
- Build command: `invoke docs` (runs `npm run build` in `docs/`)
- Build output directory: `docs/build/`

## Troubleshooting

### Common Issues

**Build failures**:

- Clear cache: `cd docs && npm run clear`
- Reinstall dependencies: `rm -rf node_modules package-lock.json && npm install`
- Update submodules: `git submodule update --recursive --remote`

**Broken links**:

- Use absolute paths for cross-section references (e.g., `/python-sdk/introduction`)
- Check redirect configuration in `docusaurus.config.ts`

**Markdown linting errors**:

- Review `.markdownlint.yaml` for disabled rules
- Line length (MD013) is disabled
- Inline HTML (MD033) is allowed for MDX components

**TypeScript errors**:

- Run `npm run typecheck` in `docs/` directory
- Check sidebar configuration in `sidebars-*.ts` files
