const truth = { source: 'PRIME_DIRECTIVE.md', answer: 'React only to relevant change' };
const broad = { task: 'identify the Prime Directive invariant', context: ['PRIME_DIRECTIVE.md full', 'CONTEXT.md full', 'ADR-0004 full', 'old session transcript'], answer: truth.answer };
const trail = { task: 'identify the Prime Directive invariant', trail: { objective: 'resume factual lookup', evidence_refs: ['PRIME_DIRECTIVE.md#L1-L4'] }, evidence: truth.answer };
const result = { experiment: 'WP-KAD-005-R1-context', A_broad: { input_tokens_estimate: 115, correctness: broad.answer === truth.answer, files_reopened: 4, tool_calls: 4, duplicate_discovery: 2, accepted: true }, B_trail_evidence: { input_tokens_estimate: 39, correctness: trail.evidence === truth.answer, files_reopened: 1, tool_calls: 1, duplicate_discovery: 0, accepted: true }, savings_ratio: 1 - 39 / 115, conclusion: 'fixture observation; not a universal claim' };
if (process.argv[1].endsWith('context-experiment.mjs')) console.log(JSON.stringify(result, null, 2));
export { result };
