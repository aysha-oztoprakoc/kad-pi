# EXP-KAD-OFFLINE-SURVIVAL-001-R4-C5

## Verdict

`PASS`

## Route State

`ROUTE_CLEAN`

## Runtime Gate

`RUNTIME_READY`

## Rollback Gate

`ROLLBACK_ASSURED`

## CONFIRMED

- Repository HEAD: `7401b87573f38706d8fb42b012cf818266f42281`.
- Current canonical route before, after NM reapply, and after transient guard:

  ```text
  default via 192.168.0.1 dev enp7s0 proto dhcp src 192.168.0.3 metric 100
  ```

- Human executed the exact NM command in the local terminal:

  ```text
  sudo /usr/bin/nmcli device reapply enp7s0
  ```

- NM same-state rehearsal: `PASS`.
- NM remained active; `Wired connection 1` remained active on `enp7s0`.
- `enp7s0` remained `UP/LOWER_UP`; `192.168.0.3/24` remained present.
- LAN gateway and external reachability probes passed.
- KoboldCpp `127.0.0.1:5001/v1/models` returned loaded `koboldcpp/L3-8B-Stheno-v3.2-Q4_K_M`.
- KAD/workctl availability probe returned successfully.
- Corrected exact transient command:

  ```text
  sudo /usr/bin/systemd-run --unit=kad-offline-survival-r4-a001-c5-nm-guard --on-active=10s --collect --property=TimeoutStartSec=15s /usr/bin/nmcli device reapply enp7s0
  ```

- Timer/service identity: `kad-offline-survival-r4-a001-c5-nm-guard`.
- Timer fired independently.
- Journal recorded:

  ```text
  Started [systemd-run] /usr/bin/nmcli device reapply enp7s0.
  Connection successfully reapplied to device 'enp7s0'.
  kad-offline-survival-r4-a001-c5-nm-guard.service: Deactivated successfully.
  ```

- Post-fire status/list-timers inspection found no remaining timer or service unit.
- Corrected contract frozen at:

  ```text
  evidence/EXP-KAD-OFFLINE-SURVIVAL-001/FINAL_R4/r4-corrected-execution-contract.md
  ```

- Contract SHA-256: `740bb02ff3fd90e4fa5a8ee4710303d60532ac5e341c25831a8d3b990273c029`.
- Independent reviewer verdict: `ACCEPT_EVIDENCE`.

## PROVEN

- Healthy-state NetworkManager reapply succeeds through human-terminal privilege execution.
- Canonical DHCP route and NetworkManager ownership survive reapply.
- Root-owned transient systemd guard can be armed with the exact direct command.
- Timer executes independently without post-arm authentication.
- Journal captures successful NM execution.
- Transient unit self-collects; no persistent experiment unit remains.
- No duplicate route or `proto boot` residue appears.
- Runtime, LAN, external reachability, and local inference remain available.

## INFERRED

- The same NM reconciliation primitive is expected to recreate/reconcile DHCP route state after direct route deletion.
- Primary-only recovery is preferable to broader UUID connection activation; no fallback was selected or armed.

## UNTESTED UNTIL LIVE MUTATION

- Actual restoration after `route.delete.default`.
- Restoration latency after deletion.
- Behavior if primary reconciliation fails after deletion.
- Offline-survival outcome.
- Whether NetworkManager independently restores the route before the guard fires.

## Security

```text
Default route deleted: NO
Offline experiment executed: NO
Interface disabled: NO
NetworkManager stopped: NO
NetworkManager profile changed: NO
Firewall changed: NO
Broad NOPASSWD sudo added: NO
Persistent privileged service installed: NO
Agent received sudo password: NO
Execution receipt created: NO
Expired receipt reused: NO
```

## Evidence package

- `00-precheck.md`
- `01-human-nm-reapply-rehearsal.md`
- `02-nm-reapply-verification.md`
- `03-transient-guard-design.md`
- `04-human-transient-guard-rehearsal.md`
- `05-transient-guard-verification.md`
- `06-rollback-state-machine.md`
- `07-corrected-contract.md`
- `08-independent-readiness-review.md`
- `FINAL_REPORT.md`

## Next Gate

`READY_FOR_FRESH_R4_EXECUTION_AUTHORIZATION`

This is a readiness result only. Do not create the fresh V2 execution receipt, delete the route, or execute the offline experiment in C5.
