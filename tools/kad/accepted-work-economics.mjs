import { hashCanonical, canonicalize } from './distillation.mjs';

const finite = value => typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null;
const text = value => typeof value === 'string' && value.length > 0 ? value : null;
const validationStatus = value => ['PASS', 'FAIL', 'UNKNOWN'].includes(value) ? value : 'UNKNOWN';

function usage(input = {}) {
  const inputTokens = finite(input.input_tokens);
  const cachedInputTokens = finite(input.cached_input_tokens);
  const outputTokens = finite(input.output_tokens);
  const reasoningTokens = finite(input.reasoning_tokens);
  const totalTokens = finite(input.total_tokens) ?? (inputTokens !== null && outputTokens !== null ? inputTokens + outputTokens : null);
  return { input_tokens: inputTokens, cached_input_tokens: cachedInputTokens, output_tokens: outputTokens, reasoning_tokens: reasoningTokens, total_tokens: totalTokens };
}

function acceptedByKad(input, validation) {
  return input.accepted === true && input.acceptance_authority === 'KAD_VALIDATOR' && validation === 'PASS';
}

export function normalizeEconomicReceipt(input = {}) {
  const validation = validationStatus(input.validation?.result ?? input.validation);
  const accepted = acceptedByKad(input, validation);
  const rawCost = finite(input.provider_reported_cost ?? input.economics?.provider_reported_cost);
  const costProvenance = input.cost_provenance ?? input.economics?.cost_provenance ?? null;
  const providerCost = rawCost !== null && ['PROVIDER_REPORTED', 'CALCULATED_FROM_PROVIDER'].includes(costProvenance) ? rawCost : null;
  const snapshot = input.quota_snapshot ?? input.economics?.quota_state ?? null;
  const repairs = finite(input.repairs ?? input.quality?.repairs) ?? 0;
  const escalations = finite(input.escalations ?? input.quality?.escalations) ?? 0;
  const duplicateCalls = finite(input.duplicate_calls ?? input.slop?.duplicate_calls);
  const unnecessaryRetries = finite(input.unnecessary_retries ?? input.slop?.unnecessary_retries);
  const context = input.context ?? input.performance ?? {};
  const receipt = {
    schema_version: 'kad-economic-1',
    task_id: text(input.task_id) ?? 'UNKNOWN',
    episode_id: text(input.episode_id) ?? null,
    equivalence_key: text(input.equivalence_key ?? input.task_equivalence_key) ?? null,
    semantic_role: text(input.semantic_role ?? input.role) ?? 'UNKNOWN',
    provider: text(input.provider) ?? 'UNKNOWN',
    model: text(input.model) ?? 'UNKNOWN',
    execution_class: text(input.execution_class) ?? 'UNKNOWN',
    trust_domain: text(input.trust_domain) ?? 'UNKNOWN',
    capability: text(input.capability) ?? 'UNKNOWN',
    usage: usage(input.usage),
    usage_scope: text(input.usage_scope ?? input.usage?.scope) ?? 'INCREMENTAL_ATTEMPT',
    inherited_parent: input.inherited_parent ? {
      receipt_id: text(input.inherited_parent.receipt_id),
      receipt_hash: text(input.inherited_parent.receipt_hash),
      remote_tokens: finite(input.inherited_parent.remote_tokens),
    } : null,
    economics: {
      provider_reported_cost: providerCost,
      cost_unit: providerCost === null ? null : text(input.cost_unit ?? input.economics?.cost_unit),
      cost_provenance: providerCost === null ? null : costProvenance,
      billing_class: text(input.billing_class ?? input.economics?.billing_class),
      quota_snapshot_id: text(input.quota_snapshot_id ?? input.economics?.quota_snapshot_id) ?? (snapshot === null ? null : hashCanonical(snapshot)),
      quota_state: snapshot,
      cache: input.cache ? { status: text(input.cache.status) ?? 'UNKNOWN', provider: text(input.cache.provider) ?? (text(input.provider) ?? 'UNKNOWN') } : null,
    },
    performance: {
      latency_ms: finite(input.performance?.latency_ms ?? input.latency_ms),
      compiled_context_bytes: finite(input.context?.compiled_context_bytes ?? input.performance?.compiled_context_bytes),
    },
    quality: {
      validation,
      accepted,
      repairs,
      escalations,
      final_outcome: accepted ? 'ACCEPTED' : validation === 'FAIL' ? 'REJECTED' : 'UNKNOWN',
      accepted_artifact_hash: accepted ? text(input.accepted_artifact_hash) : null,
    },
    slop: {
      duplicate_calls: duplicateCalls,
      unnecessary_retries: unnecessaryRetries,
      validation_failures: validation === 'FAIL' ? 1 : 0,
    },
    model_calls: finite(input.model_calls) ?? (1 + repairs + escalations),
    observation_confidence: text(input.observation_confidence) ?? 'UNKNOWN',
    provenance: {
      source: text(input.provenance?.source ?? input.source) ?? 'provider-response-metadata',
      usage_source: text(input.provenance?.usage_source) ?? null,
      provider_metadata_observed: input.provider_metadata_observed === true || input.provenance?.provider_metadata_observed === true,
    },
  };
  return receipt;
}

export function aggregateLineageRemoteTokens(receipts = []) {
  const seen = new Set();
  let total = 0;
  for (const input of receipts) {
    const receipt = input?.schema_version === 'kad-economic-1' ? input : normalizeEconomicReceipt(input);
    const key = receipt.receipt_hash ?? receipt.episode_id;
    if (key && seen.has(key)) continue;
    if (key) seen.add(key);
    const incremental = receipt.usage.total_tokens;
    if (incremental === null) return null;
    total += incremental;
  }
  return total;
}

export function deriveEconomicMetrics(receipts = []) {
  const normalized = receipts.map(receipt => receipt?.schema_version === 'kad-economic-1' ? receipt : normalizeEconomicReceipt(receipt));
  const sumIfComplete = (values, empty = 0) => values.length === 0 ? empty : values.every(value => value !== null) ? values.reduce((sum, value) => sum + value, 0) : null;
  const accepted = normalized.filter(receipt => receipt.quality.accepted);
  const knownAcceptedTokens = accepted.map(receipt => receipt.usage.total_tokens);
  const knownAcceptedCosts = accepted.map(receipt => receipt.economics.provider_reported_cost);
  const costUnits = new Set(accepted.map(receipt => receipt.economics.cost_unit).filter(Boolean));
  const remoteTokens = sumIfComplete(normalized.map(receipt => receipt.usage.total_tokens));
  const acceptedRemoteTokens = accepted.length === 0 ? 0 : sumIfComplete(knownAcceptedTokens, null);
  const totalModelCalls = sumIfComplete(normalized.map(receipt => receipt.model_calls));
  return {
    lineage_remote_tokens: aggregateLineageRemoteTokens(normalized),
    episode_count: normalized.length,
    accepted_episode_count: accepted.length,
    rejected_episode_count: normalized.filter(receipt => !receipt.quality.accepted).length,
    remote_tokens: remoteTokens,
    accepted_remote_tokens: acceptedRemoteTokens,
    total_model_calls: totalModelCalls,
    repair_count: sumIfComplete(normalized.map(receipt => receipt.quality.repairs)),
    escalation_count: sumIfComplete(normalized.map(receipt => receipt.quality.escalations)),
    remote_tokens_per_accepted_episode: accepted.length > 0 && acceptedRemoteTokens !== null ? acceptedRemoteTokens / accepted.length : null,
    provider_cost_per_accepted_episode: accepted.length > 0 && costUnits.size <= 1 && knownAcceptedCosts.every(value => value !== null) ? knownAcceptedCosts.reduce((sum, value) => sum + value, 0) / accepted.length : null,
    provider_cost_unit: costUnits.size === 1 ? [...costUnits][0] : null,
    repair_amplification: accepted.length > 0 && totalModelCalls !== null ? totalModelCalls / accepted.length : null,
  };
}

const comparableDimensions = [
  ['usage.total_tokens', receipt => receipt.usage.total_tokens],
  ['performance.latency_ms', receipt => receipt.performance.latency_ms],
  ['quality.repairs', receipt => receipt.quality.repairs],
  ['quality.escalations', receipt => receipt.quality.escalations],
];
function equivalent(a, b) { return a.equivalence_key !== null && a.equivalence_key === b.equivalence_key && a.trust_domain === b.trust_domain && a.capability === b.capability; }

export function compareEconomicEpisodes(leftInput, rightInput) {
  const left = leftInput?.schema_version === 'kad-economic-1' ? leftInput : normalizeEconomicReceipt(leftInput);
  const right = rightInput?.schema_version === 'kad-economic-1' ? rightInput : normalizeEconomicReceipt(rightInput);
  if (!equivalent(left, right)) return { result: 'INCOMPARABLE', reason: 'task equivalence, trust domain, or capability differs' };
  if (!left.quality.accepted || !right.quality.accepted) return { result: 'INSUFFICIENT_EVIDENCE', reason: 'both episodes must be accepted' };
  const dimensions = comparableDimensions.map(([name, get]) => ({ name, left: get(left), right: get(right) }));
  if (dimensions.some(dimension => dimension.left === null || dimension.right === null)) return { result: 'INSUFFICIENT_EVIDENCE', reason: 'required economic dimension is unknown', dimensions };
  const leftNoWorse = dimensions.every(dimension => dimension.left <= dimension.right);
  const rightNoWorse = dimensions.every(dimension => dimension.right <= dimension.left);
  const leftBetter = dimensions.some(dimension => dimension.left < dimension.right);
  const rightBetter = dimensions.some(dimension => dimension.right < dimension.left);
  const result = leftNoWorse && leftBetter ? 'DOMINATES' : rightNoWorse && rightBetter ? 'DOMINATED' : 'INCOMPARABLE';
  return { result, dimensions };
}

export function shadowRecommend({ actual: actualInput, alternatives = [] } = {}) {
  const actual = actualInput?.schema_version === 'kad-economic-1' ? actualInput : normalizeEconomicReceipt(actualInput);
  if (!actual.quality.accepted) return { recommendation: 'INSUFFICIENT_EVIDENCE', reason_codes: ['ACTUAL_NOT_ACCEPTED'], alternatives: [] };
  const comparisons = alternatives.map(candidateInput => { const candidate = candidateInput?.schema_version === 'kad-economic-1' ? candidateInput : normalizeEconomicReceipt(candidateInput); return { candidate, comparison: compareEconomicEpisodes(candidate, actual) }; });
  const winner = comparisons.find(item => item.comparison.result === 'DOMINATES');
  if (!winner) return { recommendation: comparisons.length && comparisons.every(item => item.comparison.result !== 'INSUFFICIENT_EVIDENCE') ? 'KEEP_CURRENT' : 'INSUFFICIENT_EVIDENCE', reason_codes: ['NO_PROVEN_DOWNWARD_DOMINANCE'], alternatives: comparisons.map(item => ({ episode_id: item.candidate.episode_id, result: item.comparison.result })) };
  const recommendation = winner.candidate.execution_class.startsWith('DETERMINISTIC') ? 'CANDIDATE_DETERMINISTIC_MIGRATION' : winner.candidate.execution_class.startsWith('LOCAL') ? 'CANDIDATE_LOCAL_MIGRATION' : 'CANDIDATE_CHEAPER_REMOTE';
  return { recommendation, reason_codes: ['EQUIVALENT_ACCEPTED_WORK', 'PARETO_DOMINATES'], candidate_episode_id: winner.candidate.episode_id, alternatives: comparisons.map(item => ({ episode_id: item.candidate.episode_id, result: item.comparison.result })) };
}

export function createDistillationCandidateReceipt({ receipts = [], repetition_threshold = 2 } = {}) {
  const normalized = receipts.map(receipt => receipt?.schema_version === 'kad-economic-1' ? receipt : normalizeEconomicReceipt(receipt));
  const first = normalized[0];
  const repeated = normalized.length >= repetition_threshold && first && normalized.every(receipt => receipt.quality.accepted && receipt.quality.validation === 'PASS' && equivalent(receipt, first));
  return { distillation_candidate: repeated, promoted: false, episode_ids: normalized.map(receipt => receipt.episode_id), reason: repeated ? 'repeated-bounded-validated-accepted-work' : 'insufficient-repeated-accepted-evidence', equivalence_key: first?.equivalence_key ?? null };
}

export function replayEconomicReceipt(receipt) {
  return JSON.parse(canonicalize(receipt));
}

export function attachEconomicReceipt(episode, receipt) {
  return { ...episode, economics: { ...episode.economics, economic_receipt: receipt } };
}
