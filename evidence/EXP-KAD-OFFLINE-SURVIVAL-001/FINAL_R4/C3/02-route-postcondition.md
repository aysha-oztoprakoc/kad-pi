# C3-02 Route Postcondition

Read-only verification at `2026-08-31T11:50:18-03:00`:

```text
unicast default via 192.168.0.1 dev enp7s0 proto dhcp scope global src 192.168.0.3 metric 100
default via 192.168.0.1 dev enp7s0 proto dhcp src 192.168.0.3 metric 100
192.168.0.0/24 dev enp7s0 proto kernel scope link src 192.168.0.3 metric 100
```

Verified:

- exactly one IPv4 default route;
- no `proto boot` default route;
- `enp7s0` UP/LOWER_UP;
- IPv4 `192.168.0.3/24` present;
- NetworkManager active;
- active connection `Wired connection 1`;
- LAN route present.
