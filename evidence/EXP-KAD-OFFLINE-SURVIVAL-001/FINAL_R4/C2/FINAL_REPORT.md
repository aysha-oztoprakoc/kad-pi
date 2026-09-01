# EXP-KAD-OFFLINE-SURVIVAL-001-R4-C2

## Verdict

`BLOCKED`

## Runtime Gate

`RUNTIME_NOT_READY`

## Rollback Gate

`ROLLBACK_NOT_ASSURED`

## CONFIRMED

- Repository HEAD: `7401b87573f38706d8fb42b012cf818266f42281`.
- Current address: `192.168.0.3/24` on `enp7s0`.
- NetworkManager: active; profile `Wired connection 1`; IPv4 method `auto`; `ipv4.never-default: no`; DHCP gateway `192.168.0.1`; route metric `100`.
- OMP CLI is available: `omp/18.0.11`; this task is executing inside the OMP/Luna harness context. The prior C1 listener-based OMP blocker is superseded: OMP is `INTERACTIVE_SESSION_PRESENT` and `CLI_AVAILABLE`.
- Pi CLI is available: `0.84.4`; no separate Pi daemon is required by the R3 contract. Pi is `CLI_AVAILABLE`; separate process presence is `NOT_REQUIRED_AS_SEPARATE_DAEMON`.
- KAD CLI and workctl are available and responded to help/status commands.
- Local inference is configured for localhost endpoints `127.0.0.1:5001` and `127.0.0.1:5002`, but both endpoints refused connection and no local inference process was found. Local inference is `UNAVAILABLE` and remains blocking because the R3 success criteria require local inference.
- Telemetry status: 37 records, 37 valid, 0 corrupted.
- The authorized rehearsal command was exactly:
  ```text
  sudo /usr/bin/ip -4 route replace default via 192.168.0.1 dev enp7s0 metric 100
  ```
- Route before rehearsal:
  ```text
  default via 192.168.0.1 dev enp7s0 proto dhcp src 192.168.0.3 metric 100
  ```
- Route immediately after rehearsal:
  ```text
  default via 192.168.0.1 dev enp7s0 metric 100
  ```
- The rehearsal preserved gateway, interface, and metric but removed explicit `proto dhcp` and `src` representation. It therefore did not preserve the complete observed route semantics.
- NetworkManager subsequently supplied/retained the DHCP route. Read-only detail showed two routes:
  ```text
  unicast default via 192.168.0.1 dev enp7s0 proto boot scope global metric 100
  unicast default via 192.168.0.1 dev enp7s0 proto dhcp scope global src 192.168.0.3 metric 100
  ```
- The duplicate `proto boot` route was uniquely identified without mutation.
- The explicitly authorized cleanup command was attempted but did not execute because sudo required a password unavailable to the non-interactive tool:
  ```text
  sudo /usr/bin/ip -4 route del default via 192.168.0.1 dev enp7s0 proto boot metric 100
  ```
- Current route state remains duplicated. No route deletion was successfully performed by this session; the route cleanup requires human interactive remediation.

## Required capability matrix

| Capability | Required? | Result |
|---|---:|---|
| KAD deterministic CLI | Yes | `CLI_AVAILABLE` |
| workctl | Yes | `CLI_AVAILABLE` |
| governance evaluator | Yes | `CLI_AVAILABLE` |
| OMP interactive harness | Yes | `INTERACTIVE_SESSION_PRESENT`, `CLI_AVAILABLE` |
| Pi runtime/API | Yes as bounded CLI capability; not separate daemon | `CLI_AVAILABLE`, separate daemon `NOT_REQUIRED_AS_SEPARATE_DAEMON` |
| local LLM inference | Yes per R3 success criteria | `UNAVAILABLE`, blocking |
| project/context files | Yes | accessible |
| telemetry | Yes | `PROCESS_PRESENT`, integrity valid |
| LAN services | Yes | NetworkManager/LAN route present; localhost services not fully qualified |
| external providers | No for survival; expected to degrade offline | not tested |

## NetworkManager characterization

Configuration evidence supports DHCP-installed default-route ownership: automatic IPv4, no static gateway/routes, `never-default=no`, and active DHCP gateway. This establishes likely event-dependent reinstallation on DHCP renewal/carrier/profile events, but not continuous immediate reconciliation. The rehearsal demonstrated that NetworkManager's DHCP route can coexist with an unqualified `proto boot` route; it did not establish safe deletion stability.

Classification: `EVENT_DEPENDENT_RESTORATION`.

## Rollback semantics

The effective restoration target is the DHCP-owned route:

```text
default via 192.168.0.1 dev enp7s0 proto dhcp src 192.168.0.3 metric 100
```

`proto dhcp` and `src` should not be blindly omitted when exact route representation matters. The authorized rehearsal proved that the previously proposed command is insufficient for preserving route metadata and can create a duplicate when NetworkManager retains/reinstalls its route.

## Guard

The harmless transient root-owned systemd probe from C1 remains proven and self-collected. It did not prove the corrected route restoration action. No real-action transient guard was created.

## Superseded findings

- C1 `OMP=BLOCKING because no listener found` → `SUPERSEDED_CLASSIFICATION` → `OMP INTERACTIVE_SESSION_PRESENT` and `CLI_AVAILABLE`.
- C1 `KoboldCpp/local inference=BLOCKING` remains blocking under the corrected capability-based taxonomy because configured local inference endpoints are unavailable and local inference is required by the frozen hypothesis.

## INFERRED

- The unqualified `ip route replace` command is not an exact semantic restoration for this DHCP-managed route.
- NetworkManager route ownership must be incorporated into any future execution contract.
- The current duplicate route state is a safety/provenance deviation requiring explicit cleanup before any further experiment gate.

## UNKNOWN

- Whether a proto-qualified deletion can be completed with interactive sudo.
- Whether a corrected proto-qualified route replacement reliably preserves NetworkManager ownership without duplication.
- Whether the local inference runtime can be restored through an authorized ordinary user-space action.
- Whether the experiment hypothesis can be validly re-scoped to omit local inference; this requires a human decision because it changes the frozen hypothesis.

## Security

- Broad NOPASSWD sudo added: `NO`
- Persistent sudoers changed: `NO`
- Persistent privileged service installed: `NO`
- Default route intentionally deleted: `NO`
- Interface changed: `NO`
- NetworkManager configuration changed: `NO`
- Firewall changed: `NO`
- Offline experiment executed: `NO`

## Evidence

- `evidence/EXP-KAD-OFFLINE-SURVIVAL-001/FINAL_R4/C1/rollback-correction.md`
- `evidence/EXP-KAD-OFFLINE-SURVIVAL-001/FINAL_R4/C2/FINAL_REPORT.md`

## Next Gate

`NOT_READY_FOR_EXECUTION`

Required next actions, in order:

1. Human-interactively remove only the uniquely identified `proto boot` duplicate and verify exactly one DHCP route remains.
2. Resolve local inference availability or obtain an explicit human decision to revise the hypothesis/contract.
3. Reassess rollback semantics and freeze no contract until runtime and route state are clean.
4. Do not request final R4 execution authorization or delete the default route.
