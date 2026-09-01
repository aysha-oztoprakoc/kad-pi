# C4-01 Recovery Candidate Analysis

## Candidate A — `nmcli device reapply enp7s0`

Primary candidate. Uses NetworkManager's active-device reconciliation path, retains DHCP ownership, and does not intentionally deactivate the device. Requires privileged authorization in this environment. Fixed executable/arguments are suitable for a root-owned transient service. **Behavior after direct kernel route deletion remains untested.**

## Candidate B — exact connection activation

```text
/usr/bin/nmcli connection up uuid 9c23d2ca-ec44-3fba-996b-b06596698315
```

Uses the exact profile and should restore DHCP-derived state, but activation is broader and may flap `enp7s0`, renew the lease, and temporarily disrupt LAN/local control. Emergency fallback only; not routine primary recovery.

## Candidate C — reload/reconciliation primitive

No narrower local NetworkManager operation was identified from the installed `nmcli` interface that both reapplies the active DHCP route and avoids the broader profile activation. `systemctl restart NetworkManager` is explicitly excluded as default because it is broader than required.

## Candidate D — manual route restoration

Rejected. C2 demonstrated that unqualified `ip route replace` creates an unqualified `proto boot` route rather than reproducing canonical DHCP ownership. Proto-qualified manual synthesis is not proven semantically correct and is not selected.
