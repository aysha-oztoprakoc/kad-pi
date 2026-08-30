# DECISIONS

<!-- DERIVED: this namespace is rebuildable project state. -->

## Notification-Oriented Causality

- ID: `decision:0001`
- Status: `ACCEPTED`
- Source: `docs/adr/0001-notification-oriented-causality.md`
- Source hash: `21ba8ee1972d3029dffb1605061978aa23dfa0932cbee9889da4eb1d4f84e51c`
- Epistemic class: `DOCUMENT_DERIVED`
- Acceptance: `ACCEPTED`
- Trust domain: `engineering`
- Privacy: `INTERNAL`
- Description: Traditional agent and state architectures rely on continuous polling loops or untyped broadcast events to detect state mutations. In large simulation environments and agent networks, continuous polling wastes compute, creates nondeterministic race conditions, and obscures causal provenance.

## Spatiotemporal Composability and Cordis Ownership

- ID: `decision:0002`
- Status: `ACCEPTED`
- Source: `docs/adr/0002-spatiotemporal-composability-cordis-ownership.md`
- Source hash: `56896db809c6859372c9c27db5e155a1386fbdcfd6885e74df7912a5d9f07e2e`
- Epistemic class: `DOCUMENT_DERIVED`
- Acceptance: `ACCEPTED`
- Trust domain: `engineering`
- Privacy: `INTERNAL`
- Description: Components frequently execute unmanaged mutations, leak event listeners, and fail to clean up resources during teardown or error scenarios. Ambient authority and unmanaged side-effects make deterministic experimentation and graceful degradation impossible.

## Intent Authority Boundary

- ID: `decision:0003`
- Status: `ACCEPTED`
- Source: `docs/adr/0003-intent-authority-boundary.md`
- Source hash: `9d289457b1ed2f295cfc5c0593f5407f635ff53df12b1e380c61df5512c7e72f`
- Epistemic class: `DOCUMENT_DERIVED`
- Acceptance: `ACCEPTED`
- Trust domain: `engineering`
- Privacy: `INTERNAL`
- Description: Probabilistic language models are well suited for interpreting natural language input, unstructured lore, and player intent, but they are nondeterministic and cannot be trusted with direct authority to mutate canonical simulation state.

## Model-Agnostic Control Plane

- ID: `decision:0004`
- Status: `ACCEPTED`
- Source: `docs/adr/0004-model-agnostic-control-plane.md`
- Source hash: `b9eba4a02e63c59802b18aa56f1409710e4c4a14e649435d24a42114d6556417`
- Epistemic class: `DOCUMENT_DERIVED`
- Acceptance: `ACCEPTED`
- Trust domain: `engineering`
- Privacy: `INTERNAL`
- Description: Coupling orchestration or core workflow code to specific proprietary model names (e.g. `gpt-4`, `claude-3-opus`, `gemini-1.5-pro`) creates vendor lock-in, breaks cross-harness portability, and leads to rapid obsolescence when models are updated or rate-limited.

## Deterministic First and Epistemic Classification

- ID: `decision:0005`
- Status: `ACCEPTED`
- Source: `docs/adr/0005-deterministic-first-and-epistemic-classification.md`
- Source hash: `f85186eb15e51ff6a36ef58e31bd663295c48326eb30270a6dbb4d53871ff9cb`
- Epistemic class: `DOCUMENT_DERIVED`
- Acceptance: `ACCEPTED`
- Trust domain: `engineering`
- Privacy: `INTERNAL`
- Description: AI agents often hallucinate claims of success or rely on self-reported "PASS" assessments without empirical verification. Furthermore, research ideas, temporary hacks, and proven theorems frequently get conflated in documentation.

## Pi SDK Session Subscribe Integration Seam

- ID: `decision:0006`
- Status: `ACCEPTED`
- Source: `docs/adr/0006-pi-sdk-session-subscribe-integration-seam.md`
- Source hash: `516ce751c4d7b1a4fb7703bfb2166b099afaa1ecd443f6a1f59bdbc390e91074`
- Epistemic class: `DOCUMENT_DERIVED`
- Acceptance: `ACCEPTED`
- Trust domain: `engineering`
- Privacy: `INTERNAL`
- Description: In WP-KAD-001, tracing real agent lifecycle events through Pi coding agent required identifying a sanctioned integration seam. While extension `input` hooks allow live callback interception, `pi.on` does not provide an unsubscription or disposal contract. In contrast, the official `@earendil-works/pi-coding-agent` SDK exports `createAgentSession()` where `session.subscribe()` returns an explicit disposal cleanup function `() => void`.

## Synthetic Knowledge Librarian Architecture

- ID: `decision:0007`
- Status: `ACCEPTED`
- Source: `docs/adr/0007-synthetic-knowledge-librarian-architecture.md`
- Source hash: `ce4b2e56b167a66e620155c2cea749d7044e9d4d855b5269cd2c3cc64146839a`
- Epistemic class: `DOCUMENT_DERIVED`
- Acceptance: `ACCEPTED`
- Trust domain: `engineering`
- Privacy: `INTERNAL`
- Description: Raw handoffs, session transcripts, and architecture documents grow rapidly in length and complexity, creating context exhaustion and token waste for LLM agents. Traditional RAG systems often suffer from chunk fragmentation, semantic drift, and failure to preserve epistemic certainty levels.

## Unified Context and Knowledge Plane

- ID: `decision:0008`
- Status: `ACCEPTED`
- Source: `docs/adr/0008-unified-context-knowledge-plane.md`
- Source hash: `6e3d57b5efc7186f84890de5743d12648c8a3c48fcacb4ebadeead7ee755085c`
- Epistemic class: `DOCUMENT_DERIVED`
- Acceptance: `ACCEPTED`
- Trust domain: `engineering`
- Privacy: `INTERNAL`
- Description: KAD-PI currently has a deterministic Librarian and durable wiki artifacts, while OMP owns volatile conversational context. The roadmap now requires a unified project knowledge plane without allowing retrieval, summaries, embeddings, or memories to become an authority layer. It also requires bounded local specialists and explicit context-economy controls.
