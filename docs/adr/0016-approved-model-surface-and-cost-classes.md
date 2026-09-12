# ADR 0016: Approved Model Surface — Declaration by Cost Class

## Context

`.omp/RULES.md` states the invariant: *do not expose secrets or create unapproved marginal paid
spend*. The OMP orchestration preflight attempted to enforce that invariant by requiring every
`enabledModels` pattern to resolve to a provider with `auth: none` and a `127.0.0.1` base URL.
That is a *local-only* policy wearing the name of a *no-unapproved-marginal-spend* policy.

On 2026-09-08 (`1a738b5`) the operator configured a two-tier cascade over the subscriptions already
paid for — Google AI Pro (`google-antigravity`), OpenCode Go (`opencode-go`), Codex
(`openai-codex`) — plus the Z.AI free tier (`zai-free`). Those lanes create no marginal per-token
spend. The gate has reported `UNAPPROVED_OR_PAYG_MODEL_SURFACE` ever since, which is why it stopped
being read: a gate that fails on a deliberate, recorded operator decision is indistinguishable from
noise.

`config/omniroute-exposure.json` already carries the exposure-side policy
(`LOCAL_SUBSCRIPTION_AND_FREE_TIERS_ONLY`, metered providers contributing only free-tier ids,
`unlisted_providers: exclude`, enforcing `REQ-KAD-FIN-001`). The preflight never consulted it.

## Decisions

1. **The spend gate asks a declaration question, not a locality question.** Every provider named in
   `enabledModels` MUST be either (a) loopback with `auth: none` — inference this host owns — or
   (b) declared by name in `config/external-providers.json` with a `cost_class`. Undeclared
   providers block. This keeps the gate failing closed on anything nobody has classified.

2. **Cost classes.**
   - `LOCAL` — loopback, `auth: none`. Approved without declaration.
   - `FIXED_SUBSCRIPTION` — the operator already pays, no marginal per-token cost.
   - `FREE_TIER` — free-tier ids only.
   - `METERED` — per-token or PAYG billing. **Blocks.**
   Approved = `LOCAL ∪ FIXED_SUBSCRIPTION ∪ FREE_TIER`. Everything else, including a provider that
   is absent from the registry, blocks with `UNAPPROVED_OR_PAYG_MODEL_SURFACE`.

3. **Declared lanes at the time of this decision.** `google-antigravity`, `openai-codex`,
   `opencode-go` → `FIXED_SUBSCRIPTION`. `zai-free` → `FREE_TIER` (external cloud, registered
   `TRANSPORT_ONLY`, so the local-inference census never counts it). `omniroute` → loopback gateway,
   approved as `LOCAL` by the base URL rule; what it *proxies* is governed by
   `config/omniroute-exposure.json`, which excludes unlisted upstreams and admits metered ones only
   through free-tier ids.

4. **Registration remains reachability, never qualification** (ADR 0015 §3). Declaring a provider
   grants no routing, acceptance or canonical authority; it only stops the gate from mistaking a
   declared lane for an unapproved one.

## Consequences

* The gate now fails on the class of change it exists to catch — a new, unlisted, or metered
  provider — instead of failing on a decision already made. Adding a connection still widens
  nothing: it must also be declared here.
* The divergence surface narrows from *config vs hardcoded policy* to *declaration vs billing
  truth*. KAD records the declaration; it cannot observe an invoice. If a provider's billing model
  changes, the declaration is wrong until an operator re-declares it, and that is a recorded
  obligation rather than a silent one.
* Evidence: `tools/kad/omp-orchestration-preflight.mjs` `inspectSpend`, receipts in
  `evidence/WP-KAD-REVIEW-REMEDIATION-058/`, and the preflight tests covering the approved,
  metered and undeclared paths.

## Status

ACCEPTED — operator decision, 2026-09-12. Supersedes the implicit loopback-only rule in
`inspectSpend`. Epistemic class: `[DESIGN_DECISION]` for the policy, `[OBSERVED]` for the registry
contents and for the gate's behaviour on each class.
