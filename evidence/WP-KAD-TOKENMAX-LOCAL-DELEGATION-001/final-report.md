# WP-KAD-TOKENMAX-LOCAL-DELEGATION-001

## Verdict
**PARTIAL — LOCAL_FIRST_POLICY_PROVEN_DETERMINISTICALLY; LIVE_LOCAL_EVIDENCE_INSUFFICIENT.**

The new coordination seam is implemented and tested. Three real current-repository extraction tasks used deterministic JSON-pointer tooling with zero model calls. Qwen was unavailable at experiment time, so no live local episode was fabricated.

## Final implementation

`tools/kad/microtask-router.mjs` composes the existing economic router, context compiler, resource-contract gate, canonical hashing, and distillation vocabulary. It is exported from `tools/kad/index.mjs`. The legacy `executeSwarm` path remains unchanged for compatibility and is not eligible for new local-first promotion without an explicit resource contract.

## Required order

```text
deterministic → local specialist → remote only with typed reason
```

Authority/trust and capability are checked before economic ranking. Deterministic tools outrank models. Local selection requires matching trust/capability, availability, explicit identity/lifecycle evidence, resource fit, bounded context/output, and deterministic validation.

## Local eligibility

A task must be read-only, have a measured source set of 1–16, bounded output schema, no mutation/security/architecture/acceptance authority, and a deterministic validator. The local resource must expose a proven ID, model identity, runtime hashes, evidence, known confidence, availability, and a passing dynamic resource contract. One local inference is allowed; repairs default to zero.

## Remote-required

Authority-sensitive reasoning, security, architecture, ambiguity, unsupported capability, unavailable local resources, missing/invalid resource contracts, resource-fit failure, and validated local semantic failure are typed reconsideration/escalation cases. Resource failure never silently invokes remote. Remote execution requires an explicit catalogued reason and existing non-PAYG economic policy.

## Context anti-rot

`compileFreshLocalPacket` creates a fresh packet from only selected source selectors, output schema, validation contract, resource contract, and invariant fields. It canonicalizes/deduplicates selectors and hashes selected evidence. It excludes parent conversation, prior local transcript, and hidden reasoning. `buildEscalationPacket` forwards only source hashes, validator results, typed failure, and unresolved residue.

## Experiments

- Deterministic tasks: **3** (`MICRO-A`, `MICRO-B`, `MICRO-C`), all accepted on first attempt, zero local/remote calls.
- Current local-eligible tasks: **0**; Qwen endpoint was unavailable and STC did not resurrect stale capability.
- Local microtask inference: **0**; permitted maximum was 3.
- Remote inference: **0**.
- Precise selected context: **884 bytes** versus **1,242 bytes** for the broad fixture selector, a calculated reduction of **358 bytes**. Token savings were not inferred because no live local inference occurred.
- Dry-run: architecture → `ARCHITECTURE_REQUIRES_REMOTE`; security mutation → `SECURITY_REQUIRES_REMOTE`; WORLD generation → WORLD-only local candidate; unsupported capability → `NO_LOCAL_CAPABILITY`; oversized contract → `LOCAL_RESOURCE_FIT_FAILED`; exact lookup → deterministic.

## Economics and distillation

Receipts preserve null/UNKNOWN usage, latency, context hash, repairs, validation, acceptance, and typed escalation. `remote_call_avoided` is null unless a deterministic counterfactual proves remote would otherwise be required. The lesson is `ROUTING_POLICY_LESSON` with invariant `CHEAPEST_SUFFICIENT_TRUSTED_EXECUTION`; general Qwen capability remains UNKNOWN. Repeated validated extraction is recorded only as a deterministic-tool candidate, never promoted.

## PON / STC

Causal events are task/route/accept/reject/escalation events, not token noise. Resource identity and lifecycle remain bound; WORLD remains WORLD-only. Unavailable Qwen is not advertised.

## Verification

- New router: **40/40 PASS**.
- Full KAD: **299/299 PASS**.
- Root `make test`: PASS.
- Librarian: PASS, 11/11 tests; verification 25 documents, 24 cards, 16 concepts.
- PRIME validation, syntax checks, and `git diff --check`: PASS.
- No remote, subscription, PAYG, Qwen, or Stheno inference was consumed.

Prior attributable work was committed separately before this package: `a8abc0a`, `513304f`, `f5fa4d9`, `d68f748`, `649f301`. The unrelated causal journal remains untouched.
