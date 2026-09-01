# R4-A002-01 Fresh Execution Authorization Scope

Experiment: `EXP-KAD-OFFLINE-SURVIVAL-001-R4-A002`
Attempt: `r4-a002-live-001`

## Requested operation

Authorize one bounded live attempt that deletes only the fresh observed DHCP IPv4 default route on `enp7s0`, observes the resulting offline interval for exactly 30 seconds, and relies exclusively on a pre-armed transient rollback guard.

Fresh route observation (`2026-08-31T14:42:52-03:00`):

```text
unicast default via 192.168.0.1 dev enp7s0 proto dhcp scope global src 192.168.0.3 metric 100
```

Exact route-delete command:

```text
sudo /usr/bin/ip -4 route del default via 192.168.0.1 dev enp7s0 proto dhcp metric 100
```

Exact rollback guard command:

```text
sudo /usr/bin/systemd-run --unit=kad-offline-survival-r4-a002-live-rollback --on-active=60s --collect --property=TimeoutStartSec=15s /usr/bin/nmcli device reapply enp7s0
```

The guard will be armed for 60 seconds. The route-delete command must execute no later than 15 seconds after `T_GUARD_ARMED`. If that deadline is missed, the route deletion will not be executed and the attempt will be classified `ABORTED_SAFE_TIMING_BUDGET`.

A fresh read-only observer with a total configured duration of 180 seconds is STARTED and deterministically VERIFIED ACTIVE immediately before guard arming. It must remain active continuously through `T_GUARD_ARMED`, route deletion, the complete 30-second offline observation interval, rollback, and post-recovery verification.

## Authority

- Orchestrator: `role.kad-builder`
- Privileged actuator: `actor.project_lead`, human local terminal
- Infrastructure mutation: `HUMAN_ONLY`
- No redelegation.

## Exact primary mutation

The exact route-delete command will be derived from the fresh zero-time route observation immediately before arming. It will target only the canonical DHCP default route on `enp7s0`; stale route tuples will cause a hard abort.

## Exact rollback boundary

Primary rollback only:

```text
/usr/bin/nmcli device reapply enp7s0
```

No fallback, NetworkManager restart, connection reactivation, interface disablement, profile change, firewall change, sudoers change, persistent service, or unrelated route operation is authorized.

## Preconditions and hard aborts

Abort before mutation on stale/invalid receipt, non-`ALLOW` preflight, route tuple mismatch, duplicate/noncanonical default route, unexpected interface/profile/firewall state, inactive observer, inactive/wrong guard, insufficient receipt validity, or inability to execute within the 15-second post-guard timing budget.

## Human decision

Requested decision: `APPROVE R4-A002 LIVE EXECUTION` or `REJECT`.

No execution, guard arming, route mutation, or offline observation is authorized by this preparation document alone.
