---
title: Upgrade AVD version
description: Move to a newer PyAVD version and validate the result on a branch before production.
audience: user
---

# Upgrade AVD version

PyAVD (Arista's Python engine) is what renders your device configurations. When a new PyAVD release is available, you move to it and **validate the result on a branch** before anything reaches production. Because both Infrahub and AVD evolve, you confirm compatibility on both sides rather than upgrading in place.

The branch-first upgrade flow is a maintainer/operator task — you rebuild the custom image, so it goes beyond the service portal.

## Before you start

- An isolated Git worktree and offline hostvars for an initial rendering comparison.
- Authorization for stack changes and live generator runs before proceeding to deployed validation.
- Know your current PyAVD version — it is pinned in `pyproject.toml` (`pyavd>=...`).
- Check the [AVD documentation](https://avd.arista.com/) for breaking changes in the target version.

## Steps

1. **Create a branch for the upgrade.**
   Create an isolated Git branch/worktree for code changes. For later live validation, create a named Infrahub branch (for example `upgrade-avd`) after obtaining authorization.

2. **Bump the PyAVD pin.**
   Update the `pyavd` version in `pyproject.toml`, regenerate the lock, and align Semaphore’s PyAVD package and AVD collection. Install the lock and build candidate images:

   ```bash
   uv lock
   uv sync --all-packages --frozen
   docker build -t avd-infrahub-candidate .
   docker build -f Dockerfile.catalog -t avd-portal-candidate .
   docker build -t avd-semaphore-candidate semaphore
   bash scripts/smoke_images.sh avd-infrahub-candidate avd-portal-candidate avd-semaphore-candidate
   ```

   Compare identical offline inputs under the old and new PyAVD versions, run the unit suite, and review rendering differences against the release notes. Candidate image validation does not restart or restore the shared stack.

3. **Regenerate on the branch after deployment authorization.**
   Updating the running stack is a separate operation that requires authorization before the live validation steps below.
   Re-run the AVD generators so host_vars and structured configuration are rebuilt with the new PyAVD version. Regeneration is idempotent (checksum-based), so it only reprocesses what the new version changes — see [Regenerate a Fabric](./regenerate-fabric.md).

4. **Review the rendered-config diff.**
   Open a proposed change from your branch and inspect the diff of the rendered EOS configurations and structured config. This is where a PyAVD version bump shows its effect — look for unexpected changes to interfaces, BGP, or EVPN stanzas.

5. **Validate.**
   Confirm the rendered artifacts build cleanly and the diff matches the release notes' expected changes. If ANTA catalog generation is enabled, regenerate the catalogs and review them too.

6. **Merge through the proposed change.**
   Once the diff is understood and approved, merge the proposed change. Only then does the new PyAVD version reach production.

## AVD 6.4.0 migration comparison

The migration compared identical offline inputs with PyAVD 6.3.0 and 6.4.0,
keeping ANTA 1.8.0 and other resolved dependencies constant. Fixtures come from
the repository's hostvar builder: an L3LS fabric with default-VRF SVIs, an L2LS
MLAG pair, and EVPN gateway peers using a remote leaf, an uplink address, or a
separate peering address. The unit suite also exercises real transforms with
mocked Infrahub file storage.

The [AVD 6.4 release notes](https://github.com/aristanetworks/avd/blob/v6.4.0/docs/release-notes/6.x.x.md#release-640)
explain the observed differences:

| Area | Observed difference and reason |
| --- | --- |
| Default-VRF prefix list | `PL-SVI-VRF-DEFAULT` now consistently orders `10.10.0.0/24` before `10.20.0.0/24`. With `PYTHONHASHSEED=1`, 6.3 renders them in reverse order; seeds 0–3 show 6.4 remains consistent. This is the documented ordering fix, PR #7257. |
| Uplink EVPN gateway | 6.3 raises `AristaAvdDuplicateDataError` when `spine1` at `10.0.0.1` is both the route server and gateway peer. 6.4 renders it once as `EVPN-OVERLAY-CORE`, matching PR #7270. A separate gateway address preserves regular route-server peering, consistent with PR #7337; that fixture already renders in 6.3. |
| EOS output | For fixtures that render in both versions, only the prefix-list sequence ordering changes. The L2LS EOS configuration is identical. Future-behavior flags remain unchanged. |
| Device documentation | Routing booleans use `False` instead of `false` (PR #7343). BGP neighbor tables add maximum-accepted-routes and maximum-advertised-routes columns (PRs #7326 and #7321). Prefix-list tables and embedded EOS reflect the ordering fix. |
| Fabric documentation | Identical for every fixture that renders in both versions. |
| ANTA catalogs | Identical for every comparable fixture; `VerifyInterfaceDiscards` and `VerifyLoggingErrors` exclusions remain effective. Catalogs are generated offline, without device execution. |

The fixtures do not enable ACT digital-twin mode. The documented
`digital_twin.mgmt_ip` change (PR #7253) therefore does not affect this comparison.
Schemas, GraphQL contracts, generated models, external APIs, and artifact formats
are unchanged. These checks cover representative rendering and isolated runtime
behavior; integration and generator idempotence checks remain necessary before
claiming full compatibility.

## If something looks wrong

- A large or surprising diff points to a PyAVD default or schema change between versions — cross-check the release notes.
- Roll back by discarding the branch (nothing merged, nothing deployed) and pinning the previous PyAVD version.
- For pipeline-level failures, see [Debugging the Pipeline](../developer-guide/avd/debugging.md).
