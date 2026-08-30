# Regression & Diagnostic Test Results

## 1. Node.js Test Suite Execution
Executed full test suite covering all subsystems in `tools/kad/test/`:

- **Command**: `node --test tools/kad/test/*.test.mjs`
- **Total Tests**: 547 tests
- **Passed**: 547
- **Failed**: 0
- **Cancelled**: 0
- **Skipped**: 0
- **Duration**: ~11.5s

---

## 2. Subsystem Test Breakdown

| Subsystem / Test Suite | File | Tests | Result |
|---|---|---|---|
| Economic Telemetry Receipts | `tools/kad/test/economic-receipts.test.mjs` | 25 | PASS |
| Bounded Resource Envelope | `tools/kad/test/resource-fit.test.mjs` | 24 | PASS |
| Context Compaction & Checkpoint | `tools/kad/test/context-compaction.test.mjs` | 9 | PASS |
| Operator Control Plane UI | `tools/kad/test/control-plane.test.mjs` | 7 | PASS |
| Promotion & Distillation Gates | `tools/kad/test/distill.test.mjs` | 9 | PASS |
| Economic Routing Policy | `tools/kad/test/economic-router.test.mjs` | 20 | PASS |
| Shadow Economic Evaluator | `tools/kad/test/economic-shadow.test.mjs` | 18 | PASS |
| Public Website & Dashboard Server | `tools/kad/test/interface-server.test.mjs` | 8 | PASS |
| Governed KnowledgePlane | `tools/kad/test/knowledge-plane.test.mjs` | 9 | PASS |
| Local Model Lifecycle & STC | `tools/kad/test/local-model.test.mjs` | 16 | PASS |
| Local Routing Engine | `tools/kad/test/local-router.test.mjs` | 36 | PASS |
| Shared Model Store | `tools/kad/test/model-store.test.mjs` | 11 | PASS |
| Persistent Multi-Turn PON Engine | `tools/kad/test/multi-turn-engine.test.mjs` | 8 | PASS |
| Counterfactual Observatory | `tools/kad/test/observatory.test.mjs` | 24 | PASS |
| OMP Adaptation Verification | `tools/kad/test/omp-adaptation.test.mjs` | 7 | PASS |
| Real Pi Persistent Runtime | `tools/kad/test/pi-real-persistent.integration.test.mjs` | 6 | PASS |
| Normalized Provider Quota | `tools/kad/test/provider-quota.test.mjs` | 16 | PASS |
| Publication Isolation | `tools/kad/test/publication.test.mjs` | 6 | PASS |
| Quota Accounting | `tools/kad/test/quota-accounting.test.mjs` | 22 | PASS |
| Raw JSON Normalization | `tools/kad/test/raw-json-normalizer.test.mjs` | 21 | PASS |
| Promotion Readiness Gate | `tools/kad/test/readiness.test.mjs` | 22 | PASS |
| Research Capability Profiles | `tools/kad/test/research-capabilities.test.mjs` | 13 | PASS |
| Research Operator CLI | `tools/kad/test/research-cli.test.mjs` | 6 | PASS |
| OpenViking Context Adapter | `tools/kad/test/research-openviking.test.mjs` | 8 | PASS |
| Read-Only Zotero Adapter | `tools/kad/test/research-zotero.test.mjs` | 7 | PASS |
| Canonical Research Corpus API | `tools/kad/test/research.test.mjs` | 13 | PASS |
| Task Budget Gate | `tools/kad/test/resource-contract.test.mjs` | 15 | PASS |
| Runtime Resource Observation | `tools/kad/test/resource-runtime.test.mjs` | 18 | PASS |
| Verified Pi SDK Resolver | `tools/kad/test/sdk-resolver.test.mjs` | 14 | PASS |
| Scientific Seed Promotion | `tools/kad/test/seed-promotion.test.mjs` | 19 | PASS |
| Swarm Coordinator | `tools/kad/test/swarm-coordinator.test.mjs` | 10 | PASS |
| Swarm Delegation Engine | `tools/kad/test/swarm.test.mjs` | 15 | PASS |
| OMP Usage Bridge | `tools/kad/test/telemetry-usage-bridge.test.mjs` | 9 | PASS |
| Core Telemetry Ledger | `tools/kad/test/telemetry.test.mjs` | 16 | PASS |
| Tokenmaxxing Accounting | `tools/kad/test/tokenmaxxing.test.mjs` | 16 | PASS |
| Canonical Obsidian Librarian | `tools/kad/test/wiki-librarian.test.mjs` | 6 | PASS |
| Local Context Library | `tools/kad/test/wiki-library.test.mjs` | 2 | PASS |
| Legacy Wiki Migration | `tools/kad/test/wiki-migration.test.mjs` | 2 | PASS |
| Derived Wiki Projections | `tools/kad/test/wiki-projection.test.mjs` | 7 | PASS |
| World Transition Slice | `tools/kad/test/world-transition.test.mjs` | 8 | PASS |
| Context Poisoning Audit | `tools/kad/test/context-poisoning-audit.test.mjs` | 7 | PASS |
| Workctl Workspace Substrate | `tools/workspace/workctl.test.mjs` | 7 | PASS |
