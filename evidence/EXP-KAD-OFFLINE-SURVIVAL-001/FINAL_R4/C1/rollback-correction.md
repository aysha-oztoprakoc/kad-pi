# EXP-KAD-OFFLINE-SURVIVAL-001-R4-C1

## Verdict

`BLOCKED`

## Rollback Gate

`ROLLBACK_NOT_ASSURED`

The transient systemd mechanism was successfully demonstrated for a harmless probe, but the full assurance gate is not met because runtime prerequisites are absent and NetworkManager interaction has not been behaviorally established without performing the prohibited route mutation.

## Identity

- Parent attempt: `EXP-KAD-OFFLINE-SURVIVAL-001-R4-A001`
- Repository HEAD: `7401b87573f38706d8fb42b012cf818266f42281`
- R3 contract SHA-256: `7c19c63b0c8e53754ca4facc9fff47decdea79ed87aec38318fe98bd96d67870`
- Correction timestamp: `2026-08-31T11:17:58-03:00`

## Current network baseline

- IPv4 address: `192.168.0.3/24`
- Interface: `enp7s0`, `UP`, `LOWER_UP`
- Default route: `default via 192.168.0.1 dev enp7s0 proto dhcp src 192.168.0.3 metric 100`
- LAN route: `192.168.0.0/24 dev enp7s0 proto kernel scope link src 192.168.0.3 metric 100`
- NetworkManager: `active`
- Connection: `Wired connection 1`, interface `enp7s0`, UUID `9c23d2ca-ec44-3fba-996b-b06596698315`
- IPv4 method: `auto`; `ipv4.never-default: no`; gateway and routes are DHCP-derived

## Runtime drift

| Component | Classification | Evidence |
|---|---|---|
| Client IPv4 | `BENIGN_DYNAMIC_DRIFT` | Current DHCP address is `.3/24`; contract binds gateway/interface, not fixed client address. |
| OMP | `BLOCKING` | No OMP process/listener was found; R3 required `127.0.0.1:39651` under observation. |
| Pi | `UNKNOWN` | No distinct Pi process/runtime was identified; no assumption made. |
| KoboldCpp/local inference | `BLOCKING` | No `koboldcpp` process/listener was found; R3 required `127.0.0.1:5001`. |
| Telemetry | `PROCESS_PRESENT` | `bin/kad-telemetry status --json`: 37 total, 37 valid, 0 corrupted. |

## Guard authorization and proof

Explicit authorization was obtained for this correction only: `APPROVE EXACT GUARD PROBE`.

Created transient unit:

```text
kad-offline-survival-r4-a001-c1-rollback-probe.timer
kad-offline-survival-r4-a001-c1-rollback-probe.service
```

Command:

```text
sudo /usr/bin/systemd-run \
  --unit=kad-offline-survival-r4-a001-c1-rollback-probe \
  --on-active=5s --collect /usr/bin/true
```

Observed:

- timer result: `success`
- service result: `success`
- service: `inactive/dead` after successful completion
- journal: systemd recorded start and successful deactivation
- unit was transient and self-collected; no persistent unit file remained

This proves authenticated pre-mutation creation and independent execution of a harmless root transient unit. It does not prove route restoration itself, because executing `ip route replace` would be an infrastructure mutation and was not authorized in this correction.

## Proposed restoration semantics

From the current observed route, the bounded action would be:

```text
/usr/bin/ip -4 route replace default via 192.168.0.1 dev enp7s0 metric 100
```

This is an idempotent replacement scoped to the observed IPv4 default route, gateway, interface, and metric. No rehearsal was performed. The route remained present throughout.

## Contract status

No revised R4 execution contract was frozen. The required runtime components are absent, and NetworkManager's behavior after manual route deletion remains untested. The R3 contract remains historical and unchanged.

## Security

- Broad passwordless sudo added: `NO`
- Persistent sudoers changed: `NO`
- Persistent privileged service installed: `NO`
- Default route deleted: `NO`
- Interface changed: `NO`
- NetworkManager changed: `NO`
- Firewall changed: `NO`
- Experiment executed: `NO`

## Evidence paths

- Parent safe-abort baseline: `../00-r4-baseline.md`
- Parent safe-abort report: `../FINAL_REPORT.md`
- This correction: `evidence/EXP-KAD-OFFLINE-SURVIVAL-001/FINAL_R4/C1/rollback-correction.md`

## Next Gate

`NOT_READY_FOR_EXECUTION`

Required corrections: restore or explicitly re-scope the required OMP/Pi/local-inference runtime through an authorized decision, and establish NetworkManager route interaction without weakening governance or broadening mutation scope. Do not request final execution authorization yet.
