# Final Snapshot Provenance

Captured for WP-032R closure.

- **HEAD:** `15483b6c87757358ab046d50d94498c9fdfb1ebe`
- **Working tree:** not clean; `staged 0, unstaged 9, untracked 28`.
- **Diff check:** PASS; no output from `git diff --check`.

Governance implementation/test SHA-256:

```text
a2cc70eaaf1bb430a7ba967ffab0b43b9405bf0293889fe566710aa0b31baad7  tools/kad/governance/human-receipt.mjs
2cb4ff51ed9cd53fe718d63ebd7767793720e7e7315d7e9ed304a75cf7af4659  tools/kad/governance/schema.mjs
32a847556dc827157bec09f47f11b280ee9efc0d0871feccef2e3ba1f17f6e34  tools/kad/governance/preflight-evaluator.mjs
1f70cefeed2f06a3628df91537ba321f5d2a5cb88deea1c007e6195c4341a3dc  tools/kad/governance/policy-resolver.mjs
48aa77f00325d2b05345b3cc869e0e8fb2e9aaa2edabbfaf4718ea0956e9a21d  tools/kad/governance/cli.mjs
2f7790ad3ed50abeab029a72fe3ddc0ca8b39ebe6799bf00ec2698eb4a1e488f  tools/kad/test/governance-v2.test.mjs
ba6efef697101814c7e130bff6d094405d427c0a8d245d222567375edcab42c3  tools/kad/test/governance-adversarial.test.mjs
```

The tree includes unrelated concurrent workspace changes and the untracked WP-032R evidence plus governance implementation. This closure does not claim a clean tree or repository commit identity for uncommitted files.

## Durable Commit Binding

- **Previous base HEAD:** `15483b6c87757358ab046d50d94498c9fdfb1ebe`
- **Commit A:** `7eee4df` — `fix(kad): harden governance authorization semantics`
- **Commit A path set:** the 7 governance implementation modules, 3 governance test modules, and WP-032R evidence files `00` through `13` plus `FINAL_REPORT.md`, exactly as explicitly staged.
- **Relationship:** the independent reviewer reviewed the content-addressed working-tree snapshot above; Commit A later materialized that same implementation/test snapshot unchanged.
- **Commit B:** this provenance-only commit; its SHA is captured in the final closure record.
- **Remaining dirty state:** unrelated pre-existing workspace changes remain outside the Commit A path set. No clean-tree claim is made.
