# R4-A002-00 Fresh Live Baseline

Timestamp: `2026-08-31T14:39:06-03:00`
Repository HEAD: `7401b87573f38706d8fb42b012cf818266f42281`

## Authority

- Orchestrator: `role.kad-builder`
- Privileged authority: `actor.project_lead`
- Infrastructure mutation: `HUMAN_ONLY`
- No redelegation.

## Network

- Interface: `enp7s0`; state `UP/LOWER_UP`
- Connection: `Wired connection 1`
- UUID: `9c23d2ca-ec44-3fba-996b-b06596698315`
- IPv4 method: `auto` (DHCP)
- `ipv4.never-default`: `no`
- Gateway: dynamically observed `192.168.0.1`
- Address: dynamically observed `192.168.0.3/24`
- Canonical route: exactly one IPv4 default, `proto dhcp`, via `192.168.0.1`, device `enp7s0`, metric `100`
- LAN route: `192.168.0.0/24 dev enp7s0 proto kernel scope link src 192.168.0.3 metric 100`

## Runtime

NetworkManager is active; `Wired connection 1` is active on `enp7s0`. Existing C3/C5 runtime evidence remains accepted and is not re-claimed as new outage evidence.

## Scope boundary

This baseline is read-only. No route, interface, NetworkManager, firewall, sudoers, or persistent-service mutation occurred.
