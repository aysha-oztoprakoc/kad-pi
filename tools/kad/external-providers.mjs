import fs from 'node:fs';
import path from 'node:path';

export const PROVIDER_TAXONOMY_CLASSES = new Set([
  'WORKLOAD_PROVIDER',
  'INTENT_GRAPH_PROJECTION',
  'EXTERNAL_DOCTRINE_SOURCE',
  'RESEARCH_PROVIDER',
  'PRESENTATION_PROVIDER'
]);

export function loadProvidersConfig(rootDir = process.cwd()) {
  const configFile = path.resolve(rootDir, 'config/external-providers.json');
  if (!fs.existsSync(configFile)) {
    throw new Error(`External providers config not found at ${configFile}`);
  }
  return JSON.parse(fs.readFileSync(configFile, 'utf8'));
}

export function listExternalProviders(rootDir = process.cwd()) {
  const config = loadProvidersConfig(rootDir);
  return config.providers || [];
}

export function getExternalProvider(providerId, rootDir = process.cwd()) {
  const providers = listExternalProviders(rootDir);
  return providers.find(p => p.id === providerId) || null;
}

/**
 * Validates whether an attempted operation by a provider conforms to authority invariants.
 */
export function validateProviderOperation(providerId, operation, payload = {}, rootDir = process.cwd()) {
  const provider = getExternalProvider(providerId, rootDir);
  if (!provider) {
    return { allowed: false, reason: `Unregistered provider: ${providerId}` };
  }

  // 1. WORKLOAD_PROVIDER Rules (e.g. Warren)
  if (provider.class === 'WORKLOAD_PROVIDER') {
    if (['MUTATE_WORK_CLAIM', 'MUTATE_WORK_LIFECYCLE', 'ACCEPT_WORKPACKAGE', 'REJECT_WORKPACKAGE'].includes(operation)) {
      return {
        allowed: false,
        reason: `Workload provider '${providerId}' cannot mutate canonical workctl state. Work lifecycle is exclusively owned by workctl.`
      };
    }
    if (operation === 'DIRECT_MAIN_MERGE') {
      return {
        allowed: false,
        reason: `Workload provider '${providerId}' autonomous merge is prohibited. Delivery must be branch-only or artifact-only.`
      };
    }
    if (operation === 'MUTATE_ISA_AUTHORITY') {
      return {
        allowed: false,
        reason: `Workload provider '${providerId}' possesses zero authority over KAD ISA.`
      };
    }
    if (operation === 'EXECUTE_RUN') {
      return { allowed: true };
    }
  }

  // 2. INTENT_GRAPH_PROJECTION Rules (e.g. Beads)
  if (provider.class === 'INTENT_GRAPH_PROJECTION') {
    if (['CLOSE_TASK', 'MUTATE_WORK_LIFECYCLE', 'CLAIM_TASK', 'MUTATE_CLAIM'].includes(operation)) {
      return {
        allowed: false,
        reason: `Intent graph projection '${providerId}' cannot close tasks or mutate workctl state. Authority direction is workctl -> Beads ONLY.`
      };
    }
    if (operation === 'SET_PRIORITY') {
      return {
        allowed: false,
        reason: `Intent graph projection '${providerId}' cannot set canonical work priority. Priority authority belongs to human / workctl.`
      };
    }
    if (operation === 'MUTATE_CANONICAL_MEMORY' || operation === 'REPLACE_KNOWLEDGE_PLANE') {
      return {
        allowed: false,
        reason: `Intent graph projection '${providerId}' cannot mutate canonical memory or replace KnowledgePlane.`
      };
    }
    if (['QUERY_INTENT_GRAPH', 'DETECT_DEPENDENCY_CYCLES', 'RECOMMEND_SCHEDULE', 'PROJECT_VISUALIZATION'].includes(operation)) {
      return { allowed: true };
    }
  }

  // 3. EXTERNAL_DOCTRINE_SOURCE Rules (e.g. Agentic Engineering)
  if (provider.class === 'EXTERNAL_DOCTRINE_SOURCE') {
    if (operation === 'PROMOTE_TO_CANONICAL_DOCTRINE') {
      if (!payload.has_kad_evidence) {
        return {
          allowed: false,
          reason: `External doctrine source '${providerId}' requires empirical KAD evidence before promotion to canonical doctrine.`
        };
      }
      return { allowed: true, evidence: payload.evidence_ref };
    }
    if (operation === 'VENDOR_SOURCE_CODE') {
      return {
        allowed: false,
        reason: `External doctrine source '${providerId}' forbids direct vendoring of unreviewed source material.`
      };
    }
    if (['GENERATE_RESEARCH_HYPOTHESIS', 'COMPARE_ARCHITECTURE', 'EVALUATE_WORKFLOW'].includes(operation)) {
      return { allowed: true };
    }
  }

  // 4. PRESENTATION_PROVIDER Rules (e.g. Sofia, Omarchy, Tell)
  if (provider.class === 'PRESENTATION_PROVIDER') {
    if (operation.startsWith('MUTATE_') || operation.startsWith('EXECUTE_SHELL_')) {
      return {
        allowed: false,
        reason: `Presentation provider '${providerId}' has zero shell mutation authority.`
      };
    }
    return { allowed: true };
  }

  // 5. RESEARCH_PROVIDER Rules (e.g. DeepAPI, Zotero)
  if (provider.class === 'RESEARCH_PROVIDER') {
    if (operation === 'FETCH_METADATA' || operation === 'SEARCH_LITERATURE' || operation === 'EXTRACT_CITATIONS') {
      return { allowed: true };
    }
  }

  return { allowed: true };
}

/**
 * Enforces the invariant: EXECUTION != LEARNING
 * Workers consume accepted knowledge while executing; cannot rewrite canonical doctrine during active execution.
 */
export function checkExecutionLearningSeparation(request) {
  const { context, attempted_action, role, target_path, evidence_receipts, passed_review } = request;

  if (context === 'EXECUTION_RUN') {
    if (
      attempted_action === 'MUTATE_CANONICAL_DOCTRINE' ||
      (target_path && (target_path.startsWith('vault/00_Governance') || target_path === 'PRIME_DIRECTIVE.md'))
    ) {
      return {
        allowed: false,
        reason: `EXECUTION != LEARNING: Workers must consume accepted knowledge and cannot rewrite canonical doctrine while executing (${role} attempted to mutate ${target_path}).`
      };
    }
    return { allowed: true };
  }

  if (context === 'DISTILLATION_PIPELINE') {
    if (attempted_action === 'PROPOSE_CANDIDATE_KNOWLEDGE') {
      if (!evidence_receipts || evidence_receipts.length === 0) {
        return {
          allowed: false,
          reason: 'Distillation requires empirical evidence receipts before proposing candidate knowledge.'
        };
      }
      if (passed_review !== true) {
        return {
          allowed: false,
          reason: 'Candidate knowledge requires review and advisory verification before promotion.'
        };
      }
      return { allowed: true };
    }
  }

  return { allowed: true };
}
