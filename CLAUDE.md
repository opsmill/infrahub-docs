# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a **documentation aggregation repository** that combines documentation from multiple Infrahub-related projects into a single documentation website using Docusaurus. The content here is mostly read-only and automatically synced from source repositories.

**Important**: Most documentation changes should be made in the source repositories, not here:

- Core Infrahub docs: `opsmill/infrahub`
- Python SDK docs: `opsmill/infrahub-sdk-python`
- Ansible collection docs: `opsmill/infrahub-ansible`
- Service catalog docs: `opsmill/infrahub-demo-service-catalog`
- Nornir integration docs: `opsmill/nornir-infrahub`
- Schema library docs: `opsmill/schema-library`
- Infrahub Sync docs: `opsmill/infrahub-sync`
- Emma docs: `opsmill/emma`

## Development Commands

Run all commands from the `docs/` directory:

```bash
cd docs
```

### Setup

```bash
npm install
```

### Development

```bash
npm start          # Start local development server with hot reload
npm run build      # Build static site for production
npm run serve      # Serve built site locally
npm run typecheck  # Run TypeScript type checking
```

### Docusaurus Commands

```bash
npm run docusaurus -- <command>  # Run any Docusaurus command
npm run clear                     # Clear build cache
```

### Linting and Quality Checks

Run these commands from the repository root:

```bash
# Markdown linting (using repository config)
markdownlint --config .markdownlint.yaml docs/**/*.mdx docs/**/*.md

# Documentation style validation (requires Vale installation)
vale --glob='!{docs/docs-schema-library/reference/*}' $(find ./docs -type f \( -name "*.mdx" -o -name "*.md" \) )

# Python linting (if applicable)
ruff check .
ruff format --check --diff

# YAML linting (if applicable) 
yamllint -s .
```

**Linting Configuration Files:**
- `.markdownlint.yaml`: Markdown linting rules (disables line length, allows HTML, etc.)
- `.vale.ini`: Documentation style rules and vocabulary
- `.yamllint.yml`: YAML formatting and style rules

## Architecture

### Multi-Plugin Documentation Structure

This site uses multiple Docusaurus plugin instances to combine documentation from different sources:

- **Main docs** (`docs/`): Core Infrahub documentation at root path `/`
- **Python SDK** (`docs-python-sdk/python-sdk/`): Python SDK docs at `/python-sdk`
- **Infrahubctl** (`docs-python-sdk/infrahubctl/`): CLI tool docs at `/infrahubctl`
- **Integrations**: Ansible (`/ansible`), Sync (`/sync`), Nornir (`/nornir`)
- **Demos**: DC Fabric (`/demo`), Service Catalog (`/demo-service-catalog`)
- **Schema Library** (`/schema-library`): Reusable schema documentation
- **Emma** (`/emma`): AI Assistant documentation

### Configuration Files

- `docusaurus.config.ts`: Main Docusaurus configuration with all plugin definitions
- `sidebars-*.ts`: Individual sidebar configurations for each documentation section
- `globalVars.js`: Global variables used across documentation
- `package.json`: Dependencies and npm scripts

### Content Organization

- Each documentation section has its own `docs-<name>/` directory
- Sidebar configuration is managed separately for each section
- Cross-references between sections use absolute paths
- Media files are stored in section-specific directories

### Key Features

- **Multi-section navigation**: Dropdown menus organize different documentation types
- **Search integration**: Local search across all documentation sections
- **Redirects**: Handles URL changes from previous documentation structure
- **Variable substitution**: Global variables can be used in Markdown content
- **Analytics**: Plausible analytics integration when `ANALYTICS` env var is set

## Working with Documentation

### Adding New Documentation Sections

1. Create new `docs-<name>/` directory
2. Add plugin configuration to `docusaurus.config.ts`
3. Create corresponding `sidebars-<name>.ts` file
4. Add navigation entry to navbar configuration

### Local Development

- Use `npm start` for live development with hot reload
- The site runs on `http://localhost:3000` by default
- Changes to most files trigger automatic browser refresh
- Configuration changes require server restart

### Content Synchronization

Documentation content is automatically synced from source repositories. Manual changes to synced content will be overwritten during the next sync cycle.

### Documentation Writing Guidelines

**Applies to:** All MDX files (`**/*.mdx`)

**Role:** Expert Technical Writer and MDX Generator with:

- Deep understanding of Infrahub and its capabilities
- Expertise in network automation and infrastructure management
- Proficiency in writing structured MDX documents
- Awareness of developer ergonomics

**Documentation Purpose:**

- Guide users through installing, configuring, and using Infrahub in real-world workflows
- Explain concepts and system architecture clearly, including new paradigms introduced by Infrahub
- Support troubleshooting and advanced use cases with actionable, well-organized content
- Enable adoption by offering approachable examples and hands-on guides that lower the learning curve

**Structure:** Follows [Diataxis framework](https://diataxis.fr/)

- **Tutorials** (learning-oriented)
- **How-to guides** (task-oriented)
- **Explanation** (understanding-oriented)
- **Reference** (information-oriented)

**Tone and Style:**

- Professional but approachable: Avoid jargon unless well defined. Use plain language with technical precision
- Concise and direct: Prefer short, active sentences. Reduce fluff
- Informative over promotional: Focus on explaining how and why, not on marketing
- Consistent and structured: Follow a predictable pattern across sections and documents

**For Guides:**

- Use conditional imperatives: "If you want X, do Y. To achieve W, do Z."
- Focus on practical tasks and problems, not the tools themselves
- Address the user directly using imperative verbs: "Configure...", "Create...", "Deploy..."
- Maintain focus on the specific goal without digressing into explanations
- Use clear titles that state exactly what the guide shows how to accomplish

**For Topics:**

- Use a more discursive, reflective tone that invites understanding
- Include context, background, and rationale behind design decisions
- Make connections between concepts and to users' existing knowledge
- Present alternative perspectives and approaches where appropriate
- Use illustrative analogies and examples to deepen understanding

**Terminology and Naming:**

- Always define new terms when first used. Use callouts or glossary links if possible
- Prefer domain-relevant language that reflects the user's perspective (e.g., playbooks, branches, schemas, commits)
- Be consistent: follow naming conventions established by Infrahub's data model and UI

**Reference Files:**

- Documentation guidelines: `docs/docs/development/docs.mdx`
- Vale styles: `.vale/styles/`
- Markdown linting: `.markdownlint.yaml`

### Document Structure Patterns (Following Diataxis)

**How-to Guides Structure (Task-oriented, practical steps):**

```markdown
- Title and Metadata
    - Title should clearly state what problem is being solved (YAML frontmatter)
    - Begin with "How to..." to signal the guide's purpose
    - Optional: Imports for components (e.g., Tabs, TabItem, CodeBlock, VideoPlayer)
- Introduction
    - Brief statement of the specific problem or goal this guide addresses
    - Context or real-world use case that frames the guide
    - Clearly indicate what the user will achieve by following this guide
    - Optional: Links to related topics or more detailed documentation
- Prerequisites / Assumptions
    - What the user should have or know before starting
    - Environment setup or requirements
    - What prior knowledge is assumed
- Step-by-Step Instructions
    - Step 1: [Action/Goal]
        - Clear, actionable instructions focused on the task
        - Code snippets (YAML, GraphQL, shell commands, etc.)
        - Screenshots or images for visual guidance
        - Tabs for alternative methods (e.g., Web UI, GraphQL, Shell/cURL)
        - Notes, tips, or warnings as callouts
    - Step 2: [Action/Goal]
        - Repeat structure as above for each step
    - Step N: [Action/Goal]
        - Continue as needed
- Validation / Verification
    - How to check that the solution worked as expected
    - Example outputs or screenshots
    - Potential failure points and how to address them
- Advanced Usage / Variations
    - Optional: Alternative approaches for different circumstances
    - Optional: How to adapt the solution for related problems
    - Optional: Ways to extend or optimize the solution
- Related Resources
    - Links to related guides, reference materials, or explanation topics
    - Optional: Embedded videos or labs for further learning
```

**Topics Structure (Understanding-oriented, theoretical knowledge):**

```markdown
- Title and Metadata
    - Title should clearly indicate the topic being explained (YAML frontmatter)
    - Consider using "About..." or "Understanding..." in the title
    - Optional: Imports for components (e.g., Tabs, TabItem, CodeBlock, VideoPlayer)
- Introduction
    - Brief overview of what this explanation covers
    - Why this topic matters in the context of Infrahub
    - Questions this explanation will answer
- Main Content Sections
    - Concepts & Definitions
        - Clear explanations of key terms and concepts
        - How these concepts fit into the broader system
    - Background & Context
        - Historical context or evolution of the concept/feature
        - Design decisions and rationale behind implementations
        - Technical constraints or considerations
    - Architecture & Design (if applicable)
        - Diagrams, images, or explanations of structure
        - How components interact or relate to each other
    - Mental Models
        - Analogies and comparisons to help understanding
        - Different ways to think about the topic
    - Connection to Other Concepts
        - How this topic relates to other parts of Infrahub
        - Integration points and relationships
    - Alternative Approaches
        - Different perspectives or methodologies
        - Pros and cons of different approaches
- Further Reading
    - Links to related topics, guides, or reference materials
    - External resources for deeper understanding
```

### Quality and Clarity Checklist

**General Documentation:**

- Content is accurate and reflects the latest version of Infrahub
- Instructions are clear, with step-by-step guidance where needed
- Markdown formatting is correct and compliant with Infrahub's style
- Spelling and grammar are checked

**For Guides:**

- The guide addresses a specific, practical problem or task
- The title clearly indicates what will be accomplished
- Steps follow a logical sequence that maintains flow
- Each step focuses on actions, not explanations
- The guide omits unnecessary details that don't serve the goal
- Validation steps help users confirm their success
- The guide addresses real-world complexity rather than oversimplified scenarios

**For Topics:**

- The explanation is bounded to a specific topic area
- Content provides genuine understanding, not just facts
- Background and context are included to deepen understanding
- Connections are made to related concepts and the bigger picture
- Different perspectives or approaches are acknowledged where relevant
- The content remains focused on explanation without drifting into tutorial or reference material
- The explanation answers "why" questions, not just "what" or "how"
