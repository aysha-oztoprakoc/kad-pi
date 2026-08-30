/**
 * KAD-PI Ideal State V2 Compiler & Traceability Engine
 * Workpackage: WP-KAD-INTENT-TO-IDEAL-STATE-REFINEMENT-030
 *
 * Compiles validated human intent (INTENT_DECISION_EVENT_V1 + INTENT_DECISION_NORMALIZATION_V1)
 * and repository facts into typed requirements, traceability graph, gap analysis,
 * experiment register, roadmaps, and normative Ideal State Artifact V2.
 */

import { calculateEventHash } from './crypto.mjs';

/**
 * Compiles all data structures for Ideal State V2
 * @param {Array<object>} events
 * @param {Array<object>} normalizations
 * @returns {object} Full Ideal State data model
 */
export function compileIdealStateData(events = [], normalizations = []) {
  const eventMap = new Map(events.map(e => [e.decision_id, e]));
  const normMap = new Map(normalizations.map(n => [n.decision_id, n]));

  // Helper to retrieve record hash for a decision ID
  const getHash = (decId) => {
    const ev = eventMap.get(decId);
    if (!ev || !ev.provenance || !ev.provenance.record_hash) {
      throw new Error(`Missing event or record_hash for ${decId}`);
    }
    return ev.provenance.record_hash;
  };

  // 1. Requirements Registry (REQ-KAD-*)
  const requirements = [
    // Domain A: Identity & Mission (DEC_ID_01, DEC_ID_02, DEC_ID_21)
    {
      requirement_id: 'REQ-KAD-ID-001',
      statement: 'KAD-PI MUST function primarily as a local-first Personal Engineering Operating System and Scientific Research Laboratory, prioritizing human cognitive leverage, formal systems engineering, scientific repeatability, and practical personal maintainability over multi-tenant SaaS or autonomous factory topologies.',
      normative_level: 'MUST',
      plane: 'TARGET',
      domain_id: 'PROJECT_IDENTITY',
      intent_refs: ['DEC_ID_01'],
      raw_event_refs: [getHash('DEC_ID_01')],
      normalization_refs: ['DEC_ID_01'],
      current_state_refs: ['PRIME_DIRECTIVE.md', 'ISA-KAD-SKILL-ROLE-002 v1.1'],
      research_refs: ['literature/agentic-engineering-governance.md'],
      rationale: 'Authoritative choice in DEC_ID_01 mandates personal engineering OS and research laboratory as non-negotiable core.',
      verification_strategy: 'Architectural inspection and doctor validation confirming all execution and knowledge subsystems subordinate to personal engineering workflows.',
      risk_class: 'CONSTITUTIONAL',
      dependencies: [],
      implementation_status: 'PARTIAL',
      target_horizon: 'NOW',
      reversibility_or_change_cost: 'IRREVERSIBLE_CONSTITUTIONAL'
    },
    {
      requirement_id: 'REQ-KAD-ID-002',
      statement: 'The system MUST be optimized exclusively for the sole project lead (AMDY), with portable and reproducible architecture allowing trusted collaborators (2-5 peers) to inspect or replicate isolated components without turning KAD into an enterprise multi-user suite.',
      normative_level: 'MUST',
      plane: 'TARGET',
      domain_id: 'TARGET_STAKEHOLDER',
      intent_refs: ['DEC_ID_02'],
      raw_event_refs: [getHash('DEC_ID_02')],
      normalization_refs: ['DEC_ID_02'],
      current_state_refs: ['PRIME_DIRECTIVE.md', '.agents/workspace/'],
      research_refs: [],
      rationale: 'Authoritative choice in DEC_ID_02 excludes multi-tenancy, enterprise RBAC, and general public user onboarding overhead.',
      verification_strategy: 'Audit of workspace permissions, credential paths, and single-operator workflow constraints.',
      risk_class: 'HIGH',
      dependencies: ['REQ-KAD-ID-001'],
      implementation_status: 'IMPLEMENTED',
      target_horizon: 'NOW',
      reversibility_or_change_cost: 'HIGH_REARCHITECT'
    },
    {
      requirement_id: 'REQ-KAD-ID-003',
      statement: 'KAD-PI MUST maintain a private core repository for personal engineering and publish open research, specifications, benchmarks, and standalone tools only through governed, staged extraction.',
      normative_level: 'MUST',
      plane: 'TARGET',
      domain_id: 'OPEN_SOURCE_ACADEMIC_DESTINATION',
      intent_refs: ['DEC_ID_21'],
      raw_event_refs: [getHash('DEC_ID_21')],
      normalization_refs: ['DEC_ID_21'],
      current_state_refs: ['evidence/WP-KAD-BASELINE-PUBLICATION-028A/'],
      research_refs: [],
      rationale: 'Authoritative choice in DEC_ID_21 adopts staged hybrid: private personal OS + open extractable research artifacts.',
      verification_strategy: 'Publication filter verification ensuring private vault notes and unvetted credentials cannot leak into public releases.',
      risk_class: 'MEDIUM',
      dependencies: ['REQ-KAD-ID-001', 'REQ-KAD-ID-002'],
      implementation_status: 'PARTIAL',
      target_horizon: '6_MONTH',
      reversibility_or_change_cost: 'MEDIUM_MIGRATION'
    },

    // Domain B: Human Cognitive Model & Sovereignty (DEC_ID_03, DEC_ID_04)
    {
      requirement_id: 'REQ-KAD-COG-001',
      statement: 'The project lead MUST retain sole sovereign authority as Strategic Governor and Research Director over charter, scope, risk tolerance, financial expenditure, canonical knowledge doctrine, and policy changes, while delegating bounded routine implementation and validation to agents.',
      normative_level: 'MUST',
      plane: 'TARGET',
      domain_id: 'SOVEREIGN_HUMAN_ROLE',
      intent_refs: ['DEC_ID_03'],
      raw_event_refs: [getHash('DEC_ID_03')],
      normalization_refs: ['DEC_ID_03'],
      current_state_refs: ['PRIME_DIRECTIVE.md', 'bin/workctl'],
      research_refs: [],
      rationale: 'Authoritative choice in DEC_ID_03 defines human position as strategic governor rather than manual line-coder or passive spectator.',
      verification_strategy: 'Policy validation ensuring all mutating transitions to canonical knowledge, policy, and budget require human signature/lease.',
      risk_class: 'CONSTITUTIONAL',
      dependencies: ['REQ-KAD-ID-001'],
      implementation_status: 'PARTIAL',
      target_horizon: 'NOW',
      reversibility_or_change_cost: 'IRREVERSIBLE_CONSTITUTIONAL'
    },
    {
      requirement_id: 'REQ-KAD-COG-002',
      statement: 'The system MUST treat loss of human cognitive leverage, degradation of epistemic trust, unvetted provider lock-in, or increasing human cognitive fatigue as a definitive architectural failure condition regardless of raw token throughput.',
      normative_level: 'MUST',
      plane: 'TARGET',
      domain_id: 'FAILURE_CONDITION',
      intent_refs: ['DEC_ID_04'],
      raw_event_refs: [getHash('DEC_ID_04')],
      normalization_refs: ['DEC_ID_04'],
      current_state_refs: ['PRIME_DIRECTIVE.md'],
      research_refs: ['literature/human-ai-cognitive-fatigue.md'],
      rationale: 'Authoritative choice in DEC_ID_04 sets cognitive leverage and epistemic integrity as the ultimate optimization metric.',
      verification_strategy: 'Human intervention telemetry and contradiction audit ensuring system complexity does not escalate human maintenance burden.',
      risk_class: 'CONSTITUTIONAL',
      dependencies: ['REQ-KAD-COG-001'],
      implementation_status: 'PARTIAL',
      target_horizon: 'NOW',
      reversibility_or_change_cost: 'IRREVERSIBLE_CONSTITUTIONAL'
    },

    // Domain C: Authority Constitution & Autonomy (DEC_ID_05, DEC_ID_06)
    {
      requirement_id: 'REQ-KAD-AUTH-001',
      statement: 'Agents MUST operate under a Tier-Tiered Bounded Autonomy model where research, planning, localized code edits, and test generation are autonomous within an active STC workctl lease, while main branch merges, external network access, and policy mutations require explicit human or policy approval.',
      normative_level: 'MUST',
      plane: 'TARGET',
      domain_id: 'AUTONOMY_BOUNDARIES',
      intent_refs: ['DEC_ID_05'],
      raw_event_refs: [getHash('DEC_ID_05')],
      normalization_refs: ['DEC_ID_05'],
      current_state_refs: ['ISA-KAD-SKILL-ROLE-002 v1.1', 'bin/workctl'],
      research_refs: [],
      rationale: 'Authoritative choice in DEC_ID_05 prohibits both unrestricted agent execution and micromanaged step-by-step human typing.',
      verification_strategy: 'STC lease boundaries and workctl lease validation tests (e.g. stc-lease.test.mjs).',
      risk_class: 'HIGH',
      dependencies: ['REQ-KAD-COG-001'],
      implementation_status: 'PARTIAL',
      target_horizon: 'NOW',
      reversibility_or_change_cost: 'HIGH_REARCHITECT'
    },
    {
      requirement_id: 'REQ-KAD-AUTH-002',
      statement: 'Models and agents MUST propose knowledge changes only; canonical knowledge promotion into the KnowledgePlane Vault MUST be authorized exclusively by human review or deterministic evidence gates.',
      normative_level: 'MUST',
      plane: 'TARGET',
      domain_id: 'KNOWLEDGE_PROMOTION_GOVERNANCE',
      intent_refs: ['DEC_ID_06'],
      raw_event_refs: [getHash('DEC_ID_06')],
      normalization_refs: ['DEC_ID_06'],
      current_state_refs: ['vault/00_Governance/', 'bin/kad-wiki'],
      research_refs: [],
      rationale: 'Authoritative choice in DEC_ID_06 establishes Human Epistemic Sovereignty with Policy-Bounded Promotion.',
      verification_strategy: 'Librarian and wiki linter tests verifying models cannot write directly to canonical doctrine zones without gate pass.',
      risk_class: 'CONSTITUTIONAL',
      dependencies: ['REQ-KAD-COG-001'],
      implementation_status: 'IMPLEMENTED',
      target_horizon: 'NOW',
      reversibility_or_change_cost: 'IRREVERSIBLE_CONSTITUTIONAL'
    },

    // Domain D: PM Kernel & Work Lifecycle (DEC_ID_17, DEC_ID_18)
    {
      requirement_id: 'REQ-KAD-PM-001',
      statement: 'KAD-PI MUST embed a lean, high-leverage, deterministic Project Management Kernel within workctl that natively manages WBS/DAG dependency graphs, STC lease claims, quality gates, and decision/risk registers, while deliberately rejecting bureaucratic enterprise agile frameworks.',
      normative_level: 'MUST',
      plane: 'TARGET',
      domain_id: 'NATIVE_PM_CAPABILITIES',
      intent_refs: ['DEC_ID_17'],
      raw_event_refs: [getHash('DEC_ID_17')],
      normalization_refs: ['DEC_ID_17'],
      current_state_refs: ['bin/workctl', 'tools/workspace/'],
      research_refs: [],
      rationale: 'Authoritative choice in DEC_ID_17 focuses PM tooling strictly on functions governing authority, sequencing, and quality.',
      verification_strategy: 'workctl ticket and DAG validation suites verifying dependency tracking and critical path calculations.',
      risk_class: 'HIGH',
      dependencies: ['REQ-KAD-AUTH-001'],
      implementation_status: 'PARTIAL',
      target_horizon: '3_MONTH',
      reversibility_or_change_cost: 'MEDIUM_MIGRATION'
    },
    {
      requirement_id: 'REQ-KAD-PM-002',
      statement: 'Workpackages MUST be hierarchically decomposed with explicit acceptance contracts, where strategic goals are set by the human, typed WBS packages are proposed by planning roles, and execution leases are validated against DAG dependencies before dispatch.',
      normative_level: 'MUST',
      plane: 'TARGET',
      domain_id: 'WORKPACKAGE_DECOMPOSITION_AUTHORITY',
      intent_refs: ['DEC_ID_18'],
      raw_event_refs: [getHash('DEC_ID_18')],
      normalization_refs: ['DEC_ID_18'],
      current_state_refs: ['bin/workctl', 'ISA-KAD-SKILL-ROLE-002 v1.1'],
      research_refs: [],
      rationale: 'Authoritative choice in DEC_ID_18 mandates hierarchical evidence-governed decomposition over freeform agent swarms.',
      verification_strategy: 'Workpackage schema validation and workctl claim verification tests.',
      risk_class: 'HIGH',
      dependencies: ['REQ-KAD-PM-001'],
      implementation_status: 'PARTIAL',
      target_horizon: '3_MONTH',
      reversibility_or_change_cost: 'MEDIUM_MIGRATION'
    },

    // Domain E: Quality Architecture & Verification Independence (DEC_ID_19)
    {
      requirement_id: 'REQ-KAD-QUAL-001',
      statement: 'The system MUST enforce strict verification independence under the constitutional invariant: MUTATOR != SOLE VERIFIER != ACCEPTANCE AUTHORITY. Implementing agents cannot self-certify significant architectural or code mutations.',
      normative_level: 'MUST',
      plane: 'TARGET',
      domain_id: 'QUALITY_GATES_AND_VERIFICATION_INDEPENDENCE',
      intent_refs: ['DEC_ID_19'],
      raw_event_refs: [getHash('DEC_ID_19')],
      normalization_refs: ['DEC_ID_19'],
      current_state_refs: ['ISA-KAD-SKILL-ROLE-002 v1.1', 'ROLE_CONTRACT_V2'],
      research_refs: [],
      rationale: 'Authoritative choice in DEC_ID_19 rejects agent self-certification as a critical quality vulnerability.',
      verification_strategy: 'Role contract and workctl transition checks verifying that review and acceptance require distinct agents or deterministic test suites.',
      risk_class: 'CONSTITUTIONAL',
      dependencies: ['REQ-KAD-AUTH-001'],
      implementation_status: 'IMPLEMENTED',
      target_horizon: 'NOW',
      reversibility_or_change_cost: 'HIGH_REARCHITECT'
    },

    // Domain F: Research Operating System (DEC_ID_13)
    {
      requirement_id: 'REQ-KAD-RES-001',
      statement: 'KAD-PI MUST execute external scientific research through a strict tiered epistemic pipeline: Question -> Source Extraction -> Provenance Validation -> Claim Triangulation -> Empirical Verification -> Advisor Review -> Human Promotion.',
      normative_level: 'MUST',
      plane: 'TARGET',
      domain_id: 'RESEARCH_OPERATING_LIFECYCLE',
      intent_refs: ['DEC_ID_13'],
      raw_event_refs: [getHash('DEC_ID_13')],
      normalization_refs: ['DEC_ID_13'],
      current_state_refs: ['evidence/WP-KAD-RESEARCH-REAL-CORPUS-EVALUATION-006/', 'bin/kad-wiki'],
      research_refs: ['literature/evidence-gated-scientific-synthesis.md'],
      rationale: 'Authoritative choice in DEC_ID_13 prevents hallucinated claims and unverified web search summaries from polluting canonical doctrine.',
      verification_strategy: 'Research workflow tests (tools/kad/test/research*.test.mjs) verifying provenance capture and claim classification.',
      risk_class: 'HIGH',
      dependencies: ['REQ-KAD-AUTH-002'],
      implementation_status: 'PARTIAL',
      target_horizon: '3_MONTH',
      reversibility_or_change_cost: 'MEDIUM_MIGRATION'
    },

    // Domain G: KnowledgePlane & Storage Topology (DEC_ID_14, DEC_ID_16)
    {
      requirement_id: 'REQ-KAD-KNOW-001',
      statement: 'The KnowledgePlane MUST maintain the canonical Obsidian Vault (human-readable Markdown with structured frontmatter) as the sole durable source of truth; vector databases, semantic embeddings, and graph indices MUST remain rebuildable derived projections.',
      normative_level: 'MUST',
      plane: 'TARGET',
      domain_id: 'KNOWLEDGE_PLANE_STORAGE_TOPOLOGY',
      intent_refs: ['DEC_ID_14'],
      raw_event_refs: [getHash('DEC_ID_14')],
      normalization_refs: ['DEC_ID_14'],
      current_state_refs: ['vault/', 'wiki/', 'bin/kad-wiki'],
      research_refs: [],
      rationale: 'Authoritative choice in DEC_ID_14 prevents black-box vector stores from usurping human-auditable Markdown as authority.',
      verification_strategy: 'Vault projection rebuild tests verifying complete state can be reconstructed from Markdown files alone.',
      risk_class: 'CONSTITUTIONAL',
      dependencies: ['REQ-KAD-AUTH-002'],
      implementation_status: 'IMPLEMENTED',
      target_horizon: 'NOW',
      reversibility_or_change_cost: 'HIGH_REARCHITECT'
    },
    {
      requirement_id: 'REQ-KAD-KNOW-002',
      statement: 'The KnowledgePlane MUST manage epistemic conflicts, stale doctrines, and invalidated claims through explicit contradiction journaling; affected claims MUST fail closed on dependent execution paths while preserving historical provenance.',
      normative_level: 'MUST',
      plane: 'TARGET',
      domain_id: 'CONTRADICTION_INVALIDATION_MANAGEMENT',
      intent_refs: ['DEC_ID_16'],
      raw_event_refs: [getHash('DEC_ID_16')],
      normalization_refs: ['DEC_ID_16'],
      current_state_refs: ['tools/kad/wiki/'],
      research_refs: [],
      rationale: 'Authoritative choice in DEC_ID_16 mandates explicit contradiction tracking instead of silent overwrites.',
      verification_strategy: 'Contradiction validator tests verifying claims marked CONTESTED block downstream automated promotion.',
      risk_class: 'HIGH',
      dependencies: ['REQ-KAD-KNOW-001'],
      implementation_status: 'PARTIAL',
      target_horizon: '3_MONTH',
      reversibility_or_change_cost: 'MEDIUM_MIGRATION'
    },

    // Domain H: ContextPlane & Semantic Retrieval (DEC_ID_14)
    {
      requirement_id: 'REQ-KAD-CTX-001',
      statement: 'Context retrieval MUST be decoupled from proprietary vendor APIs through stable capability interfaces (SemanticIndexProvider, GraphProjectionProvider, ContextCompiler); candidate providers such as OpenViking or Needle MUST undergo empirical benchmarking before adoption.',
      normative_level: 'MUST',
      plane: 'TARGET',
      domain_id: 'CONTEXT_PLANE_CAPABILITIES',
      intent_refs: ['DEC_ID_14'],
      raw_event_refs: [getHash('DEC_ID_14')],
      normalization_refs: ['DEC_ID_14'],
      current_state_refs: ['vault/90_Derived/Projections/'],
      research_refs: [],
      rationale: 'Preserves model and provider neutrality at context compilation boundaries.',
      verification_strategy: 'Context compiler mock tests and retrieval benchmark suite.',
      risk_class: 'MEDIUM',
      dependencies: ['REQ-KAD-KNOW-001'],
      implementation_status: 'NOT_IMPLEMENTED',
      target_horizon: '6_MONTH',
      reversibility_or_change_cost: 'LOW_REVERSIBLE'
    },

    // Domain I: Distillation & Downward Hierarchy (DEC_ID_15)
    {
      requirement_id: 'REQ-KAD-DIST-001',
      statement: 'KAD-PI MUST strictly enforce EXECUTION != LEARNING through an offline evidence-gated distillation pipeline that extracts repeated validated execution trajectories into deterministic tools, tests, linters, schemas, or compact local specialists.',
      normative_level: 'MUST',
      plane: 'TARGET',
      domain_id: 'DISTILLATION_LEARNING_PIPELINE',
      intent_refs: ['DEC_ID_15'],
      raw_event_refs: [getHash('DEC_ID_15')],
      normalization_refs: ['DEC_ID_15'],
      current_state_refs: ['PRIME_DIRECTIVE.md', 'tools/kad/observatory/'],
      research_refs: [],
      rationale: 'Authoritative choice in DEC_ID_15 rejects online continuous memory mutation and mandates offline downward distillation.',
      verification_strategy: 'Distillation trajectory replay tests and observatory record validation.',
      risk_class: 'HIGH',
      dependencies: ['REQ-KAD-AUTH-001'],
      implementation_status: 'PARTIAL',
      target_horizon: '6_MONTH',
      reversibility_or_change_cost: 'HIGH_REARCHITECT'
    },

    // Domain J: Security & Trust Domains (DEC_ID_08)
    {
      requirement_id: 'REQ-KAD-SEC-001',
      statement: 'Security boundaries MUST enforce strict multi-domain isolation across AMDY Workstation, TELL Server, Local Sandbox, Remote APIs, and Knowledge Vault with zero ambient credential inheritance; raw secret access by agent prompts MUST be strictly forbidden.',
      normative_level: 'MUST',
      plane: 'TARGET',
      domain_id: 'SECURITY_TRUST_DOMAINS',
      intent_refs: ['DEC_ID_08'],
      raw_event_refs: [getHash('DEC_ID_08')],
      normalization_refs: ['DEC_ID_08'],
      current_state_refs: ['PRIME_DIRECTIVE.md', '.env.example'],
      research_refs: [],
      rationale: 'Authoritative choice in DEC_ID_08 requires physical and logical credential isolation.',
      verification_strategy: 'Gitleaks scan, trivy audit, and capability-broker permission tests.',
      risk_class: 'CRITICAL',
      dependencies: ['REQ-KAD-ID-002'],
      implementation_status: 'PARTIAL',
      target_horizon: '3_MONTH',
      reversibility_or_change_cost: 'HIGH_REARCHITECT'
    },

    // Domain K: Compute Fabric & Asymmetric Hardware (DEC_ID_11, DEC_ID_23)
    {
      requirement_id: 'REQ-KAD-COMP-001',
      statement: 'The compute fabric MUST operate an asymmetric dual-node topology: AMDY Workstation handles interactive controller tasks, GUI presentation, and fast local steering; TELL Server handles headless batch execution, distillation pipelines, and multi-model benchmarking.',
      normative_level: 'MUST',
      plane: 'TARGET',
      domain_id: 'LOCAL_COMPUTE_HARDWARE_ROLES',
      intent_refs: ['DEC_ID_11', 'DEC_ID_23'],
      raw_event_refs: [getHash('DEC_ID_11'), getHash('DEC_ID_23')],
      normalization_refs: ['DEC_ID_11', 'DEC_ID_23'],
      current_state_refs: ['docs/architecture/KAD_COMPUTE_FABRIC_IDEAL_STATE_V1.md', 'evidence/WP-KAD-COMPUTE-FABRIC-EXPERIMENTAL-PROBE-021/'],
      research_refs: [],
      rationale: 'Authoritative choice in DEC_ID_11 and DEC_ID_23 leverages distinct physical hardware capabilities.',
      verification_strategy: 'Host capability adapter verification tests (tell-profile.test.mjs, compute-probe.test.mjs).',
      risk_class: 'MEDIUM',
      dependencies: ['REQ-KAD-ID-001', 'REQ-KAD-SEC-001'],
      implementation_status: 'PARTIAL',
      target_horizon: '6_MONTH',
      reversibility_or_change_cost: 'MEDIUM_MIGRATION'
    },

    // Domain L: Execution Fabric & Workload Providers (DEC_ID_09)
    {
      requirement_id: 'REQ-KAD-EXEC-001',
      statement: 'KAD-PI MUST separate execution runtimes from work lifecycle authority using the KAD_WORKLOAD_V1 abstraction; OMP serves as primary interactive controller, Pi as portable worker runtime, and Warren as an optional evidence-gated detached offload provider.',
      normative_level: 'MUST',
      plane: 'TARGET',
      domain_id: 'EXECUTION_TOPOLOGY',
      intent_refs: ['DEC_ID_09'],
      raw_event_refs: [getHash('DEC_ID_09')],
      normalization_refs: ['DEC_ID_09'],
      current_state_refs: ['ISA-KAD-SKILL-ROLE-002 v1.1', 'tools/kad/test/workload-contract.test.mjs'],
      research_refs: [],
      rationale: 'Authoritative choice in DEC_ID_09 establishes tiered runtime substrate without coupling authority to any single execution harness.',
      verification_strategy: 'Workload provider adapter tests and role dispatch tests.',
      risk_class: 'HIGH',
      dependencies: ['REQ-KAD-AUTH-001'],
      implementation_status: 'PARTIAL',
      target_horizon: '3_MONTH',
      reversibility_or_change_cost: 'MEDIUM_MIGRATION'
    },

    // Domain M: Git & GitHub Operating Model (DEC_ID_12)
    {
      requirement_id: 'REQ-KAD-GIT-001',
      statement: 'Canonical work lifecycle authority MUST remain local to Git and workctl; GitHub MUST function strictly as a downstream collaboration, publication, and remote CI verification projection.',
      normative_level: 'MUST',
      plane: 'TARGET',
      domain_id: 'GITHUB_OPERATING_MODEL',
      intent_refs: ['DEC_ID_12'],
      raw_event_refs: [getHash('DEC_ID_12')],
      normalization_refs: ['DEC_ID_12'],
      current_state_refs: ['evidence/WP-KAD-BASELINE-PUBLICATION-028A/', '.github/workflows/ci.yml'],
      research_refs: [],
      rationale: 'Authoritative choice in DEC_ID_12 preserves local sovereignty and prevents remote GitHub state from mutating local authority without explicit import.',
      verification_strategy: 'Git verification scripts and publication receipts confirming local-first authority.',
      risk_class: 'HIGH',
      dependencies: ['REQ-KAD-ID-001', 'REQ-KAD-PM-001'],
      implementation_status: 'IMPLEMENTED',
      target_horizon: 'NOW',
      reversibility_or_change_cost: 'HIGH_REARCHITECT'
    },

    // Domain N: Resource & FinOps Governance (DEC_ID_07, DEC_ID_20)
    {
      requirement_id: 'REQ-KAD-FIN-001',
      statement: 'Financial governance MUST enforce zero-marginal metered API spend by default, executing tasks on local compute and fixed subscriptions unless an explicit human lease with a capped budget is granted per workpackage.',
      normative_level: 'MUST',
      plane: 'TARGET',
      domain_id: 'ECONOMIC_FINOPS_GOVERNANCE',
      intent_refs: ['DEC_ID_07'],
      raw_event_refs: [getHash('DEC_ID_07')],
      normalization_refs: ['DEC_ID_07'],
      current_state_refs: ['bin/kad doctor', 'tools/kad/economic-router.mjs'],
      research_refs: [],
      rationale: 'Authoritative choice in DEC_ID_07 enforces strict FinOps control against unbounded model spend.',
      verification_strategy: 'Economic router tests (economic-router.test.mjs) verifying zero-spend policy enforcement.',
      risk_class: 'HIGH',
      dependencies: ['REQ-KAD-COG-001'],
      implementation_status: 'IMPLEMENTED',
      target_horizon: 'NOW',
      reversibility_or_change_cost: 'MEDIUM_MIGRATION'
    },
    {
      requirement_id: 'REQ-KAD-FIN-002',
      statement: 'Operational FinOps telemetry MUST optimize resources according to the strict priority: Human Attention > Epistemic Integrity > Maintainability > Money/Quota > Local Compute Cycles.',
      normative_level: 'MUST',
      plane: 'TARGET',
      domain_id: 'SCARCE_RESOURCE_FINOPS_OPTIMIZATION',
      intent_refs: ['DEC_ID_20'],
      raw_event_refs: [getHash('DEC_ID_20')],
      normalization_refs: ['DEC_ID_20'],
      current_state_refs: ['tools/kad/telemetry/'],
      research_refs: [],
      rationale: 'Authoritative choice in DEC_ID_20 establishes human attention and epistemic integrity as supreme scarce assets.',
      verification_strategy: 'Telemetry view model tests and observatory metrics checks.',
      risk_class: 'CONSTITUTIONAL',
      dependencies: ['REQ-KAD-COG-002'],
      implementation_status: 'PARTIAL',
      target_horizon: '3_MONTH',
      reversibility_or_change_cost: 'IRREVERSIBLE_CONSTITUTIONAL'
    },

    // Domain O: Local-First & Full Offline Boundary (DEC_ID_10)
    {
      requirement_id: 'REQ-KAD-OFFLINE-001',
      statement: 'KAD-PI MUST maintain full core engineering, research, knowledge, verification, and work package execution capabilities completely offline using deterministic tools, local models, and the local Knowledge Vault.',
      normative_level: 'MUST',
      plane: 'TARGET',
      domain_id: 'LOCAL_FIRST_OFFLINE_BOUNDARY',
      intent_refs: ['DEC_ID_10'],
      raw_event_refs: [getHash('DEC_ID_10')],
      normalization_refs: ['DEC_ID_10'],
      current_state_refs: ['bin/workctl', 'bin/kad doctor'],
      research_refs: [],
      rationale: 'Authoritative choice in DEC_ID_10 mandates complete autonomous survival during total WAN disconnect.',
      verification_strategy: 'Simulated WAN fault-injection benchmark (EXP-KAD-OFFLINE-SURVIVAL-001).',
      risk_class: 'HIGH',
      dependencies: ['REQ-KAD-ID-001', 'REQ-KAD-KNOW-001'],
      implementation_status: 'PARTIAL',
      target_horizon: '3_MONTH',
      reversibility_or_change_cost: 'HIGH_REARCHITECT'
    },

    // Domain P: Strategic Horizons & Milestones (DEC_ID_22, DEC_ID_23, DEC_ID_24)
    {
      requirement_id: 'REQ-KAD-HORIZON-001',
      statement: 'The 3-month operational destination MUST achieve a robust single-node Personal Engineering OS & Empirical Research Substrate with rock-solid workctl, full offline operation, and baseline telemetry.',
      normative_level: 'MUST',
      plane: 'TARGET',
      domain_id: 'THREE_MONTH_DESTINATION_TARGET',
      intent_refs: ['DEC_ID_22'],
      raw_event_refs: [getHash('DEC_ID_22')],
      normalization_refs: ['DEC_ID_22'],
      current_state_refs: ['bin/workctl', 'tools/kad/'],
      research_refs: [],
      rationale: 'Authoritative choice in DEC_ID_22 prioritizes near-term boring reliability and single-node stabilization.',
      verification_strategy: 'Milestone validation suite and 3-month goal verification receipts.',
      risk_class: 'MEDIUM',
      dependencies: ['REQ-KAD-ID-001', 'REQ-KAD-PM-001'],
      implementation_status: 'PARTIAL',
      target_horizon: '3_MONTH',
      reversibility_or_change_cost: 'MEDIUM_MIGRATION'
    },
    {
      requirement_id: 'REQ-KAD-HORIZON-002',
      statement: 'The 6-month intermediate destination MUST achieve an operational Asymmetric Dual-Node Compute Fabric (AMDY + TELL) with governed asynchronous workload pipelines, downward distillation, and Warren canary offload.',
      normative_level: 'MUST',
      plane: 'TARGET',
      domain_id: 'SIX_MONTH_DESTINATION_TARGET',
      intent_refs: ['DEC_ID_23'],
      raw_event_refs: [getHash('DEC_ID_23')],
      normalization_refs: ['DEC_ID_23'],
      current_state_refs: ['evidence/WP-KAD-COMPUTE-FABRIC-EXPERIMENTAL-PROBE-021/'],
      research_refs: [],
      rationale: 'Authoritative choice in DEC_ID_23 expands compute fabric across physical nodes based on empirical probe results.',
      verification_strategy: '6-month dual-node integration benchmark suite.',
      risk_class: 'MEDIUM',
      dependencies: ['REQ-KAD-COMP-001', 'REQ-KAD-HORIZON-001'],
      implementation_status: 'NOT_IMPLEMENTED',
      target_horizon: '6_MONTH',
      reversibility_or_change_cost: 'MEDIUM_MIGRATION'
    },
    {
      requirement_id: 'REQ-KAD-HORIZON-003',
      statement: 'The 12-month ultimate ideal state destination MUST achieve a mature, self-distilling Personal Engineering OS & Publishable Scientific Research Laboratory, producing high-quality publishable research artifacts and reproducible specifications.',
      normative_level: 'MUST',
      plane: 'TARGET',
      domain_id: 'TWELVE_MONTH_DESTINATION_TARGET',
      intent_refs: ['DEC_ID_24'],
      raw_event_refs: [getHash('DEC_ID_24')],
      normalization_refs: ['DEC_ID_24'],
      current_state_refs: ['docs/architecture/'],
      research_refs: [],
      rationale: 'Authoritative choice in DEC_ID_24 establishes the long-term vision of a mature self-distilling personal research OS.',
      verification_strategy: 'Annual governance audit and research artifact reproducibility verification.',
      risk_class: 'HIGH',
      dependencies: ['REQ-KAD-HORIZON-002', 'REQ-KAD-DIST-001'],
      implementation_status: 'NOT_IMPLEMENTED',
      target_horizon: '12_MONTH',
      reversibility_or_change_cost: 'HIGH_REARCHITECT'
    }
  ];

  // 2. Traceability Graph Edges
  const traceability_graph = [];

  // Helper to push edge
  const addEdge = (source, relationship, target, metadata = {}) => {
    traceability_graph.push({ source, relationship, target, ...metadata });
  };

  // Connect Decisions -> Normalized Intent -> Requirements -> Architecture -> Gaps -> Workpackages/Experiments -> Verification
  for (const req of requirements) {
    for (const decId of req.intent_refs) {
      addEdge(decId, 'DERIVED_FROM', `NORM_${decId}`, { plane: 'INTENT' });
      addEdge(`NORM_${decId}`, 'IMPLEMENTS', req.requirement_id, { plane: 'TARGET' });
    }
    addEdge(req.requirement_id, 'CONSTRAINS', `ARCH_${req.domain_id}`, { plane: 'TARGET' });
    addEdge(`ARCH_${req.domain_id}`, 'DEPENDS_ON', `GAP_${req.domain_id}`, { plane: 'CURRENT' });
    addEdge(req.requirement_id, 'VALIDATED_BY', `VERIFY_${req.requirement_id}`, { plane: 'EXPERIMENT' });
  }

  // 3. Current-to-Target Gap Analysis Matrix (16 Domains)
  const gap_matrix = [
    {
      domain_id: 'PROJECT_IDENTITY',
      current_state: 'KAD-PI operates as a personal engineering repository with emerging research capabilities, but lacks formal single-operator identity boundaries in all subsystem contracts.',
      target_state: 'Rigid personal engineering OS & research lab boundaries enforced across all tools and agent roles.',
      gap_description: 'Subsystems occasionally scaffold multi-user or enterprise abstractions that must be pruned.',
      evidence_refs: ['PRIME_DIRECTIVE.md', 'ISA-KAD-SKILL-ROLE-002 v1.1'],
      risk_level: 'MEDIUM',
      target_horizon: 'NOW',
      remediation_wp: 'WP-KAD-INTENT-TO-IDEAL-STATE-REFINEMENT-030'
    },
    {
      domain_id: 'TARGET_STAKEHOLDER',
      current_state: 'Optimized for project lead AMDY with single-user filesystem and local Git bindings.',
      target_state: 'Formalized 2-5 collaborator isolation with zero multi-tenancy overhead.',
      gap_description: 'Collaborator export and replication packaging needs structured definition.',
      evidence_refs: ['.agents/workspace/', 'bin/workctl'],
      risk_level: 'LOW',
      target_horizon: '3_MONTH',
      remediation_wp: 'WP-KAD-COLLABORATOR-PACKAGING-035'
    },
    {
      domain_id: 'SOVEREIGN_HUMAN_ROLE',
      current_state: 'Human executes workctl commands and responds to ask-me prompts, but some agent tools lack explicit human confirmation gates for sensitive actions.',
      target_state: 'Adaptive cognitive engagement (CO-DESIGN, GATED, ASYNC, EXCEPTION_ONLY) with guaranteed human sovereignty over canonical knowledge, spend, and charter.',
      gap_description: 'Automated policy enforcement of human approval gates on sensitive branches.',
      evidence_refs: ['PRIME_DIRECTIVE.md', 'ROLE_CONTRACT_V2'],
      risk_level: 'HIGH',
      target_horizon: '3_MONTH',
      remediation_wp: 'WP-KAD-GOVERNANCE-GATES-032'
    },
    {
      domain_id: 'FAILURE_CONDITION',
      current_state: 'Failure defined in principles but lacks automated telemetry detecting human cognitive fatigue or escaped complexity.',
      target_state: 'Automated human intervention and cognitive overhead telemetry actively reporting friction.',
      gap_description: 'Observatory tracks model tokens and compute, but does not yet quantify human intervention friction.',
      evidence_refs: ['tools/kad/observatory/', 'tools/kad/telemetry/'],
      risk_level: 'MEDIUM',
      target_horizon: '3_MONTH',
      remediation_wp: 'WP-KAD-COGNITIVE-TELEMETRY-031'
    },
    {
      domain_id: 'AUTONOMY_BOUNDARIES',
      current_state: 'STC lease mechanism exists in workctl but is partially advisory for subagent execution trees.',
      target_state: 'Strict capability-enforced STC worktree sandboxes with deterministic boundary violation rejection.',
      gap_description: 'Subagents can theoretically attempt out-of-scope edits if prompt steering fails; requires deterministic filesystem sandboxing.',
      evidence_refs: ['tools/workspace/stc-lease.mjs', 'tools/kad/test/stc-lease.test.mjs'],
      risk_level: 'HIGH',
      target_horizon: '3_MONTH',
      remediation_wp: 'WP-KAD-STC-SANDBOX-HARDENING-033'
    },
    {
      domain_id: 'KNOWLEDGE_PROMOTION_GOVERNANCE',
      current_state: 'Librarian role and wiki linters guard vault, but promotion from research candidates to canonical notes requires manual human review.',
      target_state: 'Automated multi-stage evidence gating pipeline verifying empirical receipts before queuing notes for human signature.',
      gap_description: 'Formal transition state machine between research candidate and canonical vault doctrine.',
      evidence_refs: ['tools/kad/wiki/', 'bin/kad-wiki'],
      risk_level: 'HIGH',
      target_horizon: '3_MONTH',
      remediation_wp: 'WP-KAD-KNOWLEDGE-LIFECYCLE-034'
    },
    {
      domain_id: 'ECONOMIC_FINOPS_GOVERNANCE',
      current_state: 'Economic router enforces zero paid API spend by default via local policy; metered calls fail closed.',
      target_state: 'Granular per-workpackage paid API spend lease system with cryptographic quota tracking.',
      gap_description: 'Metered spend requires manual toggle; needs workpackage-scoped programmatic budget caps.',
      evidence_refs: ['tools/kad/economic-router.mjs', 'bin/kad doctor'],
      risk_level: 'MEDIUM',
      target_horizon: '3_MONTH',
      remediation_wp: 'WP-KAD-FINOPS-LEASE-036'
    },
    {
      domain_id: 'SECURITY_TRUST_DOMAINS',
      current_state: 'Environment variables used locally; gitleaks and trivy integrated into doctor suite.',
      target_state: 'Formal capability-scoped credential broker with zero ambient prompt visibility and host-level isolation.',
      gap_description: 'Credential broker abstraction needs implementation to prevent ambient token exposure in subagent shells.',
      evidence_refs: ['bin/kad doctor', '.env.example'],
      risk_level: 'CRITICAL',
      target_horizon: '3_MONTH',
      remediation_wp: 'WP-KAD-CAPABILITY-BROKER-037'
    },
    {
      domain_id: 'EXECUTION_TOPOLOGY',
      current_state: 'OMP operates as primary interactive controller; Pi exists as portable runner; Warren is planned canary.',
      target_state: 'Full tiered execution substrate with evidence-gated asynchronous workload offload to Warren.',
      gap_description: 'Warren offload provider requires empirical qualification under EXP-KAD-WARREN-ASYNC-002.',
      evidence_refs: ['tools/kad/test/workload-contract.test.mjs', 'ISA-KAD-SKILL-ROLE-002 v1.1'],
      risk_level: 'MEDIUM',
      target_horizon: '6_MONTH',
      remediation_wp: 'EXP-KAD-WARREN-ASYNC-002'
    },
    {
      domain_id: 'LOCAL_FIRST_OFFLINE_BOUNDARY',
      current_state: 'Core tools run locally on Linux workstation; local LLM execution tested via Ollama/llama.cpp.',
      target_state: 'Formally verified WAN-disconnected operational baseline capable of completing complex workpackages offline.',
      gap_description: 'WAN fault-injection experiment (EXP-KAD-OFFLINE-SURVIVAL-001) required to establish offline empirical proof.',
      evidence_refs: ['bin/workctl', 'bin/kad doctor'],
      risk_level: 'HIGH',
      target_horizon: '3_MONTH',
      remediation_wp: 'EXP-KAD-OFFLINE-SURVIVAL-001'
    },
    {
      domain_id: 'LOCAL_COMPUTE_HARDWARE_ROLES',
      current_state: 'AMDY workstation operational; TELL server profile defined (WP-018) and compute probe tested (WP-021).',
      target_state: 'Persistent asynchronous batch workload offload to TELL over secure node transport.',
      gap_description: 'Headless daemon and workload router across AMDY <-> TELL requires empirical qualification.',
      evidence_refs: ['evidence/WP-KAD-COMPUTE-FABRIC-EXPERIMENTAL-PROBE-021/', 'interface/themes/tell/'],
      risk_level: 'MEDIUM',
      target_horizon: '6_MONTH',
      remediation_wp: 'EXP-KAD-TELL-PERSISTENT-005'
    },
    {
      domain_id: 'GITHUB_OPERATING_MODEL',
      current_state: 'Local Git is sovereign; GitHub remote synchronized as downstream projection with CI status check protection (WP-028A).',
      target_state: 'Automated GitHub issue/PR import gateway preserving local workctl authority.',
      gap_description: 'Automated bidirectional sync without granting GitHub authority to mutate local workctl state.',
      evidence_refs: ['evidence/WP-KAD-BASELINE-PUBLICATION-028A/', '.github/workflows/ci.yml'],
      risk_level: 'MEDIUM',
      target_horizon: '6_MONTH',
      remediation_wp: 'WP-KAD-GITHUB-PROJECTION-038'
    },
    {
      domain_id: 'RESEARCH_OPERATING_LIFECYCLE',
      current_state: 'Zotero local adapter (WP-005) and real-corpus research evaluation (WP-006) operational.',
      target_state: 'Fully integrated R0-R4 claim-sensitive research workflow with automated citation graph triangulation.',
      gap_description: 'Automated claim extraction and triangulation pipeline across local research corpus.',
      evidence_refs: ['tools/kad/research-zotero.mjs', 'evidence/WP-KAD-RESEARCH-REAL-CORPUS-EVALUATION-006/'],
      risk_level: 'HIGH',
      target_horizon: '3_MONTH',
      remediation_wp: 'WP-KAD-RESEARCH-WORKFLOW-039'
    },
    {
      domain_id: 'KNOWLEDGE_PLANE_STORAGE_TOPOLOGY',
      current_state: 'Markdown Vault in vault/ is canonical; wiki lint and projection synchronization verified (WP-010, WP-011).',
      target_state: 'Unified KnowledgePlane with schema-validated properties, rebuildable projections, and zero data loss.',
      gap_description: 'Context plane indexing and search acceleration layers require formal integration.',
      evidence_refs: ['vault/', 'bin/kad-wiki', 'evidence/WP-KAD-CANONICAL-STATE-RECONCILIATION-010-R1/'],
      risk_level: 'LOW',
      target_horizon: 'NOW',
      remediation_wp: 'WP-KAD-KNOWLEDGE-LIFECYCLE-034'
    },
    {
      domain_id: 'DISTILLATION_LEARNING_PIPELINE',
      current_state: 'Observatory records execution telemetry and causal journals (WP-002, WP-021).',
      target_state: 'Offline trajectory pattern analyzer distilling repeated execution failures into deterministic linters and tools.',
      gap_description: 'Automated distillation pipeline converting validated episodes into new regression fixtures and tools.',
      evidence_refs: ['evidence/WP-KAD-002/causal-journal.jsonl', 'tools/kad/observatory/'],
      risk_level: 'HIGH',
      target_horizon: '6_MONTH',
      remediation_wp: 'EXP-KAD-DISTILLATION-006'
    },
    {
      domain_id: 'CONTRADICTION_INVALIDATION_MANAGEMENT',
      current_state: 'Epistemic status tags exist in metadata; manual dispute recording in vault notes.',
      target_state: 'Structured contradiction journal with automated fail-closed dependency invalidation.',
      gap_description: 'Contradiction journaling engine linking conflicting claims to downstream blocking gates.',
      evidence_refs: ['vault/00_Governance/', 'tools/kad/wiki/'],
      risk_level: 'HIGH',
      target_horizon: '3_MONTH',
      remediation_wp: 'WP-KAD-CONTRADICTION-JOURNAL-040'
    }
  ];

  // 4. Experiment Register
  const experiments = [
    {
      experiment_id: 'EXP-KAD-OFFLINE-SURVIVAL-001',
      title: 'Full Offline Autonomous Engineering & Research Survival Fault-Injection Benchmark',
      domain_id: 'LOCAL_FIRST_OFFLINE_BOUNDARY',
      hypothesis: 'KAD-PI can execute end-to-end multi-step engineering and research workpackages completely offline using local deterministic tools, local models, and the local Knowledge Vault with zero network degradation.',
      baseline: 'Online execution using frontier remote models and connected web search APIs.',
      candidate: '100% disconnected environment (WAN severed) using Ollama/Qwen local inference and local Zotero/Markdown corpus.',
      independent_variable: 'Network connectivity state (CONNECTED vs SEVERED).',
      controlled_variables: ['Workpackage specification', 'Acceptance test suite', 'Hardware compute node (AMDY)'],
      confounders: ['Local model quantization quality', 'Local corpus coverage limitations'],
      metrics: ['Task completion rate (%)', 'Test pass rate (%)', 'Execution latency (seconds)', 'Human interventions required'],
      acceptance_threshold: '100% test pass on offline-capable workpackages; zero unauthorized outbound network attempts.',
      disposition_taxonomy: {
        ADOPT: 'Offline operation validated as primary baseline with zero regressions.',
        ADOPT_NARROW: 'Adopt offline baseline for engineering/code, retain online fallback for broad literature search.',
        DEFER: 'Local model capability insufficient; defer until stronger local weights available.'
      }
    },
    {
      experiment_id: 'EXP-KAD-WARREN-ASYNC-002',
      title: 'Warren Detached Asynchronous Workload Provider Qualification',
      domain_id: 'EXECUTION_TOPOLOGY',
      hypothesis: 'Offloading long-running, non-interactive batch tasks (distillation, fuzzing, multi-model evaluation) to Warren reduces human cognitive context switching without violating STC lease bounds.',
      baseline: 'Sequential foreground execution in interactive OMP sessions.',
      candidate: 'Asynchronous detached job submission to Warren worker with workctl status callbacks.',
      independent_variable: 'Execution runtime (OMP Foreground vs Warren Detached).',
      controlled_variables: ['Task workload complexity', 'STC lease boundaries', 'Acceptance criteria'],
      confounders: ['Process coordination overhead', 'Log retrieval latency'],
      metrics: ['Interactive session availability (%)', 'Task throughput (jobs/hr)', 'STC lease collision rate (%)'],
      acceptance_threshold: 'Zero STC lease violations; >30% reduction in interactive session blocking time.',
      disposition_taxonomy: {
        ADOPT: 'Warren promoted to standard WORKLOAD_PROVIDER for background batch queues.',
        MINE_IDEAS: 'Adopt detached job schema into lightweight local background runner; discard Warren runtime.',
        REMOVE: 'Warren introduces unmanageable complexity; reject dependency.'
      }
    },
    {
      experiment_id: 'EXP-KAD-BEADS-GRAPH-003',
      title: 'Beads Shadow Intent-Graph Projection Evaluation',
      domain_id: 'CONTEXT_PLANE_CAPABILITIES',
      hypothesis: 'Projecting workpackage dependency graphs and decision trees into Beads graph format provides actionable visual insight without competing with workctl lifecycle authority.',
      baseline: 'Standard workctl CLI status reports and Mermaid Markdown diagrams.',
      candidate: 'Beads graph projection generated as derived artifact in vault/90_Derived/Projections/.',
      independent_variable: 'Graph visualization format (CLI/Markdown vs Beads JSON).',
      controlled_variables: ['Workpackage dependency DAG', 'Repository state'],
      confounders: ['Visualization rendering overhead', 'Schema drift between workctl and Beads'],
      metrics: ['Graph rendering accuracy (100%)', 'Human comprehension speed (seconds)', 'Authority collision count (must be 0)'],
      acceptance_threshold: '100% deterministic compilation from workctl; zero mutation authority granted to Beads.',
      disposition_taxonomy: {
        ADOPT_NARROW: 'Adopt Beads strictly as read-only derived visualization projection.',
        MINE_IDEAS: 'Port graph layout algorithms into native Sofia v3 Cytoscape explorer; discard Beads.',
        REMOVE: 'Zero measurable comprehension gain; reject projection.'
      }
    },
    {
      experiment_id: 'EXP-KAD-SEMANTIC-RETRIEVAL-004',
      title: 'OpenViking / Needle Semantic Knowledge Retrieval Benchmark',
      domain_id: 'CONTEXT_PLANE_CAPABILITIES',
      hypothesis: 'Local semantic embedding indices accelerate relevant context retrieval for complex architecture queries without hallucinating unverified connections.',
      baseline: 'Deterministic ripgrep, AST grep, and frontmatter property queries.',
      candidate: 'Local OpenViking/Needle vector index over canonical Vault Markdown.',
      independent_variable: 'Retrieval method (Deterministic Keyword vs Semantic Vector).',
      controlled_variables: ['Query benchmark suite', 'Vault corpus content'],
      confounders: ['Embedding model latency', 'Index staleness'],
      metrics: ['Retrieval Recall@5', 'Precision@5', 'Query latency (ms)', 'Context token economy'],
      acceptance_threshold: 'Recall@5 > 85% with zero unverified document claims admitted into canonical context.',
      disposition_taxonomy: {
        ADOPT: 'Integrate semantic index as rebuildable derived projection provider.',
        ADOPT_NARROW: 'Use semantic retrieval for exploratory search only; require deterministic paths for code/governance.',
        REMOVE: 'Excessive memory/latency overhead; rely on deterministic search.'
      }
    },
    {
      experiment_id: 'EXP-KAD-TELL-PERSISTENT-005',
      title: 'TELL Persistent Headless Worker Integration & Evaluation',
      domain_id: 'LOCAL_COMPUTE_HARDWARE_ROLES',
      hypothesis: 'Offloading continuous test runs, multi-model evaluation sweeps, and distillation to TELL server keeps AMDY workstation responsive and accelerates iteration cycles.',
      baseline: 'Executing all verification and benchmarking locally on AMDY workstation.',
      candidate: 'Dispatching batch workloads to TELL server over SSH/secure transport.',
      independent_variable: 'Execution host (AMDY Local vs TELL Server).',
      controlled_variables: ['Test suite size', 'Model evaluation workloads'],
      confounders: ['Network transfer latency', 'NixOS environment differences'],
      metrics: ['AMDY GPU/CPU utilization (%)', 'Benchmark execution wall time (s)', 'Sync failure rate (%)'],
      acceptance_threshold: 'Zero test result divergence between AMDY and TELL; >50% reduction in AMDY workstation load during eval sweeps.',
      disposition_taxonomy: {
        ADOPT: 'TELL established as canonical PERSISTENT_EXECUTION_NODE for batch workloads.',
        ADOPT_NARROW: 'Use TELL for nightly evaluations only; keep active test cycles on AMDY.',
        DEFER: 'Network/sync overhead exceeds benefits; defer dual-node operations.'
      }
    },
    {
      experiment_id: 'EXP-KAD-DISTILLATION-006',
      title: 'Downward Distillation of Validated Execution Trajectories',
      domain_id: 'DISTILLATION_LEARNING_PIPELINE',
      hypothesis: 'Analyzing historical causal journals and test failures allows offline distillation into deterministic linters and specialist prompts that permanently eliminate repeated mistakes.',
      baseline: 'Ad-hoc prompt steering and manual debugging across successive workpackages.',
      candidate: 'Automated pattern extraction from causal journals producing deterministic checks and role contract fixtures.',
      independent_variable: 'Feedback mechanism (Manual Prompting vs Distilled Deterministic Checks).',
      controlled_variables: ['Task types', 'Model capability class'],
      confounders: ['Variability in workpackage domains'],
      metrics: ['Repeated error rate (%)', 'Token consumption per matched workpackage', 'Human intervention rate'],
      acceptance_threshold: '>40% reduction in repeated test-fix cycles on recurring task classes.',
      disposition_taxonomy: {
        ADOPT: 'Formalize offline distillation engine as standard post-milestone workflow.',
        MINE_IDEAS: 'Extract manual distillation checklists for human review; discard automated generator.',
        DEFER: 'Insufficient execution history; defer until 50+ workpackage episodes recorded.'
      }
    }
  ];

  // 5. Strategic Roadmaps
  const roadmaps = {
    three_month: {
      horizon: '3_MONTH',
      theme: 'Robust Single-Node Personal Engineering OS & Empirical Research Substrate',
      focus: 'Boring reliability, single-node stabilization, knowledge hygiene, full offline proof, baseline telemetry, and security boundaries.',
      milestones: [
        'M1: Full Offline Operational Baseline (EXP-KAD-OFFLINE-SURVIVAL-001 PASS)',
        'M2: Lean Deterministic PM Kernel & WBS/DAG Validation in workctl',
        'M3: Strict Multi-Domain Security Sandbox & Capability Broker Prototype',
        'M4: KnowledgePlane Contradiction Journal & Lifecycle State Machine',
        'M5: Human Cognitive Attention & Intervention Telemetry Baseline'
      ]
    },
    six_month: {
      horizon: '6_MONTH',
      theme: 'Asymmetric Dual-Node Compute Fabric (AMDY + TELL) & Governed Asynchronous Pipelines',
      focus: 'Headless TELL offload, downward distillation engine, Warren async offload canary, semantic retrieval qualification.',
      milestones: [
        'M6: Asymmetric Dual-Node Compute Fabric Operational (AMDY interactive + TELL batch)',
        'M7: Downward Distillation Pipeline Eliminating Repeated Execution Errors',
        'M8: Warren Detached Asynchronous Workload Canary Qualification',
        'M9: ContextPlane Semantic Retrieval Benchmarking & Projection Integration',
        'M10: Staged Open Research & Specification Publishing Framework'
      ]
    },
    twelve_month: {
      horizon: '12_MONTH',
      theme: 'Mature Self-Distilling Personal Engineering OS & Publishable Scientific Research Laboratory',
      focus: 'High-throughput human-AI co-design, publishable academic artifacts, reproducible benchmarks, and trusted collaborator replication.',
      milestones: [
        'M11: Fully Self-Distilling Engineering & Research Operating System',
        'M12: Submission-Ready Academic Research Artifacts & Reproducible ISAs',
        'M13: Trusted-Ring Multi-Node Portability & Replication Package',
        'M14: Formal Evaluation of Long-Term Open Source Framework Staging'
      ]
    }
  };

  // 6. Successor Workpackages Portfolio (WP-031+)
  const successor_workpackages = [
    {
      workpackage_id: 'WP-KAD-COGNITIVE-TELEMETRY-031',
      title: 'Human Cognitive Attention, Intervention Friction & Outcome Cost Telemetry Baseline',
      why_now: 'Required by REQ-KAD-COG-002 and REQ-KAD-FIN-002 to establish empirical baseline before compute fabric expansion.',
      intent_refs: ['DEC_ID_04', 'DEC_ID_20'],
      dependencies: ['WP-KAD-INTENT-TO-IDEAL-STATE-REFINEMENT-030'],
      scope: ['tools/kad/telemetry/', 'tools/kad/observatory/', 'tools/kad/test/telemetry*.test.mjs'],
      non_scope: ['commercial telemetry SaaS', 'active keyloggers', 'paid API spend'],
      authority_class: 'engineering',
      risk_level: 'MEDIUM',
      acceptance_evidence: 'Observatory records human intervention count, friction events, and task wall time with zero passive overhead.',
      estimated_resource_class: 'LOCAL_DETERMINISTIC',
      candidate_execution_provider: 'OMP'
    },
    {
      workpackage_id: 'WP-KAD-GOVERNANCE-GATES-032',
      title: 'Deterministic Governance Gates, Human Signature Verification & Main Merge Protection',
      why_now: 'Required by REQ-KAD-COG-001 and REQ-KAD-AUTH-001 to enforce human sovereignty on sensitive transitions.',
      intent_refs: ['DEC_ID_03', 'DEC_ID_05'],
      dependencies: ['WP-KAD-INTENT-TO-IDEAL-STATE-REFINEMENT-030'],
      scope: ['bin/workctl', 'tools/workspace/governance-gates.mjs', 'tools/kad/test/governance*.test.mjs'],
      non_scope: ['enterprise RBAC', 'OAuth servers', 'multi-user auth'],
      authority_class: 'governance',
      risk_level: 'HIGH',
      acceptance_evidence: 'Direct unapproved merges, unauthorized spend leases, and unverified knowledge promotions fail closed deterministically.',
      estimated_resource_class: 'LOCAL_DETERMINISTIC',
      candidate_execution_provider: 'OMP'
    },
    {
      workpackage_id: 'WP-KAD-STC-SANDBOX-HARDENING-033',
      title: 'STC Worktree Sandboxing, Subagent Isolation & Capability Lease Enforcement',
      why_now: 'Required by REQ-KAD-AUTH-001 and REQ-KAD-SEC-001 to prevent subagent authority leakage.',
      intent_refs: ['DEC_ID_05', 'DEC_ID_08'],
      dependencies: ['WP-KAD-GOVERNANCE-GATES-032'],
      scope: ['tools/workspace/stc-lease.mjs', 'tools/kad/test/stc-lease*.test.mjs'],
      non_scope: ['root privilege escalation', 'container virtualization'],
      authority_class: 'engineering',
      risk_level: 'HIGH',
      acceptance_evidence: 'Out-of-scope filesystem edits and unauthorized command executions fail closed with explicit lease violation receipts.',
      estimated_resource_class: 'LOCAL_DETERMINISTIC',
      candidate_execution_provider: 'OMP'
    },
    {
      workpackage_id: 'WP-KAD-KNOWLEDGE-LIFECYCLE-034',
      title: 'KnowledgePlane State Machine, Epistemic Gating & Rebuildable Projection Pipeline',
      why_now: 'Required by REQ-KAD-AUTH-002 and REQ-KAD-KNOW-001 to formalize promotion pipeline from candidate to doctrine.',
      intent_refs: ['DEC_ID_06', 'DEC_ID_14'],
      dependencies: ['WP-KAD-INTENT-TO-IDEAL-STATE-REFINEMENT-030'],
      scope: ['tools/kad/wiki/', 'bin/kad-wiki', 'vault/00_Governance/'],
      non_scope: ['new vector databases', 'proprietary cloud RAG'],
      authority_class: 'epistemic',
      risk_level: 'HIGH',
      acceptance_evidence: 'All vault transitions follow explicit state machine (CANDIDATE -> VERIFIED -> PROMOTED) with 100% rebuildable projections.',
      estimated_resource_class: 'LOCAL_DETERMINISTIC',
      candidate_execution_provider: 'OMP'
    },
    {
      workpackage_id: 'WP-KAD-CONTRADICTION-JOURNAL-040',
      title: 'Structured Contradiction Journal, Epistemic Conflict Invalidation & Fail-Closed Gating',
      why_now: 'Required by REQ-KAD-KNOW-002 to prevent stale or contradictory claims from polluting execution plans.',
      intent_refs: ['DEC_ID_16'],
      dependencies: ['WP-KAD-KNOWLEDGE-LIFECYCLE-034'],
      scope: ['tools/kad/wiki/contradictions.mjs', 'tools/kad/test/contradictions.test.mjs', 'vault/00_Governance/'],
      non_scope: ['probabilistic conflict resolution'],
      authority_class: 'epistemic',
      risk_level: 'HIGH',
      acceptance_evidence: 'Conflicting claims are journaled, tagged CONTESTED, and block downstream dependent automated actions until resolved.',
      estimated_resource_class: 'LOCAL_DETERMINISTIC',
      candidate_execution_provider: 'OMP'
    }
  ];

  return {
    version: '2.0.0',
    title: 'KAD-PI Ideal State V2 Specification & Traceability Architecture',
    compiled_at: new Date().toISOString(),
    source_events_count: events.length,
    source_normalizations_count: normalizations.length,
    requirements,
    traceability_graph,
    gap_matrix,
    experiments,
    roadmaps,
    successor_workpackages
  };
}

/**
 * Validates the Requirements Registry
 */
export function validateRequirementsRegistry(requirements = [], events = []) {
  const errors = [];
  const reqIds = new Set();
  const validNorms = new Set(['MUST', 'MUST_NOT', 'SHOULD', 'SHOULD_NOT', 'MAY']);
  const eventHashMap = new Map(events.map(e => [e.decision_id, e.provenance?.record_hash]));

  for (const req of requirements) {
    if (!req.requirement_id || !req.requirement_id.startsWith('REQ-KAD-')) {
      errors.push(`Invalid requirement ID: ${req.requirement_id}`);
    }
    if (reqIds.has(req.requirement_id)) {
      errors.push(`Duplicate requirement ID: ${req.requirement_id}`);
    }
    reqIds.add(req.requirement_id);

    if (!validNorms.has(req.normative_level)) {
      errors.push(`Invalid normative level in ${req.requirement_id}: ${req.normative_level}`);
    }

    if (!req.intent_refs || req.intent_refs.length === 0) {
      errors.push(`Requirement ${req.requirement_id} has no intent_refs`);
    } else {
      for (const decId of req.intent_refs) {
        if (!eventHashMap.has(decId)) {
          errors.push(`Requirement ${req.requirement_id} references unknown intent decision ${decId}`);
        } else {
          const expectedHash = eventHashMap.get(decId);
          if (!req.raw_event_refs || !req.raw_event_refs.includes(expectedHash)) {
            errors.push(`Requirement ${req.requirement_id} missing raw event hash for ${decId}`);
          }
        }
      }
    }

    if (!req.verification_strategy) {
      errors.push(`Requirement ${req.requirement_id} missing verification_strategy`);
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates the Traceability Graph
 */
export function validateTraceabilityGraph(edges = []) {
  const errors = [];
  const validRels = new Set(['DERIVED_FROM', 'IMPLEMENTS', 'CONSTRAINS', 'DEPENDS_ON', 'CONTRADICTS', 'SUPERSEDES', 'VALIDATED_BY', 'REQUIRES_EXPERIMENT']);

  if (!Array.isArray(edges) || edges.length === 0) {
    errors.push('Traceability graph is empty');
    return { valid: false, errors };
  }

  for (const edge of edges) {
    if (!edge.source || !edge.target || !edge.relationship) {
      errors.push(`Malformed edge: ${JSON.stringify(edge)}`);
      continue;
    }
    if (!validRels.has(edge.relationship)) {
      errors.push(`Invalid relationship type: ${edge.relationship}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates the Gap Analysis Matrix
 */
export function validateGapAnalysis(gaps = []) {
  const errors = [];
  const validRisks = new Set(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);
  const validHorizons = new Set(['NOW', '3_MONTH', '6_MONTH', '12_MONTH', 'ULTIMATE']);

  if (!Array.isArray(gaps) || gaps.length < 16) {
    errors.push(`Gap analysis must cover at least 16 architectural domains, got ${gaps.length}`);
  }

  for (const gap of gaps) {
    if (!gap.domain_id || !gap.current_state || !gap.target_state) {
      errors.push(`Incomplete gap entry for domain: ${gap.domain_id}`);
    }
    if (!validRisks.has(gap.risk_level)) {
      errors.push(`Invalid risk level in gap ${gap.domain_id}: ${gap.risk_level}`);
    }
    if (!validHorizons.has(gap.target_horizon)) {
      errors.push(`Invalid target horizon in gap ${gap.domain_id}: ${gap.target_horizon}`);
    }
    if (!gap.evidence_refs || gap.evidence_refs.length === 0) {
      errors.push(`Missing evidence_refs in gap ${gap.domain_id}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates the Experiment Register
 */
export function validateExperimentRegister(experiments = []) {
  const errors = [];
  if (!Array.isArray(experiments) || experiments.length === 0) {
    errors.push('Experiment register is empty');
    return { valid: false, errors };
  }

  for (const exp of experiments) {
    if (!exp.experiment_id || !exp.experiment_id.startsWith('EXP-KAD-')) {
      errors.push(`Invalid experiment ID: ${exp.experiment_id}`);
    }
    if (!exp.hypothesis || !exp.baseline || !exp.candidate) {
      errors.push(`Missing hypothesis, baseline, or candidate in ${exp.experiment_id}`);
    }
    if (!exp.metrics || exp.metrics.length === 0) {
      errors.push(`Missing metrics in ${exp.experiment_id}`);
    }
    if (!exp.disposition_taxonomy) {
      errors.push(`Missing disposition taxonomy in ${exp.experiment_id}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Renders the Ideal State Artifact V2 Markdown
 * @param {object} data
 * @returns {string} Formatted Markdown
 */
export function renderIdealStateMarkdown(data) {
  const lines = [];

  lines.push('# KAD-PI IDEAL STATE ARTIFACT V2');
  lines.push('');
  lines.push(`**Artifact Version**: \`${data.version}\``);
  lines.push(`**Compiled Date**: \`${data.compiled_at.slice(0, 10)}\``);
  lines.push('**Governing Authority**: `PRIME_DIRECTIVE.md` & `INTENT_DECISION_EVENT_V1` Ledger');
  lines.push('**Historical Baseline**: `ISA-KAD-SKILL-ROLE-002 v1.1` (Preserved Invariant)');
  lines.push('**Epistemic Status**: `CANONICAL TARGET ARCHITECTURE`');
  lines.push('');
  lines.push('---');
  lines.push('');

  lines.push('## 1. Executive Summary & Constitutional Mission');
  lines.push('');
  lines.push('KAD-PI is an advanced, local-first **Personal Engineering Operating System and Scientific Research Laboratory** designed to maximize human cognitive leverage, epistemic integrity, scientific reproducibility, and practical engineering maintainability.');
  lines.push('');
  lines.push('### Constitutional Core Principles:');
  lines.push('1. **Human Epistemic Sovereignty**: The project lead (`actor.project_lead`) retains exclusive authority over charter, scope, policy, capital, and canonical doctrine. Models propose; deterministic policy authorizes.');
  lines.push('2. **TOKENMAXXING over SLOPMAXXING**: Optimize accepted useful work and durable learning per scarce unit of human cognitive attention, remote quota, compute, and money. Raw token speed is explicitly subordinated to correctness.');
  lines.push('3. **Downward Distillation (EXECUTION != LEARNING)**: Execution is strictly decoupled from learning. Validated execution trajectories are distilled offline into deterministic tools, tests, schemas, and compact local specialists.');
  lines.push('4. **Verification Independence**: `MUTATOR != SOLE VERIFIER != ACCEPTANCE AUTHORITY`. No mutating agent may self-certify architectural or code changes.');
  lines.push('5. **Local-First Baseline Sovereignty**: Core engineering, research, verification, and work package execution MUST remain fully operational offline with zero network connectivity.');
  lines.push('');
  lines.push('---');
  lines.push('');

  lines.push('## 2. Normative Requirement Registry');
  lines.push('');
  lines.push('| Requirement ID | Domain | Normative | Statement | Intent Ref | Target Horizon | Status |');
  lines.push('|---|---|---|---|---|---|---|');

  for (const req of data.requirements) {
    const refs = req.intent_refs.join(', ');
    lines.push(`| **\`${req.requirement_id}\`** | \`${req.domain_id}\` | \`${req.normative_level}\` | ${req.statement} | \`${refs}\` | \`${req.target_horizon}\` | \`${req.implementation_status}\` |`);
  }

  lines.push('');
  lines.push('---');
  lines.push('');

  lines.push('## 3. Four-Plane Architecture Specification');
  lines.push('');
  lines.push('Every system capability is classified under the Four-Plane Model:');
  lines.push('* **`INTENT PLANE`**: Authoritative human intent (`INTENT_DECISION_EVENT_V1`, `AUTHOR_DECLARED`).');
  lines.push('* **`CURRENT PLANE`**: Repository-confirmed and empirically observed state (`ISA-002 v1.1`, `workctl`, test receipts).');
  lines.push('* **`TARGET PLANE`**: Target architectural requirements (`REQ-KAD-*`, `DERIVED_FROM_AUTHOR_DECLARED`).');
  lines.push('* **`EXPERIMENT PLANE`**: Unproven architectural hypotheses (`EXP-KAD-*`, `HYPOTHESIS`).');
  lines.push('');
  lines.push('---');
  lines.push('');

  lines.push('## 4. Current-to-Target Gap Analysis Matrix');
  lines.push('');
  lines.push('| Domain | Current State | Target State | Gap Description | Risk | Horizon | Remediation WP / Experiment |');
  lines.push('|---|---|---|---|---|---|---|');

  for (const gap of data.gap_matrix) {
    lines.push(`| **\`${gap.domain_id}\`** | ${gap.current_state} | ${gap.target_state} | ${gap.gap_description} | \`${gap.risk_level}\` | \`${gap.target_horizon}\` | \`${gap.remediation_wp}\` |`);
  }

  lines.push('');
  lines.push('---');
  lines.push('');

  lines.push('## 5. Experiment Register & Hypothesis Contracts');
  lines.push('');

  for (const exp of data.experiments) {
    lines.push(`### ${exp.experiment_id}: ${exp.title}`);
    lines.push('');
    lines.push(`* **Domain**: \`${exp.domain_id}\``);
    lines.push(`* **Hypothesis**: ${exp.hypothesis}`);
    lines.push(`* **Baseline**: ${exp.baseline}`);
    lines.push(`* **Candidate**: ${exp.candidate}`);
    lines.push(`* **Independent Variable**: ${exp.independent_variable}`);
    lines.push(`* **Controlled Variables**: ${exp.controlled_variables.join(', ')}`);
    lines.push(`* **Confounders**: ${exp.confounders.join(', ')}`);
    lines.push(`* **Metrics**: ${exp.metrics.join('; ')}`);
    lines.push(`* **Acceptance Threshold**: ${exp.acceptance_threshold}`);
    lines.push('* **Disposition Taxonomy**:');
    for (const [k, v] of Object.entries(exp.disposition_taxonomy)) {
      lines.push(`  - **\`${k}\`**: ${v}`);
    }
    lines.push('');
  }

  lines.push('---');
  lines.push('');

  lines.push('## 6. Strategic Roadmaps (3-Month, 6-Month, 12-Month)');
  lines.push('');

  for (const [horizonKey, rm] of Object.entries(data.roadmaps)) {
    lines.push(`### ${rm.horizon} Horizon: ${rm.theme}`);
    lines.push('');
    lines.push(`**Strategic Focus**: ${rm.focus}`);
    lines.push('');
    lines.push('**Key Milestones**:');
    for (const m of rm.milestones) {
      lines.push(`- [ ] **${m}**`);
    }
    lines.push('');
  }

  lines.push('---');
  lines.push('');

  lines.push('## 7. Successor Workpackage Portfolio');
  lines.push('');

  for (const wp of data.successor_workpackages) {
    lines.push(`### ${wp.workpackage_id}: ${wp.title}`);
    lines.push('');
    lines.push(`* **Why Now**: ${wp.why_now}`);
    lines.push(`* **Intent References**: \`${wp.intent_refs.join(', ')}\``);
    lines.push(`* **Dependencies**: \`${wp.dependencies.join(', ')}\``);
    lines.push(`* **Scope**: \`${wp.scope.join(', ')}\``);
    lines.push(`* **Non-Scope**: \`${wp.non_scope.join(', ')}\``);
    lines.push(`* **Authority Class**: \`${wp.authority_class}\` | **Risk Level**: \`${wp.risk_level}\``);
    lines.push(`* **Acceptance Evidence**: ${wp.acceptance_evidence}`);
    lines.push(`* **Execution Provider**: \`${wp.candidate_execution_provider}\` (${wp.estimated_resource_class})`);
    lines.push('');
  }

  return lines.join('\n');
}
