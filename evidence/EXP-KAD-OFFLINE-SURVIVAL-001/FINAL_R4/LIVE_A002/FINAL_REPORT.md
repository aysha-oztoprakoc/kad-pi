# EXP-KAD-OFFLINE-SURVIVAL-001-R4-A002 LIVE

## Evidence Verdict

`INSUFFICIENT_EVIDENCE`

The bounded attempt evidence supports a safe abort, but does not satisfy the full observer-continuity requirement for a corrected live attempt.

## Experiment Verdict

`ABORTED_SAFE_TIMING_BUDGET`

## Confirmed

- Attempt: `EXP-KAD-OFFLINE-SURVIVAL-001-R4-A002`
- Run ID: `r4-a002-live-001`
- Repository HEAD: `7401b87573f38706d8fb42b012cf818266f42281`
- Orchestrator: `role.kad-builder`
- Privileged authority: `actor.project_lead`
- Fresh bound request hash: `sha256:361b52e8f3de6071c2e924337e8ff74105705a2b1607003930756282b2e7f40e`
- Fresh V2 receipt: `har-v2-exp-offline-survival-r4-a002-live-002`
- Receipt hash: `sha256:e16e38e91e18e857cae47a3fe009906e3cceba9555c033552805237ee01cb5ff`
- Receipt validation: `valid=true`
- Fresh preflight request hash: `sha256:add5fc22c292a3d69baff562401eb33ca57014e11697c3f389a4eb2f23b1dad1`
- Fresh preflight decision: `ALLOW`
- Fresh observer was started before guard arming and verified active via `systemctl --user`.
- Guard unit `kad-offline-survival-r4-a002-live-rollback` was active/waiting.
- Guard command was exactly `/usr/bin/nmcli device reapply enp7s0`.
- At the mutation gate, the exact authorized deletion could not execute noninteractively because `sudo` required a password. The 15-second post-guard deadline had already elapsed; mutation was not attempted.
- The guard subsequently fired and self-collected.
- Final route remained `default via 192.168.0.1 dev enp7s0 proto dhcp src 192.168.0.3 metric 100`.
- `enp7s0` remained `UP/LOWER_UP`; NetworkManager and `Wired connection 1` remained active.

## PROVEN

- Fresh authorization artifact chain and exact command binding.
- Fresh receipt validation and deterministic `ALLOW` preflight.
- Fresh route observation and zero-time healthy-state verification.
- Observer-before-guard ordering and active observer verification.
- Transient guard activation and safe cleanup.
- No route mutation, outage, or unauthorized side effect.

## INFERRED

- None regarding route restoration after deletion or offline survival.

## UNKNOWN

- Route behavior after deletion.
- External/LAN/localhost/KAD/workctl/Pi/OMP/inference/telemetry behavior during route absence.
- Recovery after route deletion.

## UNTESTED REMAINDER

The entire route-deletion, offline-survival, and recovery hypothesis remains untested.

## Deviations

1. The first observer status probe used the system manager rather than `systemctl --user`; the subsequent deterministic user-manager probe established the observer as active.
2. The 180-second observer ended shortly after the scheduled observation duration, before the later safe-abort verification. It did not remain continuously active through the complete attempted rollback/post-recovery sequence.
3. `observer-repro.log` is troubleshooting output and is not execution evidence.

## Safety

```text
Route deletion executed: NO
Offline interval occurred: NO
Interface disabled: NO
NetworkManager stopped/restarted: NO
NetworkManager profile changed: NO
Firewall changed: NO
Sudoers changed: NO
Persistent privileged service installed: NO
Fallback invoked: NO
Unrelated route deleted: NO
A001 execution artifacts reused: NO
```

## Next Gate

`REPEAT_WITH_CORRECTION`

A future attempt requires a fresh scope and an observer implementation whose verified lifetime demonstrably spans guard firing and post-recovery verification, with sufficient remaining authorization validity and a human-terminal mutation path that can meet the 15-second deadline.
