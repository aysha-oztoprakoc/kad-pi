# C3-05 Rollback Strategy

## Candidates

| Candidate | Authority | Mutation surface | DHCP correctness | Guard compatibility | Idempotence | Failure mode | Confidence |
|---|---|---|---|---|---|---|---|
| Unqualified `ip route replace default ...` | root after mutation | one route | rejected by C2; produced `proto boot` residue | technically runnable | apparent | duplicate/metadata loss | rejected |
| Proto-qualified manual route replacement | root after mutation | one route | unproven; `proto dhcp` may misrepresent ownership | runnable | unproven | duplicate or ownership conflict | insufficient |
| NetworkManager connection reactivation/reapply | polkit/root depending on action | connection/profile state; may disrupt link | conceptually coherent | not yet proven from an armed guard | likely | link interruption, auth prompt, DHCP timing | insufficient |
| Existing transient systemd guard wrapping a proven local recovery command | root before mutation | bounded command | depends on selected recovery primitive | transient architecture proven in C1 | depends on command | guard command/authentication failure | insufficient |

## Decision

No candidate is promoted to canonical rollback. The simplified route replacement is permanently rejected. NetworkManager-supported recovery is the preferred direction because DHCP owns the canonical route, but it requires a separate authorized, read-only-first design and a rehearsal that proves no post-mutation password interaction. Until then:

`ROLLBACK_NOT_ASSURED`
