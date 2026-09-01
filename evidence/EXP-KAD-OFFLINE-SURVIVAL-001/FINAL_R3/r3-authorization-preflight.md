# EXP-KAD-OFFLINE-SURVIVAL-001-R3 — Authorization and Preflight

## Verdict

`PASS` for authorization and preflight only. Hard stop before offline-survival execution.

## CONFIRMED

### Contract and governance identity

- Contract: `r3-experiment-contract.md`; SHA-256 `7c19c63b0c8e53754ca4facc9fff47decdea79ed87aec38318fe98bd96d67870`
- Experiment: `EXP-KAD-OFFLINE-SURVIVAL-001-R3`
- Repository HEAD: `7401b87573f38706d8fb42b012cf818266f42281` (Commit B, provenance-binding commit)
- Governance implementation baseline Commit A: `7eee4dfdf10c2e01f6fb677073e99ba2343d376b`
- Governance provenance baseline Commit B: `7401b87573f38706d8fb42b012cf818266f42281`
- Work context: `WP-KAD-GOVERNANCE-AUTHORIZATION-SEMANTICS-032R`
- Policy: `KAD_GOVERNANCE_POLICY_V1`
- Policy hash: `sha256:651235adf464cf83bfc88854dca66ca1ddf48e9f224bec2ec73604ef6a423b78`

### Human authorization and receipt

- Human result: `APPROVE R3 EXACT-SCOPE AUTHORIZATION` via `ask_user`; no prior receipt reused.
- Human event reference: `ask_user:r3_authorization:APPROVE_R3_EXACT_SCOPE_AUTHORIZATION`
- Issuer: `actor.project_lead` (`ACTOR`)
- Authorized executor: `role.kad-builder` (`ROLE_OR_ACTOR`)
- Fresh receipt: `r3-human-authorization-receipt-v2.json`
- Receipt schema: `HUMAN_AUTHORIZATION_RECEIPT_V2`
- Receipt ID: `har-v2-exp-offline-survival-r3-001`
- Receipt content hash: `sha256:a83260f0f85aa400d5925efa124d0f79d503bb34a50e113632569f7d406bf6b7`
- Receipt file SHA-256: `538e0965d29de546d720e34a622f9d700e62b3bbd98b0cf7cc7896b3707c6100`
- Primary validity: `2026-08-31T00:20:05.000Z` through `2026-08-31T02:20:05.000Z`
- Rollback validity: through `2026-08-31T02:25:05.000Z`
- Receipt validation: valid with exact executor, work, experiment, operation, resources, paths, policy, and timestamp bindings.
- Receipt negative verification: subject, work, resource, action, path expansion, policy mismatch, expiry, and traversal variants all rejected deterministically.

### Requests and deterministic decision

- Authorization request: `r3-authorization-request.json`; request hash `sha256:24f09c29e78406744638bb98b1e8fd20c5fb6ac5108c303660f7ab5d56e12f25`; file SHA-256 `04617f5505233444199868ad836f119799f27c488d1a6139f75759f3a4915a49`
- Preflight request: `r3-governance-preflight-request.json`; schema `GOVERNANCE_PREFLIGHT_V1`; request hash `sha256:ed7ac6a6eaac60275c0facf468c1623cc4b4021fdb5b39c5de8fbb0b6f75d4cf`; file SHA-256 `bf39f0bc0784953e450102c8e3e1e95fbf2451fb1860d35203c10916fbebf7b2`
- Preflight integrity: valid; canonical request hash passed.
- Decision artifact: `r3-governance-decision.json`
- Decision schema: `GOVERNANCE_DECISION_V1`
- Decision: `ALLOW`
- Reason codes: `AUTHORIZED_BY_HUMAN_RECEIPT`
- Missing requirements: none
- Authority level: `HUMAN_PREAUTHORIZED`
- Evaluator timestamp: `2026-08-31T00:20:32.446Z`
- Decision valid until: `2026-08-31T00:25:32.446Z`
- Decision hash: `sha256:0569effe6b2ad0c5a424c7f25ba643db6233ccf2c6c5163e9567468e80c31709`

### Read-only feasibility

Commands executed without mutation:

- `whoami`, `date -u --iso-8601=seconds`, `command -v systemctl`, `command -v ip`, `command -v systemd-run`
- `systemctl is-system-running` → `running`
- `systemctl is-active NetworkManager` → `active`
- `ip -br link` → `lo` and `enp7s0` up
- `ip -4 route show default` → `default via 192.168.0.1 dev enp7s0 proto dhcp src 192.168.0.2 metric 100`
- `ip -4 addr show dev enp7s0` → `192.168.0.2/24`
- `ss -lntup` → local DNS, `omp` on `127.0.0.1:39651`, and `koboldcpp-linux` on `127.0.0.1:5001`
- `bin/kad-telemetry status --json` → telemetry storage available; 37 total records, 37 integrity-valid
- `bin/kad-governance explain INFRASTRUCTURE_MUTATION --json` → `HUMAN_ONLY`, `TIER_3_HIGH`, `HOST_MUTATION_GUARD`, human receipt required

Rollback remains a candidate exact route replacement, with `/usr/bin/ip` and `/usr/bin/systemd-run` present. No watchdog was created; no rollback command was executed.

### Exact operation boundary

- Primary: delete only `default via 192.168.0.1 dev enp7s0 metric 100` (`route.delete.default`).
- Resources: `host.amdy.workstation`, `network-interface:enp7s0`, `route:ipv4-default-via-192.168.0.1`.
- Canonical evidence scope: `evidence/EXP-KAD-OFFLINE-SURVIVAL-001/FINAL_R3/`.
- Network meaning: IPv4 default-route loss only; not interface-down, DNS loss, LAN loss, localhost loss, VPN teardown, or provider shutdown.
- Rollback: `route.replace.default`, exact route replacement via `192.168.0.1` on `enp7s0`; recovery deadline above.
- Stop conditions: local control-plane loss, rollback loss, unknowable telemetry, unauthorized impact, mismatch, expiry, unknown high-impact state, LAN/localhost loss, alternate WAN path, or restoration unverifiable.
- Required telemetry: local KAD telemetry and append-only experiment evidence.
- Execution readiness gates: fresh valid receipt; exact contract/request/receipt/preflight equivalence; valid canonical hash; `ALLOW`; receipt and decision unexpired at execution; rollback apparatus and evidence captured before mutation; all read-only baseline postconditions rechecked immediately before execution.

### Traceability

| Field | Experiment Contract | V2 Receipt | Preflight | Match |
|---|---|---|---|---|
| experiment/work | `EXP...-001-R3` / `WP...-032R` | same | same | YES |
| executor | `role.kad-builder` | same | same | YES |
| operation class | `INFRASTRUCTURE_MUTATION` | same | same | YES |
| action | `route.delete.default` | same | same | YES |
| resources | host, enp7s0, IPv4 default route | same | same | YES |
| paths/scope | exact `FINAL_R3/` evidence scope | canonical `FINAL_R3` scope | exact `FINAL_R3/` | YES |
| policy | V1 / recorded hash | same | same | YES |
| expiry | action 02:20:05Z; rollback 02:25:05Z | same | decision 00:25:32Z | YES, distinct windows |
| rollback | `route.replace.default`, exact route | same | contract reference | YES |

## INFERRED

- The currently observed host has the prerequisites needed to attempt the bounded experiment without changing interface state: systemd and NetworkManager are active, the target route/interface are present, and local control/telemetry listeners exist.
- The V2 receipt cannot be validly reused for a different executor, work/experiment, action, resource, policy, scope, or expired time because bounded negative verification rejected each variant.
- `ALLOW` establishes governance preflight approval for the exact proposed operation; it does not establish that offline survival has occurred or passed.

## UNKNOWN

- Actual offline survival behavior, degradation behavior, restoration behavior, and post-restore reconciliation remain unobserved.
- Exact future watchdog unit properties/timestamps and interactive authentication outcome remain unknown because no execution apparatus was created.
- Whether the next execution-time recheck will remain within receipt and decision validity windows is unknown.

## Gate

`READY_FOR_EXECUTION_AUTHORIZATION`

This gate package stops before execution. It is not evidence that the experiment ran.

## Governance boundary

- WP-032R remained `CLOSED`; no governance semantics were changed.
- Old R1/R2 receipts were not reused.
- No governance policy was weakened.
- `EXP-KAD-OFFLINE-SURVIVAL-001` offline execution did not occur: no route deletion, interface change, service stop, watchdog creation, or privileged mutation was performed.
- No successor WP was opened.
- No unrelated files were intentionally modified by this phase; pre-existing dirty-tree state was preserved.
