# AGENTS

<!-- DERIVED: this namespace is rebuildable project state. -->

## kad-builder Agent

- ID: `agent:kad-builder`
- Status: `FILE_ONLY`
- Source: `.agents/agents/kad-builder/agent.md`
- Source hash: `6cc678c41d0aa4847e2bef59068785a9de14814c8a6e078dde774b4a1b6f8943`
- Epistemic class: `DOCUMENT_DERIVED`
- Acceptance: `ACCEPTED`
- Trust domain: `engineering`
- Privacy: `INTERNAL`
- Description: Bounded implementation worker for approved KAD designs. Delegate small patches with explicit mutation boundaries and acceptance tests here.

## kad-master Agent

- ID: `agent:kad-master`
- Status: `FILE_ONLY`
- Source: `.agents/agents/kad-master/agent.md`
- Source hash: `a31102b51b11a5cc72192db1afe4da8233ee4c426f2a47ec3cadd6e066c0abf1`
- Epistemic class: `DOCUMENT_DERIVED`
- Acceptance: `ACCEPTED`
- Trust domain: `engineering`
- Privacy: `INTERNAL`
- Description: Master architect and swarm coordinator for KAD/PON/STC experiments. Owns architecture, decomposition, delegation, mutation authority, synthesis, escalation, and acceptance.

## kad-researcher Agent

- ID: `agent:kad-researcher`
- Status: `FILE_ONLY`
- Source: `.agents/agents/kad-researcher/agent.md`
- Source hash: `313c4ae0d3982212ce92340eab34d7bb98434d38405f82d61fece3a9281abeb3`
- Epistemic class: `DOCUMENT_DERIVED`
- Acceptance: `ACCEPTED`
- Trust domain: `engineering`
- Privacy: `INTERNAL`
- Description: Read-only evidence investigator for KAD experiments. Delegate repository discovery, source tracing, API inspection, provenance analysis, and architecture evidence gathering here.

## kad-reviewer Agent

- ID: `agent:kad-reviewer`
- Status: `FILE_ONLY`
- Source: `.agents/agents/kad-reviewer/agent.md`
- Source hash: `c5db4ff654c7172545e52fcf096d5d6d5b2ea592681ec3a78c12fd1e8e3c6fae`
- Epistemic class: `DOCUMENT_DERIVED`
- Acceptance: `ACCEPTED`
- Trust domain: `engineering`
- Privacy: `INTERNAL`
- Description: Independent adversarial reviewer for KAD work. Delegate post-implementation architecture, evidence, regression, and scope audits here.

## kad-tester Agent

- ID: `agent:kad-tester`
- Status: `FILE_ONLY`
- Source: `.agents/agents/kad-tester/agent.md`
- Source hash: `54b2e56b1ab4809da65ae4b765bca68d2efd983343244dc68e3565796ac1954d`
- Epistemic class: `DOCUMENT_DERIVED`
- Acceptance: `ACCEPTED`
- Trust domain: `engineering`
- Privacy: `INTERNAL`
- Description: Deterministic test and evidence specialist for KAD experiments. Delegate RED tests, failure injection, lifecycle verification, manifests, and reproducibility checks here.
