---
title: Upgrade AVD version
description: Move to a newer PyAVD version and validate the result on a branch before production.
audience: user
---

# Upgrade AVD version

PyAVD (Arista's Python engine) is what renders your device configurations. When a new PyAVD release is available, you move to it and **validate the result on a branch** before anything reaches production. Because both Infrahub and AVD evolve, you confirm compatibility on both sides rather than upgrading in place.

The branch-first upgrade flow is a maintainer/operator task — you rebuild the custom image, so it goes beyond the service portal.

## Before you start

- A running stack (`invoke start`) with at least one fabric already generated, so you have a config baseline to diff against.
- Know your current PyAVD version — it is pinned in `pyproject.toml` (`pyavd>=...`).
- Check the [AVD documentation](https://avd.arista.com/) for breaking changes in the target version.

## Steps

1. **Create a branch for the upgrade.**
   Create a named Infrahub branch (for example `upgrade-avd`) so the change is isolated and reviewable.

2. **Bump the PyAVD pin.**
   Update the `pyavd` version in `pyproject.toml`, then re-sync and rebuild the custom image:

   ```bash
   uv sync --all-packages
   uv run invoke build
   uv run invoke restart
   ```

3. **Regenerate on the branch.**
   Re-run the AVD generators so host_vars and structured configuration are rebuilt with the new PyAVD version. Regeneration is idempotent (checksum-based), so it only reprocesses what the new version changes — see [Regenerate a Fabric](./regenerate-fabric.md).

4. **Review the rendered-config diff.**
   Open a proposed change from your branch and inspect the diff of the rendered EOS configurations and structured config. This is where a PyAVD version bump shows its effect — look for unexpected changes to interfaces, BGP, or EVPN stanzas.

5. **Validate.**
   Confirm the rendered artifacts build cleanly and the diff matches the release notes' expected changes. If ANTA catalog generation is enabled, regenerate the catalogs and review them too.

6. **Merge through the proposed change.**
   Once the diff is understood and approved, merge the proposed change. Only then does the new PyAVD version reach production.

## If something looks wrong

- A large or surprising diff points to a PyAVD default or schema change between versions — cross-check the release notes.
- Roll back by discarding the branch (nothing merged, nothing deployed) and pinning the previous PyAVD version.
- For pipeline-level failures, see [Debugging the Pipeline](../developer-guide/avd/debugging.md).
