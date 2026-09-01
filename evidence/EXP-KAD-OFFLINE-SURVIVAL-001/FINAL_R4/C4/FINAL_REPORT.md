# EXP-KAD-OFFLINE-SURVIVAL-001-R4-C4

## Verdict

`BLOCKED`

## Route State

`ROUTE_CLEAN`

Observed route:

```text
default via 192.168.0.1 dev enp7s0 proto dhcp src 192.168.0.3 metric 100
```

## Runtime Gate

`RUNTIME_READY` (carried from C3; no contradictory evidence observed)

## Rollback Gate

`ROLLBACK_NOT_ASSURED`

## CONFIRMED

- Repository HEAD: `7401b87573f38706d8fb42b012cf818266f42281`.
- C3 evidence was preserved unchanged; C3 report SHA-256: `970e7b91b42acc6a25a14b34378c7e92ec64187136024a722501a196dc60c0c4`.
- NetworkManager connection: `Wired connection 1`; UUID `9c23d2ca-ec44-3fba-996b-b06596698315`; device `enp7s0`.
- IPv4 ownership: DHCP (`ipv4.method=auto`), no configured gateway/routes, `ipv4.never-default=no`, auto routes enabled.
- Preferred recovery primitive: `/usr/bin/nmcli device reapply enp7s0`.
- Human authorization: `APPROVE EXACT NM ROLLBACK REHEARSAL`.
- T0: one DHCP default route, `192.168.0.3/24`, interface `UP/LOWER_UP`, active NM profile.
- Exact command was attempted once but did not execute: sudo required an interactive terminal/password; exit code `1`.
- No transient NM timer/unit was armed. Existing C1 harmless `/usr/bin/true` transient probe remains the only transient proof.
- No corrected execution contract was frozen.
- No independent reviewer was launched; review status is `INSUFFICIENT_EVIDENCE`.

## PROVEN

- DHCP ownership and current canonical route state.
- Exact connection/device identity and candidate command.
- Human approval was obtained for the exact command.
- No mutation occurred because authentication failed before command execution.

## INFERRED

- `device reapply` is the least disruptive NetworkManager-supported candidate.
- Exact UUID connection activation is a broader possible fallback.
- A pre-armed root transient unit could avoid post-mutation authentication, but NM invocation compatibility was not demonstrated.

## UNTESTED UNTIL LIVE MUTATION

- Whether `nmcli device reapply enp7s0` recreates a directly deleted DHCP default route.
- Whether the exact command succeeds from a root-owned transient systemd unit.
- Whether UUID activation is an acceptable bounded fallback.
- Recovery behavior after the real route deletion.

## REJECTED

`simplified manual ip route replacement → REJECTED` (C2 proved `proto boot` residue/ownership mismatch).

## Safety

```text
Legitimate DHCP default route deleted: NO
Offline experiment executed: NO
Interface intentionally disabled: NO
NetworkManager stopped: NO
NetworkManager persistent configuration changed: NO
Firewall changed: NO
Broad NOPASSWD sudo added: NO
Persistent privileged service installed: NO
Final execution receipt created: NO
Expired receipt reused: NO
```

## Evidence package

- `00-networkmanager-baseline.md`
- `01-recovery-candidate-analysis.md`
- `02-candidate-decision.md`
- `03-nm-rehearsal.md`
- `04-transient-guard-rehearsal.md`
- `05-rollback-state-machine.md`
- `06-rollback-assurance.md`
- `07-independent-review.md`
- `FINAL_REPORT.md`

## Next Gate

`NOT_READY_FOR_EXECUTION`

Blocking prerequisite: repeat the exact authorized NM rehearsal in a session with pre-mutation privileged authentication available, then separately authorize and prove the transient NM guard. Do not create a fresh execution receipt or perform route deletion from this blocked state.
