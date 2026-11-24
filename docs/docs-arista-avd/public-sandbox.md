---
title: Public sandbox
description: Walk through the demo in the hosted public sandbox, and configure the sandbox definition that runs it.
audience: user
sidebar_position: 4
---

# Public sandbox

The public sandbox runs this design on a hosted Infrahub instance that visitors open in a browser. Visitors do not install anything, run commands, or sign in as the administrator. The sandbox pipeline prepares the instance with the `sandbox-setup` task and resets it every night.

The local guides use `http://localhost` addresses and `uv run invoke` commands. In the sandbox, use the public addresses listed on the [sandbox page](https://docs.infrahub.app/sandboxes/demo-arista-avd) and the browser steps below instead.

## What the sandbox includes

- **Infrahub**, with the schemas, menus, repository, check definition, and generator triggers already loaded, and one fabric, `Fabric-L3LS`, already generated. Its devices and their EOS configurations are on `main`.
- **Service Catalog**, the Streamlit portal used by the day-2 guides. On the sandbox page, **Open the portal** opens it.

The sandbox does not include:

- **Semaphore**. Its Ansible deployment, ANTA validation and ContainerLab tasks need devices that the sandbox cannot reach. Use a local stack for [Run ANTA after deployment](./how-to/run-anta-after-deployment.md) and [ContainerLab](./containerlab.md).
- **CloudVision validation**. No seed fabric has `cloudvision_managed` set, so the `cv-config-validation` check skips every fabric.
- **The Prefect task manager**. It is not public. To follow generator runs, open **Actions → Tasks** in Infrahub.

## Visitor walkthrough

Sign in to Infrahub with the visitor account shown on the [sandbox page](https://docs.infrahub.app/sandboxes/demo-arista-avd). Merging into `main` can need a different visitor account from the one that creates branches. The sandbox page states which account can merge.

1. View the devices of `Fabric-L3LS` in **Devices → All Devices**: its spines and leaves already exist on `main`.
2. View the EOS configuration of a device. See [Viewing artifacts](./viewing-artifacts.md) for where to find it.
3. Create a branch: open the branch selector in the top bar, select **+ Create branch** and name it, for example `regenerate-fabric-l3ls`.
4. Run the fabric generator on the branch: open **Actions → Generator definitions**, select **generate-fabric**, select **Run**, choose `Fabric-L3LS` and confirm.
5. Follow the generator chain in **Actions → Tasks**. The pod, rack, hostvar, and structured configuration generators start automatically. The full chain takes a few minutes. Without a change to the fabric's design, the generators reconcile the existing devices and change nothing.
6. Create a proposed change from the branch. The pipeline renders the EOS configuration and documentation artifacts for every device and shows what changed.
7. Optionally, merge the proposed change with the account that can merge.

[Provision your first fabric](./provision-first-fabric.md) explains each step in more detail. Skip the command-line alternative in its first step: the sandbox has no shell.

### Day-2 workflows in the Service Catalog

Open the [Service Catalog](https://portal-demo-arista-avd.opsmill.app), then follow [Add a network segment](./how-to/add-network-segment.md), [Add a server](./how-to/add-server.md), [Create a tenant](./how-to/create-tenant.md), or [Regenerate a fabric](./how-to/regenerate-fabric.md). Each workflow creates a branch. Links from the catalog open that branch in the public Infrahub interface.

The Service Catalog asks you to sign in with the same visitor account you use for Infrahub. It makes every change with that account, so Infrahub applies the same permissions as in its own interface. To switch accounts, select **Sign out** in the sidebar.

## Sandbox definition

This section is for the people who maintain the sandbox definition in Infrahub.

### Setup task

The pipeline runs `uv run invoke sandbox-setup`. The task:

1. Loads the schemas and waits until every Infrahub worker has the new schema.
2. Loads the menus.
3. Loads the `Common` seed data and the fabrics selected by `INFRAHUB_SEED_FABRICS`. When the variable is not set, it loads only `single-dc-l3ls`, which holds `Fabric-L3LS`.
4. Registers `test-repository` as a read-only repository from `INFRAHUB_REPO_URL`, tracking the branch or tag in `INFRAHUB_REPO_REF` (`main` when it is not set). The repository is read-only because Infrahub checks that it can push to a read-write repository, and a public repository registered without credentials does not allow that.
5. Waits up to 600 seconds for the repository to sync and stops with an error if the import fails.
6. Loads the CloudVision check definition, its queries and webhook, and the generator triggers.
7. Creates the branch `sandbox-generate-fabrics` and runs `generate-fabric` there for every loaded fabric. The generator triggers fire only on branches other than `main`, so the generator chain needs a branch.
8. Waits up to 1,200 seconds for the generator chain to finish, then merges the branch into `main` and deletes it. It stops with an error if a task fails.
9. Generates the `avd_eos_configuration` artifacts on `main` and stops with an error if any of them is not `Ready`.

The task deletes a `sandbox-generate-fabrics` branch left by an earlier run before it creates a new one, so it can run twice.

The task uses only `INFRAHUB_ADDRESS`, `INFRAHUB_API_TOKEN`, `INFRAHUB_REPO_URL`, `INFRAHUB_REPO_REF` and the optional `INFRAHUB_SEED_FABRICS`. It stops if `INFRAHUB_ADDRESS` or `INFRAHUB_API_TOKEN` is missing. It creates no accounts and changes no roles. All Infrahub requests go through the Infrahub Python SDK, which follows `INFRAHUB_RETRY_ON_FAILURE` and `INFRAHUB_RETRY_STATUS_CODES`.

To load other fabrics, set `INFRAHUB_SEED_FABRICS` in `setup_env` to `all` or to a comma-separated list of fabric directories, such as `single-dc-l3ls,l2ls`. The task generates every fabric it loads, so each one adds to the setup time. The pipeline stops the setup task after 1,800 seconds. The walkthrough above uses `Fabric-L3LS` only.

### Images

The `Publish sandbox images` workflow publishes these images to OpsMill's Harbor registry, which serves them at `registry.opsmill.io`:

- `registry.opsmill.io/opsmill/infrahub-enterprise-solution-arista-avd`: Infrahub Enterprise with the `solution_arista_avd` package, which the generators, transforms, and checks import. The sandbox runs the `infrahub-enterprise` driver, so set this image on its built-in `task-worker` component, with `{{ app.version }}` as the tag: `registry.opsmill.io/opsmill/infrahub-enterprise-solution-arista-avd:{{ app.version }}`. The tag then follows the sandbox's Infrahub version.
- `registry.opsmill.io/opsmill/infrahub-solution-arista-avd`: the same on Infrahub Community, for deployments that run the `infrahub` driver.
- `registry.opsmill.io/opsmill/infrahub-arista-avd/service-catalog`: the Service Catalog.

Each Infrahub image has one tag per Infrahub version, `<version>`, taken from the `INFRAHUB_BASE_VERSION` default in the `Dockerfile`. A tag exists only for a version this repository has been updated to, so update the repository to the sandbox's Infrahub version before the sandbox uses it.

### Service Catalog application

Run the Service Catalog with the `generic-app` driver, with these environment variables:

| Variable | Value |
|---|---|
| `STREAMLIT_SERVER_PORT` | `8080`, the port the `generic-app` driver serves |
| `INFRAHUB_ADDRESS` | The Infrahub address reachable inside the cluster |
| `INFRAHUB_UI_URL` | The public Infrahub address, used for links shown to visitors |
| `DEFAULT_BRANCH` | `main` |

Do not set `INFRAHUB_API_TOKEN` for the sandbox. Without it, the Service Catalog asks each visitor to sign in with their visitor account and makes their changes with that account's permissions. The sandbox definition then holds no secret for the catalog.

The local Docker Compose stack sets `INFRAHUB_API_TOKEN`, so the catalog skips the sign-in form there.

The nightly reset restores Infrahub. The Service Catalog keeps no state of its own outside Infrahub.
