# LIVE_A001-04 Rollback Guard

Exact authorized command:

```text
sudo /usr/bin/systemd-run --unit=kad-offline-survival-r4-a001-live-rollback --on-active=60s --collect --property=TimeoutStartSec=15s /usr/bin/nmcli device reapply enp7s0
```

The command creates a root-owned transient systemd timer/service with a 60-second delay, 15-second start timeout, direct fixed executable, journal logging, and collection after exit. It invokes only `/usr/bin/nmcli device reapply enp7s0`.

This unit name is live-attempt-specific and differs from the C5 rehearsal unit. The guard was authorized in the fresh V2 receipt and preflight scope. It has not yet been armed.
