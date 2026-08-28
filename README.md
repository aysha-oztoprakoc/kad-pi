# KAD-PI: Local AI Experimental Platform & Agent Harness

> **React only to relevant change; declare what every component requires; track and recover what every component changes; prove behavior before trusting implementation; reduce capability safely when assumptions fail; and preserve enough evidence to reconstruct every consequential decision.**

`NOTIFY, DON'T POLL.`  
`DECLARE, DON'T REACH.`  
`TRACK, DON'T ASSUME CLEANUP.`  
`TEST, DON'T CLAIM.`  
`DEGRADE, DON'T ESCALATE AUTHORITY.`  
`RECORD, DON'T GUESS.`  

---

## 1. Overview

**KAD-PI** is an experimental platform combining:
- **Notification-Oriented Paradigm (PON)**: Selective, causal state reaction without polling.
- **Spatiotemporal Composability (STC)**: Scoped capabilities, explicit coeffects (dependencies), managed effects, and reversible teardowns governed by **Cordis**.
- **Deterministic Authority Boundary**: Decoupling non-deterministic language models (interpreters) from canonical state mutations (pure C++20/TypeScript validator and resolver).
- **Pi Coding Agent Lifecycle Integration**: Provenance-verified `@earendil-works/pi-coding-agent` (v0.84.3) integration seam with deterministic session subscription and disposal.
- **Autonomous Agent Swarms**: Specialized role-based agent coordination (`kad-master`, `kad-researcher`, `kad-builder`, `kad-tester`, `kad-reviewer`) on Google Antigravity (AGY).
- **Synthetic Knowledge Base & Librarian Agent**: Multi-tier documentation layer with structured catalogs, taxonomies, and zero-overhead deterministic retrieval tools for autonomous agents.

---

## 2. Repository Structure

```text
.
├── PRIME_DIRECTIVE.md                 # Normative constitution & invariants
├── CONTEXT.md                         # Project domain context & ubiquitous language
├── validate_prime_directive.py        # Token budget and constitution validator
│
├── .agents/
│   ├── agents/                        # Custom AGY swarm subagent definitions
│   │   ├── kad-master/                # Master architect (Pro tier)
│   │   ├── kad-researcher/            # Read-only fact investigator (Flash tier)
│   │   ├── kad-builder/               # Bounded RED->GREEN implementer (Flash tier)
│   │   ├── kad-tester/                # Deterministic verifier & failure injector (Flash tier)
│   │   └── kad-reviewer/              # Adversarial auditor (Flash tier)
│   ├── capabilities/                  # Canonical capabilities (e.g. ask_user)
│   ├── adapters/                      # Harness-specific interaction adapters
│   └── skills/                        # Standardized engineering skills
│
├── docs/
│   └── adr/                           # Architectural Decision Records (ADRs 0001-0007)
│
├── kad-lab/
│   ├── src/                           # Pure C++20 deterministic simulation core
│   │   └── kad/                       # CandidateIntent, Validator, Resolver, StateDiff
│   ├── test/                          # EXPERIMENT-001 test suites
│   ├── exp-002/                       # LLM stream transport & teacher prompt experiments
│   └── exp-003-pi-tracer/             # Pi 0.84.3 SDK lifecycle integration tracer & tests
│
├── tools/
│   └── librarian/                     # Deterministic Librarian query engine & verifier CLI
│       ├── librarian.mjs              # Search, lookup, and verification CLI
│       └── test/                      # Librarian verification test suite
│
├── wiki/
│   ├── index.md                       # Master knowledge wiki index
│   ├── synthetic/                     # Progressive-disclosure synthetic docs for agents
│   │   ├── 01_ARCHITECTURE_PON_STC.md
│   │   ├── 02_DETERMINISTIC_AUTHORITY_SIMULATION.md
│   │   ├── 03_PI_HARNESS_INTEGRATION.md
│   │   ├── 04_SWARM_GOVERNANCE_AGENTS.md
│   │   ├── 05_SUBSCRIPTION_ECONOMICS_ROUTING.md
│   │   ├── 06_SAFE_PLUGIN_LAB_TOOLCHAINS.md
│   │   ├── 07_EVIDENCE_EPISTEMOLOGY_LEDGER.md
│   │   ├── LIBRARIAN.md               # Operating manual for Librarian Agent
│   │   ├── CATALOG.json               # Machine-readable document catalog
│   │   ├── TAXONOMY.json              # Domain ontology and concept graph
│   │   ├── TAXONOMY.md
│   │   └── RETRIEVAL_INDEX.jsonl      # Content-addressed chunk retrieval index
│   └── *.md                           # Raw source handoffs and notes
│
└── evidence/
    ├── WP-SKILL-001A/                 # Baseline skill inventory evidence
    ├── WP-SKILL-002/                  # Ecosystem refactor evidence
    └── WP-KAD-001/                    # Pi SDK tracer contract & provenance evidence
```

---

## 3. Quickstart & Verification

### Running the Librarian Engine
```bash
# Verify knowledge base links, schemas, and epistemic tags
node tools/librarian/librarian.mjs verify

# Lookup a domain concept in the formal taxonomy
node tools/librarian/librarian.mjs lookup "Fiber"

# Search documents and retrieval cards with domain filtering
node tools/librarian/librarian.mjs search "PON causality"
```

### Running Test Suites
```bash
# Deterministic C++20 Simulation Core (EXPERIMENT-001)
cd kad-lab && make test

# Librarian Knowledge Base Verification Suite
node --test tools/librarian/test/librarian.test.mjs

# Constitution Token Budget Check
python3 validate_prime_directive.py
```
