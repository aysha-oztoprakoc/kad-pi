---
name: kad-trim-cot-leakage
description: Use when auditing or fixing prose that reads like a leaked reasoning transcript — dead design-session citations such as (D1), WP-KAD-* decision cites to CSA/ISA sections that do not exist at HEAD, workctl ledger refs without an owner; change narration such as "used to", "no longer", "this cut"; DAG or review vantage ("a later WP in this DAG", "rejected in review"); reviewer-addressed justifications; control-flow narration; or hedged planning residue in docs/, vault/, evidence/ reports, .agents/, or comments in tools/.
---

# Trimming Chain-of-Thought Leakage

Chain-of-thought leakage is prose whose vantage is the authoring session rather than the repository: it cites artifacts only that session could see, narrates the change instead of the state, or argues with a reviewer who has left. The fix is never deletion alone when a passage carries factual clauses — restate each so it stands at HEAD, then delete the transcript around it; a passage carrying none (a dead citation, control-flow narration) is deleted outright. This skill applies the complete-proposition rule and the committed-artifact-citation rule to KAD surfaces; it is guidance, not a substitute for judgment.

## The one test

For every suspect passage ask: **could a reader at HEAD, with no access to any session transcript, WP thread, or uncommitted draft, resolve every reference and verify every claim?** If no, restate the surviving facts from the repository's vantage and delete the rest. If yes, it is not leakage, however historical it sounds — but resolvability only clears this skill's bar: on current-state surfaces (READMEs, CSA/ISA state docs, `docs/generated/`) a resolvable change story is still change narration, and class 3 routes it to its sanctioned home (an archived decision record or an evidence dossier).

## Taxonomy

1. **Dead design-session citations** — `(D1)`, `(D7)`, `audit C2`, `CSA §4.7`, `ISA §1.4`, phase labels (`T4`, `W3`, `P-I`), unowned `workctl` ledger refs, "(B ruling)". If the decision has a committed owner — a WP-KAD-* dossier in `evidence/`, a vault decision note, a CSA/ISA section that exists at HEAD — cite it by name and path; otherwise delete the citation and restate its factual clause to stand alone.
2. **DAG and WP vantage** — "a later WP in this DAG", "this WP adds", "the previous workpackage". State the shipped mechanism or the extension point; deferred work moves to a `TODO` marker or a WP-KAD-* / issue reference.
3. **Change narration and version stamps** — "used to", "no longer", "the old X", and indexical stamps ("v1", "this cut", "today", "now" contrasting with a past state). State the present behavior; a fixed regression becomes a present-tense counterfactual ("without X, Y happens"), never repo history ("used to Y").
4. **Review choreography** — "Rejected in review:", "the reviewer confirmed", draft ordinals ("v5 of this note"), round attributions. Keep the surviving decision and rationale as plain fact; delete who said it when.
5. **Reviewer-addressed justification** — "the cast is safe — it simply…", "this is correct because…". A comment arguing its own correctness addresses a reviewer, not a maintainer. State the invariant that makes the code safe, or delete the comment if the code shows it.
6. **Restatement and derivation transcripts** — control-flow narration ("first we X, then we Y"), test walkthroughs, proofs of obvious branches. Delete; keep only a non-obvious contract or invariant.
7. **Hedges and planning residue** — "probably fine for now", "should be enough", deferrals with no marker. Promote to `TODO`/`FIXME` or restate as the actual bound; delete the hedge.
8. **Authoring-language slips** — untranslated working-language fragments in prose whose language is otherwise English, or the reverse in a counterpart. Translate or delete.

## What is not leakage

Unaided citation fails in both directions by deleting durable references and keeping dead ones. Apply these keep rules as written:

- **Issue and WP references** — `WP-KAD-031`, `#1470`, `TODO(name):`, "issue #N owns the follow-up", an evidence-path citation (`evidence/WP-KAD-002/…`) resolve at HEAD; keep them on any surface, including CSA/ISA docs. Do not relocate them to vault notes.
- **Evidence citations inside dossiers and postmortems** — sanctioned evidence per the KAD recording directive; `evidence/` exists to make decisions reconstructable.
- **Suppression justifications** — lint-disable reasons, coverage-ignore reasons, empty-catch explanations are required prose; fix a false reason, never delete it.
- **Counterfactual-present regression pins** — "without X, Y happens", "a naive X would…", "if the fallback is removed, offline survival degrades to…".
- **Measured bounds** — `(measured: 512 nests ≈ 0.15s)` calibrating a constant, latency/telemetry bounds recorded from an actual run; the provenance word "measured" is load-bearing.
- **Runtime old/new states** — "the old connection drains before the new one accepts" is runtime lifecycle, not change history.
- **Historical stage names inside a dossier's change-story sections** — "the first cut shipped X" is current-state-safe there; indexical stamps ("this cut") stay banned everywhere.
- **External references that resolve outside the repo by design** — standards sections, protocol RFCs, upstream reference-harness docs cited as reference; the §-ban covers uncommitted internal drafts, not external standards or committed docs that own their numbering.
- **Project voice and genre forms** — "we" as project voice; a dossier's Alternatives-considered section.

## Target surfaces

Audit, in priority order when scope is broad: `docs/` (especially `docs/state/`, `docs/architecture/`, `docs/generated/`), `vault/` (decision and derived notes), `evidence/` reports (only prose added this session — never rewrite sealed dossiers), `.agents/` (skills, work notes), and comments in `tools/`. Never touch `vendor/`, archived/sealed history, or recorded fixtures and snapshots — recorded model output keeps its original voice.

## Workflow

1. Require an explicit scope; never audit a whole repo on a vague mandate. Exclude sealed surfaces (archived dossiers, recorded fixtures).
2. Audit read-only first: search for the dead-citation and narration patterns above (with hidden files so `.agents/` is searched), then judge every hit semantically. Patterns are probes, not the definition — also read the densest prose in scope (CSA/ISA sections, module comments, vault decision notes) without a pattern in hand.
3. Fix owner-first per surface: `docs/generated/` → fix the source generator or template, then regenerate; state artifacts → fix the source and re-run the state-artifact test; bilingual vault pairs → update the counterpart; model-visible strings → wording is behavior, so flag for a snapshot-backed change instead of silently rewording.
4. Before deleting anything, enumerate the passage's propositions and check the overcorrection traps: trims that flip an obligation into an endorsement, promote a hypothesis to a shipped feature, delete a true fact, or drop provenance.
5. Verify: re-run the searches expecting only sanctioned keeps and this skill's own directory; confirm every remaining citation resolves at HEAD; run the gates for touched surfaces (`python check.py` for tools, `node --test docs/state/test/state-artifacts.test.mjs` for state docs, `kad doctor` / `kad-isa check all` for governance surfaces).
