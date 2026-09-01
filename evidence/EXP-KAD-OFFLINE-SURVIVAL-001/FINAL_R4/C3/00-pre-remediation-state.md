# C3-00 Pre-remediation State

- Repository HEAD: `7401b87573f38706d8fb42b012cf818266f42281`
- Human executed the exact proto-qualified cleanup in a local interactive terminal.
- Before cleanup, read-only state contained:
  - legitimate: `default via 192.168.0.1 dev enp7s0 proto dhcp src 192.168.0.3 metric 100`
  - residue: `default via 192.168.0.1 dev enp7s0 proto boot metric 100`
- Cleanup command:
  ```text
  sudo /usr/bin/ip -4 route del default via 192.168.0.1 dev enp7s0 proto boot metric 100
  ```
- The DHCP route was not targeted.
