# C4-02 Candidate Decision

## Decision

`PREFERRED_ROLLBACK_CANDIDATE`: `/usr/bin/nmcli device reapply enp7s0`

Rationale: narrowest NetworkManager-supported active-device reconciliation, fixed local command, no intentional link deactivation, and coherent with DHCP-owned runtime state.

## Comparison

| Candidate | Restores DHCP ownership | Privilege | Link disruption | Pre-armable | Local-only | Deterministic | Risk |
|---|---|---:|---:|---:|---:|---:|---|
| NM device reapply | Intended by NM semantics; post-delete untested | yes | none intended | yes | yes | command yes, route recreation untested | medium |
| NM connection up | likely | yes | possible flap | yes | yes | command yes, timing variable | higher |
| NM reload/reconciliation | not identified | yes | service-wide if restart | yes | yes | not applicable | high |
| Manual route restoration | no; canonical ownership not preserved | yes | none | yes | yes | route text only | rejected |

Fallback is the exact UUID activation command, but it is **not authorized or armed by this C4 task**. No fallback can be claimed operationally proven.
