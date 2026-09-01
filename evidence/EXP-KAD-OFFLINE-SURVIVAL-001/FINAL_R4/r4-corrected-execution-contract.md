# R4 Corrected Execution Contract

Contract status: `FROZEN_AFTER_C5_ROLLBACK_PROOF`
Attempt: `EXP-KAD-OFFLINE-SURVIVAL-001-R4-A001`
Repository HEAD: `7401b87573f38706d8fb42b012cf818266f42281`
Governance baseline: `7eee4dfdf10c2e01f6fb677073e99ba2343d376b`

## Network boundary

- Interface: `enp7s0`
- NetworkManager connection: `Wired connection 1`
- UUID: `9c23d2ca-ec44-3fba-996b-b06596698315`
- IPv4: DHCP (`ipv4.method=auto`)
- Gateway: `192.168.0.1`
- Dynamic address: current observation `192.168.0.3/24`; do not bind future execution to a fixed source address
- Canonical route: exactly one IPv4 default in main table, `proto dhcp`, via expected gateway on `enp7s0`, expected metric, no `proto boot` residue

## Runtime

C3 runtime gate: `RUNTIME_READY`. OMP/Pi and KoboldCpp readiness remain as established by C3; C5 local KoboldCpp probe returned model `koboldcpp/L3-8B-Stheno-v3.2-Q4_K_M` at `127.0.0.1:5001/v1`.

## Rollback

Primary command:

```text
/usr/bin/nmcli device reapply enp7s0
```

Guard design:

```text
sudo /usr/bin/systemd-run --unit=kad-offline-survival-r4-a001-c5-nm-guard --on-active=10s --collect --property=TimeoutStartSec=15s /usr/bin/nmcli device reapply enp7s0
```

The guard is root-owned, transient, local, direct-exec, journaled, bounded, and self-collecting. No fallback is selected. The state machine is `ARMED → NM_REAPPLY → VERIFY_CANONICAL_DEFAULT → RECOVERED | RECOVERY_FAILED`.

## Limits and observation

C5 proves healthy-state invocation and independent timer execution, not route recreation after deletion. Future live execution must separately authorize the route fault and observe recovery for a bounded window defined by the fresh execution receipt. Abort on unexpected link/profile/firewall/configuration changes, duplicate defaults, non-DHCP route residue, or failed deterministic verification.

No execution receipt is created by C5.
