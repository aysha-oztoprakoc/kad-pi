# LIVE_A001-01 Fresh Execution Authorization Scope

Experiment: `EXP-KAD-OFFLINE-SURVIVAL-001-R4-A001`
Contract SHA-256: `740bb02ff3fd90e4fa5a8ee4710303d60532ac5e341c25831a8d3b990273c029`
Orchestrator: `role.kad-builder`
Privileged actuator: `actor.project_lead` (human local terminal)

Primary action: delete only the observed DHCP IPv4 default route.

Exact route-delete command:

```text
sudo /usr/bin/ip -4 route del default via 192.168.0.1 dev enp7s0 proto dhcp metric 100
```

Exact live rollback guard:

```text
sudo /usr/bin/systemd-run --unit=kad-offline-survival-r4-a001-live-rollback --on-active=60s --collect --property=TimeoutStartSec=15s /usr/bin/nmcli device reapply enp7s0
```

Observation duration: `30 seconds`.
Guard delay: `60 seconds`.
Primary rollback only: `/usr/bin/nmcli device reapply enp7s0`.

Approval explicitly excludes interface disablement, NetworkManager stop/restart, profile changes, firewall changes, sudoers changes, unrelated route deletion, persistent privileged services, and broader connection reactivation fallback.

A fresh V2 receipt and deterministic `ALLOW` preflight remain mandatory. No route mutation is authorized by this artifact alone.
