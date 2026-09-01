# C4-06 Rollback Assurance

## Verdict

`ROLLBACK_NOT_ASSURED`

## Proven

- Live NetworkManager ownership is DHCP-based: IPv4 method `auto`, no configured gateway/routes, `never-default=no`, auto routes enabled.
- Exact connection UUID, interface, gateway, address, and metric were observed.
- The narrowest candidate is identified as `nmcli device reapply enp7s0`.
- Human approved the exact same-state rehearsal command.
- The command was attempted exactly once and failed before execution because sudo authentication required an unavailable terminal.
- No route deletion, link disablement, service restart, firewall change, persistent profile change, or privileged persistent unit occurred.

## Inferred

NetworkManager should reconcile active DHCP-owned state through `device reapply`; connection activation is a broader fallback. These are documentation/configuration inferences only.

## Untested until live mutation

Even a successful same-state reapply would not prove recreation after direct kernel route deletion. That behavior requires either a targeted authorized test or remains inferred from NetworkManager semantics. No live mutation was authorized here.

## Gate evaluation

Route clean: PASS. Runtime ready: inherited from C3; no contradictory change observed. NM rehearsal: FAIL/NOT EXECUTED. Transient NM guard: NOT PROVEN. Therefore the assurance gate cannot pass.
