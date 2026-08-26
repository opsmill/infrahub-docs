---
title: Create a tenant
description: Create an EVPN tenant with a MAC VRF VNI base allocation for one or more fabrics.
audience: user
sidebar_position: 3
---

# Create a tenant

Creates a new EVPN tenant. A tenant is a logical container that network segments (VLANs, VRFs, SVIs) are attached to. Each tenant has a **MAC VRF VNI base** — VLAN VNIs are then computed as `base + VLAN ID`, giving every segment a unique VNI without manual allocation.

Prerequisites:

- A running stack with seed data loaded ([Quick Start](../quick-start.md)).
- At least one provisioned fabric ([Provision Your First Fabric](../provision-first-fabric.md)).

## Open the service portal

Navigate to **`http://localhost:8501`**. From the sidebar, open **Create Tenant**.

## Fill the form

| Field | Description |
|-------|-------------|
| **Tenant Name** | Free text, for example, `ACME-Corp`. |
| **MAC VRF VNI Base** | Number (1–16,777,000), default `20000`. VLAN VNI = base + VLAN ID, so pick a base that leaves enough headroom. `20000` supports VLANs 1–4094 without overlapping another base of `25000`, for example. |
| **Target Fabrics** | Multi-select of existing fabrics. The tenant is associated with every fabric you select; network segments can then be created on any of them. Defaults to the first fabric. |

## Submit

Click **Create Tenant**. The portal performs:

1. **Create branch** named `add-tenant-<tenant-name>`.
2. **Create the tenant** (`EvpnTenant`) with the chosen VNI base and linked fabrics.
3. **Run the AVD pipeline** — hostvars and structured configs regenerate for devices on the selected fabrics. This can take a few minutes on larger fabrics.
4. **Create a proposed change** summarising the tenant.

Click **View Proposed Change** when done.

## Review and merge

The tenant itself doesn't add device-level configuration (no VRFs or VLANs have been created yet), so the updated AVD artifacts may be near-identical to before. The tenant becomes useful once you add network segments under it (see [Add a Network Segment](./add-network-segment.md)).

Merge the proposed change to promote the tenant to `main`.

## Picking a VNI base

If you'll only have one tenant ever, `20000` is fine.

For multiple tenants, reserve non-overlapping ranges:

| Tenant | Base | Effective range (assuming VLANs 1–4094) |
|--------|------|-----------------------------------------|
| tenant-a | 20000 | 20001 – 24094 |
| tenant-b | 25000 | 25001 – 29094 |
| tenant-c | 30000 | 30001 – 34094 |

This avoids VNI collisions across tenants on the same fabric.

## If the service portal is unavailable

In the Infrahub UI:

1. Create a branch.
2. Create an `EvpnTenant` object. Set `name`, `mac_vrf_vni_base`, and link to the target fabrics.
3. Run **`generate-avd-device-hostvar`** (per device on each target fabric) and **`generate-avd-device-structured-config`** (per fabric).
4. Open a proposed change from the branch.

## Source

Service-portal implementation: [`service_catalog/pages/3_Create_Tenant.py`](https://github.com/opsmill/infrahub-arista-avd/blob/main/service_catalog/pages/3_Create_Tenant.py).
