# EXP-KAD-OFFLINE-SURVIVAL-001-R4-A001 — Baseline

Status: `BLOCKED` before authorization, rollback apparatus, preflight, and mutation.

- Attempt: `EXP-KAD-OFFLINE-SURVIVAL-001-R4-A001`
- Timestamp: `2026-08-31T11:06:34-03:00`
- Repository HEAD: `7401b87573f38706d8fb42b012cf818266f42281`
- Frozen R3 contract: `../FINAL_R3/r3-experiment-contract.md`
- R3 contract SHA-256: `7c19c63b0c8e53754ca4facc9fff47decdea79ed87aec38318fe98bd96d67870`
- Governance Commit A: `7eee4dfdf10c2e01f6fb677073e99ba2343d376b`
- Existing dirty-tree state was recorded and preserved; no unrelated files were modified.

Read-only observations:

- `systemctl is-system-running`: `running`
- `systemctl is-active NetworkManager`: `active`
- `enp7s0`: `UP`
- IPv4 address: `192.168.0.3/24` (R3 observed `192.168.0.2/24`; current address changed)
- Default route: `default via 192.168.0.1 dev enp7s0 proto dhcp src 192.168.0.3 metric 100`
- LAN route: `192.168.0.0/24 dev enp7s0 ... src 192.168.0.3 metric 100`
- Local `omp` and `koboldcpp-linux` listeners observed in R3 were absent from the current `ss -lntup` result.
- `/usr/bin/ip` and `/usr/bin/systemd-run`: present.
- `sudo -n -l`: interactive `(ALL) ALL`; no `NOPASSWD` authorization for `/usr/bin/ip` or `/usr/bin/systemd-run`.
- KAD telemetry: 37 records, 37 integrity-valid.
- Policy: `INFRASTRUCTURE_MUTATION` is `HUMAN_ONLY`, `TIER_3_HIGH`, receipt required.

No route, interface, service, firewall, DNS, privilege, or persistent configuration mutation was attempted.
