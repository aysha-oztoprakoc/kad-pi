# C4-04 Transient Guard Rehearsal

Not executed. The required prerequisite—successful same-state rehearsal of the exact NetworkManager command—was not met because privileged authentication was unavailable in the tool session.

Existing C1 evidence proves only a harmless root transient `/usr/bin/true` probe. It does not prove execution of NetworkManager recovery. No new timer, service, persistent unit, sudoers rule, or profile change was created in C4.

Proposed future architecture, not proven here:

```text
systemd-run --system --unit=<unique-unit> --on-active=<bounded-delay> \
  --collect --property=TimeoutStartSec=<bounded-timeout> \
  /usr/bin/nmcli device reapply enp7s0
```

Before any future guard rehearsal, the exact unit name, delay, timeout, and command must be presented for separate authorization and verified through systemd/journal state. No post-mutation authentication would be required if armed successfully beforehand; this remains unproven for the NM command.
