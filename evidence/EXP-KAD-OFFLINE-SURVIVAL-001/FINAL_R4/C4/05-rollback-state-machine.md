# C4-05 Rollback State Machine

The future guard must implement this deterministic transition model; it is not armed by C4:

```text
ARMED
  -> timeout/abort
PRIMARY_RECOVERY (/usr/bin/nmcli device reapply enp7s0)
  -> verify exact DHCP default route
     -> success: RECOVERED
     -> failure: authorized UUID connection activation fallback
        -> verify exact DHCP default route
           -> success: RECOVERED_FALLBACK
           -> failure: RECOVERY_FAILED / stop
```

Verification predicate: exactly one IPv4 default route in main table, `proto dhcp`, gateway supplied by the current DHCP observation, device `enp7s0`, current DHCP source address, and expected metric; no `proto boot` residue. Guard execution and timeout must be root-owned, bounded, fixed-argument, local, journaled, and transient/self-collecting.

The fallback is defined conceptually but not authorized, rehearsed, or armed in this task. A live route deletion remains the only direct test of primary route recreation.
