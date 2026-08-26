---
title: Architecture overview
description: System architecture and data flow for the Infrahub Arista AVD solution.
audience: developer
sidebar_position: 1
---

# Architecture overview

:::info Developer Guide
Assumes familiarity with Infrahub and Python. If you only want to *use* the system, start with [Quick Start](../quick-start.md).
:::

The solution is a repository of schemas, generators, and transforms loaded on top of the Infrahub platform. The sections below cover its components, data model, and the generator and transform pipelines.

## System components

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                           Infrahub Platform                              │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐  │
│  │   Neo4j Graph   │  │   PostgreSQL    │  │   Object Store          │  │
│  │   Database      │  │   (Metadata)    │  │   (Hostvars, Configs)   │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────┘  │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐  │
│  │   Redis Cache   │  │   RabbitMQ      │  │   Infrahub Server       │  │
│  │                 │  │   (Queue)       │  │   (API + Git Backend)   │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        Repository Solution                               │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐  │
│  │     Schemas     │  │   Generators    │  │   Transforms            │  │
│  │   (YAML DSL)    │  │   (Python)      │  │   (Python + Jinja2)     │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────┘  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐  │
│  │  Object Data    │  │     Queries     │  │   Core Library          │  │
│  │   (Seed YAML)   │  │    (GraphQL)    │  │   (src/solution_arista_avd)  │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

## Data model hierarchy

The system models a 3-tier datacenter network fabric:

```text
NetworkFabric (e.g., "Fabric-L3LS-MultiPod-A")
├── NetworkPod (e.g., "Pod-A1", "Pod-A2")
│   ├── LocationRack (e.g., "Rack-A1-01", "Rack-A1-02")
│   │   └── DcimDevice [leaf] (e.g., "leaf-A1-01-1")
│   │       └── InterfacePhysical (e.g., "Ethernet1")
│   │           ├── NetworkLink → remote interface
│   │           └── IpamIPAddress
│   └── DcimDevice [spine] (e.g., "spine-A1-1")
└── DcimDevice [super_spine] (e.g., "ss-A-1")
```

## IP address management

Fabric-level pool allocation:

```text
NetworkFabric
├── loopback_pool: CoreIPPrefixPool
│   └── Internal CoreIPAddressPool wrapper: Loopback0 addresses
├── vtep_pool: CoreIPPrefixPool
│   └── Internal CoreIPAddressPool wrapper: VTEP loopback addresses
├── uplink_pool: CoreIPPrefixPool
│   └── Prefix allocations for point-to-point links
├── mgmt_pool: CoreIPAddressPool
│   └── OOB management addresses
├── CoreNumberPool: ASN Pool (65000-65999)
│   └── Tier-aware eBGP ASN allocation: shared super-spine ASN per fabric, shared spine ASN per pod, leaf ASNs per device or MLAG domain
└── CoreNumberPool: Node ID Pool (1-65535)
    └── Per-device unique identifier
```

## Generator pipeline

Generators run in sequence to build infrastructure:

```text
┌─────────────────────────┐
│  1. FabricGenerator     │  Triggered on: NetworkFabric
│  - Resolve fabric pools │  Creates: Super-spine devices
│  - Create super-spines  │
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│  2. PodGenerator        │  Triggered on: NetworkPod
│  - Create spine devices │  Creates: Spine switches
│  - Link to super-spines │
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│  3. RackGenerator       │  Triggered on: LocationRack
│  - Create leaf devices  │  Creates: Leaf switches
│  - Link to spines       │
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│  4. AVD Generators      │  Triggered on: NetworkFabric/Device
│  - Build hostvars       │  Creates: AVD configs
│  - Generate struct cfg  │
└─────────────────────────┘
```

Two further generators sit outside this chain:

- **`ServerCablingGenerator`** (on `ComputePhysicalServer`) cables a server to the leaves in its rack, then reconciles its LAGs and VLANs and re-triggers hostvar generation for those leaves.
- **`BackfillStructuredConfigGenerator`** (on `AvdStructuredConfigFile`) runs in the opposite direction, reading AVD's structured-config output back into IPAM, interface, BGP, and routing objects.

See [Generators](./generators.md).

## Transform pipeline

Transforms convert data to artifacts:

```text
┌──────────────────┐     ┌────────────────────┐     ┌─────────────────┐
│  GraphQL Query   │ ──▶ │  Transform Logic   │ ──▶ │  Output Artifact│
│  (Data Fetch)    │     │  (Python/Jinja2)   │     │  (Config/Doc)   │
└──────────────────┘     └────────────────────┘     └─────────────────┘

Examples:
- DcimInterface → ComputedInterfaceDescription → "→ device:interface"
- NetworkFabric → CablingPlan → CSV cabling matrix
- DcimDevice → AvdEosConfig → EOS CLI configuration
- NetworkFabric → AvdFabricDoc → Markdown documentation
- DcimDevice → AvdAntaCatalog → ANTA test catalog (YAML)
- NetworkFabric → ContainerLabTopology → ContainerLab topology (YAML)
```

## Validation pipeline

Alongside transforms, proposed-change validation runs **checks** — Python routines that report pass, information, or error rather than producing an artifact. The repository ships one, `cv-config-validation`, which deploys the rendered EOS configs into a CloudVision workspace and blocks the proposed change on a failed build. See [Checks](./checks.md).

## Checksum-based change detection

Generators use checksums to avoid redundant regeneration:

```python
class GeneratorMixin:
    def calculate_checksum(self, related_node_ids: list[str]) -> str:
        """Create deterministic hash from related node IDs"""
        return hashlib.sha256("".join(sorted(related_node_ids))).hexdigest()

# Usage in generator:
new_checksum = self.calculate_checksum([pod.id, device.id, ...])
if new_checksum != target.checksum:
    # Regenerate
    target.checksum = new_checksum
```

## Configuration files

| File | Role |
|------|------|
| `.infrahub.yml` | Register queries, generators, transforms, artifacts |
| `repository.yml` | Define repository as CoreRepository in Infrahub |
| `docker-compose.yml` | Orchestrate Infrahub services |
| `pyproject.toml` | Python dependencies and tool configuration |

## Docker service stack

```yaml
services:
  infrahub-server:    # Main API server
  infrahub-git:       # Git backend for repository
  infrahub-worker:    # Async task execution
  neo4j:              # Graph database
  postgres:           # Relational metadata
  redis:              # Cache layer
  rabbitmq:           # Message queue
```

## Development workflow

```text
1. Edit schema (schemas/*.yml)
        ↓
2. Load schema: inv load-schema
        ↓
3. Edit generator/transform code
        ↓
4. Test: pytest tests/
        ↓
5. Lint: inv lint
        ↓
6. Reload: inv load
        ↓
7. Run generators via UI
```

## Pool role resolution

Fabric and pod IP pool intent is role-driven. `NetworkFabric.fabric_ip_pools` is the authoritative fabric collection for Management, Loopback, Loopback VTEP, Fabric Point-to-Point, DCI, and Fabric Supernet roles. `NetworkPod.pod_ip_pools` is the authoritative pod collection for pod-scoped Loopback, Loopback VTEP, Fabric Point-to-Point, MLAG, and MLAG Peering roles.

Validation resolves a pool's purpose from the roles on its backing `IpamPrefix` resources. The proposed-change check rejects duplicate authoritative roles, mixed-role pools, non-IP pool members, pod management pools, and pod prefixes that are not contained by the matching parent fabric pool.

During migration, legacy fabric and pod pool relationships are still present and object data is dual-populated. Generators prefer collection relationships and fall back to legacy relationships only when needed.

## Source

- Infrahub configuration: [`.infrahub.yml`](https://github.com/opsmill/infrahub-arista-avd/blob/main/.infrahub.yml) — the queries, generators, transforms, and artifact definitions registered with Infrahub.
- Schemas: [`schemas/`](https://github.com/opsmill/infrahub-arista-avd/tree/main/schemas) — the data model.
- Generators: [`generators/`](https://github.com/opsmill/infrahub-arista-avd/tree/main/generators) — Python generator classes.
- Transforms: [`transforms/`](https://github.com/opsmill/infrahub-arista-avd/tree/main/transforms) — Python transform classes and templates.
- Checks: [`checks/`](https://github.com/opsmill/infrahub-arista-avd/tree/main/checks) — proposed-change validation, currently CloudVision.
- Playbooks: [`ansible/`](https://github.com/opsmill/infrahub-arista-avd/tree/main/ansible) — the tree Semaphore runs for EOS config deployment and ContainerLab staging.
- Core library: [`src/solution_arista_avd/`](https://github.com/opsmill/infrahub-arista-avd/tree/main/src/solution_arista_avd) — shared protocols, AVD utilities, sorting, addressing.
- Service portal: [`service_catalog/`](https://github.com/opsmill/infrahub-arista-avd/tree/main/service_catalog) — Streamlit UI that orchestrates the portal workflows.
