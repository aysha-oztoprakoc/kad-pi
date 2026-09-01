# EXP-KAD-OFFLINE-SURVIVAL-001-R4-A001

## Evidence Verdict

`INSUFFICIENT_EVIDENCE`

## Experiment Verdict

`ABORTED_SAFE`

## Gate

`BLOCKED — ROLLBACK_ASSURANCE_INSUFFICIENT`

## CONFIRMED

- R3 contract was found and hash-verified: `../FINAL_R3/r3-experiment-contract.md`, SHA-256 `7c19c63b0c8e53754ca4facc9fff47decdea79ed87aec38318fe98bd96d67870`.
- Repository HEAD remains `7401b87573f38706d8fb42b012cf818266f42281`.
- The intended R4 primary action remains exactly `route.delete.default` for the IPv4 default route via `192.168.0.1` on `enp7s0`.
- Current route exists on the expected interface and gateway.
- Current host state differs from the R3 observation: address is `192.168.0.3/24` rather than `192.168.0.2/24`, and R3-observed local `omp`/`koboldcpp-linux` listeners were not present.
- `/usr/bin/ip` and `/usr/bin/systemd-run` exist.
- `sudo -n -l` confirms only interactive `(ALL) ALL` access for these commands; no passwordless `/usr/bin/ip` or `/usr/bin/systemd-run` path exists.
- A deterministic rollback guard cannot be armed with independently executable privilege without relying on an interactive password after the route mutation.
- No fresh R4 human execution authorization was requested or inferred.
- No R4 V2 receipt or R4 preflight was created.
- No route deletion, watchdog creation, service stop, interface change, firewall change, or other experiment mutation occurred.

## INFERRED

- The R4 run cannot safely proceed: rollback assurance fails before mutation.
- Current runtime/address differences require a fresh feasibility review before any future attempt; they must not be silently treated as R3-equivalent.
- The safe action is to stop before authorization and mutation.

## UNKNOWN

- Whether interactive authentication could perform the route mutation.
- Whether a separately approved least-privilege rollback capability can be established.
- Offline survival, degradation, restoration, and reconciliation behavior remain unobserved.

## Deviations

- R4 authorization, receipt, preflight, execution, rollback, and recovery were not performed because the rollback hard precondition failed.

## Safety

- Interface was not intentionally disabled.
- LAN route was not deleted.
- NetworkManager was not stopped.
- Firewall was not changed.
- Unrelated services were not stopped.
- Existing dirty workspace state was preserved.
- No expired R3 receipt or preflight was reused.
- Rollback was not required because no mutation occurred.

## Next Gate

`REPEAT_WITH_CORRECTION`

Correction required: establish and evidence a deterministic, local, least-privilege rollback guard that can restore the exact observed route without post-mutation interactive authentication; then re-run fresh contract/authorization/preflight gates. Do not alter governance policy to obtain approval.
