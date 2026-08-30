/**
 * OMP Extension Admission & Interception Pipeline Module
 * Authority: D021-002 (Full Lifecycle Admission) & D021-003 (Deterministic Interception Precedence)
 */

export const ADMISSION_LIFECYCLE_STAGES = Object.freeze({
  DISCOVER: 'DISCOVER',
  SANDBOX: 'SANDBOX',
  MEASURE: 'MEASURE',
  VERIFY: 'VERIFY',
  PROMOTE_NARROWLY: 'PROMOTE_NARROWLY',
  DEGRADE_SAFELY: 'DEGRADE_SAFELY',
  REPLACE_FREELY: 'REPLACE_FREELY'
});

export const INTERCEPTION_STAGES = Object.freeze({
  AUTHORITY_SECURITY: { order: 1, name: 'AUTHORITY_SECURITY', can_veto: true },
  CONTEXT_SAFETY: { order: 2, name: 'CONTEXT_SAFETY', can_veto: true },
  EDIT_WRITE_SAFETY: { order: 3, name: 'EDIT_WRITE_SAFETY', can_veto: true },
  LOOP_REDUNDANCY_GUARD: { order: 4, name: 'LOOP_REDUNDANCY_GUARD', can_veto: true },
  TELEMETRY_DIAGNOSTICS: { order: 5, name: 'TELEMETRY_DIAGNOSTICS', can_veto: false },
  PRESENTATION_UI: { order: 6, name: 'PRESENTATION_UI', can_veto: false }
});

const STAGE_ORDER_MAP = {
  AUTHORITY_SECURITY: 1,
  CONTEXT_SAFETY: 2,
  EDIT_WRITE_SAFETY: 3,
  LOOP_REDUNDANCY_GUARD: 4,
  TELEMETRY_DIAGNOSTICS: 5,
  PRESENTATION_UI: 6
};

export function validateExtensionAdmission(manifest = {}) {
  const violations = [];

  // Invariant 1: No third-party extension may mutate canonical knowledge
  if (manifest.mutates_canonical_knowledge === true) {
    violations.push('CANONICAL_KNOWLEDGE_MUTATION_PROHIBITED');
  }

  // Invariant 2: No third-party extension may mutate production routing policy
  if (manifest.mutates_routing_policy === true) {
    violations.push('ROUTING_POLICY_MUTATION_PROHIBITED');
  }

  // Invariant 3: Must declare a valid interception stage
  const stage = manifest.interception_stage || manifest.stage;
  if (stage && !STAGE_ORDER_MAP[stage]) {
    violations.push(`INVALID_INTERCEPTION_STAGE: ${stage}`);
  }

  return {
    admitted: violations.length === 0,
    stage: violations.length === 0 ? ADMISSION_LIFECYCLE_STAGES.SANDBOX : 'REJECTED',
    violations,
    manifest_id: manifest.id || 'unknown'
  };
}

export function resolveInterceptionPipeline(extensions = []) {
  const valid = extensions.filter(e => e && (e.stage || e.interception_stage));

  return [...valid].sort((a, b) => {
    const stageA = a.interception_stage || a.stage;
    const stageB = b.interception_stage || b.stage;
    const orderA = STAGE_ORDER_MAP[stageA] || 999;
    const orderB = STAGE_ORDER_MAP[stageB] || 999;

    if (orderA !== orderB) return orderA - orderB;
    return String(a.id || '').localeCompare(String(b.id || ''));
  });
}
