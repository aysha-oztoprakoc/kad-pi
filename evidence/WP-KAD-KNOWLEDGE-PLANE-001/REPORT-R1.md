# WP-KAD-KNOWLEDGE-PLANE-001-R1 Report

## Verdict

**PARTIAL / SAFE TO RESUME KNOWLEDGE-PLANE VERTICAL SLICE**

The isolated OpenViking substrate is installed and live at `127.0.0.1:1933`. Its local embedding path, exact resource reads, semantic retrieval, restart persistence, and raw-resource degradation were verified. The configured Ollama VLM is unavailable, so generated overviews and image summaries remain degraded. No KAD adapter, repository-wide ingestion, authority promotion, new permission, or paid fallback was introduced.

Needle 2 is installed separately and performs offline constrained structured calls. The shipped frozen data-capture suite reports `30/32` with zero critical failures. The downloaded tuned weights report `confidence: null` because their confidence head is uncalibrated; they are not eligible to make routing decisions until a KAD qualification gate establishes calibrated behavior.

The advisory-board skill is copied unchanged from the pinned upstream commit and is discoverable in the supported OMP skill directory. It was not invoked for this runtime package.

## Fixed point and provenance

- Repository fixed point: `2bae5d6065ca17cf1ac85f73f934a6eb9d9a2e9d`
- OpenViking source commit: `e8cedaebd72c9bead112a337a58768368af9c5fb` (`AGPL-3.0`)
- Needle source commit: `ee221ce7c13579d9809209b979a9b7a50936614c` (`Apache-2.0`)
- Advisory skill source commit: `fd58b80648c399f29b36d31739a0b07d459b43cf` (`MIT`)
- Full source record: `upstream-provenance.json`

## Verification evidence

- `runtime-preflight.json`: authority boundary, runtime versions, and preflight status.
- `openviking-doctor.json`: supported configuration validation and explicit Ollama failure.
- `openviking-first-boot.json`: health, ingestion, exact read, search, and restart persistence.
- `needle-preflight.json`: offline structured inference, frozen upstream suite, and confidence limitation.
- `advisory-preflight.json`: pinned skill hash and discoverability.
- `external-runtime-manifest.json`: machine-readable runtime identities and trust/economic constraints.
- `failure-matrix.json`: observed safe-degradation cases and unprobed policy cases.
- `validation.json`: JSON parsing, `make verify`, and targeted test results.

## Acceptance results

| Gate | Result | Evidence |
| --- | --- | --- |
| Isolated Python 3.12 runtime | PASS | `runtime-preflight.json` |
| OpenViking 0.4.17 import/server | PASS | `openviking-doctor.json` |
| Local embedding model | PASS | model hash and doctor result |
| OpenViking health | PASS | `/health` returned `status=ok`, `healthy=true` |
| Exact resource read | PASS | persisted `knowledge.md` read verbatim |
| Semantic retrieval | PASS | fixture returned ranked resource URI |
| Restart persistence | PASS | resource readable after stop/start |
| VLM reachability | FAIL / DEGRADED | Ollama unavailable at `127.0.0.1:11434` |
| Needle 2 installation | PASS | package `2.0.11`, local engine and weights |
| Needle offline constrained inference | PASS | validated `log_meal` fixture |
| Needle qualification | BLOCKED | tuned-weight confidence is `null`; frozen suite has two noncritical failures |
| Advisory skill discovery | PASS | unchanged `SKILL.md` present and hashed |
| KAD architecture integration | NOT CLAIMED | no adapter or control-plane mutation in this R1 package |

## Boundaries preserved

- Repository artifacts, PRIME_DIRECTIVE, accepted ADRs, tests, and evidence remain authoritative.
- OpenViking is a durable context/index adapter substrate, not KAD control plane or acceptance authority.
- OpenViking-generated summaries and Needle outputs remain derived/proposed state.
- No auto-memory promotion, full-repository ingestion, global user configuration mutation, or new paid spend occurred.
- VLM and confidence failures reduce capability; they do not widen authority or escalate routing.

## Next gated work

1. Add a KAD-owned `KnowledgePlane` contract and deterministic tests before adapter integration.
2. Define trust-domain filtering, provenance-bearing records, acceptance states, and bounded context packets.
3. Qualify Needle on a small frozen KAD dataset with a deterministic validator and explicit confidence policy.
4. Keep VLM-dependent features disabled or degraded until a separately approved local provider is reachable and verified.
5. Add an adapter smoke test only after the contract and failure-injection tests are RED-first.
