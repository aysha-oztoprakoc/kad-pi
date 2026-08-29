import crypto from 'node:crypto';

export const CUSTOM_OPTION_ID = 'CUSTOM';

function nonEmpty(value, field) {
  if (typeof value !== 'string' || value.trim() === '') throw new Error(`${field} must be a non-empty string`);
  return value;
}

export function createDecisionRequest({ question, generatedOptions, recommendedIndex = null, sourceTicket = null, project = 'kad-pi' }) {
  nonEmpty(question, 'question');
  if (!Array.isArray(generatedOptions) || generatedOptions.length !== 5) {
    throw new Error('exactly five generated options are required');
  }
  const options = generatedOptions.map((label, index) => ({
    id: `OPTION_${index + 1}`,
    label: nonEmpty(label, `generatedOptions[${index}]`),
    generated: true,
    recommended: recommendedIndex === index,
  }));
  if (new Set(options.map((option) => option.label)).size !== 5) throw new Error('generated options must be distinct');
  if (recommendedIndex !== null && (!Number.isInteger(recommendedIndex) || recommendedIndex < 0 || recommendedIndex > 4)) {
    throw new Error('recommendedIndex must identify one generated option');
  }
  options.push({ id: CUSTOM_OPTION_ID, label: 'Custom — write your own answer', generated: false, allowCustom: true });
  return Object.freeze({
    requestId: crypto.randomUUID(),
    question,
    project,
    sourceTicket,
    options: Object.freeze(options),
    status: 'WAITING_USER',
  });
}

export function resolveDecision(request, response) {
  if (!request || request.status !== 'WAITING_USER') throw new Error('decision request is not waiting for a human response');
  if (!response || response.status !== 'ANSWERED') throw new Error('HITL decision requires an ask_user ANSWERED response');
  const responseValue = response.selection ?? response.answer;
  const option = request.options.find((candidate) => candidate.id === responseValue || candidate.label === responseValue);
  if (!option) throw new Error('selection must identify one offered option');
  const selected = option.id;
  const customResponse = selected === CUSTOM_OPTION_ID ? nonEmpty(response.answer, 'custom response') : null;
  return Object.freeze({
    ticket: request.sourceTicket,
    requestId: request.requestId,
    question: request.question,
    optionsPresented: request.options,
    humanSelection: selected,
    customResponse,
    authority: 'AUTHOR_DECLARED',
    decidedAt: response.decidedAt ?? new Date().toISOString(),
    rationale: response.rationale ?? null,
    consequences: response.consequences ?? [],
    evidenceInputs: response.evidenceInputs ?? [],
  });
}

export function recordDecisionOnMap(map, decision, gist) {
  if (!map || !Array.isArray(map.decisions)) throw new Error('decision map must contain a decisions array');
  nonEmpty(gist, 'gist');
  if (!decision.ticket) throw new Error('resolved decision requires a source ticket');
  return {
    ...map,
    decisions: [...map.decisions, { ticket: decision.ticket, gist }],
  };
}

export function recordWorkctlState(workctl, transition) {
  if (!workctl || !Array.isArray(workctl.tasks)) throw new Error('workctl state must contain tasks');
  const { task, status } = transition ?? {};
  if (!task || !status) throw new Error('workctl transition requires task and status');
  return { ...workctl, tasks: workctl.tasks.map((item) => item.id === task ? { ...item, status } : item) };
}
export function createAdvisoryResult({ recommendation, lenses, disagreement = '', evidenceGaps = [] }) {
  nonEmpty(recommendation, 'recommendation');
  if (!Array.isArray(lenses) || lenses.length !== 5) throw new Error('advisory result requires five lens views');
  return Object.freeze({
    kind: 'ADVISORY',
    recommendation,
    lenses: Object.freeze(lenses),
    disagreement,
    evidenceGaps: Object.freeze(evidenceGaps),
  });
}

export function shouldApplyKadOverlay({ projectId, optedIn = false }) {
  return projectId === 'kad-pi' || optedIn === true;
}
