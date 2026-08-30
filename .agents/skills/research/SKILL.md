---
name: research
description: High-trust research fabric investigating primary sources with full citation provenance and epistemic classification.
class: WORKFLOW
version: 1.0.0
triggers:
  - research
  - investigate library
  - literature review
  - find docs
tools:
  - read
  - task
  - write
  - web_search
disposition: KEEP
---

# `research` — High-Trust Research Fabric

Investigate technical questions against **primary high-trust sources** (official docs, source code, specs, academic papers).

## Invariants
1. **Primary Sources Only**: Follow claims back to the originating codebase, RFC, or official documentation.
2. **Citation Provenance**: Every factual claim MUST cite its exact source (file, URL, DOI, section).
3. **Epistemic Classification**: Explicitly mark statements as `[SOURCE_FACT]`, `[DERIVED_SYNTHESIS]`, `[PROJECT_INFERENCE]`, or `[UNKNOWN]`.
4. **Evidence, Not Authority**: Research artifacts provide evidence to Wayfinder; they never possess autonomous decision authority.
