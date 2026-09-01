# C4-03 NetworkManager Rehearsal

## Authorization

Human authorization decision: `APPROVE EXACT NM ROLLBACK REHEARSAL`.

Exact authorized command:

```text
sudo /usr/bin/nmcli device reapply enp7s0
```

The authorization explicitly excluded route deletion, interface disablement, NetworkManager stop/restart, firewall/profile changes, and the offline experiment.

## T0

Captured at `2026-08-31T12:01:46-03:00`. One canonical DHCP default route was present; `enp7s0` was `UP/LOWER_UP`, carried `192.168.0.3/24`, and `Wired connection 1` was active.

## Execution

The exact command was attempted once. It did not execute because the tool session had no interactive sudo authentication channel:

```text
sudo: a terminal is required to read the password; either use the -S option or configure an askpass helper
sudo: a password is required
exit code: 1
```

No NetworkManager operation occurred. No network state was changed by this attempt.

## Result

`NM_ROLLBACK_REHEARSAL_NOT_EXECUTED`.

Consequently, no T1 post-rehearsal proof exists. The candidate remains a documented selection, not a behaviorally rehearsed recovery primitive.
