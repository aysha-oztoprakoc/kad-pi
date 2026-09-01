# C5-00 Precheck

Repository HEAD: `7401b87573f38706d8fb42b012cf818266f42281`
Governance baseline: `7eee4dfdf10c2e01f6fb677073e99ba2343d376b`
T0: 2026-08-31T12:10:50-03:00

Read-only precheck passed:

```text
default via 192.168.0.1 dev enp7s0 proto dhcp src 192.168.0.3 metric 100
192.168.0.0/24 dev enp7s0 proto kernel scope link src 192.168.0.3 metric 100
enp7s0: UP, LOWER_UP, CARRIER
192.168.0.3/24
NetworkManager: active
Wired connection 1: active on enp7s0
```

Exactly one IPv4 default route existed, with DHCP ownership, gateway `192.168.0.1`, device `enp7s0`, and metric `100`.
