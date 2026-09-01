# C5-02 NM Reapply Verification

Verification timestamp: `2026-08-31T13:38:34-03:00`

Observed after human-terminal execution:

```text
default via 192.168.0.1 dev enp7s0 proto dhcp src 192.168.0.3 metric 100
192.168.0.0/24 dev enp7s0 proto kernel scope link src 192.168.0.3 metric 100
enp7s0: UP, LOWER_UP, CARRIER
192.168.0.3/24
NetworkManager: active
Wired connection 1: active on enp7s0
```

Positive probes passed:

- LAN gateway `192.168.0.1`: one-packet ping succeeded.
- External/default-route address `1.1.1.1`: one-packet ping succeeded.
- KoboldCpp `127.0.0.1:5001/v1/models`: returned loaded model `koboldcpp/L3-8B-Stheno-v3.2-Q4_K_M`.
- `./bin/workctl status`: command available and returned state.

No duplicate default, `proto boot` route, address loss, link disruption, NetworkManager failure, or profile deactivation was observed.

```text
NM_REAPPLY_SAME_STATE_REHEARSAL = PASS
```

This proves healthy-state execution and preservation only. It does not prove restoration after route deletion.
