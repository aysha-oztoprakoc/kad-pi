# R4-A002-02 Exact Scope Binding

Fresh route observation timestamp: `2026-08-31T14:57:06-03:00`

Observed canonical route:

```text
unicast default via 192.168.0.1 dev enp7s0 proto dhcp scope global src 192.168.0.3 metric 100
```

## Exact primary mutation command

Derived from the observation above; valid only while the zero-time gate observes the same tuple:

```text
sudo /usr/bin/ip -4 route del default via 192.168.0.1 dev enp7s0 proto dhcp metric 100
```

## Exact rollback guard command

```text
sudo /usr/bin/systemd-run --unit=kad-offline-survival-r4-a002-live-rollback --on-active=60s --collect --property=TimeoutStartSec=15s /usr/bin/nmcli device reapply enp7s0
```

The timer is root-owned, transient, local, direct-exec, journaled, bounded, and self-collecting. It invokes no fallback.

## Timing contract

- `T_ROUTE_DELETE_COMMAND <= T_GUARD_ARMED + 15 seconds`
- Authorized offline observation: exactly 30 seconds
- Observer duration: 180 seconds, read-only, user-owned
- No interactive authorization prompt occurs between guard verification and the already-authorized route deletion.

## Authorized resources and prohibitions

Resources: host `amdy.workstation`, interface `enp7s0`, current DHCP default route via `192.168.0.1`, evidence path `FINAL_R4/LIVE_A002/`.

Prohibited: disabling `enp7s0`; stopping/restarting NetworkManager; modifying NetworkManager profiles; modifying firewall or sudoers; installing persistent privileged services; deleting unrelated routes; broad fallback; redelegation; reuse of A001 artifacts.
