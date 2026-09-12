# KAD-PI Deterministic Promotion Readiness Gate Architecture (2026-08-30)

## Executive Summary

Workpackage **WP-KAD-COUNTERFACTUAL-PROMOTION-READINESS-005** establishes the deterministic promotion readiness gate for KAD-PI. The gate evaluates the longitudinal evidence collected by the Counterfactual Observatory to determine if sufficient natural observations exist to design a controlled canary experiment for a specific opportunity class.

## Epistemic Grounding

The gate strictly operationalizes the core KAD principle:
> **No causal claims without intervention.**

COUNTERFACTUAL recommendations were explicitly not executed during production routing. Therefore, any assertion regarding empirical savings, quality improvements, or performance advantages remains `UNKNOWN` until tested in a controlled canary intervention.

## State Transitions & Reason Codes

The gate evaluates four fail-closed deterministic dimensions:

1. **Integrity Gate**:
   * Verifies SHA-256 hash-chain continuity and monotonic sequence ordering across all examined journal records.
   * Detects historical tampering and recovers malformed trailing writes without losing valid prefix records.
   * State on failure: `INVALID_EVIDENCE` (Reason: `HASH_CHAIN_CORRUPTED`, `SEQUENCE_GAP_DETECTED`, `HISTORICAL_TAMPERING_DETECTED`).

2. **Policy Drift Gate**:
   * Asserts that all records in the observation window match the frozen policy fingerprint (`sha256:7e8d35f4...`) and evaluator version (`kad-economic-shadow-v1`).
   * State on failure: `POLICY_DRIFT` (Reason: `POLICY_FINGERPRINT_DRIFT`, `EVALUATOR_VERSION_DRIFT`, `SCHEMA_VERSION_DRIFT`).

3. **Quality Gate**:
   * Checks that the rate of `UNKNOWN` status decisions does not exceed the maximum allowed threshold (30%).
   * State on failure: `UNKNOWN_DOMINATED` (Reason: `EXCESSIVE_UNKNOWN_RATE`).

4. **Sufficiency & Opportunity Class Gates**:
   * Evaluates global observation count against threshold ($\ge 10$) and per-advisory-class occurrences ($\ge 5$) and divergences ($\ge 3$).
   * State when insufficient: `INSUFFICIENT_DATA` (Reason: `BELOW_GLOBAL_OBSERVATION_THRESHOLD`, `BELOW_CLASS_OCCURRENCE_THRESHOLD`, `BELOW_CLASS_DIVERGENCE_THRESHOLD`).
   * State when sufficient for a class: `READY_FOR_CANARY_DESIGN` (Reason: `CANARY_DESIGN_EVIDENCE_SUFFICIENT`).

## Non-Promotion Invariant

The output `READY_FOR_CANARY_DESIGN` grants zero routing authority and enables zero automatic promotion. It strictly indicates that the observational evidence model is mature enough for human engineers to design a bounded, hypothesis-tested canary experiment.
