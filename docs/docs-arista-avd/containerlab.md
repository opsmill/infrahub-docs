---
title: ContainerLab
description: The ContainerLab Topology artifact — how a fabric becomes a containerlab topology file, and how to deploy it.
audience: user
---

# ContainerLab

[ContainerLab](https://containerlab.dev) runs a fabric as containers — Arista cEOS nodes for the
network devices, plain Linux containers for the servers. The repository renders a topology file for
any modelled fabric as an Infrahub artifact, so a virtual replica of the fabric can be brought up
from the same source of truth that produces the EOS configs.

Two flows exist, and they are separate on purpose:

- **The committed lab** in `lab/` — a two-DC topology checked into the repository, booting from
  AVD renders that are also checked in. This is the day-to-day lab; see `lab/README.md`.
- **The generated topology** — the `ContainerLab Topology` artifact described here, rendered per
  fabric from Infrahub data. Use this for fabrics the committed lab does not cover.

## The ContainerLab topology artifact

| Property | Value |
|----------|-------|
| Artifact name | `ContainerLab Topology` |
| Attached to | Each `NetworkFabric` (target group `fabrics`) |
| Content type | `application/yaml` |
| Transform | `containerlab_topology` |

The artifact is **fabric-scoped**: one topology per fabric, containing every device the fabric owns
through its pods and racks. The rendered `name:` is the fabric name, so the management network and
container names are derived from it (`clab-<fabric-name>-mgmt`).

Find it on the fabric's **Artifacts** tab in the Infrahub UI, the same way as the fabric
documentation — see [Viewing Artifacts](./viewing-artifacts.md).

To preview a render locally without going through a proposed change:

```bash
# COLUMNS is set because infrahubctl prints via Rich, which wraps long lines at the
# terminal width — irrelevant to the server-rendered artifact, but not to a local capture.
COLUMNS=500 uv run infrahubctl transform containerlab_topology name=Fabric-L3LS-Multi-Domain
```

## What ends up in the topology

```yaml
---
name: Fabric-L3LS-Multi-Domain

mgmt:
  network: clab-Fabric-L3LS-Multi-Domain-mgmt
  ipv4-subnet: 10.0.6.0/24

topology:
  kinds:
    arista_ceos:
      image: arista/ceos:4.36.0.1F
      startup-config: configs/__clabNodeName__.cfg
    linux:
      image: lab-server

  nodes:
    spine-infrahub-dc1-1:
      kind: arista_ceos
      mgmt-ipv4: 10.0.6.11
      binds:
        - configs/eos-intf-mapping/DCS-7050CX3-32S.json:/mnt/flash/EosIntfMapping.json:ro
    dc1-server:
      kind: linux
      mgmt-ipv4: 10.0.6.100
      binds:
        - configs/servers/dc1-server-netplan.yaml:/etc/netplan/netplan.yaml

  links:
    - endpoints: ["leaf-infrahub-dc1-1:eth49_1", "spine-infrahub-dc1-1:eth1_1"]
```

Nodes and links are emitted in a stable sorted order, and endpoints are ordered within each link,
so two renders of unchanged data are byte-identical.

`startup-config` is set only on kinds whose nodes are network devices — the `linux` kind has none,
because servers boot from their netplan bind. The path is `configs/__clabNodeName__.cfg`, the
directory the deploy playbook writes fetched EOS configs into.

### Which devices are included

Devices are selected by `DcimDevice.role`. Included: `super_spine`, `spine`, `leaf`,
`border_leaf`, `l2leaf`, `l2spine`, `l3spine`. `ComputePhysicalServer` members of the fabric are
included as Linux nodes.

The `p`, `pe`, and `rr` roles are deliberately **excluded**. They belong to the ISIS-LDP fabric,
whose interface naming has not been validated against ContainerLab, so admitting them would be
speculative. Each excluded device is logged as a warning during the render rather than dropped
silently, so `Fabric-ISIS-LDP` renders without those devices and says so in the transform log.

A link is only emitted when it resolves to exactly two endpoints and both endpoints belong to
devices present in `nodes`.

## Kind, image, and interface mapping come from the schema

Nothing about node identity is hardcoded in the transform. Three schema attributes drive it:

| Attribute | Node | Drives |
|-----------|------|--------|
| `DcimPlatform.containerlab_os` | `kind:` on each node | `arista_ceos`, `linux` |
| `DcimPlatform.containerlab_image` | `image:` on each `kinds` entry | `arista/ceos:4.36.0.1F`, `lab-server` |
| `DcimDeviceType.containerlab_interface_mapping` | the `EosIntfMapping.json` bind | `DCS-7050CX3-32S.json` |

All three are optional `Text` attributes. A device whose platform has no `containerlab_os` cannot
be rendered as a node; a device type with no `containerlab_interface_mapping` gets no
mapping bind (the `binds` key is omitted entirely when a node has nothing to bind).

`containerlab_interface_mapping` holds a **filename only**, not a path, and not the file contents.
The file itself lives in `lab/configs/eos-intf-mapping/` and is resolved relative to the topology
file at deploy time. Note the filenames intentionally differ from the device type's `part_number`
(`DCS-7050CX3-32S.json` for part number `DCS-7050CX3-32C`) — the attribute exists precisely so the
mapping filename does not have to be derived from anything else.

Seed values live in `objects/03_device_type.yml`.

## Interface names and why the mapping bind matters

Link endpoints are translated from EOS names to the Linux interface names cEOS exposes to
ContainerLab:

| EOS name | ContainerLab name |
|----------|-------------------|
| `Ethernet5` | `eth5` |
| `Ethernet1/1` | `eth1_1` |
| `Ethernet49/1` | `eth49_1` |

The rule is `Ethernet<N>[/<M>]` → `eth<N>[_<M>]`: strip the `Ethernet` prefix and replace `/` with
`_`.

For plain `Ethernet<N>` interfaces that is all cEOS needs — it maps `ethN` to `EthernetN` by
default. Breakout names are the problem. A generated config that says `interface Ethernet1/1` does
not attach to anything if cEOS has decided that `eth1_1` is `Ethernet1_1`, or has not created the
interface at all. `EosIntfMapping.json` is the file that tells cEOS which container interface
corresponds to which EOS interface name, per device type. It is mounted read-only:

```yaml
binds:
  - configs/eos-intf-mapping/DCS-7050SX3-48YC8.json:/mnt/flash/EosIntfMapping.json:ro
```

On a fabric whose spines use `Ethernet<N>/1` uplinks and whose leaves use `Ethernet49-50/1`, the
mapping bind is what makes the AVD-rendered config match the interfaces that actually exist. To
confirm it took effect after a deploy:

```bash
docker exec clab-<topology>-<a-spine> Cli -c "show interfaces status" | head -20
```

Expect `Ethernet1/1`-style names. Seeing `eth1_1` instead means the bind is missing, or points at a
file that is not on disk next to the topology.

Server nodes carry a netplan bind instead, mounted at `/etc/netplan/netplan.yaml`. The source
filename is derived by convention from the device name (`configs/servers/<device-name>-netplan.yaml`);
netplan contents are not generated from Infrahub.

## Deploying with Ansible

`ansible/deploy_clab.yml` fetches the topology artifact and each device's `AVD EOS Configuration`
artifact from Infrahub, stages them plus every committed bind source onto a ContainerLab host, and
runs `containerlab deploy` there. It lives in `ansible/` because that directory is also the
Semaphore playbook repository.

The playbook is two plays, because the machine that talks to Infrahub is not necessarily the machine
that runs the lab:

| Play | Hosts | Does |
|------|-------|------|
| 1 | `localhost` | Resolves the fabric to a node ID, fetches the topology and per-device config artifacts, asserts each returned a body |
| 2 | `clab_hosts` | Stages the topology, configs, and bind sources onto the lab host, validates every bind and `startup-config` path exists **there**, then deploys |

Nothing is written to the controller's filesystem — the artifacts are copied straight to the lab
host, so no shared filesystem is assumed.

Point `clab_hosts` at whichever host runs ContainerLab, in `ansible/inventory_clab.yml`. It defaults
to `localhost` with `ansible_connection: local`, so a single-machine setup works unchanged. This
inventory must be passed explicitly, because `ansible/ansible.cfg` pins `inventory` to the dynamic
Infrahub plugin.

Required environment:

```bash
export INFRAHUB_ADDRESS=http://localhost:8000
export INFRAHUB_API_TOKEN=<token>
```

The playbook uses the `opsmill.infrahub` collection. Install it from the repository root:

```bash
ansible-galaxy collection install -r ansible/galaxy-requirements.yml
```

The collection's plugins run on the Ansible **controller** and import `infrahub-sdk` directly, so
`infrahub-sdk` must be importable by the controller's Python — otherwise they fail with
`infrahub_sdk must be installed to use this plugin`. `lab/pyproject.toml` provides it, which is why
the wrapper below runs through `uv run` from `lab/`.

Then:

```bash
cd lab
make deploy-from-infrahub FABRIC=Fabric-L3LS-Multi-Domain
```

Or invoke it directly, noting the explicit inventory:

```bash
uv run ansible-playbook -i ../ansible/inventory_clab.yml ../ansible/deploy_clab.yml \
  -e fabric=Fabric-L3LS-Multi-Domain
```

To stage and validate without touching the lab, skip the deployment tasks:

```bash
... --skip-tags deploy
```

Useful variables:

| Variable | Default | Purpose |
|---|---|---|
| `fabric` | *required* | Which fabric to deploy |
| `clab_host_group` | `clab_hosts` | Inventory group running ContainerLab |
| `clab_staging_dir` | `/opt/containerlab/<fabric>` | Where files are staged **on the lab host** |
| `clab_dir` | `<repo>/lab` | Where committed bind sources are read from on the controller |

Verify:

```bash
containerlab inspect --topo topology.clab.yml
docker ps --format '{{.Names}}' | grep clab- | wc -l
```

### Running it from Semaphore

`invoke init-semaphore` registers a **Fetch ContainerLab Files** template. It runs the same playbook
with `--skip-tags deploy`, so it fetches the artifacts, stages every file the topology references,
and validates them — but does not deploy. That is deliberate: the Semaphore container has no
`containerlab` binary and no Docker socket, so an unskipped run can only ever fail on the
containerlab check.

The pulled files land on the Docker host, in `lab/clab-staging`:

```text
lab/clab-staging/
├── topology.clab.yml
└── configs/
    ├── <device-name>.cfg         # one per device
    ├── eos-intf-mapping/
    └── servers/
```

Every run ends by printing both the in-container and on-host paths, so there is no need to work them
out. The directory is created by `invoke start` with mode 0777, because the container writes as a
different uid than the host user; files it writes are owned by that uid, so they are readable but not
writable from the host.

`fabric` and `clab_staging_dir` come from the template's **ContainerLab** environment, not from a
survey prompt — a declared survey variable is recorded on the task but never reaches
`ansible-playbook` in Semaphore v2.17. Override them per run in the task's Environment field.

To deploy rather than only fetch, point `clab_hosts` in `ansible/inventory_clab.yml` at a
ContainerLab host reachable over SSH and clear the template's `--skip-tags deploy` argument.

## Pinning the lab's data with `manual_objects/`

`invoke load` loads `objects/` only. A second, opt-in set in `manual_objects/` is loaded manually:

```bash
uv run infrahubctl object load manual_objects/ --branch <branch-name>
```

It exists to make the multi-domain fabric line up with the committed lab rather than with whatever
the pools happen to allocate:

| File | Sets |
|---|---|
| `00_lab_l3ls_multi_domain.yml` | Fixed management addresses `10.0.6.11`–`.16` and `.21`–`.26` with matching serials across the 12 switches; `Ethernet5`/`Ethernet6` as `peering` interfaces on the two DCI leaves in each DC; the four `role=dci` `NetworkLink` objects between them; and one `EvpnGatewayGroup` per DC |
| `15a_servers_l3ls_multi_domain.yml` | The two `ComputePhysicalServer` nodes the topology renders as Linux nodes |

Without it, the generator allocates management addresses from
`Fabric-L3LS-Multi-Domain-Mgmt-Pool` in allocation order, so the rendered `mgmt-ipv4` values are
valid but won't match the values in the committed topology. Load it before running the generator
chain, on the same branch.

## How the generated lab differs from the committed lab

The generated topology is a structural replica, not a byte-identical copy of
`lab/topology.clab.yml`. The differences are intentional:

| | Committed lab | Generated |
|---|---|---|
| Node names | `ih-dc1-spine1` | `spine-infrahub-dc1-1` — the Infrahub device names, no renaming layer |
| Topology name | `infrahub-avd` | the fabric name, so container and management-network names differ |
| `startup-config` directory | `avd/intended/configs/` | `configs/` — where the playbook writes fetched configs |
| `ceos-config` bind | present | absent — serial and system-MAC files are per-lab-device-name and are not modelled in Infrahub |
| CVaaS token bind | available, commented out | absent |

Node counts, kinds, images, management addresses, link counts, interface-name forms, and bind
mount points do match.

**Server-to-server reachability is not expected to work in the generated lab.** The committed
netplan files encode VLANs 11/12/19 and their addresses, while the multi-domain fabric models VLANs
21/22/29, and netplan is not generated from Infrahub. The `make ping` checks belong to the
committed lab flow, not this one.

## Related

- `lab/README.md` — the committed lab, its Makefile targets, and the cEOS image import.
- [Viewing Artifacts](./viewing-artifacts.md) — finding, previewing, and downloading artifacts.
- [Transforms](./developer-guide/transforms.md) — how transforms and artifact definitions are wired.
