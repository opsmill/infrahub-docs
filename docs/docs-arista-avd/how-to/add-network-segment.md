---
title: Add a network segment
description: Create a VRF, VLAN, and SVI on a fabric using the service portal.
audience: user
sidebar_position: 1
---

# Add a network segment

Creates a new EVPN network segment — a VRF, a VLAN, and an SVI — on a target fabric. The workflow runs on its own branch, regenerates hostvars and structured configs, and opens a proposed change for review.

Prerequisites:

- A running stack with seed data loaded ([Quick Start](../quick-start.md)).
- A provisioned fabric with devices and artifacts ([Provision Your First Fabric](../provision-first-fabric.md)).
- At least one EVPN tenant. If none exist, create one using [Create a Tenant](./create-tenant.md) first.

## Open the service portal

Navigate to **`http://localhost:8501`**. From the sidebar, open **Add Network Segment**.

## Fill the form

The form has two columns:

| Left column | Right column |
|-------------|--------------|
| **Segment Name** — free text, for example, `web-services` | **VRF Name** — free text; leave blank to reuse an existing VRF |
| **Tenant** — dropdown of existing EVPN tenants | **VRF VNI** — number (1–16777215), default `100` |
| **VLAN ID** — number (1–4094), default `100` | **L2 Domain** — dropdown of available L2 domains |
| **Gateway IP (CIDR)** — for example, `10.10.100.1/24` | **Target Fabric** — dropdown of fabrics |

All fields are required except VRF Name (blank = use existing VRF, see below).

## Submit

Click **Create Network Segment**. The portal performs these steps in order, showing progress:

1. **Create branch** named `add-segment-<segment-name>`.
2. **Create the VLAN** (`IpamVLAN`) on the chosen L2 domain.
3. **Create the VRF** (`IpamVRF`) under the chosen tenant — only if you filled in VRF Name.
4. **Create the SVI** (`EvpnSvi`) linking the VLAN to the VRF with the specified gateway.
5. **Run the AVD pipeline** — hostvars and structured configs regenerate for affected devices. This can take a few minutes.
6. **Create a proposed change** summarising the segment.

When complete, you'll see a **View Proposed Change** button — click it to open the proposed change in the Infrahub UI.

:::note
If you left **VRF Name** blank, the SVI step is skipped and a warning is shown. You'll need to link the VLAN to an existing VRF manually in the Infrahub UI before the segment is usable.
:::

## Review and merge

In the proposed change:

1. Inspect the **Data** tab — see the three new objects (VLAN, VRF, SVI).
2. Inspect the **Artifacts** tab — the AVD EOS configurations for devices on the target fabric should have updated to include the new VLAN, VRF, and SVI.
3. Approve and **Merge** when the updated configs look correct.

Once merged, the segment exists on `main`, and Ansible inventories built from Infrahub include the new config on the next deployment.

## If the service portal is unavailable

You can do the same workflow in the Infrahub UI by creating the objects manually on a branch:

1. Create a branch.
2. Create an `IpamVLAN` on the target L2 domain.
3. Create an `IpamVRF` under the target tenant.
4. Create an `EvpnSvi` linking the two, with the gateway IP.
5. Run **`generate-avd-device-hostvar`** (per device) and **`generate-avd-device-structured-config`** (per fabric) from **Actions → Generator definitions**.
6. Create a proposed change from the branch.

See also [Common Issues](../troubleshooting.md) if a step fails.

## Source

Service-portal implementation: [`service_catalog/pages/1_Create_Segment.py`](https://github.com/opsmill/infrahub-arista-avd/blob/main/service_catalog/pages/1_Create_Segment.py).
