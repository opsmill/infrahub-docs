---
title: CloudVision validation
---

# CloudVision validation

The repository validates generated EOS configurations in CloudVision during
Infrahub proposed-change validation. It also records the CloudVision workspace
URL in the proposed change and registers a placeholder CustomWebhook handoff for
submitting the linked workspace when the proposed change is submitted.

## Runtime configuration

CloudVision credentials are read from task-worker environment variables:

```bash
CLOUDVISION_SERVERS=cv.example.com
CLOUDVISION_TOKEN=...
CLOUDVISION_VERIFY_CERTS=true
```

Username/password authentication is also supported with
`CLOUDVISION_USERNAME` and `CLOUDVISION_PASSWORD`. Optional proxy settings use
the `CLOUDVISION_PROXY_*` variables.

`docker-compose.override.yml` passes these variables into the Infrahub task
worker so proposed-change checks can access them.

## Proposed-change validation

The `cv-config-validation` check uses the `cv_config_check` GraphQL query to
collect the target fabric and related devices. The fabric must have
`cloudvision_managed` set to `true` before CloudVision validation runs.
Unmanaged fabrics skip CloudVision credential setup, serial-number checks,
inventory checks, and workspace validation.

For a managed fabric, validation first authenticates to CloudVision, then
requires every confirmed device in the fabric to have a serial number and to
exist in CloudVision inventory. Devices outside the target fabric are ignored,
and missing optional relationships are treated as absent membership rather than
runtime failures. Inventory-confirmed devices must also be active in
CloudVision; inactive targeted devices fail validation even if the workspace
build itself succeeds.

After eligibility passes, only devices with generated structured-config
artifacts are deployed to the validation workspace. If no generated
structured-config artifacts exist for an otherwise eligible managed fabric, the
check records an informational skip and does not create or build a workspace.

For each selected device, the check downloads the
`AvdStructuredConfigFile`, renders EOS CLI with `pyavd.get_device_config()`,
deploys the configs to a CloudVision workspace, and requests a workspace build.
Download, JSON decode, or render failures block the proposed change with a
device-specific error. CloudVision connection, deployment, or workspace build
failures also block the proposed change and include the fabric and workspace
context when available.

## Workspace tracking

Successful validation creates or updates a deterministic CloudVision workspace
for the proposed change and target fabric. If the workspace already exists and
is not pending, the check returns it to a pending state before deploying the
latest configs and requesting a build.

When the tracking schema is loaded, validation also creates or updates a
`CloudvisionWorkspace` object in Infrahub. The object tracks:

- `name`: workspace display name
- `workspace_id`: deterministic CloudVision workspace ID
- `proposed_change_id`: proposed change that created the workspace
- `workspace_url`: exact CloudVision workspace URL shown to reviewers
- `thread_id`: proposed-change overview thread used for workspace comments
- `change_control_id` / `change_control_url`: CloudVision change control created
  during submission, when one exists
- `last_submission_error` / `last_submission_attempt_at`: latest failed
  CustomWebhook submission attempt
- `submitted_at`: successful submission timestamp
- `status`: `pending`, `built`, `submitted`, `abandoned`, or `submit_failed`
- `fabric`: fabric validated by the workspace

The workspace ID is deterministic from proposed-change ID and fabric name, so a
validation rerun updates the same CloudVision workspace instead of creating a
new one. Separate proposed changes against the same fabric receive different
workspace IDs.

After a workspace is created or reused, validation creates or reuses one
deterministic `CoreChangeThread` in the proposed-change Overview. The first
comment contains the exact workspace URL. Rerunning validation for the same
proposed change and workspace reuses the stored `thread_id` or deterministic
thread label and does not duplicate the URL comment.

The CloudVision workspace display name uses the proposed-change name and fabric
name. Its description uses the proposed-change description, with a generic
Infrahub validation description when the proposed change has no description.
When the check context does not include full proposed-change metadata, the check
looks up the open proposed change by source branch and also tries the short
branch name for `feat/` branches.

If the `CloudvisionWorkspace` schema is unavailable during rollout, tracking is
skipped without masking CloudVision validation success or failure.

## CustomWebhook submission

The repository loads exactly one placeholder `CoreCustomWebhook` named
`cloudvision-workspace-submission`. It is associated with proposed-change
merge for the `cv-config-validation` workflow, references the
`cv-workspace-submission-webhook-payload` `CoreTransformPython`, and uses this
explicitly non-production URL:

```text
https://placeholder.invalid/cloudvision-workspace-submission
```

The placeholder is a repository-loadable handoff marker for this phase. No real external automation receiver is required, and the placeholder URL is not a production deployment endpoint.

The CustomWebhook processing entry point is
`submit_linked_workspace_for_custom_webhook()` in
`checks/cv_workspace_lifecycle.py`. It extracts the proposed-change ID and
branch from the submitted proposed-change event, ignores events that explicitly
identify a check other than `cv-config-validation`, and calls the shared
submission handler.

The shared submission handler is
`submit_linked_workspace_for_proposed_change()` in
`checks/cv_workspace_lifecycle.py`. It resolves `CloudvisionWorkspace` objects
by the submitted proposed-change ID on the selected branch and submits only when
exactly one linked workspace exists and is in a submit-ready state.

On success, the handler appends a comment to the existing workspace thread with
the CloudVision workspace identity and URL when available. The thread is marked
resolved only after the success or already-complete comment is saved.
Already-submitted workspaces are treated as complete and are not submitted
again.

On failure, the handler stores `status=submit_failed`, records the latest
failure reason, appends an unresolved failure comment when possible, and leaves
the thread unresolved. If thread or comment writes fail, the handler logs the
same proposed-change, workspace, fabric, and error context as the fallback.
If no linked workspace exists or multiple workspaces are linked ambiguously, the
handler creates a proposed-change submission outcome thread when possible and
records the skip or ambiguity there.

Manual retry uses the invoke task:

```bash
uv run invoke submit-cv-workspace --proposed-change-id <proposed-change-id> --branch main
```

## Operational notes

CloudVision validation depends on the AVD generator chain having already
produced structured-config artifacts. Missing artifacts do not exempt devices
from managed-fabric serial-number or inventory eligibility; they only remove the
device from workspace config deployment after eligibility succeeds.

CloudVision build or EOS validation failures should be handled as data fixes
first. Add schema or generator code only when a required configuration family
cannot be represented with the existing model.

The validation check builds workspaces for review only. CloudVision submission
is handled by CustomWebhook processing or the manual retry task, not
by the pre-merge validation check.

CloudVision change-control management and Semaphore Ansible playbooks are out of scope for this phase. The CustomWebhook is only the handoff point for future deployment automation after linked workspace submission.

## Related

- [Checks](./developer-guide/checks.md) — how the check is wired, its query and supporting modules, and
  how to run or extend it.
- [Schemas → CloudvisionWorkspace](./developer-guide/schemas.md#cloudvisionworkspace--cloudvisionworkspace)
  — the tracking node's attributes and relationships.
