# Upstream advisory board analysis

## Provenance

- Repository: `https://github.com/harryvondiesel-web/5-persona-advisory-board`
- Revision: `fd58b80648c399f29b36d31739a0b07d459b43cf`
- Skill: `SKILL.md`
- SHA-256: `9c3079e838d92967af5936f99591d9c3908a816d0e49faae9341087f0acc52ae`
- Version: `0.2.1`
- License: MIT

## Preserved

The upstream skill supplies the governing shape: interview first, CRIT (`Context → Role → Interview → Task`), five lenses receiving the same evidence, forced disagreement, and one practical decision brief. It explicitly keeps the board advisory and rejects five unrelated essays or claims to literal persona identity.

## Replaced

The generic Product Clarity, Risk and Capital, Scale and Systems, Offer Strength, and Future Self lenses are not suitable as KAD authority or research lenses. The derivative substitutes Epistemic Integrity, Authority & Safety, Systems & Lifecycle, Economy & Determinism, and Research & Long-Horizon Value.

## Local warning resolution

The installed upstream copy had a quoted `name` scalar. `workctl` validates the frontmatter name against the directory name using the unquoted scalar value; this produced `frontmatter name mismatch`. The local vanilla copy normalizes only that field to `name: 5-persona-advisory-board`. No behavior or lens content was changed.
