import sys
import urllib.request
from pathlib import Path
from xml.etree import ElementTree

from invoke import Context, task  # type: ignore[import-untyped]

CURRENT_DIRECTORY = Path(__file__).resolve()
DOCUMENTATION_DIRECTORY = CURRENT_DIRECTORY.parent / "docs"

MAIN_DIRECTORY_PATH = Path(__file__).parent

REDIRECT_CHECK_DIR = MAIN_DIRECTORY_PATH / "docs" / "redirect-check"
OLD_PATHS_FILE = REDIRECT_CHECK_DIR / "old-paths.txt"


@task
def format(context: Context) -> None:
    """Run RUFF to format all Python files."""

    exec_cmds = ["ruff format .", "ruff check . --fix"]
    with context.cd(MAIN_DIRECTORY_PATH):
        for cmd in exec_cmds:
            context.run(cmd)


@task
def lint_yaml(context: Context) -> None:
    """Run Linter to check all YAML files."""
    print(" - Check code with yamllint")
    exec_cmd = "yamllint ."
    with context.cd(MAIN_DIRECTORY_PATH):
        context.run(exec_cmd)


@task
def lint_markdown(context: Context) -> None:
    """Run Linter to check all Markdown files."""
    print(" - Check code with markdownlint")
    exec_cmd = "markdownlint '**/*.md' '**/*.mdx'"
    with context.cd(MAIN_DIRECTORY_PATH):
        context.run(exec_cmd)


@task
def lint_mypy(context: Context) -> None:
    """Run Linter to check all Python files."""
    print(" - Check code with mypy")
    exec_cmd = "mypy --show-error-codes ."
    with context.cd(MAIN_DIRECTORY_PATH):
        context.run(exec_cmd)


@task
def lint_ruff(context: Context) -> None:
    """Run Linter to check all Python files."""
    print(" - Check code with ruff")
    exec_cmd = "ruff check ."
    with context.cd(MAIN_DIRECTORY_PATH):
        context.run(exec_cmd)


@task(name="lint")
def lint_all(context: Context) -> None:
    """Run all linters."""
    lint_markdown(context)
    lint_yaml(context)
    lint_ruff(context)
    lint_mypy(context)


@task(name="docs")
def docs_build(context: Context) -> None:
    """Build documentation website."""
    exec_cmd = "npm run build"

    with context.cd(DOCUMENTATION_DIRECTORY):
        output = context.run(exec_cmd)

    if output is None or output.exited != 0:
        sys.exit(-1)


@task
def serve(context: Context) -> None:
    """Run documentation server in development mode."""

    exec_cmd = "npm run serve"

    with context.cd(DOCUMENTATION_DIRECTORY):
        context.run(exec_cmd)


@task(name="snapshot-urls")
def docs_snapshot_urls(context: Context, build: bool = True) -> None:
    """Snapshot all current doc paths from sitemap.xml into docs/redirect-check/old-paths.txt."""
    if build:
        with context.cd(DOCUMENTATION_DIRECTORY):
            output = context.run("npm run build")
        if output is None or output.exited != 0:
            sys.exit(-1)

    sitemap = DOCUMENTATION_DIRECTORY / "build" / "sitemap.xml"
    if not sitemap.exists():
        print(f"ERROR: sitemap not found at {sitemap}. Run with --build or build first.")
        sys.exit(-1)

    tree = ElementTree.parse(sitemap)
    ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    urls = [loc.text for loc in tree.iterfind(".//sm:loc", ns) if loc.text]

    # Derive base URL from first entry to strip it
    if not urls:
        print("ERROR: no URLs found in sitemap.")
        sys.exit(-1)

    # Find common prefix (base URL) — strip scheme+host
    from urllib.parse import urlparse

    paths = []
    for url in urls:
        parsed = urlparse(url)
        path = parsed.path.rstrip("/") or "/"
        paths.append(path)

    paths.sort()

    REDIRECT_CHECK_DIR.mkdir(parents=True, exist_ok=True)
    OLD_PATHS_FILE.write_text("\n".join(paths) + "\n")
    print(f"Wrote {len(paths)} paths to {OLD_PATHS_FILE}")


@task(name="check-redirects")
def docs_check_redirects(
    context: Context,
    server: str = "http://localhost:3000",
    paths_file: str = str(OLD_PATHS_FILE),
) -> None:
    """Check that all paths in old-paths.txt return HTTP 2xx from the local server."""
    paths_path = Path(paths_file)
    if not paths_path.exists():
        print(f"ERROR: paths file not found: {paths_path}")
        print("Run `uv run invoke snapshot-urls` first.")
        sys.exit(-1)

    paths = [p for p in paths_path.read_text().splitlines() if p.strip()]
    failures: list[tuple[str, str]] = []

    for path in paths:
        url = server.rstrip("/") + path
        try:
            with urllib.request.urlopen(url, timeout=10) as resp:
                if not (200 <= resp.status < 300):
                    failures.append((path, str(resp.status)))
        except urllib.error.HTTPError as exc:
            failures.append((path, str(exc.code)))
        except Exception as exc:
            failures.append((path, str(exc)))

    total = len(paths)
    if failures:
        print(f"\nFAILURES ({len(failures)}/{total}):")
        for path, reason in failures:
            print(f"  {reason:>6}  {path}")
        sys.exit(1)
    else:
        print(f"All {total} paths OK.")
