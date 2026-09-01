# C4-00 NetworkManager Baseline

Timestamp: 2026-08-31T12:01:46-03:00
Repository HEAD: `7401b87573f38706d8fb42b012cf818266f42281`
Governance baseline: `7eee4dfdf10c2e01f6fb677073e99ba2343d376b`

## Observed ownership

- Connection ID: `Wired connection 1`
- UUID: `9c23d2ca-ec44-3fba-996b-b06596698315`
- Device: `enp7s0`; NetworkManager-managed; connected
- IPv4 method: `auto`
- `ipv4.never-default`: `no`
- Configured gateway/routes: none; `ipv4.gateway` and `ipv4.routes` are empty
- `ipv4.ignore-auto-routes`: `no`
- DHCP server/router: `192.168.0.1`
- Address: `192.168.0.3/24` (dynamic)
- Metric: `100` (active route; profile metric is default `-1`)
- DHCP lease time observed: `7200` seconds
- NM state: `connected`, full IPv4 connectivity

## Route baseline

```text
default via 192.168.0.1 dev enp7s0 proto dhcp src 192.168.0.3 metric 100
192.168.0.0/24 dev enp7s0 proto kernel scope link src 192.168.0.3 metric 100
```

Exactly one IPv4 default route was observed. Interface flags were `UP,LOWER_UP,CARRIER`; no `proto boot` residue.

## Command semantics inspected

`nmcli device reapply enp7s0` is documented locally as attempting to update the device with changes to the currently active connection made since last applied. It is the narrowest candidate, but its ability to recreate a route deleted directly from the kernel was not established here.

`nmcli connection up uuid 9c23d2ca-ec44-3fba-996b-b06596698315` activates the profile and is a broader operation that may renew DHCP and interrupt the link.
