---
title: AVD transforms
description: The three Python transforms that render EOS configs and AVD documentation from stored data.
audience: developer
sidebar_position: 3
---

# AVD transforms

:::info Developer Guide
Documents the transform implementations. To *view* artifacts as an operator, see [Viewing Artifacts](../../viewing-artifacts.md).
:::

Four Python transforms turn the data produced by the [two-phase pipeline](./overview.md) into user-facing artifacts. All four are registered in [`.infrahub.yml`](https://github.com/opsmill/infrahub-arista-avd/blob/main/.infrahub.yml).

:::note Generated Pydantic models
The `*_query.py` files referenced below are **generated** from their matching `.gql` and the checked-in `schema.graphql` via `infrahubctl graphql generate-return-types`. Do not hand-edit them. See [Transforms → Query Classes](../transforms.md#query-classes) for the regeneration command.
:::

| Transform | Target group | Content type | Wraps |
|-----------|-------------|--------------|-------|
| `avd_eos_config` | `avd_devices` | `text/plain` | `pyavd.get_device_config()` |
| `avd_device_doc` | `avd_devices` | `text/markdown` | PyAVD device documentation |
| `avd_fabric_doc` | `fabrics` | `text/markdown` | `pyavd.get_fabric_documentation()` |
| `avd_anta_catalog` | `avd_devices` | `application/yaml` | `pyavd.get_device_test_catalog()` |

## `avd_eos_config`

**Class**: `AvdEosConfigTransform`
**Source**: [`transforms/avd_eos_config.py`](https://github.com/opsmill/infrahub-arista-avd/blob/main/transforms/avd_eos_config.py)
**Query**: [`transforms/avd_device_config.gql`](https://github.com/opsmill/infrahub-arista-avd/blob/main/transforms/avd_device_config.gql)
**Pydantic model**: `transforms/avd_device_config_query.py`

Renders a single device's Arista EOS CLI configuration.

Flow:

1. Query resolves the target device and navigates to `AvdArtifact.structured_config_file`.
2. Transform fetches the structured-config JSON from the `AvdStructuredConfigFile` (a `CoreFileObject`).
3. Calls `pyavd.get_device_config(structured_config)`.
4. Returns the EOS CLI text.

If `structured_config_file` is missing or empty, the transform returns a user-readable "No structured config available" message rather than crashing — see [Debugging the Pipeline](./debugging.md#missing-structured-config) for the diagnostic flow.

## `avd_device_doc`

**Class**: `AvdDeviceDocTransform`
**Source**: [`transforms/avd_device_doc.py`](https://github.com/opsmill/infrahub-arista-avd/blob/main/transforms/avd_device_doc.py)
**Query**: `transforms/avd_device_config.gql` (reused)
**Pydantic model**: `transforms/avd_device_config_query.py`

Renders per-device markdown documentation.

Flow:

1. Same query as `avd_eos_config` — resolves device and its structured config.
2. Calls the PyAVD device documentation function on the structured config.
3. Returns markdown.

## `avd_fabric_doc`

**Class**: `AvdFabricDocTransform`
**Source**: [`transforms/avd_fabric_doc.py`](https://github.com/opsmill/infrahub-arista-avd/blob/main/transforms/avd_fabric_doc.py)
**Query**: [`transforms/avd_fabric_devices.gql`](https://github.com/opsmill/infrahub-arista-avd/blob/main/transforms/avd_fabric_devices.gql)
**Pydantic model**: `transforms/avd_fabric_devices_query.py`

Renders fabric-wide markdown documentation covering the full topology.

Flow:

1. Query resolves the fabric and walks to every device in its pods and racks.
2. Transform fetches **hostvars** and **structured config** files for all devices.
3. Calls `pyavd.get_avd_facts(all_hostvars)` to build the shared facts.
4. Calls `pyavd.get_fabric_documentation(avd_facts, structured_configs, fabric_name)`.
5. Returns markdown.

Fabric documentation requires hostvars to be present for *every* device in the fabric. If any device has no hostvars, the transform fails the artifact generation with a message naming the missing devices.

## `avd_anta_catalog`

**Class**: `AvdAntaCatalogTransform`
**Source**: [`transforms/avd_anta_catalog.py`](https://github.com/opsmill/infrahub-arista-avd/blob/main/transforms/avd_anta_catalog.py)
**Query**: [`transforms/avd_anta_catalog.gql`](https://github.com/opsmill/infrahub-arista-avd/blob/main/transforms/avd_anta_catalog.gql)
**Pydantic model**: `transforms/avd_anta_catalog_query.py`

Renders a per-device [ANTA](https://anta.arista.com) test catalog as YAML.

Flow:

1. Query resolves the `target` device *and* every device in the graph, so siblings can be filtered
   by fabric in the transform. The device's fabric is `pod.parent`, a discriminated union — only a
   `NetworkFabric` parent has the `name` and `anta_enabled` fields the gating needs.
2. If the fabric has `anta_enabled` unset or false, return a marker comment and stop.
3. Download each same-fabric device's structured config, passing it through
   `pyavd.validate_structured_config()`.
4. Build one `AVDFabricData` from all of them — catalog generation is fabric-wide, unlike EOS config
   rendering.
5. Call `pyavd.get_device_test_catalog(hostname, target_structured_config, fabric_data)` and dump it
   as YAML.

Every "cannot render" path returns a comment rather than raising, so the artifact always renders and
states the reason:

```text
# ANTA disabled for fabric Fabric-L3LS-Multi-Domain
# No structured config for leaf-infrahub-dc1-1
# ANTA catalog: no fabric for leaf-infrahub-dc1-1
```

## Registration in `.infrahub.yml`

```yaml
python_transforms:
  - name: avd_eos_config
    class_name: AvdEosConfigTransform
    file_path: "./transforms/avd_eos_config.py"
  - name: avd_fabric_doc
    class_name: AvdFabricDocTransform
    file_path: "./transforms/avd_fabric_doc.py"
  - name: avd_device_doc
    class_name: AvdDeviceDocTransform
    file_path: "./transforms/avd_device_doc.py"
  - name: avd_anta_catalog
    class_name: AvdAntaCatalogTransform
    file_path: "./transforms/avd_anta_catalog.py"

artifact_definitions:
  - name: avd_eos_configuration
    targets: avd_devices
    transformation: avd_eos_config
  - name: avd_fabric_documentation
    targets: fabrics
    transformation: avd_fabric_doc
  - name: avd_device_documentation
    targets: avd_devices
    transformation: avd_device_doc
  - name: avd_anta_catalog
    targets: avd_devices
    transformation: avd_anta_catalog
    content_type: application/yaml
```

## Other transforms

The repository also ships transforms outside the AVD pipeline — the cabling-plan CSV, computed
interface descriptions, the ContainerLab topology, and the CloudVision webhook payload. They are
documented in [Transforms](../transforms.md).

## Adding a new transform

See [Extending the Pipeline → Adding a new transform output](./extending.md#add-a-new-transform-output).
