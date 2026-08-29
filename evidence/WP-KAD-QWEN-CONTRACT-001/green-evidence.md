# Green evidence

`tools/kad/resource-contract.mjs` now exposes deterministic resource-contract comparison, Pi OpenAI request derivation, preflight fit checks, output saturation classification, and finish reason normalization. `executeSwarm` rejects impossible local tasks before `worker.execute` when a worker resource contract is supplied.
