---
title: Migrate Semaphore storage
description: Preserve Semaphore's SQLite database and configuration when moving to persistent Docker volumes.
audience: operator
---

# Migrate Semaphore storage

New Semaphore containers run with the current host user's UID/GID. Reports stay under `anta/`;
Semaphore's configuration and SQLite database live in project-scoped Docker volumes. Use this
procedure once when upgrading an existing checkout whose Semaphore container stores its state in
the container filesystem.

The start, stop, and initialization commands check the existing container and stop with a migration
message if its UID/GID or persistent mounts do not match. This prevents Compose's `down` operation
from removing an unmigrated container and its SQLite database. They leave its files and report
directory unchanged when that check fails.

## Prepare and back up

From the repository root, initialize credentials if needed and export the host identity for the
Docker commands in this procedure:

```bash
uv run invoke init-secrets
export SEMAPHORE_UID="${SEMAPHORE_UID:-$(id -u)}"
export SEMAPHORE_GID="${SEMAPHORE_GID:-$(id -g)}"
```

Finish or cancel Semaphore jobs in the UI before continuing. Find the stopped or running
Semaphore container and record its project and image IDs:

```bash
docker compose -f docker-compose.yml -f docker-compose.override.yml ps --all semaphore
SEMAPHORE_CONTAINER="$(docker compose -f docker-compose.yml -f docker-compose.override.yml ps --all --quiet semaphore)"
test -n "$SEMAPHORE_CONTAINER"
test "$(printf '%s\n' "$SEMAPHORE_CONTAINER" | wc -l)" -eq 1
COMPOSE_PROJECT="$(docker inspect --format '{{index .Config.Labels "com.docker.compose.project"}}' "$SEMAPHORE_CONTAINER")"
OLD_IMAGE_ID="$(docker inspect --format '{{.Image}}' "$SEMAPHORE_CONTAINER")"
OLD_IMAGE="infrahub-semaphore:rollback-$(date -u +%Y%m%dT%H%M%SZ)"
docker image tag "$OLD_IMAGE_ID" "$OLD_IMAGE"
```

Build the image before stopping the running service, then stop only Semaphore. The old container
remains available as the source for the backup:

```bash
uv run invoke build
docker compose -f docker-compose.yml -f docker-compose.override.yml stop semaphore
```

Create a private, timestamped backup outside the image build context and copy both directories
from the stopped container:

```bash
umask 077
BACKUP_DIR=".semaphore-backups/$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$BACKUP_DIR/config" "$BACKUP_DIR/data"
chmod 0700 .semaphore-backups "$BACKUP_DIR"
BACKUP_DIR="$(cd "$BACKUP_DIR" && pwd)"
docker cp "$SEMAPHORE_CONTAINER:/etc/semaphore/." "$BACKUP_DIR/config/"
docker cp "$SEMAPHORE_CONTAINER:/var/lib/semaphore/." "$BACKUP_DIR/data/"
```

Confirm the saved SQLite database passes its integrity check before creating volumes:

```bash
python3 -c 'import sqlite3,sys; db=sqlite3.connect("file:"+sys.argv[1]+"?mode=ro",uri=True); result=db.execute("PRAGMA quick_check").fetchone(); print(result[0]); assert result == ("ok",)' "$BACKUP_DIR/data/database.sqlite"
```

## Restore and recreate

Derive the volume names from the existing Compose project. Refuse to reuse either volume if it
already exists; that can indicate an earlier or partial migration that should be inspected first.
Compose creates the volumes with the correct project labels when the migration helper runs.

```bash
CONFIG_VOLUME="${COMPOSE_PROJECT}_semaphore_config"
DATA_VOLUME="${COMPOSE_PROJECT}_semaphore_data"
if docker volume inspect "$CONFIG_VOLUME" >/dev/null 2>&1 || docker volume inspect "$DATA_VOLUME" >/dev/null 2>&1; then
  echo "Semaphore volume already exists; inspect it and the backup before proceeding." >&2
  exit 1
fi
```

Copy each backup into its new empty volume using the freshly built Semaphore image as a root-only
helper. Each command checks that the destination is empty, preserves copied symlinks, and gives
Semaphore private ownership of the restored files:

```bash
docker compose -f docker-compose.yml -f docker-compose.override.yml run --rm --no-deps \
  --user 0:0 --env SEMAPHORE_UID --env SEMAPHORE_GID \
  --volume "$BACKUP_DIR/config:/migration:ro" --entrypoint /bin/sh semaphore -ec \
  'test -z "$(find /etc/semaphore -mindepth 1 -maxdepth 1 -print -quit)"; cp -a /migration/. /etc/semaphore/; chown -hR "$SEMAPHORE_UID:$SEMAPHORE_GID" /etc/semaphore; find /etc/semaphore -type d -exec chmod 0700 {} \;; find /etc/semaphore -type f -exec chmod 0600 {} \;'

docker compose -f docker-compose.yml -f docker-compose.override.yml run --rm --no-deps \
  --user 0:0 --env SEMAPHORE_UID --env SEMAPHORE_GID \
  --volume "$BACKUP_DIR/data:/migration:ro" --entrypoint /bin/sh semaphore -ec \
  'test -z "$(find /var/lib/semaphore -mindepth 1 -maxdepth 1 -print -quit)"; cp -a /migration/. /var/lib/semaphore/; chown -hR "$SEMAPHORE_UID:$SEMAPHORE_GID" /var/lib/semaphore; find /var/lib/semaphore -type d -exec chmod 0700 {} \;; find /var/lib/semaphore -type f -exec chmod 0600 {} \;'
```

Update ownership of existing report and staging files without following symlinks, and remove
write permission for other users:

```bash
sudo find -P anta lab/clab-staging -xdev ! -type l -exec chown "$SEMAPHORE_UID:$SEMAPHORE_GID" {} +
sudo find -P anta lab/clab-staging -xdev ! -type l -exec chmod o-w {} +
```

Recreate only the Semaphore service after both volumes contain the verified backup:

```bash
docker compose -f docker-compose.yml -f docker-compose.override.yml up -d --no-deps --force-recreate semaphore
docker compose -f docker-compose.yml -f docker-compose.override.yml ps semaphore
```

Confirm the UI can log in, projects and job history are present, and a new ANTA report in `anta/`
belongs to the current host user. Keep the backup and `OLD_IMAGE` tag until these checks pass. To roll
back the image while keeping the migrated SQLite data and configuration, first stop Semaphore and
prepare the old image's writable paths:

```bash
docker compose -f docker-compose.yml -f docker-compose.override.yml stop semaphore
docker run --rm --user 0:0 --env SEMAPHORE_UID --env SEMAPHORE_GID \
  --volume "$CONFIG_VOLUME:/etc/semaphore" --volume "$DATA_VOLUME:/var/lib/semaphore" \
  --entrypoint /bin/sh "$OLD_IMAGE" -ec \
  'mkdir -p /tmp/semaphore; chown -hR "$SEMAPHORE_UID:$SEMAPHORE_GID" /home/semaphore /etc/semaphore /var/lib/semaphore /tmp/semaphore; chmod 0755 /home/semaphore; chmod 0700 /etc/semaphore /var/lib/semaphore /tmp/semaphore'
printf 'services:\n  semaphore:\n    image: "%s"\n    build: null\n' "$OLD_IMAGE" > "$BACKUP_DIR/rollback.yml"
docker compose -f docker-compose.yml -f docker-compose.override.yml -f "$BACKUP_DIR/rollback.yml" \
  up -d --no-deps --force-recreate semaphore
```

Keep the original backup for recovery if the migrated data itself is damaged. Do not remove either
backup or volume during rollback.

## Ongoing lifecycle

`uv run invoke stop`, `start`, and service recreation retain the named volumes. `uv run invoke destroy`
uses `docker compose down -v` and intentionally removes Semaphore's database and configuration.

Invoke detects UID/GID from the calling user. For direct Compose commands, export `SEMAPHORE_UID` and
`SEMAPHORE_GID` as shown above. Overrides may also be placed in the ignored `.env` file. The UID must
match the host owner of `anta/` and `lab/clab-staging/`; otherwise Invoke stops before changing their
permissions.
