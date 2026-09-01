# R2 exact fault and restore contract

This is a recorded candidate contract only; it was not authorized or executed.

## Target

- Host: AMDY
- Interface: `enp7s0`
- Gateway: `192.168.0.1`
- Expected route: `default via 192.168.0.1 dev enp7s0 metric 100`
- Preserved LAN: `192.168.0.0/24`
- Preserved localhost: `127.0.0.0/8`, `::1`

## Fault

Delete only the observed IPv4 default route, using the exact route identity and interactive local OS authentication. No firewall, NetworkManager, persistent route, sudoers, daemon, or credential changes.

## Rollback

A root-owned transient systemd one-shot watchdog would execute an idempotent route replacement equivalent to:

```text
/usr/bin/ip -4 route replace default via 192.168.0.1 dev enp7s0 metric 100
```

The watchdog would be armed before fault injection, trigger after the bounded outage/watchdog interval, have no network dependency, and be removed only after route restoration was verified. Exact systemd unit properties and timestamps would need to be captured before route deletion.

Because the receipt schema cannot machine-validate issuer/delegate separation, this candidate was not armed and the route was not changed.
