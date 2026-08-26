---
title: Viewing artifacts
description: Find, preview, and download the AVD EOS configs and fabric/device documentation.
audience: user
sidebar_position: 5
---

# Viewing artifacts

Once generators have run on a branch and you've opened a proposed change (see [Provision Your First Fabric](./provision-first-fabric.md) or any of the day-2 how-to pages), the proposed-change CI pipeline renders these artifact types:

| Artifact | Attached to | Content type | Purpose |
|----------|-------------|--------------|---------|
| **AVD EOS Configuration** | Each `DcimDevice` | `text/plain` | The Arista EOS CLI configuration for that device. |
| **AVD Device Documentation** | Each `DcimDevice` | `text/markdown` | Human-readable documentation describing the device. |
| **AVD Fabric Documentation** | Each `NetworkFabric` | `text/markdown` | Fabric-wide topology and design documentation. |
| **ContainerLab Topology** | Each `NetworkFabric` | `application/yaml` | A [ContainerLab](https://containerlab.dev) topology file for running the fabric as containers. |
| **Cabling Plan** | Each `NetworkFabric` | `text/csv` | One row per connection for the field and cabling teams. |
| **AVD ANTA Catalog** | Each `DcimDevice` | `application/yaml` | The device's [ANTA](https://anta.arista.com) test catalog. Rendered only when the fabric has `anta_enabled` set; otherwise the artifact holds a one-line comment saying so. |

Per-device artifacts (`AVD EOS Configuration`, `AVD Device Documentation`) are rendered as part of the proposed-change CI. If you want to view them outside a proposed change, open them on a device's **Artifacts** tab and click **Regenerate**.

## Finding a device artifact

1. In the Infrahub UI, open **Devices → All Devices**.
2. Click a device (for example `leaf-pod-A1-1`).
3. Click the **Artifacts** tab on the device's detail page.
4. You'll see rows for **AVD EOS Configuration** and **AVD Device Documentation**.

## Previewing an artifact

Click the artifact row to open a preview panel. The preview shows:

- The rendered content inline.
- Metadata: content type, last rendered timestamp, size.
- A **Download** button.
- A **Regenerate** button (forces a fresh render even if nothing has changed).

### EOS configuration preview

The EOS config is plain text — paste-ready for a lab switch or a virtual Arista instance. Example excerpt:

```text
!
hostname leaf-pod-A1-1
!
router bgp 65101
   router-id 10.255.1.1
   …
```

### Markdown documentation preview

The fabric and device markdown documents include tables, topology descriptions, and interface lists. They render directly in the Infrahub preview.

## Finding a fabric artifact

1. Open **Fabric Design → Fabrics**.
2. Click the fabric (`Fabric-L3LS-MultiPod-A`).
3. Click the **Artifacts** tab.
4. Open **AVD Fabric Documentation** or **ContainerLab Topology**.

### ContainerLab topology preview

The topology is YAML. It names every device the fabric owns as a ContainerLab node — cEOS nodes for
the switches, Linux nodes for the servers — plus every fabric link as a `endpoints` pair:

```yaml
topology:
  nodes:
    spine-infrahub-dc1-1:
      kind: arista_ceos
      mgmt-ipv4: 10.0.6.11
  links:
    - endpoints: ["leaf-infrahub-dc1-1:eth49_1", "spine-infrahub-dc1-1:eth1_1"]
```

Node kinds, container images, and interface-mapping binds come from schema attributes rather than
the transform, so changing the cEOS version is a data change. See the
[ContainerLab page](./containerlab.md) for the full shape and for how to deploy the topology.

## Downloading artifacts

In the preview panel, click **Download**. Content is served with the correct `Content-Type`:

- EOS configs save as `.txt`.
- Markdown docs save as `.md`.
- The ContainerLab topology saves as `.yml`, ready to pass to `containerlab deploy --topo`.

## Regenerating an artifact

Artifacts regenerate automatically when the underlying data changes, but you can force a regeneration from the preview panel's **Regenerate** button. Typical reasons to force a regenerate:

- You edited a device attribute directly in the UI and want to see the config update.
- A previous generator run was interrupted and the artifact is stale.

## What if an artifact is empty or says `no structured config available`?

This means the structured-config generator hasn't run for the fabric yet. See the [troubleshooting page](./troubleshooting.md) for the fix.

## Downstream consumption

The artifacts are also accessible via the Infrahub API and through Ansible playbooks orchestrated by Semaphore at `http://localhost:3000`. Two playbook trees exist, and they consume different artifacts:

- `ansible/` at the repository root — the tree Semaphore runs. `inventory.yml` builds the inventory from Infrahub and `deploy.yml` fetches each device's **AVD EOS Configuration** with `opsmill.infrahub.artifact_fetch`. `deploy_clab.yml` fetches the **ContainerLab Topology** artifact plus every device's EOS config, stages them on a ContainerLab host, and deploys the lab; see the [ContainerLab page](./containerlab.md).
- `lab/playbooks/` — the AVD-toolchain playbooks for the committed lab (`build.yml`, `deploy.yml`, `deploy-eapi.yml`, `test.yml`), driven from `lab/Makefile`.

Both need the `opsmill.infrahub` collection: `ansible-galaxy collection install -r ansible/galaxy-requirements.yml`.
