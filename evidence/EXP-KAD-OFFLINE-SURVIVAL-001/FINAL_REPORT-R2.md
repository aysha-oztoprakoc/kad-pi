# EXP-KAD-OFFLINE-SURVIVAL-001-R2 — Qualification Report

## Verdict

**BLOCKED.** R2 did not enter authorization, claim creation, watchdog arming, WAN fault injection, or offline execution.

Attempt 0 remains `BLOCKED` for missing human receipt. R1 remains `BLOCKED` because no independently guaranteed privileged restoration path existed. Both records are preserved.

## Discovery

The host is systemd-managed and running. `/usr/bin/systemd-run` is present. The active route is `default via 192.168.0.1 dev enp7s0 metric 100`; LAN and localhost prerequisites remain as recorded in R1. No IPv6 default route, VPN/tunnel interface, or proxy environment was observed. Sudo permits interactive `(ALL) ALL`, but does not grant passwordless `/usr/bin/ip` or `/usr/bin/systemd-run`.

A transient root-owned systemd one-shot watchdog is the narrow candidate apparatus. Its candidate rollback command is recorded in `r2-exact-fault-and-restore-contract.md`. It was not created or tested.

## Blocking defect

The current `HUMAN_AUTHORIZATION_RECEIPT_V1` implementation has only `actor_id`. It does not represent or validate separate human issuer and authorized executor/delegate identities. Encoding the distinction in free-text `note` would not be machine-verifiable; treating one actor as both issuer and executor would repeat R1's audit ambiguity.

Therefore no fresh R2 receipt was requested, no R2 claim was created, and no privileged command was attempted. This is a governance-model expressiveness defect, classified `GOVERNANCE_FAILURE`, severity P2. The experiment did not modify the governance subsystem.

## Empirical capability result

No WAN outage occurred. All offline capabilities are `NOT_TESTED`; no survival, degradation, local-inference, remote-failure, restoration, or integrity result may be claimed. No permanent privilege, route, firewall, NetworkManager, daemon, sudoers, or credential change occurred.

## Evidence

- `r2-privilege-apparatus-inspection.md`
- `r2-authorization-model.md`
- `r2-exact-fault-and-restore-contract.md`
- `receipts-manifest.json`
- preserved attempt 0 and R1 evidence

No successor workpackage was started.
