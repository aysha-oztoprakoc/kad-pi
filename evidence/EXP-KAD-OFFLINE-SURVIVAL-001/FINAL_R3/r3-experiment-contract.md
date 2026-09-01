# EXP-KAD-OFFLINE-SURVIVAL-001-R3 — Exact Experiment Contract

## Status

`FROZEN_FOR_HUMAN_AUTHORIZATION`; pre-execution only. This contract authorizes no execution by itself.

## Identity

- `experiment_id`: `EXP-KAD-OFFLINE-SURVIVAL-001-R3`
- `phase`: `R3 authorization and preflight`
- `repository_head`: `7401b87573f38706d8fb42b012cf818266f42281`
- `governance_implementation_baseline`: `7eee4dfdf10c2e01f6fb677073e99ba2343d376b`
- `governance_provenance_baseline`: `7401b87573f38706d8fb42b012cf818266f42281`
- `executor`: `role.kad-builder`
- `human_issuer`: `actor.project_lead` (human project lead; explicit approval required)
- `work_context`: `WP-KAD-GOVERNANCE-AUTHORIZATION-SEMANTICS-032R`

## Hypothesis and purpose

The local KAD/OMP/Pi core survives loss of the WAN default route while LAN and localhost remain available, degrades remote capabilities without unauthorized escalation, continues bounded local workflows and telemetry, and restores/reconciles cleanly after the route is restored. This is an `[EXPERIMENT]`; only measured observations may be classified `[OBSERVED]`.

## Primary operation

- `operation_class`: `INFRASTRUCTURE_MUTATION`
- `primary_action`: `route.delete.default`
- Exact operation: delete only the observed IPv4 default route `default via 192.168.0.1 dev enp7s0 metric 100`; do not bring an interface down and do not alter firewall, DNS configuration, persistent routes, NetworkManager configuration, sudoers, daemons, credentials, or host routing beyond that exact transient route.

## Resources and scope

- Host: `host.amdy.workstation`
- Interface: `network-interface:enp7s0`
- Route: `route:ipv4-default-via-192.168.0.1`
- Preserved LAN: `192.168.0.0/24`
- Preserved localhost: `127.0.0.0/8`, `::1`
- Observed systemd control plane: systemd PID 1; NetworkManager service
- Local runtime/control services under observation: `omp` on `127.0.0.1:39651`; `koboldcpp-linux` on `127.0.0.1:5001`; local DNS listeners on loopback
- Required telemetry: local KAD telemetry and append-only experiment evidence
- Canonical evidence scope: `evidence/EXP-KAD-OFFLINE-SURVIVAL-001/FINAL_R3/`
- Canonical requested path: `evidence/EXP-KAD-OFFLINE-SURVIVAL-001/FINAL_R3/`

## Network transition

`OFFLINE_WAN` means loss of the IPv4 default route only. It is not interface-down, DNS unavailability, LAN loss, localhost loss, VPN teardown, or provider shutdown. LAN and localhost must remain available. No IPv6 default route, tunnel, proxy, or alternate WAN path is authorized.

## Observation window and validity

- Planned fault-observation window: 5 minutes after the route deletion is verified.
- Authorization validity: from explicit human approval/receipt `not_before` through the exact receipt `action_valid_until`; rollback remains authorized through `recovery_deadline`.
- The deterministic preflight decision is separately short-lived and must be fresh at execution time.

## Rollback and safe de-escalation

- `rollback_action`: `route.replace.default`
- Exact rollback command semantics: `/usr/bin/ip -4 route replace default via 192.168.0.1 dev enp7s0 metric 100`
- Rollback resource: `route:ipv4-default-via-192.168.0.1` on `network-interface:enp7s0` at `host.amdy.workstation`
- Rollback scope: only restoration of that transient IPv4 default route; no persistent or unrelated network changes.
- Rollback window: receipt `recovery_deadline`; route restoration must be verified before closure.
- Safe de-escalation: stop the observation, restore the exact route, verify LAN/localhost/control-plane/telemetry, then release any execution claim; never escalate to interface, firewall, DNS, or service mutation.
- Candidate root-owned transient systemd watchdog must be armed before deletion and removed only after restoration verification; its exact unit properties and timestamps must be captured before any future execution. No watchdog is created in R3 preflight.

## Stop conditions

Abort and restore immediately on unexpected loss of local control plane, loss of rollback capability, telemetry failure making outcome unknowable, unauthorized resource impact, policy/receipt/request mismatch, lease or receipt expiry, unknown high-impact state, loss of LAN or localhost preservation, alternate WAN path discovery, or inability to verify restoration.

## Success criteria

PASS requires measured evidence that: the exact default route was removed; LAN and localhost remained reachable; systemd/OMP/local inference and required local telemetry remained controllable; remote-dependent capabilities degraded without unauthorized escalation; the bounded offline workflow completed; the exact route was restored; post-restore reconciliation and integrity checks passed; and no prohibited resource was changed.

## Failure criteria

FAIL/ABORT for any stop condition, route/interface scope deviation, loss of rollback or evidence, unauthorized mutation, control-plane failure, or failed restoration. `INCONCLUSIVE` if required telemetry or postconditions are missing even when no adverse state is observed.

## Prohibited operations

No execution occurs in this authorization/preflight phase. No interface disablement, network service stop, firewall/routing persistence change, privileged mutation, paid API call, raw-secret access, governance-policy change, successor workpackage, or unrelated file mutation is permitted.
