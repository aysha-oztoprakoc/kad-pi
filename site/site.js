import { escapeHtml, statusBadge } from '../interface/kad-ui.js';
import {
  fetchPublicState,
  filterPublicRecords,
  searchPublicRecords,
  filterRecordsByType,
  summarizePublicState
} from './adapter.mjs';

function renderHomeSignals(summary) {
  const statusEl = document.querySelector('#project-status');
  if (statusEl) statusEl.innerHTML = statusBadge(summary.status);

  const sourceCount = document.querySelector('#source-count');
  if (sourceCount) sourceCount.textContent = summary.sourceCount;

  const recordCount = document.querySelector('#record-count');
  if (recordCount) recordCount.textContent = summary.recordCount;

  const knowledgeState = document.querySelector('#knowledge-state');
  if (knowledgeState) knowledgeState.innerHTML = `Public projection status: ${statusBadge(summary.status)}`;

  const publicRecordCount = document.querySelector('#public-record-count');
  if (publicRecordCount) publicRecordCount.textContent = `Public records: ${summary.publicRecords.length}`;

  const projectionId = document.querySelector('#public-projection-id');
  if (projectionId) projectionId.textContent = `Schema: ${escapeHtml(summary.schemaVersion)}`;
}

function renderKnowledgeExplorer(records) {
  const container = document.querySelector('#knowledge-explorer-container');
  if (!container) return;

  container.innerHTML = `
    <div class="panel" style="margin-top: 24px;">
      <div class="section-head" style="margin-bottom: 16px;">
        <div>
          <p class="eyebrow">Interactive Explorer</p>
          <h2 style="font-size: 1.4rem;">Browse Public Knowledge Records</h2>
        </div>
      </div>
      <div class="graph-controls" style="margin-bottom: 20px;">
        <div class="graph-controls-group" style="flex: 1;">
          <input type="search" id="knowledge-search" class="graph-input" placeholder="Search public records..." style="min-width: 240px;" aria-label="Search records">
          <select id="knowledge-type-filter" class="graph-select" aria-label="Filter by type">
            <option value="ALL">All Types</option>
            <option value="PROJECT">Projects</option>
            <option value="RESEARCH_PAPER">Research Papers</option>
            <option value="DECISION">Decisions</option>
            <option value="DOCUMENTATION">Documentation</option>
            <option value="ARCHITECTURE">Architecture</option>
          </select>
        </div>
        <span id="record-match-count" class="mono" style="font-size: 0.8rem; color: var(--faint);">${records.length} records</span>
      </div>
      <div id="knowledge-record-list" class="record-list" style="max-height: 480px; overflow-y: auto;">
      </div>
    </div>
  `;

  const searchInput = document.querySelector('#knowledge-search');
  const typeSelect = document.querySelector('#knowledge-type-filter');
  const listEl = document.querySelector('#knowledge-record-list');
  const countEl = document.querySelector('#record-match-count');

  function updateList() {
    const query = searchInput ? searchInput.value : '';
    const type = typeSelect ? typeSelect.value : 'ALL';

    let filtered = searchPublicRecords(records, query);
    filtered = filterRecordsByType(filtered, type);

    if (countEl) countEl.textContent = `${filtered.length} records`;

    if (filtered.length === 0) {
      listEl.innerHTML = `<div class="empty">No matching public knowledge records found.</div>`;
      return;
    }

    listEl.innerHTML = filtered.map(r => `
      <article class="record">
        <header>
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <span class="kicker">${escapeHtml(r.type || r.namespace || 'KNOWLEDGE')}</span>
            <h3>${escapeHtml(r.title)}</h3>
          </div>
          <span class="status status--${escapeHtml(r.status || 'ACTIVE')}">${escapeHtml(r.status || 'PUBLIC')}</span>
        </header>
        <p>${escapeHtml(r.description || r.excerpt || 'No description provided.')}</p>
        <div class="meta">
          <span>ID: <code>${escapeHtml(r.id || r.kad_id || 'UNKNOWN')}</code></span>
          ${r.epistemic_class ? `<span>Tier: ${escapeHtml(r.epistemic_class)}</span>` : ''}
        </div>
      </article>
    `).join('');
  }

  if (searchInput) searchInput.addEventListener('input', updateList);
  if (typeSelect) typeSelect.addEventListener('change', updateList);
  updateList();
}

async function init() {
  try {
    const rawState = await fetchPublicState();
    const summary = summarizePublicState(rawState);

    renderHomeSignals(summary);
    renderKnowledgeExplorer(summary.publicRecords);
  } catch (error) {
    const statusEl = document.querySelector('#project-status');
    if (statusEl) {
      statusEl.innerHTML = `<div class="error">${escapeHtml(error.message)}. Public content remains available; live state projection is offline.</div>`;
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
