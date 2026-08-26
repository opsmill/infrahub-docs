---
title: Regenerate a fabric
description: Use the Fabric Design page to inspect and re-run the generator chain for a fabric.
audience: user
sidebar_position: 4
---

# Regenerate a fabric

The Fabric Design page in the service portal is the interactive view of a fabric. From it you can inspect the topology and cabling, see fabric settings and EVPN tenants, and trigger a full regeneration of the fabric — devices, cabling, hostvars, and structured configs — from a single button.

## Open the fabric design page

Navigate to **`http://localhost:8501`**. From the sidebar, open **Fabric View** (the page title is **Fabric Design View**).

## Pick branch and fabric

- **Select Branch** (sidebar dropdown) — choose which Infrahub branch to view. For inspection, any branch is fine. For regeneration, use a non-default branch so the change is isolated and reviewable.
- **Select Fabric** (main area) — choose the fabric to view, for example, `Fabric-L3LS-MultiPod-A`.

## Tabs

The page has four tabs:

| Tab | What it shows |
|-----|---------------|
| **Design Topology** | Hierarchical view of the fabric: pods, racks, devices. Useful to confirm the shape of the fabric before generating. |
| **Cabling Topology** | Physical cabling map — every link between devices. Useful to spot missing or misrouted cabling. |
| **Fabric Settings** | Underlay/overlay protocols, MTU, spanning-tree configuration. |
| **EVPN Tenants** | Tenants associated with the fabric, their VRFs, SVIs, and L2 VLANs. |

## Regenerate the fabric

In the **Generate Fabric** section (typically above the tabs or in a side panel depending on your window size):

1. Accept the auto-generated **Branch name** (format `generate-<fabric-name>-<timestamp>`) or edit it.
2. Click the **Generate** button (primary-styled).

The portal triggers the full generator chain — `generate-fabric` → `generate-pod` → `generate-rack` → `generate-avd-device-hostvar` → `generate-avd-device-structured-config` — on the named branch.

While the chain runs, the portal shows progress. The full run typically takes a few minutes for a small fabric; longer for fabrics with many pods and racks.

## What you get

When the run finishes, the portal creates a proposed change. Click **View Proposed Change** to review:

- New or updated devices (if the fabric had none, or if pods/racks have been added since the last generation).
- Updated cabling (if cabling changed).
- Updated AVD artifacts for every device and the fabric itself.

Review and merge as usual.

## When to regenerate a fabric

- After manually editing IP pools, fabric settings, or device templates that affect code paths in the generators.
- After a failed partial run where some generators didn't complete. Re-running is idempotent — existing devices and objects are upserted, not duplicated.
- After upgrading the PyAVD version, if the structured config output format has changed.

## Inspecting without regenerating

You don't need to regenerate to browse. Pick a branch and fabric and switch between the four tabs to answer questions like:

- "Is `Fabric-L3LS-MultiPod-A` cabled consistently across pods?" → **Cabling Topology**.
- "Which tenants are on `Fabric-L3LS-MultiPod-B`?" → **EVPN Tenants**.
- "What MTU is configured for the underlay?" → **Fabric Settings**.

## If the service portal is unavailable

You can trigger the generator chain manually in the Infrahub UI:

1. Create a branch.
2. Open **Actions → Generator definitions**.
3. Run **`generate-fabric`** and select the fabric.
4. The chain cascades automatically via event triggers.
5. Create a proposed change from the branch.

See [Provision Your First Fabric](../provision-first-fabric.md) for a step-by-step walkthrough of the same chain.

## Source

Service-portal implementation: [`service_catalog/pages/4_Fabric_View.py`](https://github.com/opsmill/infrahub-arista-avd/blob/main/service_catalog/pages/4_Fabric_View.py).
