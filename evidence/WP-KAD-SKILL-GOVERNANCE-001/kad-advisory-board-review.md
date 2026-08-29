## Decision

Customize Matt skills with thin project-scoped overlays and small explicit patches, not direct forks or independent replacement.

## Context Read

The workspace already has a portable `.agents/skills` root, canonical `ask_user`, `workctl` execution coordination, and local KAD authority doctrine. Upstream Matt revision `6654f6b60cd9d5be8b54c6fafe44346dabeb3b76` and upstream advisory revision `fd58b80648c399f29b36d31739a0b07d459b43cf` are pinned. The user direction explicitly favors preserving vanilla engineering discipline. The decision stage is architecture selection before broader skill adaptation. Known risk: local copies can drift from upstream; unknown: future upstream changes may alter seams.

## Five KAD Lenses

### Epistemic Integrity
- View: Pinned source snapshots, per-skill hashes, and an inspectable delta matrix make the base/delta/execution distinction reconstructable.
- Blind spot: A hash proves bytes, not that an adaptation preserves semantic behavior; regression fixtures remain necessary.
- Recommendation: Keep upstream snapshots and require deterministic lock validation before treating a skill view as current.

### Authority & Safety
- View: Thin overlays keep KAD authority project-scoped and preserve the separation between advisory recommendation, human decision, and workctl execution.
- Blind spot: A markdown skill is trusted executable instruction; future overlays could accidentally widen shell, provider, or filesystem authority.
- Recommendation: Require explicit project opt-in and prohibit overlays from changing provider, trust, policy, or execution authority.

### Systems & Lifecycle
- View: Composition around Wayfinder plus a small decision protocol deepens existing seams instead of creating a second task ledger.
- Blind spot: Two skill roots already create collisions, and a new derivative can become another competing router if ownership is not explicit.
- Recommendation: Keep `.agents/skills` canonical, let Wayfinder own decisions, and let workctl own claims/state/handoffs.

### Economy & Determinism
- View: Deterministic hashes, frontmatter checks, and fixtures are cheaper and more reliable than model comparison; no provider or paid spend changes.
- Blind spot: Over-adapting every Matt skill would consume review and context budget without leverage.
- Recommendation: Adapt only ask-matt, Wayfinder, and the advisory derivative now; classify the rest and defer.

### Research & Long-Horizon Value
- View: A portable provenance lock and explicit update model create durable evidence for future upstream refreshes and side-project reuse.
- Blind spot: Provenance artifacts can become paperwork if no later update workflow consumes them.
- Recommendation: Keep the lock machine-readable and make drift status actionable without auto-overwriting customizations.

## Disagreement

All lenses reject independent replacement. Systems & Lifecycle favors composition; Authority & Safety is more conservative and would block any overlay lacking an explicit boundary. Economy & Determinism challenges adapting the whole matrix. Research accepts a small derivative only because the provenance and update path are durable. The main trade-off is less immediate convenience in exchange for lower drift and authority risk.

## Evidence Gaps

- No live upstream update beyond the pinned revisions has been applied.
- Semantic preservation across every deferred Matt skill is classified, not exhaustively re-proven in this workpackage.
- No human decision was needed: the user direction already declared the thin-adaptation preference.

## Advisory Recommendation

- Preferred direction: thin composition/overlay, with a separate KAD advisory derivative and no wholesale Matt fork.
- Why: preserves CRIT and vanilla engineering flow while localizing KAD policy at explicit seams.
- Main risk: future local edits can outgrow the diff budget.
- Evidence needed: deterministic lock/doctor output, behavior fixtures, and a two-axis code review.
- Next bounded action: use this architecture as the basis for the Wayfinder and ask-me protocol implementation.
- Do not do: do not replace Matt skills wholesale, auto-update trusted instructions, or let the board authorize implementation.
