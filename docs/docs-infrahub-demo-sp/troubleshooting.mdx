# Troubleshooting

Common failure modes and their fixes. If your problem is not here, check
the [Infrahub documentation](https://docs.infrahub.app) or open an issue.

---

## Bootstrap timeout

**Symptom:**

```text
[ERROR] ConnectionRefusedError: [Errno 111] Connection refused
```

or the bootstrap script exits immediately with "Infrahub not reachable".

**Cause:** The bootstrap script runs too soon after `docker compose up`.
Infrahub takes 20–40 seconds to initialise its database and API server.

**Fix:**

```bash
# Wait for Infrahub to be ready, then bootstrap manually:
uv run invoke start
sleep 40
uv run invoke bootstrap
```

Alternatively, run `invoke init` which includes a built-in wait, but if your
machine is slow, increase the sleep in `tasks.py`:

```python
# tasks.py — find the sleep call in init_demo and increase it
time.sleep(40)  # change to 60 or more on slow machines
```

---

## Generator fails: "No free physical interface"

**Symptom:**

```text
RuntimeError: No free physical interface on pe-lon-arista
```

**Cause:** The `L3VpnGenerator` allocates PE-CE interfaces by picking the
first `InterfacePhysical` with `status = free` on the target PE. All
interfaces on that PE are already in use (either `active` or `cust`).

**Fix:** Create a free interface on the PE via the Infrahub UI or GraphQL:

```bash
curl -s -X POST http://localhost:8000/graphql \
  -H "X-INFRAHUB-KEY: 06438eb2-8019-4776-878c-0941b1f1d1ec" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation {
      InterfacePhysicalCreate(data: {
        name: {value: \"Ethernet10\"},
        status: {value: \"free\"},
        mtu: {value: 9000},
        device: {hfid: [\"pe-lon-arista\"]}
      }) { ok object { id } }
    }"
  }'
```

Repeat for whichever PE is out of free interfaces.

---

## Port conflict: Infrahub already running

**Symptom:**

```text
Error response from daemon: driver failed programming external connectivity ...
Bind for 0.0.0.0:8000 failed: port is already allocated
```

**Cause:** Another process (or a leftover container) is using port 8000,
4200 (Prefect), or 8501 (Streamlit).

**Fix:**

```bash
# Find what is using the port:
lsof -i :8000

# Stop leftover containers from this project:
docker compose -p sp-demo down

# If another unrelated project is running on the same port,
# override the port in .env:
echo "INFRAHUB_PORT=8001" >> .env
# Then update INFRAHUB_ADDRESS accordingly:
echo 'INFRAHUB_ADDRESS="http://localhost:8001"' >> .env
uv run invoke start
```

---

## Containerlab: image pull failure

### SR Linux (`ghcr.io/nokia/srlinux`)

```text
Error response from daemon: Head "https://ghcr.io/...": unauthorized
```

SR Linux is on GitHub Container Registry and requires a GitHub token:

```bash
docker login ghcr.io -u <github-username> -p <personal-access-token>
```

Create a PAT at https://github.com/settings/tokens with `read:packages` scope.

### Arista cEOS (`ceos:latest`)

cEOS is not on any public registry. Download the `.tar.xz` from the Arista
Software Downloads portal (requires an Arista account) and import it:

```bash
docker import cEOS-lab-4.30.0F.tar.xz ceos:latest
docker image ls ceos
```

### network-multitool (`ghcr.io/hellt/network-multitool`)

This is a public image. If it fails, you may be hitting Docker Hub rate
limits. Authenticate with Docker Hub:

```bash
docker login docker.io
```

---

## Streamlit catalog: "Infrahub not reachable"

**Symptom:** The Streamlit app loads but shows "Cannot connect to Infrahub".

**Cause:** `INFRAHUB_ADDRESS` is not set or points to the wrong host/port.

**Fix:**

```bash
# Verify the env var is set:
grep INFRAHUB_ADDRESS .env

# If running Streamlit outside Docker Compose, ensure the address
# points to the correct host:
echo 'INFRAHUB_ADDRESS="http://localhost:8000"' >> .env
uv run streamlit run service_catalog/app.py
```

If you are running the Streamlit app inside Docker Compose, use the
internal service name:

```bash
INFRAHUB_ADDRESS=http://infrahub-server:8000
```

---

## Schema load order error

**Symptom:**

```text
SchemaNotFound: Node 'RoutingProtocol' not found
```

**Cause:** The SP schemas (`schemas/sp/`) reference base and extension nodes
that were not loaded first.

**Fix:** Always load schemas in order:

```bash
infrahubctl schema load schemas/base/
infrahubctl schema load schemas/extensions/
infrahubctl schema load schemas/sp/
```

`invoke bootstrap` does this automatically. If you loaded schemas manually
in the wrong order, run `invoke destroy && invoke init` to start clean.

---

## Proposed Change: check fails after generator runs

**Symptom:** The `pe_interface_alloc` check fails even though the generator
ran and set the interface.

**Cause:** The check reads the current branch state. If the generator ran on
a previous branch and the change was already merged, the interface status may
already be `cust` on `main`, making it appear unavailable for a new site.

**Fix:** Use a different (free) interface for the new site, or set an
existing `cust`-status interface back to `free` if it was decommissioned.

---

## yamllint: line too long

**Symptom:**

```text
[error] line too long (105 > 100 characters)
```

**Cause:** Bootstrap YAML files sometimes have long inline object specs.

**Fix:** Break the long line or raise the limit in `.yamllint.yml`:

```yaml
rules:
  line-length:
    max: 120
    level: warning   # demote from error to warning if needed
```

---

## uv sync fails

**Symptom:** `uv sync` fails with a resolver error or `requires-python`
mismatch.

**Fix:**

```bash
# Verify your Python version:
python --version   # must be 3.10, 3.11, or 3.12

# If using pyenv:
pyenv install 3.12
pyenv local 3.12
uv sync
```
