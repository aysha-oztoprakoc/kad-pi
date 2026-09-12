# SKILLS

<!-- DERIVED: this namespace is rebuildable project state. -->

## code-review Skill

- ID: `skill:code-review`
- Status: `FILE_ONLY`
- Source: `.agents/skills/code-review/SKILL.md`
- Source hash: `c4c7e604d7b24635cd4a949228e1a2332e348abdc18a65be9a7e2d01223a31ee`
- Epistemic class: `DOCUMENT_DERIVED`
- Acceptance: `ACCEPTED`
- Trust domain: `engineering`
- Privacy: `INTERNAL`
- Description: Dual-axis code review evaluating Standards (style, types, lint) and Specification (ticket fulfill) with skeptical analysis.

## implement Skill

- ID: `skill:implement`
- Status: `FILE_ONLY`
- Source: `.agents/skills/implement/SKILL.md`
- Source hash: `91d618b0dcbd7bc781eb8bd39b3e067888b28b26532a39af5975e1b68b63c19b`
- Epistemic class: `DOCUMENT_DERIVED`
- Acceptance: `ACCEPTED`
- Trust domain: `engineering`
- Privacy: `INTERNAL`
- Description: Primary engineering implementation skill. Executes code edits on claimed files within fusion_writer_lease bounds.

## kad-evidence-gate Skill

- ID: `skill:kad-evidence-gate`
- Status: `FILE_ONLY`
- Source: `.agents/skills/kad-evidence-gate/SKILL.md`
- Source hash: `e1118957b052d4170809b0fb1ad83c8274d9e3a1aa23828fe31b483a1ce2da66`
- Epistemic class: `DOCUMENT_DERIVED`
- Acceptance: `ACCEPTED`
- Trust domain: `engineering`
- Privacy: `INTERNAL`
- Description: Use when turning an observed or proposed trajectory into reusable KAD knowledge, or when checking whether a candidate skill/policy may be promoted. Do not invoke for ordinary implementation without a distillation candidate.

## tdd Skill

- ID: `skill:tdd`
- Status: `FILE_ONLY`
- Source: `.agents/skills/tdd/SKILL.md`
- Source hash: `ad9668f83e9c8482b121871120bc558aa24e8c93873e8db2b435253ad0131819`
- Epistemic class: `DOCUMENT_DERIVED`
- Acceptance: `ACCEPTED`
- Trust domain: `engineering`
- Privacy: `INTERNAL`
- Description: Test-Driven Development discipline: Red (failing test) -> Green (minimal pass) -> Refactor (clean structure).
