# EXP-KAD-OFFLINE-SURVIVAL-001-R4-A001 LIVE

## Experiment

`EXP-KAD-OFFLINE-SURVIVAL-001-R4-A001`

## Evidence Verdict

`ACCEPT_EVIDENCE`

## Experiment Verdict

`ABORTED_SAFE`

## CONFIRMED

- Repository HEAD: `7401b87573f38706d8fb42b012cf818266f42281`.
- Corrected contract SHA-256: `740bb02ff3fd90e4fa5a8ee4710303d60532ac5e341c25831a8d3b990273c029`.
- Orchestrator: `role.kad-builder`.
- Actual privileged actuator: `actor.project_lead`, human local terminal.
- Revised execution authorization: `APPROVE R4-A001 LIVE EXECUTION`.
- Authorization request hash: `sha256:5cc79ac974c275ce909ea12ab4ccf302607ddf3c3c2045f11ce1e7d1e5f15a13`.
- V2 receipt ID: `har-v2-exp-offline-survival-r4-a001-live-001`.
- V2 receipt hash: `sha256:04a5e17e3a6dff88460bf13522ab973d8c8c6eaa7cf0626deec6942a3ca939aa`.
- Receipt validation at execution time: `valid=true`; post-attempt revalidation occurred after expiry.
- Fresh preflight decision: `ALLOW`.
- Preflight request hash: `sha256:a9ae63b90a4fc3b9663b6aec123600fe2d2f915858c9fb1d07859559e826221d`.
- Preflight decision hash: `sha256:6369e566cc3f2c3b8fd9e5a628b8bf74305a199fbede8f131c9fa48005c0baaa`.
- Observer: user-owned transient `kad-offline-survival-r4-a001-live-observer.service`; raw log SHA-256 `ff73327e37ff8637df75810e4a158ecdd0dfa146da93c8558c9945411c29cd74`.
- Live guard: `kad-offline-survival-r4-a001-live-rollback`.
- Exact guard command:

  ```text
  sudo /usr/bin/systemd-run --unit=kad-offline-survival-r4-a001-live-rollback --on-active=60s --collect --property=TimeoutStartSec=15s /usr/bin/nmcli device reapply enp7s0
  ```

- Guard was verified active/waiting at `14:20:30 -03`.
- Guard fired at `14:21:33 -03` and successfully reapplied NetworkManager configuration while the route was still present.
- Guard service deactivated and self-collected.
- Independent reviewer verdict: `ACCEPT_EVIDENCE`; review: `09-independent-review.md`.
- Exact route-delete command was never executed:

  ```text
  sudo /usr/bin/ip -4 route del default via 192.168.0.1 dev enp7s0 proto dhcp metric 100
  ```

- Final route remained:

  ```text
  default via 192.168.0.1 dev enp7s0 proto dhcp src 192.168.0.3 metric 100
  ```

- NetworkManager remained active; `Wired connection 1` remained active on `enp7s0`.

## PROVEN

- Fresh human authorization, V2 receipt integrity, and deterministic `ALLOW` preflight.
- Independent local observer start, dry validation, and timestamped evidence capture.
- Live transient guard arming, exact command binding, timer execution, journal success, and cleanup.
- Canonical DHCP route remained clean throughout.
- No route mutation occurred.

## INFERRED

- None regarding live offline behavior; the mutation did not occur.

## UNKNOWN

- Route state after deletion.
- External reachability during an actual outage.
- LAN/localhost/KAD/Pi/OMP/inference behavior during an actual outage.
- Recovery after route deletion.

## UNTESTED REMAINDER

The entire route-deletion and offline-survival hypothesis remains untested. The guard delay elapsed before the mutation gate could be completed.

## Deviations

`ABORTED_SAFE`: the pre-armed guard fired before the route-delete command was authorized for execution at the final gate. No corrective routing mutation was attempted.

## Safety

```text
Interface intentionally disabled: NO
NetworkManager stopped: NO
NetworkManager profile changed: NO
Firewall changed: NO
Broad NOPASSWD sudo added: NO
Persistent privileged service installed: NO
Agent received sudo password: NO
Unrelated route deleted: NO
Expired receipt reused: NO
```

## Next Gate

`REPEAT_WITH_CORRECTION`

Do not automatically start another attempt. A future attempt requires a new explicit authorization scope, new receipt, new preflight, and a guard timing design that leaves sufficient budget for final gate and mutation.
