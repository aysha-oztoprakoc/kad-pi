# R2 privilege apparatus inspection

Read-only discovery completed before any privileged action.

- `systemd-run`: `/usr/bin/systemd-run`
- `systemctl is-system-running`: `running`
- `ip`: `/usr/bin/ip`
- NetworkManager: active; `enp7s0` connected
- IPv4 default: `default via 192.168.0.1 dev enp7s0 proto dhcp src 192.168.0.2 metric 100`
- IPv6 default routes: none
- Interfaces: `lo`, `enp7s0`; no WireGuard, tun, tap, or ppp interface observed
- Proxy environment: none observed
- Sudo policy: interactive `(ALL) ALL`; no passwordless `/usr/bin/ip` or `/usr/bin/systemd-run`; existing passwordless entries are unrelated (`asdcontrol`, approved DNS helper, timezone helper)

A transient root-owned systemd one-shot timer/service appears to be the narrow candidate, but no transient unit was created during discovery. The exact unit command was not executed because fresh R2 authorization is required first.

R2 remains blocked at the authorization-model gate described in `r2-authorization-model.md`; no network mutation occurred.
