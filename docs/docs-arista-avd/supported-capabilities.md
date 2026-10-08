---
title: Supported capabilities
description: The AVD scenarios, services, artifacts, and workflows this Arista AVD reference design supports today.
---

# Supported capabilities

This is a **reference design** that covers a defined set of AVD capabilities on Infrahub. This page lists what it supports today; use it to check a capability before planning a deployment. PyAVD inputs that are not listed here can be passed through the `avd_custom_hostvars` attribute, described in the [developer guide](./developer-guide/avd/extending.md).

## AVD example scenarios

The reference design ships a loadable fabric for each of these official [AVD example designs](https://avd.arista.com/6.2/ansible_collections/arista/avd/examples/index.html). Every device in these fabrics renders a valid PyAVD EOS configuration on a fresh instance.

| AVD example scenario | Fabric | Design |
|----------------------|--------|--------|
| Single-DC L3LS | `Fabric-L3LS` | eBGP underlay, EVPN/VXLAN L3LS. |
| Single-DC Multi-Pod L3LS (5-stage Clos) | `Fabric-L3LS-MultiPod-A` | 6 super-spines + 3 pods; super-spines as EVPN route servers; tenants as VLAN-aware bundles (`evpn_vlan_aware_bundles`). |
| Dual-DC L3LS | `Fabric-L3LS-Multi-Domain` | EVPN DC Gateway (next-hop-self) + DCI `l3_edge` p2p links, via `avd_custom_hostvars`. |
| L2LS fabric (standalone) | `Fabric-L2LS` | Underlay `none` → `l2spine` + `l2leaf`, pure Layer-2 (no VNI/VXLAN/EVPN), MLAG on both tiers, two MLAG rack pairs. Tag-scoped VLANs `BLUE-NET`/`GREEN-NET`/`ORANGE-NET` and per-tier MSTP priorities (l2spine 4096 / l2leaf 16384). Host endpoints sit on leaf access ports through per-color access profiles (one untagged VLAN each, PortFast `edge`). |
| Campus fabric | `Fabric-Campus` | Underlay `ospf` → `l3spine` core with anycast SVIs (`Evpn.Svi`) + `l2leaf` access; dot1x/PoE via `avd_custom_hostvars`. |
| ISIS-LDP IPVPN | `Fabric-ISIS-LDP` | Underlay `isis-ldp` → `p` core + `pe` edge; per-customer L3VPN VRFs (`Evpn.Tenant`/`Ipam.VRF`). |

The fabric `underlay_routing_protocol` attribute selects the design, and the pod and rack generators map it to the matching device roles.

Services in every design use the same objects: `Ipam.VLAN`, `Evpn.Tenant`, `Ipam.VRF`, and `Evpn.Svi`. The EVPN DC Gateway remote peers and campus dot1x/PoE settings are passed through `avd_custom_hostvars`.

## Fabric generation

| Capability | Notes |
|------------|-------|
| Generate a full fabric (Fabric → Pod → Rack → Device) from a design | Super-spines, spines, and leaves are created from device templates, with no per-device host_vars written by hand. |
| Cable devices together automatically | The generators create uplinks and device-to-device links. |
| Regenerate idempotently | Checksum-based change detection skips work when nothing changed, so re-running is safe. |

## Addressing & numbering

| Capability | Notes |
|------------|-------|
| Allocate loopback, interconnect, and management prefixes/IPs from pools | Drawn from branch-aware pools so parallel work does not collide. |
| Allocate DCI point-to-point /31 prefixes from fabric DCI pool roles | Generated DCI `l3_edge` addressing resolves from `NetworkFabric.fabric_ip_pools` role `dci` first, legacy `NetworkFabric.dci_pool` second, and a deterministic Fabric Supernet fallback when the DCI prefix-pool role is missing. |
| Allocate BGP ASNs and node IDs from pools | Assigned automatically during generation. |

<!-- vale Google.Headings = NO -->
<!-- Every word here is an accepted acronym, but Vale still reads the heading as
     title case. Scoped off rather than reworded, so the published anchor is
     unchanged. -->
## Services (VLAN / EVPN / VRF / MLAG / LAG / routing)
<!-- vale Google.Headings = YES -->

| Capability | Notes |
|------------|-------|
| VLANs and L2 domains | Defined in Infrahub and rendered into the configuration. |
| Fabric-level EVPN settings | The fabric sets the underlay protocol (eBGP, OSPF, ISIS-LDP, or none), the overlay protocol (eBGP or iBGP), VLAN-aware bundles, the virtual router MAC address, the uplink MTU, and the spanning-tree mode. Super-spines act as EVPN route servers. |
| EVPN L3 VRFs | Each tenant VRF renders with its VRF VNI, anycast SVIs, and VTEP diagnostic loopback. |
| Route distinguishers and route targets | AVD derives them automatically for each VRF. |
| EVPN Multi-Domain Gateway on border leafs | Fabric-owned `EvpnDomain` objects hold local `EvpnGatewayGroup` children for `border_leaf` devices, which render as PyAVD EVPN Gateway settings for All-Active Multihoming. Each pod points at its group's local domain. |
| DCI links between border leafs | `NetworkLink` objects with `role=dci` reuse shared physical endpoints and render as PyAVD `l3_edge.p2p_links`. |
| MLAG | An MLAG domain sets the domain ID, the two peers, the shared BGP ASN, and an optional virtual router MAC address. Peer-link interfaces come from interfaces with the `mlag_peer` role, and peer addressing comes from the pod MLAG pools. Applies to leaf and border leaf, and to l2leaf, l2spine, and l3spine in L2LS, campus, and ISIS-LDP fabrics. |
| Server LAG | Server port-channels render with the LACP mode (active, passive, or static), the channel ID, and trunk or access VLANs. A LAG that spans two non-MLAG switches can use EVPN all-active multihoming with an automatically derived ESI. |
| BGP peer groups | AVD creates the underlay, overlay, and MLAG peer groups. The fabric sets a password for each of the three. |
| Prefix lists, route maps, static routes | The backfill generator records the prefix lists, route maps, and static routes from the AVD output in Infrahub. |

## Rendering & artifacts

| Capability | Notes |
|------------|-------|
| Render Arista EOS device configurations (PyAVD) | Deploy-ready per-device EOS CLI, as downloadable artifacts. |
| Fabric and per-device documentation (Markdown) | Generated from the same data as the configuration. |
| Cabling plan (CSV) | One row per connection for the field/cabling team. |
| Computed interface descriptions | Consistent interface descriptions, updated automatically. |
| ANTA test catalog (per device, YAML) | Generated when the fabric `anta_enabled` flag is set. |

## Validation (ANTA)

| Capability | Notes |
|------------|-------|
| ANTA test-catalog generation | The `avd_anta_catalog` transform runs when `anta_enabled` is set; fabric-level `avd_catalogs_filters` can exclude named tests. |
| On-demand ANTA execution | After deployment, the **Validate with ANTA** Semaphore task scopes the Infrahub `main` inventory to one fabric, fetches each device catalog, and writes JSON, Markdown, and CSV reports. See [Run ANTA after deployment](./how-to/run-anta-after-deployment.md). |

## Validation (CloudVision)

| Capability | Notes |
|------------|-------|
| CloudVision config validation in a proposed change | The `cv-config-validation` check deploys the rendered configs to a CloudVision workspace and blocks the proposed change on a failed build. Opt in per fabric with `cloudvision_managed`. See [CloudVision Validation](./cloudvision.md). |
| Workspace tracking and review link | Each workspace is recorded as a `CloudvisionWorkspace` object and its URL posted to the proposed change. |
| Workspace submission | A `CoreCustomWebhook` sends the submission when the proposed change merges, or you run `invoke submit-cv-workspace`. Point the webhook at your own automation endpoint. |

## Lab

| Capability | Notes |
|------------|-------|
| ContainerLab topology per fabric | The `containerlab_topology` artifact renders the devices and links of L3LS, L2LS, and campus fabrics; kinds, images, and interface mappings come from schema attributes. See [ContainerLab](./containerlab.md). |
| Deploying the generated topology | `ansible/deploy_clab.yml` stages the topology, EOS configs, and bind sources on a ContainerLab host and deploys them. The Semaphore template fetches and stages the files. |

## Deployment

| Capability | Notes |
|------------|-------|
| Deploy configurations to devices | Through the bundled Ansible runner or CloudVision (CVP/CVaaS). |

## Interfaces & change management

| Capability | Notes |
|------------|-------|
| Self-service portal (Streamlit) for guided provisioning | Alongside the Infrahub Web UI, GraphQL API, and MCP. |
| Branches, proposed changes, approvals, full lineage | Standard Infrahub change management. |
| Brownfield import | Modeling an existing fabric and importing configs through Infrahub Sync is available as a guided engagement. |

## Fabric pool management

| Capability | Notes |
|------------|-------|
| Role-driven fabric pool collection | `NetworkFabric.fabric_ip_pools` covers Management, Loopback, Loopback VTEP, Fabric Point-to-Point, DCI, and Fabric Supernet roles. |
| Pod-scoped pool collection and containment validation | `NetworkPod.pod_ip_pools` supports pod Loopback, VTEP, Fabric Point-to-Point, MLAG, and MLAG Peering roles with parent-fabric containment checks. |
| Legacy pool migration compatibility | Legacy fabric and pod pool relationships remain optional, and the seed data populates both the legacy and the new relationships. |
| Deterministic fallback/default pools | The Fabric Supernet fallback creates stable prefix pools; MLAG defaults use stable `/31` pool objects. |
