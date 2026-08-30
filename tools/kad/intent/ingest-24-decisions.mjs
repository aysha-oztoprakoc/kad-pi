/**
 * Ingestion script for the 24 Canonical Intention Alignment Decisions (2026-08-30)
 * Encodes all 24 decisions into INTENT_DECISION_EVENT_V1 and INTENT_DECISION_NORMALIZATION_V1
 * with exact cryptographic provenance, question hashing, and option preservation.
 */

import { resolve } from 'node:path';
import {
  createIntentEvent,
  createIntentNormalization,
  writeAllEvents,
  writeAllNormalizations,
  validateIntentJournal,
  compileAlignmentReport,
  DEFAULT_EVENTS_JOURNAL_PATH,
  DEFAULT_NORMALIZATIONS_PATH
} from './index.mjs';
import { writeFileSync } from 'node:fs';

const SESSION_ID = 'session-2026-08-30-alignment';
const CAPTURED_AT = '2026-08-30T18:00:00.000Z';
const HOST_ID = 'host.amdy.workstation';
const ACTOR_ID = 'actor.project_lead';

const RAW_DECISIONS_DATA = [
  // Round 1: Identity & Governance
  {
    decision_id: 'DEC_ID_01',
    domain_id: 'PROJECT_IDENTITY',
    question: 'What is the primary, non-negotiable identity of KAD-PI to which all other capabilities are subordinated?',
    options: [
      {
        option_id: 'opt_01',
        order: 1,
        raw_label: 'Personal Engineering OS & Research Lab',
        raw_description: 'Local-first cognitive workstation maximizing research throughput, formal systems engineering, and practical personal maintainability.',
        recommended: true,
        default_selected: true
      },
      {
        option_id: 'opt_02',
        order: 2,
        raw_label: 'Autonomous Agent Fleet Factory',
        raw_description: 'System for running dozens of independent agents with maximum delegation.',
        recommended: false,
        default_selected: false
      },
      {
        option_id: 'opt_03',
        order: 3,
        raw_label: 'General Purpose Multi-Tenant Framework',
        raw_description: 'Framework designed for public multi-user collaborative deployment.',
        recommended: false,
        default_selected: false
      },
      {
        option_id: 'opt_04',
        order: 4,
        raw_label: 'Pure Academic Prototype',
        raw_description: 'Throwaway research exploration without durable daily engineering use.',
        recommended: false,
        default_selected: false
      },
      {
        option_id: 'opt_05',
        order: 5,
        raw_label: 'Enterprise Automation Suite',
        raw_description: 'Business process workflow automation and integration platform.',
        recommended: false,
        default_selected: false
      }
    ],
    selected_option_id: 'opt_01',
    raw_note: 'Personal Engineering OS & Research Lab (note: KAD-PI is a local-first Personal Engineering Operating System and Research Laboratory for computer-engineering projects, designed to amplify the project lead\'s ability to research, design, implement, verify, manage, and continuously improve complex systems. It coordinates deterministic tools, Knowledge systems, local and remote AI, project-management processes, and bounded autonomous execution while preserving human strategic authority, scientific traceability, reproducibility, and graceful degradation.)',
    source_event_id: 'ask-me-round1-dec01',
    normalized_intent: 'KAD-PI primary identity is Personal Engineering OS and Research Laboratory. All agent and automation capabilities are subordinated to amplifying personal research throughput.',
    decision_class: 'ARCHITECTURAL',
    change_cost: 'HIGH',
    lock_in_risk: 'HIGH',
    governing_constraints: ['LOCAL_FIRST', 'PERSONAL_LEAD_SUBORDINATION', 'SCIENTIFIC_TRACEABILITY']
  },
  {
    decision_id: 'DEC_ID_02',
    domain_id: 'TARGET_STAKEHOLDER',
    question: 'Who is the primary intended user and audience for KAD-PI?',
    options: [
      {
        option_id: 'opt_01',
        order: 1,
        raw_label: 'Sole Project Lead (AMDY) Exclusive',
        raw_description: 'Optimized strictly for the project lead, with portable architecture for trusted collaborators to replicate.',
        recommended: true,
        default_selected: true
      },
      {
        option_id: 'opt_02',
        order: 2,
        raw_label: 'Public Open-Source Community',
        raw_description: 'Designed primarily for broad anonymous public contributors.',
        recommended: false,
        default_selected: false
      },
      {
        option_id: 'opt_03',
        order: 3,
        raw_label: 'Enterprise Engineering Teams',
        raw_description: 'Multi-tenant organization-wide engineering deployment.',
        recommended: false,
        default_selected: false
      },
      {
        option_id: 'opt_04',
        order: 4,
        raw_label: 'Academic Research Lab',
        raw_description: 'Multi-researcher academic group with shared cluster resources.',
        recommended: false,
        default_selected: false
      },
      {
        option_id: 'opt_05',
        order: 5,
        raw_label: 'Commercial SaaS Customers',
        raw_description: 'Cloud-hosted multi-tenant service for commercial subscribers.',
        recommended: false,
        default_selected: false
      }
    ],
    selected_option_id: 'opt_01',
    raw_note: 'Sole Project Lead (AMDY) Exclusive (note: Primary user: the project lead. Secondary operational audience: a small trusted ring of research/engineering collaborators and academic reviewers. KAD-PI should remain aggressively optimized for the project lead\'s workflow and hardware, while its core architecture, contracts, evidence, configuration, and deployment procedures remain reproducible and portable enough for 2-5 trusted collaborators to inspect, replicate, or operate bounded portions of the system. General public, enterprise, and multi-tenant usability are not goals.)',
    source_event_id: 'ask-me-round1-dec02',
    normalized_intent: 'System is optimized exclusively for the project lead (AMDY), while maintaining reproducible contracts for a small trusted collaborator ring (2-5 peers). Enterprise and multi-tenant complexity is excluded.',
    decision_class: 'GOVERNANCE',
    change_cost: 'MEDIUM',
    lock_in_risk: 'MEDIUM',
    governing_constraints: ['SINGLE_OPERATOR_FOCUS', 'TRUSTED_COLLABORATOR_PORTABILITY']
  },
  {
    decision_id: 'DEC_ID_03',
    domain_id: 'SOVEREIGN_HUMAN_ROLE',
    question: 'What is the sovereign role of the project lead in KAD-PI operations?',
    options: [
      {
        option_id: 'opt_01',
        order: 1,
        raw_label: 'Strategic Governor & Research Director',
        raw_description: 'Human retains sole authority over charter, scope, capital, canonical knowledge, and policy; delegates routine execution.',
        recommended: true,
        default_selected: true
      },
      {
        option_id: 'opt_02',
        order: 2,
        raw_label: 'Hands-On Full-Stack Implementer',
        raw_description: 'Human writes all code manually; agents provide autocomplete only.',
        recommended: false,
        default_selected: false
      },
      {
        option_id: 'opt_03',
        order: 3,
        raw_label: 'Passive Observer / Auditor',
        raw_description: 'Agents make all decisions autonomously; human observes logs.',
        recommended: false,
        default_selected: false
      },
      {
        option_id: 'opt_04',
        order: 4,
        raw_label: 'Peer Pair Programmer',
        raw_description: 'Human and agents share equal decision rights across all operations.',
        recommended: false,
        default_selected: false
      },
      {
        option_id: 'opt_05',
        order: 5,
        raw_label: 'Infrastructure Sysadmin Only',
        raw_description: 'Human manages hardware/network; models own engineering.',
        recommended: false,
        default_selected: false
      }
    ],
    selected_option_id: 'opt_01',
    raw_note: 'Strategic Governor & Research Director (note: The project lead operates as the sovereign strategic governor, research director, and principal architect of KAD-PI. The human retains sole authority over project charter, scope boundaries, capital/paid-API spend, canonical knowledge promotion, policy/constitutional invariants, and irreversible production/publication actions. Routine decomposition, implementation, testing, evidence collection, literature analysis, and deterministic verification are aggressively delegated to agents and local deterministic tools.)',
    source_event_id: 'ask-me-round1-dec03',
    normalized_intent: 'The human project lead is sovereign strategic governor and research director. Retains sole authority over charter, scope, paid spend, knowledge promotion, policy, and irreversible actions.',
    decision_class: 'GOVERNANCE',
    change_cost: 'HIGH',
    lock_in_risk: 'HIGH',
    governing_constraints: ['HUMAN_SOVEREIGNTY', 'DELEGATED_EXECUTION_BOUNDARIES']
  },
  {
    decision_id: 'DEC_ID_04',
    domain_id: 'FAILURE_CONDITION',
    question: 'What constitutes architectural failure for KAD-PI even if raw throughput improves?',
    options: [
      {
        option_id: 'opt_01',
        order: 1,
        raw_label: 'Loss of Cognitive Leverage, Epistemic Trust, or Sovereign Control',
        raw_description: 'Degrading understanding, polluting trusted knowledge, creating provider lock-in, or increasing human cognitive fatigue.',
        recommended: true,
        default_selected: true
      },
      {
        option_id: 'opt_02',
        order: 2,
        raw_label: 'Low Benchmark Token Speed',
        raw_description: 'Failure is defined solely by token generation rate.',
        recommended: false,
        default_selected: false
      },
      {
        option_id: 'opt_03',
        order: 3,
        raw_label: 'Sub-100 Agent Concurrency',
        raw_description: 'Failure is defined by inability to run massive parallel agent swarms.',
        recommended: false,
        default_selected: false
      },
      {
        option_id: 'opt_04',
        order: 4,
        raw_label: 'Absence of Cloud-Hosted SaaS',
        raw_description: 'Failure is defined by lack of multi-tenant cloud offering.',
        recommended: false,
        default_selected: false
      },
      {
        option_id: 'opt_05',
        order: 5,
        raw_label: 'Strict Refusal to use Closed Models',
        raw_description: 'Failure is defined by refusal to adopt closed proprietary APIs.',
        recommended: false,
        default_selected: false
      }
    ],
    selected_option_id: 'opt_01',
    raw_note: 'Loss of Human Cognitive Leverage, Epistemic Trust, or Sovereign Control (note: KAD-PI is a definitive failure if, despite high execution throughput or benchmark performance, it makes the project lead a less capable engineer/researcher: consuming more attention than it saves, degrading understanding of the system, polluting trusted knowledge, obscuring why decisions were made, creating dependence on opaque infrastructure/providers, or allowing probabilistic components to acquire authority that can no longer be confidently audited or overridden. The system succeeds only if automation increases the human\'s effective capacity while preserving comprehension, epistemic integrity, deterministic authority, and practical maintainability.)',
    source_event_id: 'ask-me-round1-dec04',
    normalized_intent: 'Architectural failure is defined as loss of human cognitive leverage, epistemic trust, or sovereign control, regardless of raw token throughput.',
    decision_class: 'ARCHITECTURAL',
    change_cost: 'HIGH',
    lock_in_risk: 'HIGH',
    governing_constraints: ['ANTI_SLOPMAXXING', 'EPISTEMIC_INTEGRITY_FIRST']
  },

  // Round 2: Governance & Boundaries
  {
    decision_id: 'DEC_ID_05',
    domain_id: 'AUTONOMY_BOUNDARIES',
    question: 'What are the explicit autonomy boundaries for agent execution?',
    options: [
      {
        option_id: 'opt_01',
        order: 1,
        raw_label: 'Tier-Tiered Bounded Autonomy with Deterministic Gates',
        raw_description: 'Autonomous research, planning, code edits, and tests within workctl claim; human gate on knowledge, spend, and main merges.',
        recommended: true,
        default_selected: true
      },
      {
        option_id: 'opt_02',
        order: 2,
        raw_label: 'Unrestricted Full Autonomy',
        raw_description: 'Agents modify repository, spend money, and push without human gates.',
        recommended: false,
        default_selected: false
      },
      {
        option_id: 'opt_03',
        order: 3,
        raw_label: 'Read-Only Exploration Only',
        raw_description: 'Agents may only search and read; zero code mutation allowed.',
        recommended: false,
        default_selected: false
      },
      {
        option_id: 'opt_04',
        order: 4,
        raw_label: 'Single-Turn Prompting Only',
        raw_description: 'No multi-step autonomous execution; human drives every step.',
        recommended: false,
        default_selected: false
      },
      {
        option_id: 'opt_05',
        order: 5,
        raw_label: 'Autonomous Merge on Unit Test Pass',
        raw_description: 'Any green test automatically merges to main without human review.',
        recommended: false,
        default_selected: false
      }
    ],
    selected_option_id: 'opt_01',
    raw_note: 'Tier-Tiered Bounded Autonomy with Deterministic Gates and Human Constitutional Authority (Agents may autonomously research, plan, modify authorized worktrees, implement code, run tests, generate evidence, create commits, and operate disposable/staging artifacts within an explicit workctl claim + STC lease. Git branch/PR operations, external execution, and other reversible mutations may be delegated according to workpackage risk. Canonical knowledge promotion, security/credential changes, policy/ISA changes, significant spending, irreversible infrastructure mutations, and other constitutional operations require explicit human authorization. Main-branch integration may eventually be deterministically authorized for empirically qualified low-risk work classes, but it is not a universal agent right.)',
    source_event_id: 'ask-me-round2-dec05',
    normalized_intent: 'Agents possess bounded autonomy within an explicit workctl claim + STC lease. Reversible work is delegated; irreversible actions, spend, and canonical promotion require explicit human gates.',
    decision_class: 'GOVERNANCE',
    change_cost: 'HIGH',
    lock_in_risk: 'HIGH',
    governing_constraints: ['STC_LEASE_CONFINEMENT', 'CONSTITUTIONAL_GATES']
  },
  {
    decision_id: 'DEC_ID_06',
    domain_id: 'KNOWLEDGE_PROMOTION_GOVERNANCE',
    question: 'How is knowledge promoted to canonical status in the KnowledgePlane?',
    options: [
      {
        option_id: 'opt_01',
        order: 1,
        raw_label: 'Human Epistemic Sovereignty with Policy-Bounded Promotion',
        raw_description: 'Human remains sole authority over canonical truth; deterministic gates enforce evidence prerequisites; models propose only.',
        recommended: true,
        default_selected: true
      },
      {
        option_id: 'opt_02',
        order: 2,
        raw_label: 'Autonomous Agent Knowledge Promotion',
        raw_description: 'Agents directly update canonical doctrine upon reaching consensus.',
        recommended: false,
        default_selected: false
      },
      {
        option_id: 'opt_03',
        order: 3,
        raw_label: 'Unstructured Raw Scraping Ingestion',
        raw_description: 'All retrieved web content becomes canonical immediately.',
        recommended: false,
        default_selected: false
      },
      {
        option_id: 'opt_04',
        order: 4,
        raw_label: 'Model Confidence Threshold Promotion',
        raw_description: 'High model confidence score automatically promotes knowledge.',
        recommended: false,
        default_selected: false
      },
      {
        option_id: 'opt_05',
        order: 5,
        raw_label: 'Static Hardcoded Knowledge Only',
        raw_description: 'Knowledge never changes after repository creation.',
        recommended: false,
        default_selected: false
      }
    ],
    selected_option_id: 'opt_01',
    raw_note: 'Human Epistemic Sovereignty with Deterministic, Policy-Bounded Knowledge Promotion (The human remains the sole sovereign authority over what counts as canonical truth, which epistemic classes exist, promotion policy, governance doctrine, architectural intent, and any change that can alter future authority boundaries or system identity. Deterministic linters, evidence gates, and policy engines enforce promotion prerequisites. AI agents may discover, observe, synthesize, triangularize, propose, refute, and structure candidate knowledge, but they possess zero unilateral authority to promote hypotheses, external claims, or model outputs into canonical status.)',
    source_event_id: 'ask-me-round2-dec06',
    normalized_intent: 'Human is the sole sovereign authority over canonical knowledge promotion. Models propose and structure candidate knowledge; deterministic evidence gates enforce validation prerequisites.',
    decision_class: 'GOVERNANCE',
    change_cost: 'HIGH',
    lock_in_risk: 'HIGH',
    governing_constraints: ['HUMAN_EPISTEMIC_SOVEREIGNTY', 'DETERMINISTIC_GATES']
  },
  {
    decision_id: 'DEC_ID_07',
    domain_id: 'ECONOMIC_FINOPS_GOVERNANCE',
    question: 'What is the governing policy for financial and metered API spend?',
    options: [
      {
        option_id: 'opt_01',
        order: 1,
        raw_label: 'Strict Zero-Marginal Metered API Spend by Default',
        raw_description: 'Operate on local compute and fixed subscriptions; metered API spend requires explicit per-workpackage human lease.',
        recommended: true,
        default_selected: true
      },
      {
        option_id: 'opt_02',
        order: 2,
        raw_label: 'Uncapped Metered API Usage',
        raw_description: 'Agents may call paid frontier models without budget limits.',
        recommended: false,
        default_selected: false
      },
      {
        option_id: 'opt_03',
        order: 3,
        raw_label: '100% Local Inference Only',
        raw_description: 'Completely forbid all external and subscription APIs permanently.',
        recommended: false,
        default_selected: false
      },
      {
        option_id: 'opt_04',
        order: 4,
        raw_label: 'Monthly Unchecked Budget Allocation',
        raw_description: 'Fixed monthly pool consumed without workpackage attribution.',
        recommended: false,
        default_selected: false
      },
      {
        option_id: 'opt_05',
        order: 5,
        raw_label: 'Cost-Blind Best-Model Selection',
        raw_description: 'Always route to most expensive model regardless of cost.',
        recommended: false,
        default_selected: false
      }
    ],
    selected_option_id: 'opt_01',
    raw_note: 'Strict Zero-Marginal Metered API Spend by Default, with Strict Per-Workpackage Leases for Explicitly Authorized Paid Work (By default, KAD-PI operates on fixed-cost and free resources: local compute/models, fixed subscriptions, and free API tiers. Metered/paid API spend is strictly zero by default and blocked by policy. A human-authorized economic lease with an explicit budget cap, reason, and lifetime may be granted to a specific workpackage, but cannot be exceeded or automatically renewed.)',
    source_event_id: 'ask-me-round2-dec07',
    normalized_intent: 'Zero marginal metered spend by default. Metered paid API usage requires explicit human lease with budget cap bound to specific workpackage ticket.',
    decision_class: 'ECONOMIC',
    change_cost: 'MEDIUM',
    lock_in_risk: 'MEDIUM',
    governing_constraints: ['TOKENMAXXING', 'ZERO_DEFAULT_PAYG']
  },
  {
    decision_id: 'DEC_ID_08',
    domain_id: 'SECURITY_TRUST_DOMAINS',
    question: 'How are security, credentials, and trust boundaries enforced across hosts and processes?',
    options: [
      {
        option_id: 'opt_01',
        order: 1,
        raw_label: 'Strict Multi-Domain Trust Boundaries with Epistemic and Physical Isolation',
        raw_description: 'Physical/logical isolation across AMDY, TELL, Local Sandbox, Remote APIs, and Vault. Secrets never leak to untrusted agents.',
        recommended: true,
        default_selected: true
      },
      {
        option_id: 'opt_02',
        order: 2,
        raw_label: 'Shared Global Environment Variables',
        raw_description: 'All processes and models have full access to all API keys and shell.',
        recommended: false,
        default_selected: false
      },
      {
        option_id: 'opt_03',
        order: 3,
        raw_label: 'Complete Air-Gapped Physical Disconnection',
        raw_description: 'Disconnect network permanently from all machines.',
        recommended: false,
        default_selected: false
      },
      {
        option_id: 'opt_04',
        order: 4,
        raw_label: 'Model-Supervised Security Prompts',
        raw_description: 'Rely on system prompts to instruct models not to reveal secrets.',
        recommended: false,
        default_selected: false
      },
      {
        option_id: 'opt_05',
        order: 5,
        raw_label: 'Single Flat Trust Domain',
        raw_description: 'Treat local and remote processes as identical security trust level.',
        recommended: false,
        default_selected: false
      }
    ],
    selected_option_id: 'opt_01',
    raw_note: 'Strict Multi-Domain Trust Boundaries with Epistemic and Physical Isolation (The system enforces strict trust domain separation: AMDY workstation (interactive/controller), TELL server (headless batch/offline), Local LLM Sandbox (untrusted probabilistic generation), Remote Providers (external untrusted), and Canonical Knowledge Vault (high-integrity local store). Secrets never leave their respective trust domains, network access is policy-controlled, and code execution is restricted to authorized worktrees under explicit claims.)',
    source_event_id: 'ask-me-round2-dec08',
    normalized_intent: 'Multi-domain trust boundary isolation: AMDY (interactive), TELL (batch compute), Sandbox (local inference), Remote (untrusted external), Vault (canonical knowledge).',
    decision_class: 'GOVERNANCE',
    change_cost: 'HIGH',
    lock_in_risk: 'HIGH',
    governing_constraints: ['TRUST_DOMAIN_ISOLATION', 'LEAST_PRIVILEGE']
  },

  // Round 3: Execution Topology & Infrastructure
  {
    decision_id: 'DEC_ID_09',
    domain_id: 'EXECUTION_TOPOLOGY',
    question: 'What is the architectural topology of execution controllers and workers in KAD-PI?',
    options: [
      {
        option_id: 'opt_01',
        order: 1,
        raw_label: 'Tiered Substrate (Interactive OMP + Local LLM + Worktrees + Optional Detached Warren)',
        raw_description: 'OMP as primary controller; Pi as portable worker runtime; Warren as evidence-gated detached offload worker.',
        recommended: true,
        default_selected: true
      },
      {
        option_id: 'opt_02',
        order: 2,
        raw_label: 'Single-Process Monolithic CLI',
        raw_description: 'All work executed sequentially inside one single CLI binary.',
        recommended: false,
        default_selected: false
      },
      {
        option_id: 'opt_03',
        order: 3,
        raw_label: 'Warren as Sovereign Central Controller',
        raw_description: 'Make Warren daemon the primary authority over the entire project.',
        recommended: false,
        default_selected: false
      },
      {
        option_id: 'opt_04',
        order: 4,
        raw_label: 'Pure Remote Cloud Orchestration',
        raw_description: 'Run all orchestrators on remote Kubernetes cluster.',
        recommended: false,
        default_selected: false
      },
      {
        option_id: 'opt_05',
        order: 5,
        raw_label: 'Decentralized Peer-to-Peer Agent Mesh',
        raw_description: 'Agents coordinate without any central controller or claim authority.',
        recommended: false,
        default_selected: false
      }
    ],
    selected_option_id: 'opt_01',
    raw_note: 'Tiered Substrate (Interactive OMP + Local LLM + Worktrees + Optional Detached Warren) (note: Warren is not merely "optional" in the long-term Ideal State; it is an evidence-gated detached workload substrate that should become preferred for qualifying asynchronous work if its canaries demonstrate net human-attention and throughput benefits. OMP remains the primary interactive cognitive/control environment. Pi remains the portable worker runtime. Neither Warren nor Pi becomes project authority.)',
    source_event_id: 'ask-me-round3-dec09',
    normalized_intent: 'Tiered execution architecture: OMP as primary interactive control environment, Pi as portable worker runtime, Warren as subordinate detached workload provider, workctl as authority.',
    decision_class: 'ARCHITECTURAL',
    change_cost: 'HIGH',
    lock_in_risk: 'MEDIUM',
    governing_constraints: ['OMP_CONTROLLER_PRIMARY', 'WORKCTL_AUTHORITY_INVARIANT']
  },
  {
    decision_id: 'DEC_ID_10',
    domain_id: 'LOCAL_FIRST_OFFLINE_BOUNDARY',
    question: 'What is the operational boundary for offline operation in KAD-PI?',
    options: [
      {
        option_id: 'opt_01',
        order: 1,
        raw_label: 'Full-Core Autonomous Offline Baseline (Deterministic + Local LLM + Vault)',
        raw_description: 'Core engineering, research, knowledge, verification, and work packages fully operational with zero Internet connection.',
        recommended: true,
        default_selected: true
      },
      {
        option_id: 'opt_02',
        order: 2,
        raw_label: 'Cloud-Mandated Connectivity',
        raw_description: 'System requires active Internet connection and external APIs to function.',
        recommended: false,
        default_selected: false
      },
      {
        option_id: 'opt_03',
        order: 3,
        raw_label: 'Offline Read-Only Archive',
        raw_description: 'Can read local files offline, but all execution and tests require cloud.',
        recommended: false,
        default_selected: false
      },
      {
        option_id: 'opt_04',
        order: 4,
        raw_label: 'Local Web Dashboard Only',
        raw_description: 'Offline mode provides UI mockups but no functional engine.',
        recommended: false,
        default_selected: false
      },
      {
        option_id: 'opt_05',
        order: 5,
        raw_label: 'Degraded TUI with No Local Models',
        raw_description: 'Offline mode has zero AI assistance; human does all operations.',
        recommended: false,
        default_selected: false
      }
    ],
    selected_option_id: 'opt_01',
    raw_note: 'Full-Core Autonomous Offline Baseline (Deterministic + Local LLM + Vault) (note: Local-first means KAD-PI\'s core engineering, research-management, knowledge, verification, and bounded agent workflows must remain operational during complete Internet loss. Remote providers are optional capability multipliers, not architectural dependencies. Offline mode must preserve deterministic tooling, canonical repository and Vault/KnowledgePlane access, local inference, workpackage lifecycle, STC leases, testing, evidence generation, local Git operations, and bounded local agent execution. Cloud-dependent capabilities may degrade or queue, but cannot stall the local core.)',
    source_event_id: 'ask-me-round3-dec10',
    normalized_intent: 'KAD-PI core must remain fully autonomous and operational offline (deterministic tools, local models, workctl, Knowledge Vault, and testing). Remote APIs are optional multipliers.',
    decision_class: 'ARCHITECTURAL',
    change_cost: 'HIGH',
    lock_in_risk: 'LOW',
    governing_constraints: ['LOCAL_FIRST_SOVEREIGNTY', 'FULL_CORE_OFFLINE']
  },
  {
    decision_id: 'DEC_ID_11',
    domain_id: 'LOCAL_COMPUTE_HARDWARE_ROLES',
    question: 'How are local hardware compute resources specialized between AMDY workstation and TELL server?',
    options: [
      {
        option_id: 'opt_01',
        order: 1,
        raw_label: 'Asymmetric Workstation (AMDY) vs Dedicated Headless Compute (TELL)',
        raw_description: 'AMDY handles interactive control and desktop integration; TELL handles heavy batch workloads, distillation, and multi-model eval.',
        recommended: true,
        default_selected: true
      },
      {
        option_id: 'opt_02',
        order: 2,
        raw_label: 'Symmetric Identical Nodes',
        raw_description: 'Treat AMDY and TELL as identical compute nodes with no specialization.',
        recommended: false,
        default_selected: false
      },
      {
        option_id: 'opt_03',
        order: 3,
        raw_label: 'Single-Machine Only (AMDY Only)',
        raw_description: 'Decommission TELL and run all workloads strictly on AMDY.',
        recommended: false,
        default_selected: false
      },
      {
        option_id: 'opt_04',
        order: 4,
        raw_label: 'Cloud Compute Migration',
        raw_description: 'Replace local GPUs with rented cloud virtual machines.',
        recommended: false,
        default_selected: false
      },
      {
        option_id: 'opt_05',
        order: 5,
        raw_label: 'Headless-Only Operation (TELL Only)',
        raw_description: 'Eliminate interactive workstation and operate solely via SSH to TELL.',
        recommended: false,
        default_selected: false
      }
    ],
    selected_option_id: 'opt_01',
    raw_note: 'Asymmetric Workstation (AMDY: Ryzen 7 7700 + RX 9060 XT) vs Headless Server (TELL: Ryzen 9 7900X + Dual RTX 3060 12GB) (note: AMDY is the interactive cognitive/controller workstation with fast single-core response and desktop integration. TELL is the dedicated headless compute engine for long-running batch workloads, multi-model evaluation, heavy distillation, and continuous validation. Each host maintains strict local autonomy while collaborating via explicit workload packets and Git/Vault synchronization.)',
    source_event_id: 'ask-me-round3-dec11',
    normalized_intent: 'Hardware specialization: AMDY workstation is interactive cognitive controller; TELL server is headless batch compute engine for validation, distillation, and multi-model eval.',
    decision_class: 'OPERATIONAL',
    change_cost: 'MEDIUM',
    lock_in_risk: 'LOW',
    governing_constraints: ['ASYMMETRIC_COMPUTE_FABRIC', 'HOST_AUTONOMY']
  },
  {
    decision_id: 'DEC_ID_12',
    domain_id: 'GITHUB_OPERATING_MODEL',
    question: 'What is the relationship between local repository authority and remote GitHub repository?',
    options: [
      {
        option_id: 'opt_01',
        order: 1,
        raw_label: 'Local-First Sovereign with GitHub as Downstream Projection & Collaboration Surface',
        raw_description: 'workctl and local Git own canonical work lifecycle; GitHub is downstream projection. External PRs/issues require explicit local import.',
        recommended: true,
        default_selected: true
      },
      {
        option_id: 'opt_02',
        order: 2,
        raw_label: 'GitHub-Sovereign Central Authority',
        raw_description: 'GitHub Issues/Projects own truth; local repo is transient mirror.',
        recommended: false,
        default_selected: false
      },
      {
        option_id: 'opt_03',
        order: 3,
        raw_label: 'Complete GitHub Isolation',
        raw_description: 'Never connect to GitHub or push commits remotely.',
        recommended: false,
        default_selected: false
      },
      {
        option_id: 'opt_04',
        order: 4,
        raw_label: 'Automatic Bidirectional Sync Without Gates',
        raw_description: 'Any change on GitHub instantly mutates local canonical state.',
        recommended: false,
        default_selected: false
      },
      {
        option_id: 'opt_05',
        order: 5,
        raw_label: 'Multi-Forge Mirroring Only',
        raw_description: 'Treat GitHub as dumb backup mirror without using Issues or Actions.',
        recommended: false,
        default_selected: false
      }
    ],
    selected_option_id: 'opt_01',
    raw_note: 'Local-First Sovereign with GitHub as Downstream Projection & Collaboration Surface (note: KAD-PI is local-first sovereign. workctl owns canonical work lifecycle, the local Git repository owns engineering history and accepted code state, evidence/ owns reproducible execution/validation receipts, and the KnowledgePlane/Vault owns accepted project knowledge. GitHub is a subordinate remote collaboration, verification, delivery, and publication surface. Issues, Projects, Discussions, PR metadata, reviews, and Actions results may propose work or contribute evidence, but they cannot mutate canonical KAD state implicitly. Any GitHub-originating information must cross an explicit deterministic import/acceptance boundary before becoming authoritatively local.)',
    source_event_id: 'ask-me-round3-dec12',
    normalized_intent: 'Local repository and workctl are canonical truth authority; GitHub is a subordinate downstream projection, remote verification, and collaboration surface.',
    decision_class: 'GOVERNANCE',
    change_cost: 'HIGH',
    lock_in_risk: 'LOW',
    governing_constraints: ['LOCAL_AUTHORITY_SOVEREIGNTY', 'DETERMINISTIC_IMPORT_GATES']
  },

  // Round 4: Research, Knowledge & Distillation
  {
    decision_id: 'DEC_ID_13',
    domain_id: 'RESEARCH_OPERATING_LIFECYCLE',
    question: 'What is the scientific research lifecycle from question to accepted doctrine?',
    options: [
      {
        option_id: 'opt_01',
        order: 1,
        raw_label: 'Tiered Epistemic Research Pipeline (Provenance -> Claim Classification -> Triangulation -> Validation -> Review -> Promotion)',
        raw_description: 'Strict scientific pipeline ensuring external literature is extracted, triangulated, empirically probed, and advisor-reviewed before human promotion.',
        recommended: true,
        default_selected: true
      },
      {
        option_id: 'opt_02',
        order: 2,
        raw_label: 'Unchecked Web RAG Ingestion',
        raw_description: 'Directly inject search snippets into context without validation.',
        recommended: false,
        default_selected: false
      },
      {
        option_id: 'opt_03',
        order: 3,
        raw_label: 'Manual-Only Human Literature Review',
        raw_description: 'AI agents forbidden from assisting with literature extraction.',
        recommended: false,
        default_selected: false
      },
      {
        option_id: 'opt_04',
        order: 4,
        raw_label: 'LLM Hallucination Consensus',
        raw_description: 'Accept hypotheses if 3 different LLMs agree without empirical test.',
        recommended: false,
        default_selected: false
      },
      {
        option_id: 'opt_05',
        order: 5,
        raw_label: 'Purely Theoretical Math Formalism Only',
        raw_description: 'Exclude all empirical engineering experiments.',
        recommended: false,
        default_selected: false
      }
    ],
    selected_option_id: 'opt_01',
    raw_note: 'Tiered Epistemic Research Pipeline — Provenance -> Claim Classification -> Triangulation -> Empirical Validation Where Applicable -> Advisor Review -> Human Promotion (External research enters KAD only through a bounded research question and provenance-verified corpus. Agents extract atomic claims with citations, classify each claim by epistemic type and consequence, evaluate source quality and agreement, and distinguish external evidence from KAD-local observation. Consequential empirical claims should be reproduced or probed locally when feasible and decision-relevant; theoretical, standards-based, historical, or otherwise non-reproducible claims instead require appropriate independent corroboration. Advisor review tests relevance, uncertainty, contradictions, and applicability. Only explicitly accepted conclusions may become KAD doctrine. Research artifacts may be stored before acceptance, but they remain noncanonical evidence or hypotheses.)',
    source_event_id: 'ask-me-round4-dec13',
    normalized_intent: 'Research lifecycle enforces provenance -> claim classification -> triangulation -> empirical probing -> advisory review -> human promotion. Unverified claims remain noncanonical hypotheses.',
    decision_class: 'RESEARCH',
    change_cost: 'HIGH',
    lock_in_risk: 'MEDIUM',
    governing_constraints: ['SCIENTIFIC_REPRODUCIBILITY', 'TRIANGULATION_INVARIANT']
  },
  {
    decision_id: 'DEC_ID_14',
    domain_id: 'KNOWLEDGE_PLANE_STORAGE_TOPOLOGY',
    question: 'What is the canonical storage topology for the KnowledgePlane and Vault?',
    options: [
      {
        option_id: 'opt_01',
        order: 1,
        raw_label: 'Canonical Knowledge Vault (Human-Readable Markdown + Structured Metadata + Rebuildable Projections)',
        raw_description: 'Markdown notes in Vault are canonical truth; vector/graph indices are rebuildable projections, never primary authority.',
        recommended: true,
        default_selected: true
      },
      {
        option_id: 'opt_02',
        order: 2,
        raw_label: 'Vector Database Primary Authority',
        raw_description: 'Vector embeddings are primary storage; Markdown files are discarded.',
        recommended: false,
        default_selected: false
      },
      {
        option_id: 'opt_03',
        order: 3,
        raw_label: 'Proprietary Cloud Knowledge Base',
        raw_description: 'Store project knowledge in proprietary third-party cloud service.',
        recommended: false,
        default_selected: false
      },
      {
        option_id: 'opt_04',
        order: 4,
        raw_label: 'Unstructured Git Commit Messages Only',
        raw_description: 'No documentation vault; rely solely on git log.',
        recommended: false,
        default_selected: false
      },
      {
        option_id: 'opt_05',
        order: 5,
        raw_label: 'Ephemeral Model Context Window Cache',
        raw_description: 'Keep knowledge in memory cache without disk files.',
        recommended: false,
        default_selected: false
      }
    ],
    selected_option_id: 'opt_01',
    raw_note: 'Canonical KnowledgePlane with Human-Readable Markdown Doctrine + Structured Provenance, and Rebuildable Semantic/Graph Projections (The KAD KnowledgePlane is centered on human-readable Markdown notes in the Knowledge Vault as the sole source of canonical doctrine, accompanied by structured JSON/JSONL metadata for provenance, citations, and validation receipts. Derived semantic indices, vector databases, and knowledge graphs are rebuildable projections, never primary authorities.)',
    source_event_id: 'ask-me-round4-dec14',
    normalized_intent: 'Knowledge Vault Markdown notes + structured provenance receipts constitute canonical doctrine. Derived graph, semantic, and vector indices are rebuildable projections.',
    decision_class: 'ARCHITECTURAL',
    change_cost: 'HIGH',
    lock_in_risk: 'LOW',
    governing_constraints: ['MARKDOWN_CANONICAL_AUTHORITY', 'REBUILDABLE_PROJECTIONS']
  },
  {
    decision_id: 'DEC_ID_15',
    domain_id: 'DISTILLATION_LEARNING_PIPELINE',
    question: 'How does KAD distill learning from execution without online memory mutation?',
    options: [
      {
        option_id: 'opt_01',
        order: 1,
        raw_label: 'Offline Evidence-Gated Distillation into Deterministic Tools and Compact Specialists',
        raw_description: 'Execution is strictly decoupled from learning. Historical validated trajectories are analyzed offline and distilled downward.',
        recommended: true,
        default_selected: true
      },
      {
        option_id: 'opt_02',
        order: 2,
        raw_label: 'Online Continuous Weight Fine-Tuning',
        raw_description: 'Model weights update live after every prompt execution.',
        recommended: false,
        default_selected: false
      },
      {
        option_id: 'opt_03',
        order: 3,
        raw_label: 'Unbounded Prompt Injection Memory',
        raw_description: 'Append raw conversations directly into global system prompt.',
        recommended: false,
        default_selected: false
      },
      {
        option_id: 'opt_04',
        order: 4,
        raw_label: 'Zero Distillation / Static Forever',
        raw_description: 'Never extract patterns or improve tooling from experience.',
        recommended: false,
        default_selected: false
      },
      {
        option_id: 'opt_05',
        order: 5,
        raw_label: 'Autonomous Prompt Mutation Without Tests',
        raw_description: 'Agents rewrite their own prompt templates without deterministic gates.',
        recommended: false,
        default_selected: false
      }
    ],
    selected_option_id: 'opt_01',
    raw_note: 'Offline Evidence-Gated Distillation from Validated Trajectories into Deterministic Tools and Compact Local Specialists (Execution is strictly decoupled from learning. The distillation pipeline analyzes accepted, reproducible episode records from historical execution, identifies high-frequency patterns and expensive model calls, and distills them downward into deterministic tools, regexes, scripts, or specialized local model prompts/weights. Distilled artifacts must pass rigorous evidence gates before deployment.)',
    source_event_id: 'ask-me-round4-dec15',
    normalized_intent: 'EXECUTION != LEARNING invariant. Learning occurs offline from validated episode receipts, distilling high-cost patterns downward into deterministic tools and compact specialists via evidence gates.',
    decision_class: 'ARCHITECTURAL',
    change_cost: 'HIGH',
    lock_in_risk: 'MEDIUM',
    governing_constraints: ['EXECUTION_LEARNING_SEPARATION', 'DOWNWARD_DISTILLATION']
  },
  {
    decision_id: 'DEC_ID_16',
    domain_id: 'CONTRADICTION_INVALIDATION_MANAGEMENT',
    question: 'How are knowledge contradictions, claim invalidations, and stale doctrines handled?',
    options: [
      {
        option_id: 'opt_01',
        order: 1,
        raw_label: 'Explicit Contradiction Journaling with Claim-Scoped Invalidation and Provenance Preservation',
        raw_description: 'Contradictions logged in explicit journal; affected claims marked CONTESTED/INVALIDATED; fail closed on affected paths only.',
        recommended: true,
        default_selected: true
      },
      {
        option_id: 'opt_02',
        order: 2,
        raw_label: 'Silent Overwrite by Latest Agent Turn',
        raw_description: 'Newest turn silently overwrites older notes without logging conflict.',
        recommended: false,
        default_selected: false
      },
      {
        option_id: 'opt_03',
        order: 3,
        raw_label: 'Global System Halt on Any Disagreement',
        raw_description: 'Entire project halts completely if any two notes conflict.',
        recommended: false,
        default_selected: false
      },
      {
        option_id: 'opt_04',
        order: 4,
        raw_label: 'Voting Consensus Invalidation',
        raw_description: 'Simple majority vote among 3 LLMs deletes conflicted claims.',
        recommended: false,
        default_selected: false
      },
      {
        option_id: 'opt_05',
        order: 5,
        raw_label: 'Permanent Contradiction Tolerance Without Invalidation',
        raw_description: 'Allow contradictory claims to coexist forever as canonical.',
        recommended: false,
        default_selected: false
      }
    ],
    selected_option_id: 'opt_01',
    raw_note: 'Explicit Contradiction Journaling with Claim-Scoped Invalidation and Provenance Preservation (When new evidence contradicts existing knowledge, KAD logs the contradiction in an explicit contradiction journal rather than silently overwriting or resolving by agent consensus. Affected claims become CONTESTED, STALE, or INVALIDATED according to evidence and impact. Consequential conflicts fail closed only for the authority paths they affect. Resolution requires appropriate evidence, experiment, source verification, or human decision, while superseded knowledge remains preserved as historical provenance.)',
    source_event_id: 'ask-me-round4-dec16',
    normalized_intent: 'Contradictions are logged in an explicit contradiction journal. Affected claims are scoped and marked CONTESTED/STALE/INVALIDATED without silent overwrites, preserving historical provenance.',
    decision_class: 'GOVERNANCE',
    change_cost: 'MEDIUM',
    lock_in_risk: 'LOW',
    governing_constraints: ['CONTRADICTION_JOURNALING', 'PROVENANCE_PRESERVATION']
  },

  // Round 5: Project Management & Quality Systems
  {
    decision_id: 'DEC_ID_17',
    domain_id: 'NATIVE_PM_CAPABILITIES',
    question: 'Which project-management capabilities should be native core system functions in KAD-PI?',
    options: [
      {
        option_id: 'opt_01',
        order: 1,
        raw_label: 'Lean High-Leverage Deterministic PM Core (WBS/DAG + Claims + Quality Gates + Registers)',
        raw_description: 'Native core limited to functions governing authority, sequencing, evidence, risk, and resource allocation. Bureaucratic PM excluded.',
        recommended: true,
        default_selected: true
      },
      {
        option_id: 'opt_02',
        order: 2,
        raw_label: 'Heavyweight Enterprise Jira/Agile Suite',
        raw_description: 'Full enterprise PM suite with story points, velocity charts, and burndowns.',
        recommended: false,
        default_selected: false
      },
      {
        option_id: 'opt_03',
        order: 3,
        raw_label: 'Zero Native PM / Ad-Hoc Chat Prompting',
        raw_description: 'No structured workpackages, tickets, or dependency tracking.',
        recommended: false,
        default_selected: false
      },
      {
        option_id: 'opt_04',
        order: 4,
        raw_label: 'External SaaS PM Integration Only',
        raw_description: 'Rely strictly on Notion or Linear for all project state.',
        recommended: false,
        default_selected: false
      },
      {
        option_id: 'opt_05',
        order: 5,
        raw_label: 'Fully Autonomous Unsupervised Planning Engine',
        raw_description: 'Agents invent their own roadmaps and milestones without human oversight.',
        recommended: false,
        default_selected: false
      }
    ],
    selected_option_id: 'opt_01',
    raw_note: 'Lean High-Leverage Deterministic PM Core (WBS/DAG + Claims + Quality Gates + Registers) (note: Lean Deterministic Project-Management Core in Evidence, Risk, Resource, Research, and Change Control. KAD-PI should natively implement only those project-management capabilities whose correctness materially affects work authorization, sequencing, quality, reproducibility, risk, scarce-resource allocation, or architectural traceability. The native deterministic core should include hierarchical work decomposition, dependency DAGs and critical-path reasoning, claims/STC leases, milestones, acceptance/quality gates, risk and decision registers, change/configuration control, research-question and experiment tracking, resource/budget envelopes, and measurable flow/attention metrics. Rich stakeholder reporting, enterprise accounting, advanced forecasting, and presentation dashboards should remain derived capabilities or external projections unless empirical need justifies promotion. KAD-PI uses a Lean Deterministic Project-Management Kernel. Native PM capabilities are limited to functions that materially govern authority, sequencing, evidence, risk, scarce-resource allocation, or architectural integrity.)',
    source_event_id: 'ask-me-round5-dec17',
    normalized_intent: 'Native PM engine is a Lean Deterministic Core: WBS/DAG decomposition, claims/STC leases, quality gates, risk/decision registers, and resource envelopes. Bureaucratic slop is excluded.',
    decision_class: 'ARCHITECTURAL',
    change_cost: 'HIGH',
    lock_in_risk: 'MEDIUM',
    governing_constraints: ['LEAN_PM_CORE', 'DETERMINISTIC_WORK_AUTHORITY']
  },
  {
    decision_id: 'DEC_ID_18',
    domain_id: 'WORKPACKAGE_DECOMPOSITION_AUTHORITY',
    question: 'How are workpackages decomposed, bounded, and authorized for execution?',
    options: [
      {
        option_id: 'opt_01',
        order: 1,
        raw_label: 'Hierarchical Evidence-Governed Decomposition with Explicit Acceptance Contracts',
        raw_description: 'Human provides strategic goals; planners propose typed WBS; deterministic policy validates DAG/STC bounds; independent verification reviews.',
        recommended: true,
        default_selected: true
      },
      {
        option_id: 'opt_02',
        order: 2,
        raw_label: 'Freeform Agent Task Generation',
        raw_description: 'Agents spawn sub-tasks with arbitrary scopes without dependency checking.',
        recommended: false,
        default_selected: false
      },
      {
        option_id: 'opt_03',
        order: 3,
        raw_label: 'Manual-Only Human Work Breakdown',
        raw_description: 'Human must write every line of every ticket and script manually.',
        recommended: false,
        default_selected: false
      },
      {
        option_id: 'opt_04',
        order: 4,
        raw_label: 'Monolithic Single-Workpackage Execution',
        raw_description: 'All work executed as one single massive un-decomposed task.',
        recommended: false,
        default_selected: false
      },
      {
        option_id: 'opt_05',
        order: 5,
        raw_label: 'Infinite Recursive Task Spawning',
        raw_description: 'Agents recursively spawn tasks without depth or budget bounds.',
        recommended: false,
        default_selected: false
      }
    ],
    selected_option_id: 'opt_01',
    raw_note: 'High-Leverage Deterministic Core with Multi-Level Strategic Guidance and Independent Verification (Workpackage generation follows an evidence-governed, multi-level hierarchy: Human provides strategic goals and constraints; Planners propose typed WBS decompositions with explicit acceptance criteria and capability requirements; Deterministic policy validates DAG dependencies, STC lease bounds, and resource allocations; Independent verification agents review plan feasibility before claim issuance.)',
    source_event_id: 'ask-me-round5-dec18',
    normalized_intent: 'Workpackage decomposition follows hierarchical contracts: Human strategic intent -> Planner typed WBS -> Deterministic policy validation -> Independent plan review -> Bounded execution claim.',
    decision_class: 'GOVERNANCE',
    change_cost: 'HIGH',
    lock_in_risk: 'MEDIUM',
    governing_constraints: ['BOUNDED_WORKPACKAGE_CONTRACT', 'STC_CONCURRENCY_SAFETY']
  },
  {
    decision_id: 'DEC_ID_19',
    domain_id: 'QUALITY_GATES_AND_VERIFICATION_INDEPENDENCE',
    question: 'How is verification independence enforced for code and architecture changes?',
    options: [
      {
        option_id: 'opt_01',
        order: 1,
        raw_label: 'Strict Verification Independence with Mutator != Verifier Invariant',
        raw_description: 'Mutating agent cannot serve as sole verifier or acceptance authority. Independent roles and deterministic suites must pass before acceptance.',
        recommended: true,
        default_selected: true
      },
      {
        option_id: 'opt_02',
        order: 2,
        raw_label: 'Self-Certification by Implementing Agent',
        raw_description: 'Implementing agent declares its own code verified without external check.',
        recommended: false,
        default_selected: false
      },
      {
        option_id: 'opt_03',
        order: 3,
        raw_label: 'Zero Automated Verification',
        raw_description: 'Rely purely on human code review without running tests.',
        recommended: false,
        default_selected: false
      },
      {
        option_id: 'opt_04',
        order: 4,
        raw_label: 'Probabilistic LLM Reviewer as Sole Gate',
        raw_description: 'Skip tests if an LLM reviewer says code looks good.',
        recommended: false,
        default_selected: false
      },
      {
        option_id: 'opt_05',
        order: 5,
        raw_label: 'Post-Deployment Canary Verification Only',
        raw_description: 'Test in production without pre-commit or pre-merge validation.',
        recommended: false,
        default_selected: false
      }
    ],
    selected_option_id: 'opt_01',
    raw_note: 'Strict Multi-Tier Verification Independence with Mutator != Verifier Invariant (All consequential work must satisfy the strict separation of concerns: Mutating agents cannot serve as the sole verifier or acceptance authority for their own work. Independent testing roles execute automated test suites, linters, security scanners, and formal property checks against reproducible evidence before human or policy acceptance.)',
    source_event_id: 'ask-me-round5-dec19',
    normalized_intent: 'MUTATOR != SOLE VERIFIER != ACCEPTANCE AUTHORITY invariant. Consequential work requires independent verification and reproducible deterministic test evidence before acceptance.',
    decision_class: 'GOVERNANCE',
    change_cost: 'HIGH',
    lock_in_risk: 'LOW',
    governing_constraints: ['VERIFICATION_INDEPENDENCE', 'DETERMINISTIC_EVIDENCE_FIRST']
  },
  {
    decision_id: 'DEC_ID_20',
    domain_id: 'SCARCE_RESOURCE_FINOPS_OPTIMIZATION',
    question: 'What is the hierarchy of scarce resources that KAD-PI optimizes?',
    options: [
      {
        option_id: 'opt_01',
        order: 1,
        raw_label: 'Human Attention > Epistemic Integrity > Maintainability > Money/Quota > Local Compute',
        raw_description: 'Strict resource priority: maximize accepted useful work and durable learning per scarce unit of human cognitive attention.',
        recommended: true,
        default_selected: true
      },
      {
        option_id: 'opt_02',
        order: 2,
        raw_label: 'Local Compute Cycles as Top Priority',
        raw_description: 'Waste human time to save minor GPU electricity.',
        recommended: false,
        default_selected: false
      },
      {
        option_id: 'opt_03',
        order: 3,
        raw_label: 'Maximum Token Generation Speed',
        raw_description: 'Maximize raw token count regardless of quality or human fatigue.',
        recommended: false,
        default_selected: false
      },
      {
        option_id: 'opt_04',
        order: 4,
        raw_label: 'Financial Cost as Sole Metric',
        raw_description: 'Zero spend even if it costs hundreds of hours of manual labor.',
        recommended: false,
        default_selected: false
      },
      {
        option_id: 'opt_05',
        order: 5,
        raw_label: 'Unconstrained Resource Consumption',
        raw_description: 'Ignore all resource constraints and consume without tracking.',
        recommended: false,
        default_selected: false
      }
    ],
    selected_option_id: 'opt_01',
    raw_note: 'Hierarchical Scarce-Resource Conservation: Human Attention > Epistemic Integrity > Maintainability > Money/Compute (Scarce resources are prioritized strictly: 1. Human Cognitive Attention & Strategic Direction (most scarce, non-renewable); 2. Epistemic Integrity & System Comprehensibility (preventing knowledge rot and authority leakage); 3. Practical Architecture Maintainability (preventing accidental complexity); 4. Metered Financial Cost & Quota; 5. Local Compute Cycles (least scarce). The system optimizes accepted useful work per unit of human attention and epistemic trust.)',
    source_event_id: 'ask-me-round5-dec20',
    normalized_intent: 'Scarce resource hierarchy: Human Attention (1) > Epistemic Integrity (2) > Maintainability (3) > Financial/Quota Cost (4) > Local Compute (5). Spend cheap compute to save human focus.',
    decision_class: 'ECONOMIC',
    change_cost: 'HIGH',
    lock_in_risk: 'LOW',
    governing_constraints: ['TOKENMAXXING', 'COGNITIVE_LEVERAGE_MAXIMIZATION']
  },

  // Round 6: Destinations & Horizon Milestones
  {
    decision_id: 'DEC_ID_21',
    domain_id: 'OPEN_SOURCE_ACADEMIC_DESTINATION',
    question: 'What is the intended long-term open-source, academic, and publication destination for KAD-PI?',
    options: [
      {
        option_id: 'opt_01',
        order: 1,
        raw_label: 'Private Personal OS + Governed Open Research/Specification Artifacts (Staged Hybrid)',
        raw_description: 'Private core optimized for project lead; public release staged as extractable research reports, ISAs, reproducible benchmarks, and standalone tools.',
        recommended: true,
        default_selected: true
      },
      {
        option_id: 'opt_02',
        order: 2,
        raw_label: 'Immediate Public Open-Source Framework',
        raw_description: 'Open source the full repository immediately for public community development.',
        recommended: false,
        default_selected: false
      },
      {
        option_id: 'opt_03',
        order: 3,
        raw_label: '100% Closed Proprietary Commercial Tool',
        raw_description: 'Keep all architecture, papers, and tools completely private forever.',
        recommended: false,
        default_selected: false
      },
      {
        option_id: 'opt_04',
        order: 4,
        raw_label: 'Pure Academic Paper Repository',
        raw_description: 'Treat codebase as thesis appendix without practical software evolution.',
        recommended: false,
        default_selected: false
      },
      {
        option_id: 'opt_05',
        order: 5,
        raw_label: 'Venture-Backed Commercial Platform',
        raw_description: 'Pivot immediately to multi-tenant commercial SaaS product.',
        recommended: false,
        default_selected: false
      }
    ],
    selected_option_id: 'opt_01',
    raw_note: 'Private Personal OS + Governed Open Research/Specification Artifacts (Staged Hybrid) (note: KAD-PI is primarily a personal and small-trusted-ring engineering/research environment for learning, researching, applying, and empirically validating KAD principles in real projects. Its architecture should remain optimized for the project lead and close collaborators rather than for anonymous public users or community-first production. Public release is staged and evidence-driven: formal specifications, ISAs, research reports, reproducible experiments, benchmarks, methodologies, and independently useful tools may be published when they are mature enough to support external scrutiny, replication, collaboration, or academic use. Broader open-source release of larger KAD subsystems should occur only if empirical use demonstrates durable value and there is a clear reason to support external users. The 12-month objective is to establish whether KAD works, what parts are genuinely reusable, and whether the research justifies a larger academic, open-source, or product future. The hierarchy should be PRIMARY learn + research + build + validate internally -> SECONDARY publish extractable research/specs/tools -> TERTIARY selectively open-source proven subsystems.)',
    source_event_id: 'ask-me-round6-dec21',
    normalized_intent: 'Staged hybrid destination: Primary private personal engineering/research OS; Secondary publication of extractable formal ISAs, research papers, and benchmarks; Tertiary open-sourcing of proven subsystems.',
    decision_class: 'GOVERNANCE',
    change_cost: 'HIGH',
    lock_in_risk: 'LOW',
    governing_constraints: ['STAGED_PUBLICATION_LIFECYCLE', 'INTERNAL_VALIDATION_FIRST']
  },
  {
    decision_id: 'DEC_ID_22',
    domain_id: 'THREE_MONTH_DESTINATION_TARGET',
    question: 'What is the concrete 3-month operational destination for KAD-PI?',
    options: [
      {
        option_id: 'opt_01',
        order: 1,
        raw_label: 'Robust Single-Node Personal Engineering OS & Empirical Research Substrate',
        raw_description: 'Immediate stabilization: rock-solid workctl lifecycle, 100% deterministic test pass, full offline operation, local inference, and Zotero integration.',
        recommended: true,
        default_selected: true
      },
      {
        option_id: 'opt_02',
        order: 2,
        raw_label: 'Cloud-Distributed Kubernetes Swarm',
        raw_description: 'Deploy 50 agent nodes in public cloud across multiple regions.',
        recommended: false,
        default_selected: false
      },
      {
        option_id: 'opt_03',
        order: 3,
        raw_label: 'Commercial Web SaaS Landing Page',
        raw_description: 'Build user signup, stripe billing, and multi-tenant authentication.',
        recommended: false,
        default_selected: false
      },
      {
        option_id: 'opt_04',
        order: 4,
        raw_label: 'Pure Mathematics Theoretical Proof',
        raw_description: 'Spend 3 months writing Coq/Lean formal proofs of agent theory only.',
        recommended: false,
        default_selected: false
      },
      {
        option_id: 'opt_05',
        order: 5,
        raw_label: 'Unmodified Fork of Upstream OMP',
        raw_description: 'Abandon custom KAD architecture and use standard upstream harness.',
        recommended: false,
        default_selected: false
      }
    ],
    selected_option_id: 'opt_01',
    raw_note: 'Robust Single-Node Personal Engineering OS & Empirical Research Substrate (Immediate Stabilization: Rock-solid workctl lifecycle, 100% deterministic test pass, full offline operation, local inference for structured tasks, lossless human intent ledger, Knowledge Vault integration, and foundational research workflow with local Zotero/PDF ingestion.)',
    source_event_id: 'ask-me-round6-dec22',
    normalized_intent: '3-Month Target: Single-node stabilization (rock-solid workctl, 100% deterministic test suite, full offline capability, lossless intent ledger, local inference, and Zotero research workflow).',
    decision_class: 'OPERATIONAL',
    change_cost: 'MEDIUM',
    lock_in_risk: 'LOW',
    governing_constraints: ['SINGLE_NODE_STABILIZATION', 'OFFLINE_FIRST']
  },
  {
    decision_id: 'DEC_ID_23',
    domain_id: 'SIX_MONTH_DESTINATION_TARGET',
    question: 'What is the concrete 6-month intermediate destination for KAD-PI?',
    options: [
      {
        option_id: 'opt_01',
        order: 1,
        raw_label: 'Asymmetric Dual-Node Compute Fabric (AMDY + TELL) with Governed Asynchronous Workload Pipelines',
        raw_description: 'Operational Dual-Node Architecture: Headless TELL server executing batch validation, evaluation, distillation; Warren canary offload.',
        recommended: true,
        default_selected: true
      },
      {
        option_id: 'opt_02',
        order: 2,
        raw_label: 'Full Commercial Multi-Tenant Cluster',
        raw_description: 'Commercial SaaS multi-region deployment for external paying clients.',
        recommended: false,
        default_selected: false
      },
      {
        option_id: 'opt_03',
        order: 3,
        raw_label: 'Complete Freezing with No Further Changes',
        raw_description: 'Lock repository permanently against any new features or improvements.',
        recommended: false,
        default_selected: false
      },
      {
        option_id: 'opt_04',
        order: 4,
        raw_label: 'Autonomous Agent Self-Replication Factory',
        raw_description: 'Agents spin up new cloud servers autonomously to scale swarm size.',
        recommended: false,
        default_selected: false
      },
      {
        option_id: 'opt_05',
        order: 5,
        raw_label: 'Hardware Migration to Proprietary ASIC Cluster',
        raw_description: 'Replace all x86 PCs with proprietary AI accelerator rack.',
        recommended: false,
        default_selected: false
      }
    ],
    selected_option_id: 'opt_01',
    raw_note: 'Asymmetric Dual-Node Compute Fabric (AMDY + TELL) with Governed Asynchronous Workload Pipelines (Operational Dual-Node Architecture: Headless TELL server executing heavy batch validation, multi-model evaluation, and offline distillation; Warren detached workload provider canary evaluation; automated literature analysis and research hypothesis synthesis; refined ISA-003 governance.)',
    source_event_id: 'ask-me-round6-dec23',
    normalized_intent: '6-Month Target: Dual-node compute fabric (AMDY interactive + TELL batch/distillation), evidence-gated Warren canary offloading, automated research synthesis, and refined ISA governance.',
    decision_class: 'ARCHITECTURAL',
    change_cost: 'HIGH',
    lock_in_risk: 'MEDIUM',
    governing_constraints: ['DUAL_NODE_FABRIC', 'WARREN_EVIDENCE_GATE']
  },
  {
    decision_id: 'DEC_ID_24',
    domain_id: 'TWELVE_MONTH_DESTINATION_TARGET',
    question: 'What is the 12-month ultimate ideal state destination for KAD-PI?',
    options: [
      {
        option_id: 'opt_01',
        order: 1,
        raw_label: 'Mature Self-Distilling Personal Engineering OS & Publishable Scientific Research Laboratory',
        raw_description: 'Comprehensive self-distilling personal OS; evidence-gated knowledge promotion; publishable academic artifacts; high-throughput human-AI collaboration.',
        recommended: true,
        default_selected: true
      },
      {
        option_id: 'opt_02',
        order: 2,
        raw_label: 'Fully Autonomous Unattended AGI Lab',
        raw_description: 'Human completely leaves the loop; AI runs entire research lab autonomously.',
        recommended: false,
        default_selected: false
      },
      {
        option_id: 'opt_03',
        order: 3,
        raw_label: 'Global Enterprise Microservices Mesh',
        raw_description: 'High-availability global enterprise deployment across 100 enterprise tenants.',
        recommended: false,
        default_selected: false
      },
      {
        option_id: 'opt_04',
        order: 4,
        raw_label: 'Deprecated Legacy Project',
        raw_description: 'Abandon KAD-PI and migrate to standard off-the-shelf cloud agents.',
        recommended: false,
        default_selected: false
      },
      {
        option_id: 'opt_05',
        order: 5,
        raw_label: 'Closed Commercial API Provider',
        raw_description: 'Sell API access to proprietary KAD models on the open market.',
        recommended: false,
        default_selected: false
      }
    ],
    selected_option_id: 'opt_01',
    raw_note: 'Mature Self-Distilling Personal Engineering OS & Publishable Scientific Research Laboratory (Fully Mature 12-Month Target: Comprehensive self-distilling personal engineering operating system; autonomous evidence-gated knowledge promotion; publishable academic research artifacts and formal specifications; proven high-throughput human-AI collaborative engineering with minimal human cognitive fatigue.)',
    source_event_id: 'ask-me-round6-dec24',
    normalized_intent: '12-Month Target: Mature, self-distilling personal engineering OS and publishable scientific research lab. High-throughput human-AI collaborative engineering with preserved cognitive leverage.',
    decision_class: 'ARCHITECTURAL',
    change_cost: 'HIGH',
    lock_in_risk: 'LOW',
    governing_constraints: ['SELF_DISTILLING_OS', 'SCIENTIFIC_LABORATORY_DESTINATION']
  }
];

export function runIngestion() {
  const events = [];
  const normalizations = [];

  for (const item of RAW_DECISIONS_DATA) {
    const event = createIntentEvent({
      decision_id: item.decision_id,
      domain_id: item.domain_id,
      question: {
        raw_text: item.question
      },
      options: item.options,
      response: {
        selected_option_id: item.selected_option_id,
        raw_note: item.raw_note,
        epistemic_class: 'AUTHOR_DECLARED',
        actor_id: ACTOR_ID
      },
      facilitation: {
        protocol: 'ASK_ME_5_PLUS_1',
        recommendation_present: item.options.some(o => o.recommended),
        recommended_option_id: item.options.find(o => o.recommended)?.option_id ?? null
      },
      provenance: {
        session_id: SESSION_ID,
        source_type: 'SOURCE_CAPTURED',
        source_event_id: item.source_event_id,
        captured_at: CAPTURED_AT,
        host_id: HOST_ID,
        supersedes: null,
        superseded_by: null
      }
    });

    events.push(event);

    const norm = createIntentNormalization({
      decision_id: item.decision_id,
      derived_from: {
        record_hash: event.provenance.record_hash,
        decision_id: item.decision_id
      },
      normalized_intent: item.normalized_intent,
      epistemic_class: 'DERIVED_FROM_AUTHOR_DECLARED',
      decision_class: item.decision_class,
      change_cost: item.change_cost,
      lock_in_risk: item.lock_in_risk,
      governing_constraints: item.governing_constraints,
      normalization_provenance: {
        agent: 'kad-researcher',
        model: 'gemini-3.7-flash-high',
        procedure_version: 'INTENT_NORMALIZATION_V1',
        created_at: CAPTURED_AT
      }
    });

    normalizations.push(norm);
  }

  // Validate entire journal before writing
  const val = validateIntentJournal(events, normalizations);
  if (!val.valid) {
    throw new Error(`Ingestion validation failed: ${val.errors.join('; ')}`);
  }

  // Write to canonical files
  writeAllEvents(DEFAULT_EVENTS_JOURNAL_PATH, events);
  writeAllNormalizations(DEFAULT_NORMALIZATIONS_PATH, normalizations);

  // Compile alignment report
  const reportPath = resolve(process.cwd(), 'docs/architecture/KAD_PI_INTENTION_ALIGNMENT_REPORT_2026-08-30.md');
  const compiledMarkdown = compileAlignmentReport(events, normalizations, { date: '2026-08-30' });
  writeFileSync(reportPath, compiledMarkdown, 'utf8');

  console.log(`[PASS] Successfully ingested ${events.length} decisions and generated normalizations.`);
  console.log(`  Events Journal:        ${DEFAULT_EVENTS_JOURNAL_PATH}`);
  console.log(`  Normalizations File:   ${DEFAULT_NORMALIZATIONS_PATH}`);
  console.log(`  Alignment Report:      ${reportPath}`);

  return { events, normalizations, stats: val.stats };
}

// Execute if run directly
runIngestion();
