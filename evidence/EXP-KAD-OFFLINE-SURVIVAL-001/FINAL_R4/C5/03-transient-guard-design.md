# C5-03 Transient Guard Design

Correct exact command authorized and executed by the human:

```text
sudo /usr/bin/systemd-run --unit=kad-offline-survival-r4-a001-c5-nm-guard --on-active=10s --collect --property=TimeoutStartSec=15s /usr/bin/nmcli device reapply enp7s0
```

Properties:

- Direct executable: `/usr/bin/nmcli`; no shell wrapper or interpolation.
- Fixed arguments: `device reapply enp7s0`.
- Root-owned system service/timer through `sudo systemd-run`.
- Unique experiment-specific unit identity.
- Ten-second bounded activation delay.
- Fifteen-second service start timeout.
- `--collect` requests transient unit collection after exit.
- Journal provides execution evidence.
- No persistent unit file is created.

An initial human attempt was rejected by the user as malformed and produced `Failed to find executable device`; read-only inspection found no timer or service remaining. The corrected command was separately authorized before execution.
