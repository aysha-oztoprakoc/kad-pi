import { displayDate, escapeHtml, loadJson, statusBadge } from '../interface/kad-ui.js';

const content = document.querySelector('#dashboard-content');
const navLinks = [...document.querySelectorAll('[data-view]')];
let data;

function safeSourceHref(source) {
  const value = String(source ?? '');
  if (!value || value.startsWith('/') || value.includes('..') || value.includes('\\')) return null;
  return `../${value.split('/').map(encodeURIComponent).join('/')}`;
}

function recordLink(record) {
  const source = String(record.source_ref ?? '');
  const href = safeSourceHref(source);
  return href ? `<a href="${href}" target="_blank" rel="noreferrer">${escapeHtml(source)}</a>` : 'source unavailable';
}

function recordCard(record) {
  return `<article class="record"><header><div><p class="kicker">${escapeHtml(record.namespace)} · ${escapeHtml(record.id)}</p><h3>${escapeHtml(record.title)}</h3></div>${statusBadge(record.status)}</header><p>${escapeHtml(record.description || 'No description recorded.')}</p><div class="meta"><span>Epistemic: ${escapeHtml(record.epistemic_class || 'UNKNOWN')}</span><span>Acceptance: ${escapeHtml(record.acceptance_state || 'UNKNOWN')}</span><span>Source: ${recordLink(record)}</span></div></article>`;
}

function records(namespace) {
  return data.state.namespaces?.[namespace] ?? [];
}

function table(rows, columns) {
  if (!rows.length) return '<div class="empty">No governed records are available for this namespace.</div>';
  return `<div class="table-wrap"><table class="data-table"><thead><tr>${columns.map(column => `<th>${escapeHtml(column.label)}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${columns.map(column => `<td>${column.render ? column.render(row) : escapeHtml(row[column.key])}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}

function overview() {
  const attention = data.status.components.filter(component => ['DEGRADED', 'BLOCKED', 'PARTIAL', 'UNKNOWN'].includes(component.state));
  const counts = data.status.components.reduce((result, component) => { result[component.state] = (result[component.state] ?? 0) + 1; return result; }, {});
  const recent = data.evidence.slice(-3).reverse();
  return `<div class="dashboard-title"><div><p class="eyebrow">Overview / operator landing</p><h1>What needs attention?</h1><p>Static read-only view of governed project projections. No live service is implied.</p></div>${statusBadge(data.status.status)}</div><div class="grid grid-4"><article class="panel metric"><span class="metric-label">Projection state</span><strong class="metric-value">${escapeHtml(data.status.status)}</strong><span class="kicker">${escapeHtml(data.state.projection_id)}</span></article><article class="panel metric"><span class="metric-label">Canonical sources</span><strong class="metric-value">${data.state.source_count}</strong><span class="kicker">hashed input set</span></article><article class="panel metric"><span class="metric-label">Governed records</span><strong class="metric-value">${data.state.record_count}</strong><span class="kicker">derived, not authority</span></article><article class="panel metric"><span class="metric-label">Needs attention</span><strong class="metric-value">${attention.length}</strong><span class="kicker">unknown / degraded / blocked</span></article></div><section class="section"><div class="grid grid-2"><article class="panel panel--gold"><p class="eyebrow">Current focus</p><h2>Governed wiki projection</h2><p class="mono">${escapeHtml(data.state.projection_id)}</p><p>Static projection boundary. Runtime services are not implied.</p></article><article class="panel panel--cyan"><p class="eyebrow">Indexed evidence</p><h2>Recent receipts</h2>${recent.length ? `<ul class="list">${recent.map(item => `<li><a href="../${item.report_path}">${escapeHtml(item.workpackage)}</a> · ${escapeHtml(item.verdict || 'UNKNOWN')}</li>`).join('')}</ul>` : '<div class="empty">No evidence index is available.</div>'}</article></div></section><section class="section"><div class="section-head"><div><p class="eyebrow">Attention queue</p><h2>Capability states</h2></div></div>${attention.length ? table(attention, [{ label: 'Component', key: 'component' }, { label: 'State', render: row => statusBadge(row.state) }, { label: 'Reason', render: row => escapeHtml(row.blocking_reason || row.degraded_capabilities?.join(', ') || 'No qualification evidence recorded') }, { label: 'Evidence', render: recordLink }]) : '<div class="empty">No degraded, blocked, partial, or unknown components are recorded.</div>'}</section><section class="section"><div class="grid grid-3">${Object.entries(counts).sort().map(([state, count]) => `<article class="panel"><span class="metric-label">${escapeHtml(state)}</span><strong class="metric-value">${count}</strong></article>`).join('')}</div></section>`;
}

function namespaceView(namespace, eyebrow, title, intro) {
  const items = records(namespace);
  return `<div class="dashboard-title"><div><p class="eyebrow">${eyebrow}</p><h1>${title}</h1><p>${intro}</p></div><span class="chip">${items.length} records</span></div><div class="record-list">${items.length ? items.map(recordCard).join('') : '<div class="empty">This namespace is unavailable or empty. No healthy fallback is implied.</div>'}</div>`;
}

function agents() {
  const agentRecords = [...records('AGENTS'), ...records('CAPABILITIES')];
  return `<div class="dashboard-title"><div><p class="eyebrow">Agents / declarations</p><h1>Agents and capabilities</h1><p>Declared roles, trust domains, and capabilities only. Runtime activity is not invented.</p></div><span class="chip">${agentRecords.length} records</span></div><div class="record-list">${agentRecords.length ? agentRecords.map(recordCard).join('') : '<div class="empty">No agent or capability declarations are available.</div>'}</div>`;
}

function evidence() {
  const items = data.evidence ?? [];
  const recordsForReview = [...records('EVIDENCE'), ...records('FAILURES')];
  return `<div class="dashboard-title"><div><p class="eyebrow">Evidence / receipts</p><h1>What has been observed?</h1><p>Evidence is navigable here, but this surface cannot accept, alter, or promote it.</p></div></div>${table(items, [{ label: 'Workpackage', key: 'workpackage' }, { label: 'Verdict', render: row => statusBadge(row.verdict === 'PASS' ? 'PASS' : row.verdict) }, { label: 'Commit', render: row => escapeHtml(row.commit || 'not recorded') }, { label: 'Report', render: row => row.report_path ? recordLink({ source_ref: row.report_path }) : 'not recorded' }, { label: 'Blockers', render: row => escapeHtml((row.remaining_blockers ?? []).join('; ') || 'none recorded') }])}<section class="section"><div class="section-head"><div><p class="eyebrow">Governed records</p><h2>Evidence and failures</h2></div></div><div class="record-list">${recordsForReview.length ? recordsForReview.map(recordCard).join('') : '<div class="empty">No evidence records are available.</div>'}</div></section>`;
}

function system() {
  return `<div class="dashboard-title"><div><p class="eyebrow">System / boundary</p><h1>Static mode by design.</h1><p>The MVP needs no backend: all required dashboard features are served from generated projections.</p></div><span class="status status--PASS">READ-ONLY</span></div><div class="grid grid-2"><article class="panel panel--gold"><p class="kicker">Data source</p><h2>Governed projections</h2><p>Loaded from <span class="mono">wiki/generated/kad-canonical/</span>. Source references remain visible for local inspection; the dashboard does not rewrite them.</p><div class="meta"><span>Projection: ${escapeHtml(data.state.projection_id)}</span><span>Sources: ${data.state.source_count}</span><span>Records: ${data.state.record_count}</span></div></article><article class="panel panel--cyan"><p class="kicker">Live state</p><h2>Not observed</h2><p>No endpoint, task stream, model heartbeat, CPU meter, token counter, or provider probe is synthesized here. Runtime claims remain UNKNOWN unless a real source is added in a separate workpackage.</p></article></div><section class="section"><div class="notice"><strong>Recovery behavior:</strong> if a projection file is unavailable, this dashboard shows a bounded error. It does not convert missing data into PASS.</div></section>`;
}

function render(view = location.hash.slice(1) || 'overview') {
  const allowed = new Set(['overview', 'knowledge', 'agents', 'models', 'providers', 'evidence', 'research', 'system']);
  const selected = allowed.has(view) ? view : 'overview';
  navLinks.forEach(link => {
    if (link.dataset.view === selected) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  const views = { overview, knowledge: () => namespaceView('PROJECT', 'Knowledge / projection', 'Knowledge', 'Canonical source counts, derived records, and provenance remain distinct.'), agents, models: () => namespaceView('MODELS', 'Models / qualification', 'Models', 'Registry identity and qualification states; presence does not mean active.'), providers: () => namespaceView('PROVIDERS', 'Providers / evidence', 'Providers', 'Configured, qualified, degraded, and unknown states stay separate.'), evidence, research: () => namespaceView('RESEARCH', 'Research / epistemic class', 'Research', 'Hypotheses, experiments, observations, and future work remain labelled.'), system };
  content.innerHTML = views[selected]();
}

try {
  const [state, status, evidenceIndex] = await Promise.all([
    loadJson('../wiki/generated/kad-canonical/project-state.json'),
    loadJson('../wiki/generated/kad-canonical/status.json'),
    loadJson('../wiki/generated/kad-canonical/evidence-index.json')
  ]);
  data = { state, status, evidence: evidenceIndex };
  document.querySelector('#projection-status').textContent = `STATE ${status.status}`;
  document.querySelector('#loaded-from').textContent = `${state.record_count} records · ${displayDate(new Date().toISOString().slice(0, 10))}`;
  render();
} catch (error) {
  document.querySelector('#projection-status').textContent = 'STATE UNKNOWN';
  content.innerHTML = `<div class="error"><strong>Governed projection unavailable.</strong><p>${escapeHtml(error.message)}</p><p>Static dashboard content cannot claim health without its source projection.</p></div>`;
}

window.addEventListener('hashchange', () => { if (data) render(); });
