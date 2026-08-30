# SKILLS

<!-- DERIVED: this namespace is rebuildable project state. -->

## code-review Skill

- ID: `skill:code-review`
- Status: `FILE_ONLY`
- Source: `.agents/skills/code-review/SKILL.md`
- Source hash: `47f4e52c21694def9c7c11cbfbf891ca35eac7a93e395797515be3c8a409ae50`
- Epistemic class: `DOCUMENT_DERIVED`
- Acceptance: `ACCEPTED`
- Trust domain: `engineering`
- Privacy: `INTERNAL`
- Description: Review the changes since a fixed point (commit, branch, tag, or merge-base) along two axes: Standards (does the code follow this repo's documented coding standards?) and Spec (does the code match what the originating issue/spec asked for?). Runs both reviews in parallel sub-agents and reports them side by side. Use when the user wants to review a branch, a PR, work-in-progress changes, or asks to \"review since X\".

## implement Skill

- ID: `skill:implement`
- Status: `FILE_ONLY`
- Source: `.agents/skills/implement/SKILL.md`
- Source hash: `7a624d0a999f6f0d2d45c3a430ed026094827fb55330b06826efda7ca8984c49`
- Epistemic class: `DOCUMENT_DERIVED`
- Acceptance: `ACCEPTED`
- Trust domain: `engineering`
- Privacy: `INTERNAL`
- Description: Implement a piece of work based on a spec or set of tickets.

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
- Source hash: `5c1902f0c747725fe2781b68d678f4cebe075bad2ebd4a977a82d5f8d08d00bf`
- Epistemic class: `DOCUMENT_DERIVED`
- Acceptance: `ACCEPTED`
- Trust domain: `engineering`
- Privacy: `INTERNAL`
- Description: Test-driven development. Use when the user wants to build features or
