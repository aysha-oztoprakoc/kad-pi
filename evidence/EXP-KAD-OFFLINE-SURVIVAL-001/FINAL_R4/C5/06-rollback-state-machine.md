# C5-06 Rollback State Machine

Identity: `kad-offline-survival-r4-a001-c5-nm-guard`

```text
ARMED
  -> timeout/abort trigger
NM_REAPPLY
  -> VERIFY_CANONICAL_DEFAULT
     -> PASS: RECOVERED
     -> FAIL: RECOVERY_FAILED
```

Primary recovery command:

```text
/usr/bin/nmcli device reapply enp7s0
```

The C5 evidence supports the primary-only design. No broader `connection up` fallback is selected or armed; adding it would widen disruption without current evidence that it is needed.

Verification is state-based, not exit-code-only. Success requires exactly one usable IPv4 default route in the main table, DHCP-managed semantics, expected gateway/device, and no `proto boot` residue or duplicate default. The client source address is dynamic DHCP state and is not fixed in the predicate.

The state machine proves pre-armed independent execution and healthy-state preservation. Restoration after actual route deletion remains untested until live mutation.
