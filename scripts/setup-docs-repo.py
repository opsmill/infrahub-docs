#!/usr/bin/env python3
"""Setup documentation syncing for a new OpsMill repository.

This script automates the setup of documentation infrastructure for a new
repository that will sync its docs to the infrahub-docs aggregation site.

It can:
1. Set up the source repository with all required files for documentation
2. Set up the infrahub-docs repository with the plugin configuration
3. Do both at once

Usage:
    # Setup source repo only
    python setup-docs-repo.py --source-repo /path/to/my-new-project

    # Setup infrahub-docs only
    python setup-docs-repo.py --infrahub-docs-repo /path/to/infrahub-docs --project-name my-project

    # Setup both
    python setup-docs-repo.py --source-repo /path/to/my-new-project --infrahub-docs-repo /path/to/infrahub-docs

    # With display name
    python setup-docs-repo.py --source-repo /path/to/my-new-project --display-name "My Project"
"""

import argparse
import re
import shutil
import stat
import sys
from pathlib import Path

# Get the templates directory (relative to this script)
SCRIPT_DIR = Path(__file__).resolve().parent
TEMPLATES_DIR = SCRIPT_DIR / "templates"

# Files to copy from templates (relative paths)
# Files with {{PLACEHOLDER}} patterns will have substitutions applied
TEMPLATE_FILES = [
    # Documentation framework
    "docs/.gitignore",
    "docs/babel.config.js",
    "docs/docusaurus.config.ts",
    "docs/package.json",
    "docs/sidebars.ts",
    "docs/tsconfig.json",
    "docs/src/css/custom.css",
    "docs/static/img/favicon.ico",
    "docs/static/img/infrahub-hori.svg",
    "docs/static/img/infrahub-hori-dark.svg",
    "docs/docs/readme.mdx",
    # Linting configuration
    ".vale/",
    ".vale.ini",
    ".markdownlint.yaml",
    ".yamllint.yml",
    # GitHub Actions
    ".github/build-docs.sh",
    ".github/file-filters.yml",
    ".github/labeler.yml",
    ".github/labels.yml",
    ".github/workflows/sync-docs.yml",
]

# CI workflow jobs that can be added to an existing ci.yml
CI_WORKFLOW_JOBS = """
  documentation:
    defaults:
      run:
        working-directory: ./docs
    if: |
      always() && !cancelled() &&
      !contains(needs.*.result, 'failure') &&
      !contains(needs.*.result, 'cancelled') &&
      needs.files-changed.outputs.documentation == 'true'
    needs: ["files-changed", "yaml-lint", "python-lint", "markdown-lint"]
    runs-on: "ubuntu-22.04"
    timeout-minutes: 5
    steps:
      - uses: actions/checkout@v5
        with:
          submodules: true
      - uses: actions/setup-node@v6
        with:
          node-version: 20
          cache: 'npm'
          cache-dependency-path: docs/package-lock.json
      - name: "Install dependencies"
        working-directory: docs
        run: npm install
      - name: "Build docs website"
        run: npm run build

  validate-documentation-style:
    if: |
      always() && !cancelled() &&
      !contains(needs.*.result, 'failure') &&
      !contains(needs.*.result, 'cancelled')
    needs: ["files-changed", "yaml-lint", "python-lint", "markdown-lint"]
    runs-on: "ubuntu-22.04"
    timeout-minutes: 5
    env:
      VALE_VERSION: "3.13.0"
    steps:
      - uses: "actions/checkout@v5"
        with:
          submodules: true
      - name: Download Vale
        run: |
          curl -sL "https://github.com/errata-ai/vale/releases/download/v${VALE_VERSION}/vale_${VALE_VERSION}_Linux_64-bit.tar.gz" -o vale.tar.gz
          tar -xzf vale.tar.gz
      - name: "Validate documentation style"
        run: ./vale $(find ./docs/docs -type f \\( -name "*.mdx" -o -name "*.md" \\) )
"""


def get_project_name(repo_path: Path) -> str:
    """Extract project name from repository path."""
    return repo_path.name


def get_project_name_pascal(name: str) -> str:
    """Convert project name to PascalCase for sidebar names.

    Args:
        name: Project name (e.g., 'my-new-project').

    Returns:
        PascalCase version (e.g., 'MyNewProject').
    """
    return "".join(word.capitalize() for word in re.split(r"[-_]", name))


def copy_and_substitute(
    src: Path,
    dst: Path,
    substitutions: dict[str, str],
) -> None:
    """Copy a file or directory, applying substitutions to text files.

    Args:
        src: Source path.
        dst: Destination path.
        substitutions: Dictionary of placeholder -> replacement pairs.
    """
    dst.parent.mkdir(parents=True, exist_ok=True)

    if src.is_dir():
        if dst.exists():
            shutil.rmtree(dst)
        shutil.copytree(src, dst)
        # Apply substitutions to all text files in the directory
        for file_path in dst.rglob("*"):
            if file_path.is_file():
                apply_substitutions_to_file(file_path, substitutions)
    else:
        shutil.copy2(src, dst)
        apply_substitutions_to_file(dst, substitutions)


def apply_substitutions_to_file(file_path: Path, substitutions: dict[str, str]) -> None:
    """Apply placeholder substitutions to a file if it's a text file.

    Args:
        file_path: Path to the file.
        substitutions: Dictionary of placeholder -> replacement pairs.
    """
    # Skip binary files
    binary_extensions = {".ico", ".png", ".jpg", ".jpeg", ".gif", ".svg", ".woff", ".woff2"}
    if file_path.suffix.lower() in binary_extensions:
        return

    try:
        content = file_path.read_text()
        original_content = content

        for placeholder, replacement in substitutions.items():
            content = content.replace(placeholder, replacement)

        # Only write if content changed
        if content != original_content:
            file_path.write_text(content)
    except UnicodeDecodeError:
        # Skip binary files that weren't caught by extension check
        pass


def setup_source_repo(
    source_repo: Path,
    project_name: str,
    display_name: str,
) -> None:
    """Set up documentation infrastructure in the source repository.

    Args:
        source_repo: Path to the source repository to set up.
        project_name: Name of the project (used for paths and URLs).
        display_name: Human-readable display name for the project.
    """
    print(f"\n{'=' * 60}")
    print(f"Setting up source repository: {source_repo}")
    print(f"Project name: {project_name}")
    print(f"Display name: {display_name}")
    print("=" * 60)

    if not TEMPLATES_DIR.exists():
        print(f"ERROR: Templates directory not found: {TEMPLATES_DIR}")
        sys.exit(1)

    project_pascal = get_project_name_pascal(project_name)

    # Define substitutions
    substitutions = {
        "{{PROJECT_NAME}}": project_name,
        "{{PROJECT_PASCAL}}": project_pascal,
        "{{PROJECT_DISPLAY_NAME}}": display_name,
    }

    # Copy template files
    print("\nCopying template files...")
    for rel_path in TEMPLATE_FILES:
        src = TEMPLATES_DIR / rel_path
        dst = source_repo / rel_path

        if not src.exists():
            print(f"  WARNING: Template file not found: {rel_path}")
            continue

        print(f"  {rel_path}")
        copy_and_substitute(src, dst, substitutions)

    # Make build script executable
    build_script = source_repo / ".github" / "build-docs.sh"
    if build_script.exists():
        build_script.chmod(build_script.stat().st_mode | stat.S_IXUSR | stat.S_IXGRP | stat.S_IXOTH)
        print("  Made .github/build-docs.sh executable")

    print("\n" + "=" * 60)
    print("Source repository setup complete!")
    print("=" * 60)
    print("\nNext steps for source repository:")
    print("1. Review and customize docs/docusaurus.config.ts")
    print("2. Update docs/sidebars.ts with your documentation structure")
    print("3. Add your documentation content to docs/docs/")
    print("4. Add PAT_TOKEN secret to GitHub repository settings")
    print("5. Test locally: cd docs && npm install && npm start")
    print("\nOptional: Add CI workflow jobs for documentation building")
    print("See the CI_WORKFLOW_JOBS constant in this script for examples")


def setup_infrahub_docs(
    infrahub_docs_repo: Path,
    project_name: str,
    source_repo_name: str | None = None,
    display_name: str | None = None,
    navbar_dropdown: str | None = None,
) -> None:
    """Set up the infrahub-docs repository for a new documentation section.

    Args:
        infrahub_docs_repo: Path to the infrahub-docs repository.
        project_name: Name used for paths (e.g., 'my-project' -> docs-my-project).
        source_repo_name: GitHub repo name if different from project_name.
        display_name: Display name for navbar (defaults to project_name).
        navbar_dropdown: Which dropdown to add to ('tools', 'integrations', 'demos').
    """
    print(f"\n{'=' * 60}")
    print(f"Setting up infrahub-docs repository: {infrahub_docs_repo}")
    print(f"Project name: {project_name}")
    print("=" * 60)

    if not infrahub_docs_repo.exists():
        print(f"ERROR: infrahub-docs repository not found: {infrahub_docs_repo}")
        sys.exit(1)

    docs_dir = infrahub_docs_repo / "docs"
    if not docs_dir.exists():
        print(f"ERROR: docs directory not found in infrahub-docs: {docs_dir}")
        sys.exit(1)

    project_pascal = get_project_name_pascal(project_name)
    source_repo = source_repo_name or project_name
    display = display_name or project_name

    # Create placeholder directory and files
    print("\nCreating placeholder files...")
    docs_project_dir = docs_dir / f"docs-{project_name}"
    docs_project_dir.mkdir(parents=True, exist_ok=True)

    placeholder = docs_project_dir / "readme.mdx"
    if not placeholder.exists():
        placeholder.write_text(f"""---
title: {display}
---

# {display}

This documentation will be synced from the source repository.
""")
        print(f"  Created docs/docs-{project_name}/readme.mdx")

    # Create sidebar file
    sidebar_file = docs_dir / f"sidebars-{project_name}.ts"
    if not sidebar_file.exists():
        sidebar_file.write_text(f"""import type {{SidebarsConfig}} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {{
  {project_pascal}Sidebar: [
    {{
      type: 'autogenerated',
      dirName: '.',
    }},
  ]
}};

export default sidebars;
""")
        print(f"  Created docs/sidebars-{project_name}.ts")

    # Generate the plugin configuration snippet
    plugin_config = f"""    [
      '@docusaurus/plugin-content-docs',
      {{
        id: 'docs-{project_name}',
        path: 'docs-{project_name}',
        routeBasePath: '{project_name}',
        sidebarCollapsed: false,
        sidebarPath: './sidebars-{project_name}.ts',
        editUrl: 'https://github.com/opsmill/{source_repo}/tree/main/docs',
      }},
    ],"""

    # Generate navbar entry
    navbar_entry = f"""            {{
              type: "docSidebar",
              sidebarId: "{project_pascal}Sidebar",
              label: "{display}",
              docsPluginId: "docs-{project_name}",
            }},"""

    print("\n" + "=" * 60)
    print("Placeholder files created!")
    print("=" * 60)
    print("\nYou need to manually add the following to docs/docusaurus.config.ts:")
    print("\n1. Add this plugin configuration in the 'plugins' array:")
    print("-" * 40)
    print(plugin_config)
    print("-" * 40)
    print("\n2. Add this navbar entry (in appropriate dropdown or top-level):")
    print("-" * 40)
    print(navbar_entry)
    print("-" * 40)

    # Optionally try to auto-insert (with user confirmation)
    config_file = docs_dir / "docusaurus.config.ts"
    if config_file.exists():
        print("\nWould you like to attempt automatic insertion? (y/n): ", end="")
        try:
            response = input().strip().lower()
            if response == "y":
                insert_plugin_config(config_file, plugin_config, navbar_entry, navbar_dropdown)
        except EOFError:
            print("\nSkipping automatic insertion (non-interactive mode)")


def insert_plugin_config(
    config_file: Path,
    plugin_config: str,
    navbar_entry: str,
    navbar_dropdown: str | None,
) -> None:
    """Attempt to automatically insert plugin configuration.

    Args:
        config_file: Path to docusaurus.config.ts.
        plugin_config: Plugin configuration snippet to insert.
        navbar_entry: Navbar entry snippet to insert.
        navbar_dropdown: Which dropdown to add to, or None for manual.
    """
    content = config_file.read_text()

    # Find a good insertion point for the plugin (before google-tag-manager plugin)
    plugin_marker = "@docusaurus/plugin-google-tag-manager"
    if plugin_marker in content:
        # Find the line with the marker and insert before it
        lines = content.split("\n")
        new_lines = []
        inserted = False
        for line in lines:
            if plugin_marker in line and not inserted:
                # Insert our plugin before this one
                new_lines.append(plugin_config)
                inserted = True
            new_lines.append(line)

        if inserted:
            content = "\n".join(new_lines)
            config_file.write_text(content)
            print("  Inserted plugin configuration")
        else:
            print("  WARNING: Could not find insertion point for plugin")
    else:
        print("  WARNING: Could not find plugin insertion marker")

    print("\n  NOTE: Navbar entry must be added manually to the appropriate location")
    print(f"  Suggested dropdown: {navbar_dropdown or 'top-level or new dropdown'}")


def main() -> None:
    """Main entry point for the script."""
    parser = argparse.ArgumentParser(
        description="Setup documentation syncing for a new OpsMill repository",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )

    parser.add_argument(
        "--source-repo",
        type=Path,
        help="Path to the source repository to set up with documentation infrastructure",
    )
    parser.add_argument(
        "--infrahub-docs-repo",
        type=Path,
        help="Path to the infrahub-docs repository",
    )
    parser.add_argument(
        "--project-name",
        type=str,
        help="Project name (default: derived from source repo directory name)",
    )
    parser.add_argument(
        "--display-name",
        type=str,
        help="Display name for navbar (default: project name)",
    )
    parser.add_argument(
        "--source-repo-name",
        type=str,
        help="GitHub repository name if different from project name",
    )
    parser.add_argument(
        "--navbar-dropdown",
        type=str,
        choices=["tools", "integrations", "demos"],
        help="Which navbar dropdown to add the entry to",
    )

    args = parser.parse_args()

    if not args.source_repo and not args.infrahub_docs_repo:
        parser.print_help()
        print("\nERROR: Must specify at least one of --source-repo or --infrahub-docs-repo")
        sys.exit(1)

    # Determine project name
    if args.project_name:
        project_name = args.project_name
    elif args.source_repo:
        project_name = get_project_name(args.source_repo.resolve())
    else:
        print("ERROR: --project-name is required when only setting up infrahub-docs")
        sys.exit(1)

    # Determine display name
    display_name = args.display_name or project_name

    # Setup source repo if requested
    if args.source_repo:
        setup_source_repo(
            args.source_repo.resolve(),
            project_name,
            display_name,
        )

    # Setup infrahub-docs if requested
    if args.infrahub_docs_repo:
        setup_infrahub_docs(
            args.infrahub_docs_repo.resolve(),
            project_name,
            source_repo_name=args.source_repo_name,
            display_name=display_name,
            navbar_dropdown=args.navbar_dropdown,
        )

    print("\n" + "=" * 60)
    print("Setup complete!")
    print("=" * 60)
    print("\nRemember to:")
    print("1. Review all generated/modified files")
    print("2. Add PAT_TOKEN secret to the source repository")
    print("3. Create PRs in both repositories")
    print("4. Merge infrahub-docs PR first, then source repo PR")
    print("5. Set up Cloudflare Pages integration if needed")


if __name__ == "__main__":
    main()
