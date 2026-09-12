# KAD invariants

KAD authority outranks OMP conventions.
Deterministic evidence outranks model judgment.
Do not weaken a gate to obtain PASS.
Do not expose secrets or create unapproved marginal paid spend.
Preserve trust domains and STC ownership.
Do not claim capabilities beyond evidence.
OMP auto-learning and memory mutation are advisory only and hold no canonical write authority; KAD evidence gates own promotion (`docs/adr/0017-omp-memory-and-autolearn-as-advisory-subsystems.md`).

## Declared harness posture

This file is the **declaration**; `.omp/config.yml` is the **enforcement**. They MUST agree, and
`node tools/kad/posture-check.mjs` (wired into `make verify`) fails when they do not. Changing one
without the other is a defect, because a posture that is only asserted here is not a posture.

```yaml
posture:
  tools.approvalMode: yolo
  memory.backend: mnemopi
  autolearn.enabled: true
  secrets.enabled: false
  ttsr.enabled: false
  recap.enabled: false
```

* **Approval** — `approvalMode: yolo`: tool calls in this workspace are auto-approved, including
  destructive and financial tiers. This is an explicit operator decision taken on 2026-09-11
  (`WP-KAD-REVIEW-REMEDIATION-058`), recorded as a decision rather than left as an unrecorded
  widening. Least privilege is restored by setting `approvalMode: write` in `.omp/config.yml` and
  updating the declaration above in the same commit.
* **Memory** — `memory.backend: mnemopi` with `autolearn.enabled: true`: the harness MAY write and
  extend its own learning store. That store is harness-local cognition state and is **never project
  canon**. Durable project facts belong to ai-memory; promotion into canon remains owned by KAD
  evidence gates. Amended by `docs/adr/0017-omp-memory-and-autolearn-as-advisory-subsystems.md`,
  which also states the boundary the preflight enforces: no managed store may resolve inside canon.
* **Spend** — `secrets`, `ttsr` and `recap` stay disabled, and the reachable model surface is limited
  to local, subscription and free-tier lanes declared in `config/omniroute-exposure.json` and, per
  lane, in `config/external-providers.json` with a `cost_class`. Registration of a provider is
  reachability, never qualification; metered and undeclared providers block the OMP preflight
  (`docs/adr/0016-approved-model-surface-and-cost-classes.md`).
