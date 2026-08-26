---
title: Developer guide
description: How the Infrahub Arista AVD solution is built and how to extend it.
audience: developer
hide_table_of_contents: true
---

# Developer guide

This guide is for **contributors** who want to extend, debug, or maintain the AVD pipeline — adding device roles, transform outputs, schema fields, or fixing pipeline issues. It assumes familiarity with Python, GraphQL, and Infrahub generators/transforms.

## Start here

1. **[Architecture Overview](./architecture.md)** — system components, data model hierarchy, and the generator pipeline at a glance.
2. **[AVD Pipeline → Overview](./avd/overview.md)** — the two-phase pipeline (hostvars → structured config) and the PyAVD version target.

## Reference

- **[Schemas](./schemas.md)** — every YAML schema file and the kinds it defines.
- **[Generators](./generators.md)** — the generator framework, file structure, and per-generator behaviour.
- **[Transforms](./transforms.md)** — Python and Jinja2 transforms, queries, and content types.
- **[Checks](./checks.md)** — proposed-change validation checks, including CloudVision configuration validation.

## AVD pipeline

The AVD pipeline is the technically distinguishing piece of this solution and has its own sub-section:

- **[Overview](./avd/overview.md)** — two-phase pipeline + PyAVD version pin.
- **[Hostvars Reference](./avd/hostvars.md)** — the PyAVD-compatible structure produced per device role.
- **[Transforms](./avd/transforms.md)** — `avd_eos_config`, `avd_fabric_doc`, `avd_device_doc`.
- **[AvdArtifact & File Storage](./avd/artifacts.md)** — the `AvdArtifact` node, child file nodes, checksum-based change detection.
- **[Role Mapping](./avd/role-mapping.md)** — Infrahub roles → AVD device types.
- **[Extending the Pipeline](./avd/extending.md)** — worked examples for new roles, new transform outputs, new hostvar fields.
- **[Debugging the Pipeline](./avd/debugging.md)** — intermediate-file inspection, single-generator re-runs, common failure modes.

## Looking for the operator guides?

If you want to *use* the system to provision fabrics and view configurations without modifying code, start with [Quick Start](../quick-start.md) and the [how-to guides](../how-to/add-network-segment.md).
