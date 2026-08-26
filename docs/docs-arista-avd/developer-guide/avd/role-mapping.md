---
title: Role mapping
description: Infrahub device roles mapped to PyAVD device types.
audience: developer
sidebar_position: 5
---

# Role mapping

:::info Developer Guide
Role names are **PyAVD-version-sensitive** — see the [overview](./overview.md#pyavd-version) for the pinned version.
:::

Infrahub's `DcimDevice.role.value` is a string enum that the hostvars generator maps to a PyAVD `type`. The mapping lives in [`src/solution_arista_avd/avd.py`](https://github.com/opsmill/infrahub-arista-avd/blob/main/src/solution_arista_avd/avd.py):

## Table

| Infrahub role | PyAVD `type` | Primary scenario |
|---------------|--------------|------------------|
| `super_spine` | `super-spine` | L3LS, 5-stage Clos |
| `spine` | `spine` | L3LS |
| `leaf` | `l3leaf` | L3LS |
| `border_leaf` | `l3leaf` | Dual-DC (DCI) |
| `l2leaf` | `l2leaf` | L3LS access, L2LS access, campus access |
| `l2spine` | `l2spine` | Standalone L2LS fabric |
| `l3spine` | `l3spine` | L2LS (L3 variant), campus core |
| `p` | `p` | ISIS-LDP IPVPN (provider core) |
| `pe` | `pe` | ISIS-LDP IPVPN (provider edge) |
| `rr` | `rr` | ISIS-LDP IPVPN route reflector |

All PyAVD `type` values above are valid entries in the pinned PyAVD default `node_type_keys`. Roles beyond `l3leaf`/`l2leaf` are the schema anchors for the AVD example scenarios; the scenario-specific rendering behaviour is delivered either natively or through the `avd_custom_hostvars` escape hatch — see [Extending the Pipeline](./extending.md).

## The mapping in code

```python
# src/solution_arista_avd/avd.py
ROLE_TO_AVD_TYPE: dict[str, str] = {
    "super_spine": "super-spine",
    "spine": "spine",
    "leaf": "l3leaf",
    "border_leaf": "l3leaf",
    "l2leaf": "l2leaf",
    "l2spine": "l2spine",
    "l3spine": "l3spine",
    "p": "p",
    "pe": "pe",
    "rr": "rr",
}


def get_avd_type(role: str) -> str:
    if role not in ROLE_TO_AVD_TYPE:
        msg = f"Unknown device role: {role}"
        raise ValueError(msg)
    return ROLE_TO_AVD_TYPE[role]
```

An unrecognized role raises `ValueError` at generation time — Phase 1 fails for that device.

## Underlay-driven role selection

The four non-L3LS example designs do not set spine/leaf roles manually. Instead the upstream generator derives them from the **fabric underlay**, so the same spine/leaf topology renders different device types per design:

| Fabric underlay | Spine-tier role | Leaf-tier role | Example design |
|-----------------|-----------------|----------------|----------------|
| `none` | `l2spine` | `l2leaf` | Standalone L2LS |
| `ospf` | `l3spine` | `l2leaf` | Campus |
| `isis-ldp` | `p` | `pe` | MPLS ISIS-LDP IPVPN |

These come from `SPINE_ROLE_BY_UNDERLAY` and `LEAF_ROLE_BY_UNDERLAY` in [`avd.py`](https://github.com/opsmill/infrahub-arista-avd/blob/main/src/solution_arista_avd/avd.py). The selection is **gated to non-L3LS underlays only**: a routed L3LS fabric (underlay `ebgp`) is not in either map, so it falls back to the default `spine` / `leaf` roles.

## MLAG in non-L3LS designs

`MLAG_MAIN_TIER_ROLES` (`l2leaf`, `l2spine`, `l3spine`) is the main tier of the non-L3LS designs that forms MLAG pairs. When the fabric underlay is one of `SPINE_UPLINK_UNDERLAYS` (`none`, `ospf`, `isis-ldp`), devices in these roles render node-group / peer-link / MLAG-domain configuration — the same as the L3LS leaf family. The gate leaves the L3LS access-tier `l2leaf` (pure access under EVPN) unaffected.

Which generator forms the pair depends on the tier:

| Tier | Generator | Peer-link source |
|------|-----------|------------------|
| `l2leaf` (rack tier) | `generate-rack` | Highest-numbered free access ports — the `arista-7050sx3-48yc8c` l2leaf model ships no dedicated `mlag_peer` interfaces |
| `l2spine` (pod tier, underlay `none`) | `generate-pod` | Highest-numbered free **super-spine-facing** ports, unused in a standalone L2LS fabric (it has no super-spines) |

Both go through the shared `assign_mlag_peer_interfaces` helper on the generator mixin, so the choice is deterministic (ordered by the interface's computed `index`) and idempotent — a re-run converts nothing further. The l2spine pair has **no BGP ASN**: a pure Layer-2 tier runs no BGP.

## Per-tier spanning-tree priorities

`Network.SpanningTreePriority` links a fabric to a per-role MSTP priority. Its `role` dropdown covers `super_spine`, `spine`, `leaf`, `l2leaf` and — for the non-L3LS designs — `l2spine` and `l3spine`. The L2LS example sets `l2spine: 4096` / `l2leaf: 16384`, which the hostvars generator emits as each tier's `spanning_tree_priority`.

## Role implications

The role governs these downstream behaviors in the hostvars generator and in PyAVD itself:

| Role | Uplink source | Gets EVPN data? | MLAG? |
|------|---------------|----------------|-------|
| `super_spine` | — (top of fabric) | No | No |
| `spine` | `super_spine` | No | No |
| `leaf` | `spine` | Yes | Yes (if peer set) |
| `border_leaf` | `spine` | Yes, including DCI links and EVPN Gateway when the device is a member of an `EvpnGatewayGroup` | Yes (if peer set) |
| `l2leaf` | `leaf` | No (skipped) | Yes (if peer set) |

See [Hostvars Reference](./hostvars.md) for exactly which fields each role emits.

## Tests

The role mapping is exercised by:

- [`tests/unit/test_avd.py`](https://github.com/opsmill/infrahub-arista-avd/blob/main/tests/unit/test_avd.py) — covers `get_avd_type()` for each role and the `ValueError` on unknown roles.

## Adding a new role

See [Extending the Pipeline → Add a new device role](./extending.md#add-a-new-device-role).
