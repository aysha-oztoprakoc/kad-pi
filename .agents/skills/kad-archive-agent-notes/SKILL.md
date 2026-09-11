---
name: kad-archive-agent-notes
description: Use when adding, auditing, pruning, archiving, or restoring durable notes in the KAD repo — evidence/ dossiers, docs/state/ records, vault/ decision or research notes, .agents/work/ workpackage artifacts — to freeze superseded notes as archived history rather than editing them as current authority, triage each note (superseded → archive, still-preventing-a-fallback → keep, rejected → delete), and keep the manifest/link trail current.
---

# Archiving Agent Notes

Reduce the active decision corpus without erasing history that can still guide work. Judge every note semantically; word count and age are discovery aids, never archive criteria. KAD's durable-notes surfaces are `evidence/` (per-WP dossiers: `final-report.md`, `implementation-manifest.md`, `claim-ledger.jsonl`, `causal-journal.jsonl`), `docs/state/` (CSA/ISA records and decision notes), `vault/` (decision notes, research claims/experiments/syntheses), and `.agents/work/` (workpackage artifacts). `.agents/notes/` may not exist; do not invent it as a surface.

## Core discipline

Notes are frozen when superseded — never edited as current authority. A note that a newer note, WP, or CSA/ISA state supersedes is moved to an `archived/<kind>` location under its owning surface (e.g. `vault/99_Archive/`, `evidence/<WP>/archived/`, `docs/state/archived/`) and the owning manifest is updated. If no archiving convention exists for the surface, apply the minimal one below.

## Check supersession when adding a note

Every new durable note triggers a scoped audit of active notes covering the same decision, mechanism, or rejected alternative. Classify each full or partial supersession while writing the new note: archive qualifying superseded records in the same change, retain and cross-link partial supersessions or independently useful rationale, delete rejected notes that no longer prevent a plausible mistake, and repair inbound links.

## Classify by future value

Apply these outcomes:

- **Superseded → archive (frozen):** the note is fully replaced by newer authority (a later WP dossier, a CSA/ISA state that now owns the fact, a vault decision note). Move the complete record to `archived/<kind>` under the owning surface, stamp it `Archived: YYYY-MM-DD`, and make no other body edits — the archived copy is a historical snapshot, not authority for current behavior.
- **Still-preventing-a-fallback → keep:** retain the note when its rationale, alternatives, negative guarantees, ownership boundary, security rule, or reintroduction condition still constrains current work — e.g. a measured bound, a rejected design that remains tempting, or a degradation guard ("without X, Y happens"). Length does not matter.
- **Rejected / no-longer-useful → delete:** delete the whole record when the idea is obsolete, superseded, no longer plausible, or unlikely to prevent re-litigation. Repair or delete inbound links.

Do not archive toward a quota. Inspect every note in scope, classify analogous groups under one principle, use best judgment for close cases, and record genuinely borderline decisions for the handoff.

## Minimal convention (when the surface has none)

1. Create `archived/<kind>/` beside the active notes (e.g. `docs/state/archived/decisions/`, `vault/99_Archive/`), mirroring the active layout.
2. Move the complete note(s); insert only `Archived: YYYY-MM-DD` below the status/header line. No body edits: do not translate, reformat, update facts, or repair links inside the note.
3. Update the owning manifest or index (e.g. the `vault/index.md`/`log.md`, a dossier `implementation-manifest.md`, or `docs/generated/progress-state.json` when the note is a projection source) so the archive move is discoverable and the link trail resolves.
4. Redirect inbound links from active prose to current authority; retarget them to the archived path only when the historical snapshot is intentionally cited; delete them otherwise. Never verify or repair links out of the archived note.

## Validate and report

Run the gates that own the touched surface: `node --test docs/state/test/state-artifacts.test.mjs` after any `docs/state/` or projection touch, `make verify` / `kad doctor` / `kad-isa check all` for governance surfaces, and the targeted check from `kad-pre-push-checks` that covers the diff. Do not claim archived outbound links are valid unless a verifier actually checks them.

Report active notes kept, notes archived, rejected notes deleted, and every genuinely borderline case with its chosen outcome.
