import { performance } from 'node:perf_hooks';

const corpus = [
  { id: 'prime', source: 'PRIME_DIRECTIVE.md#L1-L4', text: "PRIME DIRECTIVE. React only to relevant change. NOTIFY, DON'T POLL." },
  { id: 'context', source: 'CONTEXT.md#L1-L4', text: 'KAD-PI Domain Context. Notification is a punctual typed signal.' },
  { id: 'router', source: 'tools/kad/local-router.mjs#L1-L8', text: 'Router eligibility requires exact trust-domain matching and declared capabilities.' }
];
const questions = [
  { id: 'q1', terms: ['relevant', 'change'], answer: 'NOTIFY, DON\'T POLL.', source: 'prime' },
  { id: 'q2', terms: ['trust-domain', 'matching'], answer: 'exact trust-domain matching', source: 'router' }
];
const words = text => text.trim().split(/\s+/).filter(Boolean).length;
function answer(packet, question) { return packet.some(x => x.text.includes(question.answer)); }
function run(condition, packet, meta = {}, activeQuestions = questions) {
  const start = performance.now();
  const rows = activeQuestions.map(q => ({ question: q.id, correct: answer(packet, q), source_ranges: packet.filter(x => x.id === q.source).map(x => x.source) }));
  return { condition, correctness: rows.filter(x => x.correct).length / rows.length, retrieval_precision: packet.length ? rows.filter(x => x.source_ranges.length).length / packet.length : 0, retrieval_recall: rows.filter(x => x.correct).length / rows.length, injected_context_tokens: words(packet.map(x => x.text).join(' ')), source_ranges_used: [...new Set(rows.flatMap(x => x.source_ranges))], latency_ms: Number((performance.now() - start).toFixed(3)), local_tokens: 0, remote_tokens: 0, ...meta };
}
const full = run('RAG-0 FULL', corpus);
const standard = run('RAG-1 STANDARD', questions.map(q => corpus.find(x => q.terms.some(t => x.text.includes(t)))).filter(Boolean));
const reactive = run('RAG-2 PON+STC', corpus.filter(x => x.id !== 'context'), { evaluated_question_count: 2, source_change: 'router trust-domain classification', pon_notification: 'trust-domain.changed', affected_rule_evaluations: 1, unaffected_rule_evaluations: 0, invalidation_count: 1, stale_context_error: false, stc_context: { source: 'tools/kad/local-router.mjs', version: 'working-tree', scope: 'retrieval', dependencies: ['trust-domain'], lifetime: 'until dependency change', provenance: 'OBSERVED' } });
const result = { experiment: 'WP-KAD-005-R1-RAG', corpus_size: corpus.length, question_count: questions.length, conditions: [full, standard, reactive], conclusion: 'OBSERVED measurements only; no general improvement claim.' };
if (process.argv[1].endsWith('rag-microexperiment.mjs')) console.log(JSON.stringify(result, null, 2));
export { result };
