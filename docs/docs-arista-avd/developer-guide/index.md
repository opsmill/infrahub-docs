---
title: Developer guide
description: How the Infrahub Arista AVD solution is built and how to extend it.
audience: developer
hide_table_of_contents: true
---

# Developer guide

This guide is for **contributors** who want to extend, debug, or maintain the AVD pipeline — adding device roles, transform outputs, schema fields, or fixing pipeline issues. It assumes familiarity with Python, GraphQL, and Infrahub generators/transforms.

## Contributor runtime and validation

Use Python **3.14.7**; the solution supports `>=3.14,<3.15`. Python 3.11–3.13
support has been removed. Install the committed dependency lock and run unit
tests directly:

```bash
uv sync --all-packages --frozen
uv run pytest tests/unit
uv run invoke lint
uv run invoke docs
cd docs
pnpm run typecheck
```

`invoke test` also runs integration tests. Integration tests are time-consuming
and must be run manually by the user before claiming full integration
compatibility. Generator changes also require idempotence validation. Unit tests
and image smoke checks do not establish full integration compatibility.

The custom Infrahub image extends `/.venv` shipped with Infrahub 1.11.5 using
`uv sync --no-dev --frozen --inexact`, with automatic Python selection. The
image's `PATH` selects `/.venv/bin/python`, which uses the Python 3.14.7
interpreter supplied by the image. Keep the solution's Python requirements
compatible with that interpreter. `--inexact` retains extra packages when
syncing a compatible existing environment; it cannot retain them if a Python
mismatch causes `uv` to recreate the environment. Verify imports and dependency
consistency with the image smoke checks after building.

Infrahub loads Python generators and transforms into its worker process, where
the solution imports PyAVD directly. Infrahub and PyAVD must therefore share the
same Python interpreter and compatible dependencies. Installing PyAVD in a
separate virtual environment does not make it available to those imports. Using
different Python versions requires a separate process or service.

The portal uses `python:3.14.7-slim` and starts Streamlit with `uv run --no-sync`.
Semaphore retains its separate Python and Ansible runtime.

Build and check disposable candidate images without starting Compose:

```bash
docker build -t avd-infrahub-candidate .
docker build -f Dockerfile.catalog -t avd-portal-candidate .
docker build -t avd-semaphore-candidate semaphore
bash scripts/smoke_images.sh avd-infrahub-candidate avd-portal-candidate avd-semaphore-candidate
```

The smoke script checks server, worker, and task-manager imports, inherited
Infrahub/SDK versions, package consistency, portal health, and Semaphore AVD
versions and playbook syntax. Its containers have no external network access;
it does not run deployment playbooks or device tests. CI runs this check
independently of the E2E job when images or dependencies change.

## Start here

1. **[Architecture Overview](./architecture.md)** — system components, data model hierarchy, and the generator pipeline at a glance.
2. **[AVD Pipeline → Overview](./avd/overview.md)** — the two-phase pipeline (hostvars → structured config) and the PyAVD version target.

## Reference

- **[Schemas](./schemas.md)** — every YAML schema file and the kinds it defines.
- **[Generators](./generators.md)** — the generator framework, file structure, and per-generator behaviour.
- **[Transforms](./transforms.md)** — Python and Jinja2 transforms, queries, and content types.
- **[Checks](./checks.md)** — proposed-change validation checks, including CloudVision configuration validation.

## AVD pipeline

The AVD pipeline is the technically distinguishing piece of this solution and has its own sub-section:

- **[Overview](./avd/overview.md)** — two-phase pipeline + PyAVD version pin.
- **[Hostvars Reference](./avd/hostvars.md)** — the PyAVD-compatible structure produced per device role.
- **[Transforms](./avd/transforms.md)** — `avd_eos_config`, `avd_fabric_doc`, `avd_device_doc`.
- **[AvdArtifact & File Storage](./avd/artifacts.md)** — the `AvdArtifact` node, child file nodes, checksum-based change detection.
- **[Role Mapping](./avd/role-mapping.md)** — Infrahub roles → AVD device types.
- **[Extending the Pipeline](./avd/extending.md)** — worked examples for new roles, new transform outputs, new hostvar fields.
- **[Debugging the Pipeline](./avd/debugging.md)** — intermediate-file inspection, single-generator re-runs, common failure modes.

## Looking for the operator guides?

If you want to *use* the system to provision fabrics and view configurations without modifying code, start with [Quick Start](../quick-start.md) and the [how-to guides](../how-to/add-network-segment.md).
