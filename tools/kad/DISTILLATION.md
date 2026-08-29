# Deterministic distillation

`distillation.mjs` is the evidence gate for reusable KAD-PI teaching data. Model output is only a candidate; a record reaches `VERIFIED` and then `GOLDEN` through execution by an allowlisted verifier and explicit promotion authority. Receipts are re-executed when checked. Source artifacts are content-hashed.

```sh
node tools/kad/distill-cli.mjs ingest candidate.json
node tools/kad/distill-cli.mjs verify candidate.json
node tools/kad/distill-cli.mjs promote candidate.json gate-id
node tools/kad/distill-cli.mjs retrieve task.json
node tools/kad/distill-cli.mjs replay
node tools/kad/distill-cli.mjs export dataset.jsonl runtime-steering
node tools/kad/distill-cli.mjs export training.jsonl training
```

Set `KAD_DISTILL_DIR` to select the JSON store (default: `evidence/distillation`). Seed records are in `tools/kad/seeds/golden.jsonl`; they are generated through the same transition gate and contain contrastive failures. Export contains stable supervised/policy rows (and runtime contrastive rows), sorted by IDs. Training export additionally requires eligible=true, accepted rights, accepted quality, and valid provenance. Replay without a registered adapter or fresh observation is explicitly NOT_REPLAYED.
