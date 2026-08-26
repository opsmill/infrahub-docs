---
title: Quick start
description: Install dependencies, bring the stack up, and load seed data.
audience: user
sidebar_position: 1
---

# Quick start

The steps below take you from a fresh clone to a running Infrahub instance with seed data loaded. After this, see [Provision Your First Fabric](./provision-first-fabric.md) to generate devices, configurations, and AVD artifacts.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose.
- [`uv`](https://docs.astral.sh/uv/getting-started/installation/) — the Python package manager this project uses.
- Python 3.11 or newer.

Everything else is installed by `uv sync` inside the project.

## 1. Install dependencies

From the repository root:

```bash
uv sync --all-packages
```

This creates a virtualenv under `.venv/` and installs the project and its dependencies, including `pyavd` and the Infrahub SDK.

## 2. Build the custom Infrahub image

The project extends the base Infrahub image with `pyavd` and project code. Build the image once:

```bash
uv run invoke build
```

To build against a different Infrahub release, set `INFRAHUB_BASE_VERSION` first — the compose files
default to `1.10.6`:

```bash
export INFRAHUB_BASE_VERSION=<infrahub-version>
uv run invoke build
```

Re-run this only after changes to `Dockerfile` or the Python dependencies. `invoke build --no-cache`
forces a clean rebuild.

## 3. Start the stack

```bash
uv run invoke start
```

This brings up, in the background:

| Service | URL | Purpose |
|---------|-----|---------|
| Infrahub UI | `http://localhost:8000` | Main web interface |
| Service Portal | `http://localhost:8501` | Streamlit self-service portal |
| Semaphore | `http://localhost:3000` | Ansible automation runner |
| Neo4j Browser | `http://localhost:7474` | Graph database browser |
| Prefect | `http://localhost:4200` | Task-manager UI — where generator, transform, and check runs show up |

`invoke start` also creates `lab/clab-staging/` before compose runs, so the Semaphore container has a
writable bind-mount source for [ContainerLab](./containerlab.md) files.

Wait for services to become healthy. You can check with:

```bash
docker compose -f docker-compose.yml -f docker-compose.override.yml ps
```

All services should show `healthy` or `running`. Infrahub is ready once `http://localhost:8000` responds.

## 4. Load schemas, menus, objects, and repository

Once Infrahub is healthy, load everything in one command:

```bash
uv run invoke load
```

This runs, in order:

1. Initialise Semaphore (idempotent — safe to re-run).
2. Load schemas from `schemas/`.
3. Load the UI menu from `menus/`.
4. Load seed data from `objects/` — manufacturers, device types, IP pools, profiles, device templates, fabrics, racks, VLANs.
5. Register this repository with Infrahub and wait for it to reach `in-sync`.
6. Load the check queries from `repository_checks.yml`, which depend on the repository being synced.
7. Load event triggers and rules from `triggers.yml`.

Seed data loads in filename order, and the numeric prefixes encode that order: shared data first
(`00`–`06` — groups, manufacturers, device types, IPAM, management, profiles, device templates),
then the example fabrics (`10`–`15`), each with its own fabric, rack, service, and server files.

## 5. Confirm everything loaded

Open the Infrahub UI at **`http://localhost:8000`** and log in. You should see:

- **Devices → Types & Models → Manufacturers**: Arista, Dell, and other manufacturers.
- **Fabric Design → Fabrics**: `Fabric-L3LS-MultiPod-A` and `Fabric-L3LS-MultiPod-B` with their pods.
- **Locations → Racks**: pre-defined racks per pod.
- **IPAM → Prefixes**: the fabric supernet and per-fabric prefix pools.

If you don't see these, re-run `uv run invoke load` or see [Common Issues](./troubleshooting.md).

## Next: provision a fabric

The stack is up but no devices exist yet — fabrics, pods, and racks are defined but leaves, spines, and super-spines need to be generated. Follow [Provision Your First Fabric](./provision-first-fabric.md) next.

## Common commands

| Command | What it does |
|---------|--------------|
| `uv run invoke start` | Start all services |
| `uv run invoke stop` | Stop containers, keep volumes |
| `uv run invoke destroy` | Stop and **remove** containers, networks, and volumes (wipes data) |
| `uv run invoke restart` | Restart all services |
| `uv run invoke restart --component=infrahub-server` | Restart a specific service |
| `uv run invoke load` | Re-run the full load sequence |
| `uv run invoke load-schema` | Reload schemas only |
| `uv run invoke load-menu` | Reload UI menus only |
| `uv run invoke init-semaphore` | Re-register the Semaphore project and templates (idempotent) |
| `uv run invoke test` | Run the test suite, then Ruff and mypy |
| `uv run invoke lint` | Ruff, yamllint, and mypy |
| `uv run invoke format` | Apply Ruff formatting |

`uv run invoke --list` shows the full set.
