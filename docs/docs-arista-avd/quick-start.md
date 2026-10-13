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
- Python 3.14 (`>=3.14,<3.15`); the default patch version is 3.14.7.

Everything else is installed by `uv sync` inside the project.

## 1. Install dependencies

From the repository root:

```bash
uv sync --all-packages
```

This creates a virtualenv under `.venv/` and installs the project and its dependencies, including `pyavd` and the Infrahub SDK.

## 2. Initialize local credentials

Generate the credentials required by the Compose stack:

```bash
uv run invoke init-secrets
```

The command adds only missing assignments to the ignored `.env` file, preserves existing values,
sets mode `0600`, and does not print credential values. The `.env.example` file keeps credential
fields empty and lists every required variable.

Docker Compose reads `.env` automatically. Values exported in the shell take precedence. The single
`INFRAHUB_API_TOKEN` value is passed to Infrahub as the initial administrator token and to the service
portal, task worker, and Semaphore for API authentication.

Re-run `uv run invoke init-secrets` after deleting a value to generate only that missing assignment.

## 3. Build the custom Infrahub image

The project extends the base Infrahub image with `pyavd` and project code. Build the image once:

```bash
uv run invoke build
```

To build against a different Infrahub release, set `INFRAHUB_BASE_VERSION` first — the compose files
default to `1.10.10`:

```bash
export INFRAHUB_BASE_VERSION=<infrahub-version>
uv run invoke build
```

Re-run this only after changes to `Dockerfile` or the Python dependencies. `invoke build --no-cache`
forces a clean rebuild.

## 4. Start the stack

```bash
uv run invoke start
```

This brings up, in the background:

| Service | URL | Purpose |
|---------|-----|---------|
| Infrahub UI | `http://localhost:8000` | Main web interface |
| Service Portal | `http://localhost:8501` | Streamlit self-service portal |
| Semaphore | `http://localhost:3000` | Ansible deployment and ANTA validation runner |
| Neo4j Browser | `http://localhost:7474` | Graph database browser |
| Prefect | `http://localhost:4200` | Task-manager UI — where generator, transform, and check runs show up |

`invoke start` also creates `lab/clab-staging/` and `anta/` before Compose runs. Semaphore uses the
current host user's UID/GID for bind-mounted files; `SEMAPHORE_UID` and `SEMAPHORE_GID` in the shell
or ignored `.env` can override the detected values. The ANTA reports remain in `anta/`, while
Semaphore's SQLite database and configuration persist in Docker volumes.

Wait for services to become healthy. You can check with:

```bash
docker compose -f docker-compose.yml -f docker-compose.override.yml ps
```

All services should show `healthy` or `running`. Infrahub is ready once `http://localhost:8000` responds.

## 5. Load schemas, menus, objects, and repository

Once Infrahub is healthy, load schemas, shared data, the selected fabrics, and repository settings:

```bash
uv run invoke load
```

This runs, in order:

1. Validate the entire seed selection, then initialise Semaphore (idempotent — safe to re-run).
2. Load schemas from `schemas/`.
3. Load the UI menu from `menus/`.
4. Load `objects/common/`, then each selected fabric directory in alphabetical order.
5. Register this repository with Infrahub and wait for it to reach `in-sync`.
6. Load the check queries from `repository_checks.yml`, which depend on the repository being synced.
7. Load event triggers and rules from `triggers.yml`.

### Choose the seed fabrics

`INFRAHUB_SEED_FABRICS` can be set in `.env` or exported in the shell. Exported values take
precedence over `.env`. An absent or empty value loads `all`, preserving the default of seven fabrics.
The selection applies to `invoke load`; keep the `invoke start` then `invoke load` sequence.

```bash
# All seven fabrics (default)
INFRAHUB_SEED_FABRICS=all uv run invoke load

# One fabric
INFRAHUB_SEED_FABRICS=l3ls-multi-domain uv run invoke load

# Multiple fabrics
INFRAHUB_SEED_FABRICS=l2ls,campus uv run invoke load

# Shared objects only
INFRAHUB_SEED_FABRICS=none uv run invoke load
```

| Directory identifier | Infrahub fabric | Example |
|---|---|---|
| `l3ls-multipod-a` | `Fabric-L3LS-MultiPod-A` | Single DC Multi-Pod L3LS (5-Stage Clos) |
| `l3ls-multipod-b` | `Fabric-L3LS-MultiPod-B` | Additional Multi-Pod fabric |
| `l3ls-multi-domain` | `Fabric-L3LS-Multi-Domain` | Dual DC L3LS |
| `l2ls` | `Fabric-L2LS` | L2LS Fabric |
| `campus` | `Fabric-Campus` | Campus Fabric |
| `single-dc-l3ls` | `Fabric-L3LS` | Single DC L3LS |
| `isis-ldp` | `Fabric-ISIS-LDP` | Additional repository example: ISIS-LDP IPVPN |

The scenario names follow the official [AVD 6.4 examples](https://avd.arista.com/6.4/ansible_collections/arista/avd/examples/index.html).
This catalog does not change the repository's PyAVD version. See [supported capabilities](./supported-capabilities.md)
for the topology and services of each example.

Identifiers are case-sensitive. Surrounding spaces are trimmed and duplicates are removed. Unknown
identifiers, empty elements such as `l2ls,`, and combinations of `all` or `none` with another value
fail before Semaphore, schemas, or menus are loaded. The error lists the available values.
`all` discovers every non-hidden fabric subdirectory containing YAML seed files.

Common contains groups, Arista models and platforms, reusable interface profiles, Arista switch
templates, shared DNS/NTP and users, the fabric supernet, and `Hall-A1` shared by MultiPod A/B.
Each fabric owns its pools, fabric/pods, locations, services, server profiles/templates, and endpoints.
Numeric prefixes order dependencies within each directory. Common is loaded in a separate command
before any fabric, and every fabric can be loaded with Common alone.

### Load only objects on an existing instance

Once the schemas are loaded, select seeds without running the rest of bootstrap:

```bash
uv run invoke load-objects --fabrics=l2ls,campus --branch=seed-review
```

Create the Infrahub branch first. `--fabrics` overrides the environment variable; `--branch` targets
an Infrahub branch, and omission uses the instance's default branch. Use the default branch only
for a disposable instance during initial bootstrap.

Both commands display the effective selection and current directory, and stop at the first failure.
A new selection adds or updates objects. Previously loaded fabrics remain present; changing the
selection does not remove data.

## 6. Confirm everything loaded

Open the Infrahub UI at **`http://localhost:8000`** and log in. You should see:

- **Devices → Types & Models → Manufacturers**: Arista.
- **Fabric Design → Fabrics**: the selected fabrics with their pods (all seven by default).
- **Locations → Racks**: pre-defined racks per pod.
- **IPAM → Prefixes**: the fabric supernet and per-fabric prefix pools.

If you don't see these, re-run `uv run invoke load` or see [Common Issues](./troubleshooting.md).

## Next: provision a fabric

The stack is up but no devices exist yet — fabrics, pods, and racks are defined but leaves, spines, and super-spines need to be generated. Follow [Provision Your First Fabric](./provision-first-fabric.md) next.

## Common commands

| Command | What it does |
|---------|--------------|
| `uv run invoke init-secrets` | Generate missing local credentials in `.env` |
| `uv run invoke start` | Start all services |
| `uv run invoke stop` | Stop containers, keep volumes |
| `uv run invoke destroy` | Stop and **remove** containers, networks, and volumes (wipes data) |
| `uv run invoke restart` | Restart all services |
| `uv run invoke restart --component=infrahub-server` | Restart a specific service |
| `uv run invoke load` | Re-run bootstrap with the selected fabrics |
| `uv run invoke load-objects --fabrics=l2ls --branch=seed-review` | Load Common and selected seeds on a branch |
| `uv run invoke load-schema` | Reload schemas only |
| `uv run invoke load-menu` | Reload UI menus only |
| `uv run invoke init-semaphore` | Re-register the Semaphore project, deployment templates, and ANTA task (idempotent) |
| `uv run invoke test` | Run the test suite, then Ruff and mypy |
| `uv run invoke lint` | Ruff, yamllint, and mypy |
| `uv run invoke format` | Apply Ruff formatting |

`uv run invoke --list` shows the full set.

`invoke destroy` also removes Semaphore's database and configuration volumes. For an existing
Semaphore container, follow [Migrate Semaphore storage](./how-to/migrate-semaphore-storage.md) before
stopping or starting the new image so its SQLite database, encryption settings, projects, and task
history survive.

After a generated configuration has been merged and deployed, follow
[Run ANTA after deployment](./how-to/run-anta-after-deployment.md) to validate one fabric from
Semaphore.
