---
title: Common issues
description: Diagnose and fix the most frequent failures — stack health, generator order, seed data, artifacts.
audience: user
sidebar_position: 6
# Every issue below repeats the same Symptoms/Diagnose/Fix subheadings, so
# listing them would fill the page TOC with duplicates. Keep it at the issue
# level.
toc_max_heading_level: 2
---

# Common issues

The failure modes below are the ones you'll hit most often. If your problem isn't here, the [developer guide](./developer-guide/index.md) has deeper debugging material for contributors.

## Stack is not healthy

### Symptoms

- `http://localhost:8000` doesn't respond.
- `uv run invoke load` fails with connection errors.
- Service portal at `http://localhost:8501` loads but shows `Unable to fetch data from Infrahub`.

### Diagnose

```bash
docker compose -f docker-compose.yml -f docker-compose.override.yml ps
```

Look for any service that is **not** `healthy` or `running`. The usual culprits are:

- **Neo4j** — first-time startup takes 30–60 seconds. Re-check after a minute.
- **PostgreSQL** — check the volume mount has write permission (`ls -l` on the docker volume location).
- **RabbitMQ / Redis** — restart with `uv run invoke restart --component=<service-name>`.

Check logs for a failing service:

```bash
docker compose -f docker-compose.yml -f docker-compose.override.yml logs --tail 100 <service-name>
```

### Fix

If restarting doesn't help, tear down and rebuild:

```bash
uv run invoke destroy          # removes all volumes — your data is wiped
uv run invoke start
uv run invoke load
```

:::warning
`invoke destroy` removes all volumes, including your graph database. Use this only if you're okay losing local data.
:::

## Generators ran out of order

### Symptoms

- `generate-fabric` finishes but no pod, rack, or device tasks appear afterwards.
- A leaf device is created but has no BGP ASN, node ID, or IP address.
- Hostvars generation fails with `parent not found`.

### Cause

Triggers connect the generators into a chain: `generate-fabric` → `generate-pod` → `generate-rack` → `generate-avd-device-hostvar` → `generate-avd-device-structured-config`. If triggers didn't load — the last step of `invoke load` — the chain is broken.

### Diagnose

In the Infrahub UI, open **Governance → Triggers**. You should see trigger entries covering each generator.

If the Triggers page is empty, the trigger load step didn't run.

### Fix

Re-run the trigger load step:

```bash
uv run invoke load
```

This is idempotent and re-registers triggers.

If the generators already ran out of order and left partial data, the cleanest fix is to discard the branch (Infrahub UI → Branches → your branch → Delete) and re-run from a fresh branch.

## Missing seed data

### Symptoms

- Running the fabric generator returns an error about missing IP pools, ASN pools, or device templates.
- The fabrics list is empty.
- Manufacturer or device-type lookups fail.

### Diagnose

Open the Infrahub UI and check each of these lists is populated:

| Menu | Expected |
|------|----------|
| Devices → Types & Models → Manufacturers | Arista, Dell, and others |
| Devices → Types & Models → Device Types | Arista models (7050-CX3, etc.) |
| Fabric Design → Fabrics | `Fabric-L3LS-MultiPod-A` and `Fabric-L3LS-MultiPod-B` |
| IPAM → Prefixes | supernet and per-fabric pools |

If any are empty, seed data did not load.

### Fix

Re-run seed data load. From the repository root:

```bash
uv run invoke load
```

This re-loads schemas, menus, objects, repository, and triggers. It is idempotent — existing objects are upserted, not duplicated.

If `invoke load` fails on the `infrahubctl object load` step, the most common cause is Infrahub not being ready yet. Wait 10–20 seconds and re-run.

## "No structured config available" when viewing an artifact

### Symptoms

- The device's **AVD EOS Configuration** artifact opens but shows "No structured config available" or similar.
- The device has hostvars (you can see `AvdHostvarFile` listed for it) but no `AvdStructuredConfigFile`.

### Cause

The structured-config generator (Phase 2 of the AVD pipeline) runs per fabric, not per device. It reads all device hostvars and generates structured configs for all devices at once. If that generator hasn't run, or ran before the hostvars for this device were ready, the structured config is missing.

### Fix

Re-run the structured-config generator for the fabric:

1. In the Infrahub UI, on the correct branch, open **Actions → Generator definitions**.
2. Click **`generate-avd-device-structured-config`**.
3. Click **Run** and select the fabric (for example, `Fabric-L3LS-MultiPod-A`).

Once the task completes, the artifact renders on the next open.

Alternatively, in the artifact preview panel, click **Regenerate**.

## The ANTA catalog artifact contains only a comment

### Symptoms

The **AVD ANTA Catalog** artifact renders successfully but holds a single line:

```text
# ANTA disabled for fabric Fabric-L3LS-MultiPod-A
```

### Cause

Catalog generation is opt-in per fabric. The transform checks `NetworkFabric.anta_enabled` and
returns a marker comment rather than failing, so the artifact always renders and states why it is
empty.

### Fix

Set `anta_enabled` on the fabric — on a branch, as with any data change — and regenerate. Two other
markers point elsewhere:

| Marker | Meaning |
|--------|---------|
| `# No structured config for <device>` | The structured-config generator hasn't produced a config for that device — see the section above |
| `# ANTA catalog: no fabric for <device>` | The device has no pod, or its pod has no parent fabric |

## CloudVision validation is skipped or fails

### Symptoms

- The `cv-config-validation` check reports an informational skip on a proposed change.
- The check fails with a CloudVision connection or authentication error.

### Diagnose and fix

| What you see | Cause | Fix |
|---|---|---|
| Check skips everything | The fabric has `cloudvision_managed` set to `false` | Set it on the fabric; unmanaged fabrics skip credentials, serial, inventory, and workspace checks by design |
| Connection or auth failure | `CLOUDVISION_SERVERS` / `CLOUDVISION_TOKEN` not reaching the task worker | `docker-compose.override.yml` forwards them from your shell (or a `.env` file) into the Infrahub containers, so set them and re-run `uv run invoke start` — `restart` reuses the existing containers and their old environment |
| "device has no serial number" or an inventory error | A confirmed device in the fabric is missing a serial, or isn't in CloudVision inventory | Fix the device data, or remove it from the fabric before validating |
| Informational skip, workspace never created | No device in the fabric has a generated structured config yet | Run the structured-config generator first |

See [CloudVision Validation](./cloudvision.md) for the full behaviour and
[Checks](./developer-guide/checks.md) for how to run the check directly.

## Service portal is down but Infrahub is up

### Symptoms

- `http://localhost:8000` works.
- `http://localhost:8501` returns connection refused or a blank page.

### Fix

Restart the service portal container:

```bash
uv run invoke restart --component=service-catalog
```

The compose service is named `service-catalog`; `--component` takes a compose service name, which
you can list with:

```bash
docker compose -f docker-compose.yml -f docker-compose.override.yml config --services
```

If the portal is unavailable and you need to complete a workflow, you can do most operations directly in the Infrahub UI:

- **Add Network Segment** — create `IpamVLAN`, `IpamVRF`, and `EvpnSvi` objects manually in the UI on a branch, then run the hostvars and structured-config generators.
- **Create Tenant** — create an `EvpnTenant` object in the UI.
- **Add Server** — create a `ComputePhysicalServer` linked to a compute rack, then re-run the generator chain.

## Generators take longer than expected

Normal durations on a typical laptop:

| Generator | Target | Duration |
|-----------|--------|----------|
| `generate-fabric` | one fabric | 10–30 s |
| `generate-pod` | one pod | 10–20 s |
| `generate-rack` | one rack | 10–20 s |
| `generate-avd-device-hostvar` | one device | 20–45 s |
| `generate-avd-device-structured-config` | one fabric | 1–3 min for a small fabric; longer for many devices |

If a task has been in **Running** state for more than 10 minutes, check the task's log in **Actions → Tasks → [task]** and look for errors. Most long-running tasks are waiting on a missing dependency (an IP pool, a parent object). The log names the missing item.

## Starting over {#starting-over-completely}

```bash
uv run invoke destroy     # wipes everything
uv run invoke build
uv run invoke start
uv run invoke load
```

This is the nuclear option — rebuild the image, restart the stack with empty volumes, and reload everything.
