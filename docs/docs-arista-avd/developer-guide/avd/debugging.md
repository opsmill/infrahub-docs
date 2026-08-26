---
title: Debugging the pipeline
description: Inspect intermediate files, force regeneration, and isolate a single generator or transform.
audience: developer
sidebar_position: 7
---

# Debugging the pipeline

:::info Developer Guide
For operator-facing issues (stack health, generator order, "no structured config available"), see the [Troubleshooting page](../../troubleshooting.md).
:::

## Inspecting hostvars and structured configs

Both files live on the `AvdArtifact` for each device (see [AvdArtifact & File Storage](./artifacts.md)). To read them:

### Via the Infrahub UI

1. Navigate to the device's `AvdArtifact` (for example, search for the artifact named after the device).
2. Open the `hostvar_file` or `structured_config_file` relationship — the child node is an `AvdHostvarFile` / `AvdStructuredConfigFile`.
3. Download or view the `content` attribute (JSON).

### Via the SDK

```python
from infrahub_sdk import InfrahubClient

client = InfrahubClient(address="http://localhost:8000")
await client.login()

artifact = await client.get(
    kind="AvdArtifact",
    device__name__value="leaf-pod-A1-1",
    branch="main",
    prefetch_relationships=True,
    include=["hostvar_file", "structured_config_file"],
)

hostvars_node = artifact.hostvar_file.peer
hostvars = hostvars_node.content.value   # raw JSON string
```

## Checksum-based change detection

Both generators skip writes when content is unchanged. The flow is:

1. Serialise the new content (hostvars dict or structured config dict) to JSON.
2. Compute `hashlib.sha256(json_bytes).hexdigest()`.
3. Compare against the existing file's `checksum` attribute (provided by `CoreFileObject`).
4. If equal → skip the write (log "unchanged, skipped").
5. If different → replace the file.

### Forcing a regeneration

If you need to force a fresh write (for example, you suspect the checksum is stale or want to test the generator path end-to-end), delete the child file node:

```python
hostvars_node = artifact.hostvar_file.peer
await hostvars_node.delete()
```

The next generator run writes a new `AvdHostvarFile` unconditionally.

## Re-running a single generator

### From the UI

1. On a branch, open **Actions → Generator definitions**.
2. Pick the generator (for example, `generate-avd-device-hostvar`).
3. Click **Run** and select the target device (or fabric for Phase 2).

### Via the SDK

Generators can be triggered programmatically:

```python
await client.execute_graphql(
    query="""
    mutation RunGenerator($group: String!, $generator: String!) {
        CoreGeneratorDefinitionRun(
            data: { generator: $generator, group: $group }
        ) { ok }
    }
    """,
    variables={"generator": "generate-avd-device-hostvar", "group": "avd_devices"},
    branch_name="my-branch",
)
```

See the service portal implementation in [`service_catalog/utils/api.py`](https://github.com/opsmill/infrahub-arista-avd/blob/main/service_catalog/utils/api.py) (`run_avd_pipeline()` and related helpers) for a working example.

## Missing structured config

**Symptoms**: `avd_eos_config` transform returns `No structured config available`.

**Diagnostic flow**:

1. Fetch the device's `AvdArtifact`. Is there one? If not — the device isn't in the `avd_devices` group.
2. Does `AvdArtifact.hostvar_file` exist? If not — Phase 1 didn't run for this device. Run `generate-avd-device-hostvar` for it.
3. Does `AvdArtifact.structured_config_file` exist? If not — Phase 2 didn't run (or failed) for this device's fabric. Run `generate-avd-device-structured-config` for the fabric.
4. If `structured_config_file` exists but `content` is empty or malformed — the previous Phase 2 run had a partial failure. Delete the file and re-run Phase 2.

## PyAVD validation errors

`pyavd.validate_inputs()` is called in Phase 2 across **all** devices in the fabric. If one device has invalid hostvars, the whole Phase 2 run fails.

**Reading the error**:

```text
pyavd.j2lint.utils.ValidationError: Invalid type for ... in ...
```

The error names a field and a device. Fetch that device's hostvars (above) and look for:

- Missing required fields for the role (`id`, `bgp_as`, `loopback_ipv4_address` for L3 roles).
- Mismatched list lengths in the uplink block (`uplink_interfaces` vs `uplink_switches`).
- Type mismatches — PyAVD expects stringified ASNs (`"65101"`), CIDR-less loopbacks, etc.

Cross-reference [Hostvars Reference](./hostvars.md) for the expected types.

## Common failure modes

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Phase 2 fails "Missing hostvar_file for device X" | Phase 1 didn't complete for device X | Re-run Phase 1 for that device |
| `get_avd_type` raises `ValueError` | New role added to schema without adding to `ROLE_TO_AVD_TYPE` | Update [`src/solution_arista_avd/avd.py`](https://github.com/opsmill/infrahub-arista-avd/blob/main/src/solution_arista_avd/avd.py) |
| Fabric documentation empty or partial | One or more devices missing hostvars | Complete Phase 1 for all devices |
| Artifact regenerates every run even when nothing changed | Hostvars dict has a non-deterministic field (for example, iteration order of a set) | Sort lists/dicts before JSON-serialising |
| Transform returns stale output | `CoreFileObject.content` cached somewhere; rare | Force-regenerate the artifact from the UI preview panel |

## Pre-seeded device reconciliation

When a fabric already contains pods, racks, or devices, run `generate-fabric` for
the fabric first. A standard run preserves non-empty operator-provided device
values, including `serial` and `mgmt_ip`, and fills missing generator-owned
relationships needed by AVD. The expected log stream for a reconciled device
includes field-decision entries for populated, preserved, or skipped fields.

If the cascade stops after fabric generation, check whether the downstream pod
or rack checksum changed. Changed targets should be handled by the existing
trigger rules; unchanged targets should be visible as direct
`CoreGeneratorDefinitionRun` calls for `generate-pod` or `generate-rack` with
explicit node IDs. If hostvars are still missing after rack generation, follow
the missing structured config diagnostic flow above and confirm all racks in the
fabric have `generation_complete=True`.

## Turning up log verbosity

The generators log via the Infrahub SDK's logging. To see more detail on a dev stack, bump the log level in the Infrahub server's environment:

```bash
# in docker-compose.override.yml for the infrahub service
environment:
  INFRAHUB_LOG_LEVEL: DEBUG
```

Then restart:

```bash
uv run invoke restart --component=infrahub-server
```

## Comparing a render against AVD's own examples

`scripts/compare_avd_examples.py` answers whether this design's render produces the same EOS
features as the AVD example it is based on — use it when a new fabric design is added and you want
evidence beyond a successful render.

```bash
# one rendered config against one AVD example config
uv run python scripts/compare_avd_examples.py rendered.cfg avd_example.cfg

# two directories of *.cfg, matched by basename
uv run python scripts/compare_avd_examples.py rendered_dir/ avd_examples_dir/

# no inputs needed — exercises the comparison logic itself
uv run python scripts/compare_avd_examples.py --self-test
```

Byte-for-byte identity is deliberately not the goal. Infrahub allocates its own addressing,
hostnames, ASNs, and node IDs, so the script masks IP, MAC, IPv6, and ASN tokens before comparing,
then reports top-level EOS feature sections (`router bgp`, `vlan`, `mlag configuration`,
`router isis`, `mpls ldp`, …) as present in both, only in the render, or only in the example. A
section present in the example but missing from the render is the difference to investigate.

The reference configs come from the AVD repository, under
`ansible_collections/arista/avd/examples/<example>/intended/configs/*.cfg`.

## Related reading

- [Overview](./overview.md) — the pipeline shape at a glance.
- [AvdArtifact & File Storage](./artifacts.md) — exactly which node holds which piece of data.
- [Troubleshooting](../../troubleshooting.md) — operator-level issues and fixes.
