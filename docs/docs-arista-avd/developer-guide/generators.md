---
title: Generators
description: The infrastructure generators that create devices, interfaces, cabling, and AVD inputs.
audience: developer
sidebar_position: 3
---

# Generators

:::info Developer Guide
Explains how the generators are structured. To *run* generators as an operator, start with [Quick Start](../quick-start.md).
:::

## Overview

Generators create infrastructure objects based on templates and target objects. They run via the Infrahub UI or API and use checksums for idempotent execution.

## Generator architecture

Each generator consists of:

1. **Generator Class** (`generate_*.py`) - Python class extending `InfrahubGenerator`
2. **Query Class** (`*_query.py`) - Pydantic models for GraphQL response parsing
3. **GraphQL Query** (`*.gql`) - Query to fetch target data

```text
┌──────────────────┐     ┌────────────────────┐     ┌─────────────────┐
│  GraphQL Query   │ ──▶ │  Pydantic Parser   │ ──▶ │  Generator      │
│  (*.gql)         │     │  (*_query.py)      │     │  (generate_*.py)│
└──────────────────┘     └────────────────────┘     └─────────────────┘
```

## Device-design-driven generation

The fabric, pod, and rack generators take device counts and templates from their
container's `device_designs` relationship — not from per-role fields on the
container. Each design has a `role`, a `device_quantity`, and a
`device_template`; see [Schemas](schemas.md#device-design-entities--networkdevicedesign-generic)
for the entity itself.

Every generator resolves designs through the same `GeneratorMixin` helper:

```python
# Which super-spines should this fabric have?
template_id, quantity = self.device_design_for(fabric_node.device_designs, "super_spine")
```

`device_design_for` returns `(template_id, quantity)`, or `(None, 0)` when the
container has no design for that role. **Absence means none**: a rack with no
`l2leaf` design gets no L2 leaves, and the generator does not error. This
replaces the older "set the count to `0`" idiom.

Which role each tier reads:

| Generator | Container | Design roles read |
| --- | --- | --- |
| `FabricGenerator` | `NetworkFabric` | `super_spine` |
| `PodGenerator` | `NetworkPod` | `spine` |
| `RackGenerator` | `LocationRack` | `leaf`, `l2leaf` |

### Cross-tier completeness reads

A generator also reads the *upstream* container's designs to decide whether its
prerequisites exist yet, so a partially generated fabric defers instead of
producing a half-cabled topology:

- `PodGenerator` reads the fabric's `super_spine` design. If the fabric expects
  super-spines but they do not all exist yet, the pod generator waits rather
  than cabling spines to an incomplete super-spine layer. A fabric with no
  `super_spine` design skips super-spine uplinks entirely.
- `RackGenerator` reads the pod's `spine` design and compares it to the spines
  that exist, applying the same rule before cabling leaves upward.

These reads are why the generator `.gql` queries select `device_designs` on the
parent as well as on the target.

## Generators

### FabricGenerator

**File**: `generators/generate_fabric.py`

**Target**: `NetworkFabric`

**Purpose**: Initialize fabric infrastructure

**Actions**:

1. Resolve fabric-scoped pools
   - `loopback_pool` for device Loopback0 addresses
   - `vtep_pool` for VTEP loopback addresses
   - `mgmt_pool` for management addresses
   - `asn_pool` for BGP autonomous systems
   - `node_id_pool` for unique device identifiers
2. Create super-spine devices from the fabric's `super_spine` device design
3. Assign loopback IPs to super-spines

**Query**: `generate_fabric.gql`

```graphql
query FabricGenerator($fabric_id: String!) {
  NetworkFabric(ids: [$fabric_id]) {
    edges {
      node {
        id
        name { value }
        supernet_pool { value }
        # ... pool and template data
      }
    }
  }
}
```

### PodGenerator

**File**: `generators/generate_pod.py`

**Target**: `NetworkPod`

**Purpose**: Create pod infrastructure

**Actions**:

1. Create spine devices from the pod's `spine` device design
2. Link spines to super-spines
3. Allocate loopback IPs from pod pools
4. Set BGP ASN and node IDs

**Query**: `generate_pod.gql`

```graphql
query PodGenerator($pod_id: String!) {
  NetworkPod(ids: [$pod_id]) {
    edges {
      node {
        id
        name { value }
        fabric { node { ... } }
        # ... template and pool data
      }
    }
  }
}
```

### RackGenerator

**File**: `generators/generate_rack.py`

**Target**: `LocationRack`

**Purpose**: Create rack infrastructure

**Actions**:

1. Create leaf and L2-leaf devices from the rack's `leaf` / `l2leaf` device designs
2. Link leaves to pod spines
3. Allocate loopback IPs
4. Set BGP ASN and node IDs

**Query**: `generate_rack.gql`

```graphql
query RackGenerator($rack_id: String!) {
  LocationRack(ids: [$rack_id]) {
    edges {
      node {
        id
        name { value }
        pod { node { ... } }
        # ... device and link data
      }
    }
  }
}
```

### GenerateAVDDeviceHostvar

**File**: `generators/generate_avd_device_hostvar.py`

**Target**: `DcimDevice`

**Purpose**: Generate PyAVD hostvars for each device

**Actions**:

1. Extract device attributes (hostname, role, ASN, node ID)
2. Extract IP addresses (loopback, management)
3. Determine uplink topology by device role
4. Extract connected endpoints (servers with VLANs)
5. Validate optional EVPN Gateway group intent for `border_leaf` devices
6. Build PyAVD-compatible hostvars structure
7. Upload hostvars JSON to object store
8. Create/update AvdArtifact with checksum

**Query**: `avd_device_hostvar.gql`

For EVPN Multi-Domain Gateway hostvars, the query fetches `EvpnGatewayGroup.local_domain`, the selected `pod` and its `evpn_domain`, `remote_domain`, members, and peer candidate groups from `remote_domain.remote_gateway_groups`. The generator emits `l3leaf.nodes[].evpn_gateway` only for valid grouped `border_leaf` devices, rejects Pod/local-domain mismatches and same local/remote domain intent, validates the final payload with `pyavd.validate_inputs()`, and derives hostname-only remote peers from valid groups that share the selected remote domain.

### AvdDeviceStructuredConfigGenerator

**File**: `generators/generate_avd_device_structured_config.py`

**Target**: `NetworkFabric`

**Purpose**: Generate AVD structured configs for all fabric devices

**Actions**:

1. Traverse fabric hierarchy (pods → devices, racks → devices)
2. Fetch hostvars from object store for each device
3. Validate inputs with `pyavd.validate_inputs()`
4. Generate AVD facts with `pyavd.get_avd_facts()`
5. Generate structured config per device
6. Upload configs to object store
7. Update AvdArtifact with config identifier

**Query**: `generate_avd.gql`

### ServerCablingGenerator

**File**: `generators/generate_server_cabling.py`

**Target**: `ComputePhysicalServer` (group `servers`)

**Purpose**: Cable a server to the leaf switches in its rack, then reconcile its LAGs and VLANs

**Actions**:

1. Resolve the server's rack and find the `leaf` / `l2leaf` switches in it
2. Build sorted interface maps for the server and for the leaves' `role=server` interfaces
3. On first run, pick the next free port index across those leaves and create the links; on a
   re-run, rebuild the existing cabling plan instead of cabling again
4. For a dual-homed server, create the server-side `Bond1` and the switch-side
   `Port-Channel<ID>` LAGs, assign members, and set `evpn_ethernet_segment` when the pair is not
   MLAG-backed
5. Assign VLANs from server intent — on a single-homed server they stay on the physical interface,
   on a dual-homed server they are assigned to the LAG
6. Trigger AVD hostvar regeneration for the leaves the server connects to

**Query**: `generate_server_cabling.gql`

Because steps 3–5 run on every invocation, the generator is the reconciliation path as well as the
creation path: re-running it after a VLAN or LAG change updates an already-cabled server without
producing duplicate links. The operator-facing walkthrough is
[Add a Server](../how-to/add-server.md).

### BackfillStructuredConfigGenerator

**File**: `generators/backfill_structured_config.py`

**Target**: `AvdStructuredConfigFile` (group `avd_structured_configs`)

**Purpose**: Read AVD's structured-config output back into the Infrahub data model

**Actions**: Parse each device's stored structured config and upsert the objects it implies —
`IpamPrefix` and `IpamIPAddress` entries, `DcimInterface.mtu`, BGP peer groups and neighbors,
prefix lists, route maps, and static routes.

**Query**: `backfill_structured_config.gql`

This generator runs in the opposite direction to the rest of the chain: everything else turns intent
into AVD inputs, while the backfill turns AVD's derived output into queryable objects. Those objects
are reconciled *from* AVD, not authored as inputs — see
[Supported Capabilities](../supported-capabilities.md).

## Generator execution order

Run generators in this order for a new fabric:

```text
1. FabricGenerator     (on Fabric)
        ↓
2. PodGenerator        (on each Pod)
        ↓
3. RackGenerator       (on each Rack)
        ↓
4. AVD Hostvars        (on each Device)
        ↓
5. AVD Structured Cfg  (on Fabric)
```

For an existing fabric, `generate-fabric` is also the reconciliation entry point.
Checksum changes still drive the existing trigger rules: a changed pod checksum
fires `generate-pod`, and a changed rack checksum fires `generate-rack`. When a
pod or rack checksum is already current, the upstream generator explicitly
continues the cascade with `CoreGeneratorDefinitionRun` targeted to the unchanged
node IDs. This keeps repeated fabric runs from faking checksum churn while still
reaching pod, rack, hostvar, and structured-config generation.

The fabric generator skips direct continuation for the fabric-role pod because
that pod is owned by `FabricGenerator` for super-spine creation. Pod generation
uses the same pattern for racks: changed racks rely on checksum-trigger saves;
unchanged racks are scheduled directly.

Device reconciliation is fill-only by default. `GeneratorMixin.create_avd_device()`
fetches any existing device by name before building the upsert payload, then
populates missing generator-owned values such as status, role, object template,
pod, rack, index, AVD group membership, node ID, management IP, loopback IP,
VTEP loopback IP, and ASN. Existing non-empty operator values, including
`serial` and `mgmt_ip`, are preserved during standard generation.

## Running generators

### Via Infrahub UI

1. Navigate to target object (Fabric, Pod, Rack, or Device)
2. Click **Actions** → **Generator definitions**
3. Select the generator
4. Click **Run**

### Via infrahubctl CLI

The CLI takes the generator name followed by `key=value` variables — the parameters declared for
that generator in `.infrahub.yml`. Every generator here is parameterised by `name`, so the value is
the target object's name, not its ID:

```bash
uv run infrahubctl generator generate-fabric name=Fabric-L3LS-MultiPod-A --branch <branch-name>
uv run infrahubctl generator generate-pod name=Pod-A2 --branch <branch-name>
uv run infrahubctl generator generate-rack name=Rack-A2-1 --branch <branch-name>
uv run infrahubctl generator generate-avd-device-hostvar name=leaf-pod-a2-1-1 --branch <branch-name>

# List the generators the repository defines
uv run infrahubctl generator --list
```

`backfill-structured-config` is the exception: its parameter is the artifact name
(`artifact__name__value`), still passed as `name=`.

## GeneratorMixin

All generators use `GeneratorMixin` from `src/solution_arista_avd/generator.py`:

```python
class GeneratorMixin:
    def calculate_checksum(self, related_node_ids: list[str]) -> str:
        """
        Calculate deterministic checksum from related node IDs.
        Used to detect when regeneration is needed.
        """
        sorted_ids = sorted(related_node_ids)
        combined = "".join(sorted_ids)
        return hashlib.sha256(combined.encode()).hexdigest()

    @classmethod
    def device_design_for(cls, device_designs, role) -> tuple[str | None, int]:
        """
        Return (template_id, quantity) for one role's device design,
        or (None, 0) when the container has no design for that role.
        """

    async def assign_mlag_peer_interfaces(
        self, device, count=2, carvable_roles=frozenset({"server", "mlag_peer"})
    ) -> None:
        """
        Repurpose a device's highest-numbered carvable ports as its MLAG
        peer-link, for switch models that ship no dedicated mlag_peer
        interfaces. Deterministic (ordered by the interface's computed
        `index`) and idempotent, so a re-run converts nothing further.
        Used by the rack generator for l2leaf pairs and the pod generator
        for the l2spine pair.
        """
```

Usage in generator:

```python
class FabricGenerator(GeneratorMixin, InfrahubGenerator):
    async def generate(self, data):
        # Calculate checksum from related nodes
        new_checksum = self.calculate_checksum([
            pod.id for pod in data.pods
        ])

        # Skip if unchanged
        if new_checksum == data.checksum:
            return

        # ... generate infrastructure ...

        # Update checksum
        data.checksum = new_checksum
        await data.save()
```

## Query classes (Pydantic)

Each generator has a corresponding query class for type-safe parsing. **These `*_query.py` files are generated, not hand-written** — regenerate them whenever the `.gql` query or the schema changes:

```bash
uv run infrahubctl graphql generate-return-types generators/generate_fabric.gql
```

This reads `schema.graphql` at the repo root (refresh with `uv run infrahubctl graphql export-schema --destination schema.graphql` when needed) and emits the matching `*_query.py` next to the query file.

Shape of a typical generated class:

```python
# generators/fabric_generator_query.py  (generated)

from pydantic import BaseModel

class FabricNode(BaseModel):
    id: str
    name: ValueWrapper[str]
    supernet_pool: ValueWrapper[str]
    pods: EdgesWrapper[PodNode]

class FabricGeneratorQuery(BaseModel):
    NetworkFabric: EdgesWrapper[FabricNode]
```

## Configuration

Generators are registered in `.infrahub.yml`:

```yaml
generator_definitions:
  - name: generate-fabric
    file_path: "./generators/generate_fabric.py"
    class_name: FabricGenerator
    targets: fabrics
    query: generate_fabric

  - name: generate-pod
    file_path: "./generators/generate_pod.py"
    class_name: PodGenerator
    targets: pods
    query: generate_pod

  - name: generate-rack
    file_path: "./generators/generate_rack.py"
    class_name: RackGenerator
    targets: racks
    query: generate_rack

  - name: generate-server-cabling
    file_path: "./generators/generate_server_cabling.py"
    class_name: ServerCablingGenerator
    targets: servers
    query: generate_server_cabling

  - name: backfill-structured-config
    file_path: "./generators/backfill_structured_config.py"
    class_name: BackfillStructuredConfigGenerator
    targets: avd_structured_configs
    query: backfill_structured_config
```

The AVD generators are registered in the same block; the file is the authoritative list of all seven.

## Pool resolution

The fabric, pod, rack, and hostvars generators consume role-driven pool collections first. `NetworkFabric.fabric_ip_pools` supplies fabric Management, Loopback, Loopback VTEP, Fabric Point-to-Point, DCI, and Fabric Supernet roles. `NetworkPod.pod_ip_pools` can override pod-specific Loopback, Loopback VTEP, and Fabric Point-to-Point pools.

If a required fabric prefix pool is missing and a Fabric Supernet pool exists, `GeneratorMixin` creates deterministic fallback prefix pools with stable names such as `<fabric>-Loopback-Pool`, then wraps Loopback and VTEP prefix pools in address pools for device allocation. Repeated runs upsert the same names.

The hostvars generator resolves MLAG and MLAG Peering from `pod_ip_pools`, then legacy pod relationships, then pod-scoped default pools named `<pod>-MLAG-Peer-Subnet` and `<pod>-MLAG-L3-Peering-Subnet`. Each pod is allocated its own child prefix — a `/24` from `169.254.0.0/16` for the peer-link, a `/28` from `192.0.0.0/24` for L3 peering — because PyAVD carves a `/31` per MLAG pair out of the pool, and MLAG L3 peering addresses are advertised into the underlay. Treat the L3 peering default as a safety net, not a design: define an explicit `mlag_peering` pool.

## File structure

```text
generators/
├── generate_fabric.py              # Fabric generator class
├── generate_fabric.gql             # Fabric GraphQL query
├── fabric_generator_query.py       # Fabric Pydantic models
├── generate_pod.py                 # Pod generator class
├── generate_pod.gql                # Pod GraphQL query
├── pod_generator_query.py          # Pod Pydantic models
├── generate_rack.py                # Rack generator class
├── generate_rack.gql               # Rack GraphQL query
├── rack_generator_query.py         # Rack Pydantic models
├── generate_avd_device_hostvar.py  # AVD hostvars generator
├── avd_device_hostvar.gql          # AVD device query
├── generate_avd_device_structured_config.py  # AVD structured config
├── generate_avd.gql                # AVD fabric query
├── generate_avd_inputs_query.py    # AVD fabric Pydantic models
├── generate_avd_device_inputs_query.py  # AVD device Pydantic models
├── generate_server_cabling.py      # Server cabling generator
├── generate_server_cabling.gql     # Server cabling query
├── server_cabling_query.py         # Server cabling Pydantic models
├── backfill_structured_config.py   # Structured-config backfill generator
├── backfill_structured_config.gql  # Backfill query
└── backfill_structured_config_query.py  # Backfill Pydantic models
```

## Source

- Generator framework: [`src/solution_arista_avd/generator.py`](https://github.com/opsmill/infrahub-arista-avd/blob/main/src/solution_arista_avd/generator.py) — `GeneratorMixin` with checksum-based change detection.
- Infrastructure generators:
  - [`generators/generate_fabric.py`](https://github.com/opsmill/infrahub-arista-avd/blob/main/generators/generate_fabric.py) — `FabricGenerator`.
  - [`generators/generate_pod.py`](https://github.com/opsmill/infrahub-arista-avd/blob/main/generators/generate_pod.py) — `PodGenerator`.
  - [`generators/generate_rack.py`](https://github.com/opsmill/infrahub-arista-avd/blob/main/generators/generate_rack.py) — `RackGenerator`.
  - [`generators/generate_server_cabling.py`](https://github.com/opsmill/infrahub-arista-avd/blob/main/generators/generate_server_cabling.py) — `ServerCablingGenerator`.
  - [`generators/backfill_structured_config.py`](https://github.com/opsmill/infrahub-arista-avd/blob/main/generators/backfill_structured_config.py) — `BackfillStructuredConfigGenerator`.
- AVD generators (documented in detail in the [AVD Pipeline sub-section](./avd/overview.md)):
  - [`generators/generate_avd_device_hostvar.py`](https://github.com/opsmill/infrahub-arista-avd/blob/main/generators/generate_avd_device_hostvar.py) — `GenerateAVDDeviceHostvar`.
  - [`generators/generate_avd_device_structured_config.py`](https://github.com/opsmill/infrahub-arista-avd/blob/main/generators/generate_avd_device_structured_config.py) — `AvdDeviceStructuredConfigGenerator`.
- Registration: [`.infrahub.yml`](https://github.com/opsmill/infrahub-arista-avd/blob/main/.infrahub.yml) — `generator_definitions:` block.
- Tests: [`tests/unit/`](https://github.com/opsmill/infrahub-arista-avd/tree/main/tests/unit) and [`tests/integration/`](https://github.com/opsmill/infrahub-arista-avd/tree/main/tests/integration).
