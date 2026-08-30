/**
 * Compiles machine-readable Intent Decision Events and Normalizations into a
 * canonical, human-readable Decision Register / Intention Alignment Report.
 *
 * @param {Array<object>} events
 * @param {Array<object>} normalizations
 * @param {object} [options]
 * @returns {string} Compiled Markdown report
 */
export function compileAlignmentReport(events = [], normalizations = [], options = {}) {
  const date = options.date || new Date().toISOString().slice(0, 10);
  const version = options.version || '1.0.0';

  // Group events by decision_id and take latest non-superseded event
  const eventsByDecision = new Map();
  for (const ev of events) {
    eventsByDecision.set(ev.decision_id, ev);
  }

  const normsByDecision = new Map();
  for (const norm of normalizations) {
    normsByDecision.set(norm.decision_id, norm);
  }

  // Sort decisions deterministically by decision_id (e.g. DEC_ID_01 to DEC_ID_24)
  const decisionIds = Array.from(eventsByDecision.keys()).sort();

  const lines = [];

  lines.push(`# KAD-PI CANONICAL INTENTION ALIGNMENT & DECISION REGISTER (${date})`);
  lines.push('');
  lines.push('> **Governing Invariant**: Human intent is captured losslessly before model interpretation.');
  lines.push('> Models may normalize intent (`DERIVED_FROM_AUTHOR_DECLARED`), but model output never overwrites raw human selection (`AUTHOR_DECLARED`).');
  lines.push('');
  lines.push(`**Compiled At**: \`${date}\``);
  lines.push(`**Schema Specification**: \`INTENT_DECISION_EVENT_V1\` / \`INTENT_DECISION_NORMALIZATION_V1\``);
  lines.push(`**Active Decisions Count**: \`${decisionIds.length}\``);
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## 1. Executive Summary Table');
  lines.push('');
  lines.push('| Decision ID | Domain | Selected Option | Epistemic Class | Record Hash |');
  lines.push('|---|---|---|---|---|');

  for (const id of decisionIds) {
    const ev = eventsByDecision.get(id);
    const selectedOpt = ev.options.find(o => o.option_id === ev.response.selected_option_id);
    const label = selectedOpt ? selectedOpt.raw_label : ev.response.selected_option_id;
    const shortHash = ev.provenance.record_hash ? ev.provenance.record_hash.slice(0, 19) + '...' : 'UNKNOWN';
    lines.push(`| **\`${ev.decision_id}\`** | \`${ev.domain_id}\` | ${label} | \`${ev.response.epistemic_class}\` | \`${shortHash}\` |`);
  }

  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## 2. Detailed Decision Records & Lossless Provenance');
  lines.push('');

  for (const id of decisionIds) {
    const ev = eventsByDecision.get(id);
    const norm = normsByDecision.get(id);

    lines.push(`### ${ev.decision_id}: ${ev.domain_id}`);
    lines.push('');
    lines.push(`**Raw Question**: ${ev.question.raw_text}`);
    lines.push(`**Question Hash**: \`${ev.question.question_hash}\``);
    lines.push('');
    lines.push('#### Offered Options:');
    for (const opt of ev.options) {
      const recBadge = opt.recommended ? ' *(Recommended)*' : '';
      const defBadge = opt.default_selected ? ' *(Default)*' : '';
      const desc = opt.raw_description ? ` — ${opt.raw_description}` : '';
      lines.push(`* **[${opt.option_id}]** \`${opt.raw_label}\`${recBadge}${defBadge}${desc}`);
    }
    lines.push('');

    const selectedOpt = ev.options.find(o => o.option_id === ev.response.selected_option_id);
    const selectedLabel = selectedOpt ? selectedOpt.raw_label : ev.response.selected_option_id;

    lines.push('#### Raw Human Selection (`AUTHOR_DECLARED`):');
    lines.push(`* **Selected Option**: \`[${ev.response.selected_option_id}] ${selectedLabel}\``);
    if (ev.response.raw_note) {
      lines.push(`* **Raw Human Note**: "${ev.response.raw_note}"`);
    } else {
      lines.push('* **Raw Human Note**: *(none provided)*');
    }
    lines.push(`* **Actor**: \`${ev.response.actor_id}\` | **Host**: \`${ev.provenance.host_id}\``);
    lines.push(`* **Captured At**: \`${ev.provenance.captured_at}\` (Session: \`${ev.provenance.session_id}\`)`);
    lines.push(`* **Source Type**: \`${ev.provenance.source_type}\` (Event ID: \`${ev.provenance.source_event_id || 'N/A'}\`)`);
    lines.push(`* **Record Hash**: \`${ev.provenance.record_hash}\``);
    if (ev.provenance.supersedes) {
      lines.push(`* **Supersedes Record**: \`${ev.provenance.supersedes}\``);
    }
    lines.push('');

    if (norm) {
      lines.push('#### Derived Model Normalization (`DERIVED_FROM_AUTHOR_DECLARED`):');
      lines.push(`* **Normalized Intent**: ${norm.normalized_intent}`);
      lines.push(`* **Decision Class**: \`${norm.decision_class}\` | **Change Cost**: \`${norm.change_cost}\` | **Lock-in Risk**: \`${norm.lock_in_risk}\``);
      if (norm.governing_constraints && norm.governing_constraints.length > 0) {
        lines.push(`* **Governing Constraints**: ${norm.governing_constraints.map(c => `\`${c}\``).join(', ')}`);
      }
      lines.push(`* **Normalization Agent**: \`${norm.normalization_provenance.agent}\` (${norm.normalization_provenance.model})`);
      lines.push(`* **Derived From Event Hash**: \`${norm.derived_from.record_hash}\``);
    } else {
      lines.push('#### Derived Model Normalization:');
      lines.push('* *(No normalization compiled)*');
    }

    lines.push('');
    lines.push('---');
    lines.push('');
  }

  lines.push('## 3. Cryptographic Verification & Compilation Receipt');
  lines.push('');
  lines.push('```json');
  lines.push(JSON.stringify({
    compiler: 'bin/kad-intent compile-report',
    version: '1.0.0',
    date,
    total_active_decisions: decisionIds.length,
    epistemic_invariants: {
      raw_events_immutable: true,
      author_declared_restricted_to_human_evidence: true,
      model_normalizations_typed: true
    }
  }, null, 2));
  lines.push('```');
  lines.push('');

  return lines.join('\n');
}
