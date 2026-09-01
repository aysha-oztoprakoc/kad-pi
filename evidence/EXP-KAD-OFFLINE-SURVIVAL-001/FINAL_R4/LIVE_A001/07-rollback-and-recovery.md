# LIVE_A001-07 Rollback and Recovery

Guard unit: `kad-offline-survival-r4-a001-live-rollback`

The transient guard fired at `2026-08-31 14:21:33 -03` while the canonical route was still present. Journal:

```text
Started [systemd-run] /usr/bin/nmcli device reapply enp7s0.
Connection successfully reapplied to device 'enp7s0'.
kad-offline-survival-r4-a001-live-rollback.service: Deactivated successfully.
```

The unit self-collected. No route recovery was required because no route deletion occurred.

Guard classification: `GUARD_REAPPLIED_AFTER_ALREADY_RESTORED` is not used as an experimental recovery result; the precise outcome is `ABORTED_SAFE_BEFORE_MUTATION` because the guard fired before the mutation gate.

Final route remained:

```text
default via 192.168.0.1 dev enp7s0 proto dhcp src 192.168.0.3 metric 100
```

No recovery-after-deletion evidence exists.
