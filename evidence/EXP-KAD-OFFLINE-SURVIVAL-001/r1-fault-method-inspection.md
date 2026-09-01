# R1 fault-method inspection

Read-only inspection selected the narrowest intended mechanism:

- Host: AMDY workstation
- Active interface: `enp7s0`
- IPv4 WAN route: `default via 192.168.0.1 dev enp7s0 metric 100`
- LAN route preserved by design: `192.168.0.0/24 dev enp7s0`
- Localhost: `lo`, `127.0.0.1/8`, `::1/128`
- IPv6 default route: none observed
- Active VPN/WireGuard: none observed; `wg` is not installed
- Active connections: NetworkManager `Wired connection 1` on `enp7s0`, plus loopback
- Proxy environment: no proxy variables present
- Container alternative: Docker socket inaccessible; no container network was used
- Network manager: NetworkManager active; `systemd-networkd` inactive

Proposed non-persistent mutation:

```text
sudo /usr/bin/ip route del default via 192.168.0.1 dev enp7s0
sudo /usr/bin/ip route add default via 192.168.0.1 dev enp7s0 metric 100
```

The first command removes only the WAN default route and preserves LAN/localhost. The second restores it.

## Hard precondition result

The current sudo policy grants passwordless access only to `/usr/bin/asdcontrol`, not `/usr/bin/ip`, `/usr/bin/nmcli`, or a route/firewall wrapper. `sudo -n -l` confirmed no non-interactive authorization for the route action. No password prompt was initiated and no privileged mutation was attempted.

A local watchdog cannot satisfy the restoration hard precondition because it cannot execute the authorized restore command without an interactive password or an approved local privileged wrapper. R1 therefore stops before harness arming and fault injection.
