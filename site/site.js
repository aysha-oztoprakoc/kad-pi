import { escapeHtml, loadJson, statusBadge } from '../interface/kad-ui.js';

function showError(message) {
  const status = document.querySelector('#project-status');
  if (status) status.innerHTML = `<div class="error">${escapeHtml(message)} Public content remains available; current state is unavailable.</div>`;
}

try {
  const state = await loadJson('./generated/public-state.json');
  const status = document.querySelector('#project-status');
  if (status) status.innerHTML = statusBadge(state.project.status);
  const sourceCount = document.querySelector('#source-count');
  if (sourceCount) sourceCount.textContent = state.project.source_count;
  const recordCount = document.querySelector('#record-count');
  if (recordCount) recordCount.textContent = state.project.record_count;
  const knowledgeState = document.querySelector('#knowledge-state');
  if (knowledgeState) knowledgeState.innerHTML = `Public projection status: ${statusBadge(state.project.status)}`;
  const publicRecordCount = document.querySelector('#public-record-count');
  if (publicRecordCount) publicRecordCount.textContent = `Public records: ${state.records.length}`;
  const projectionId = document.querySelector('#public-projection-id');
  if (projectionId) projectionId.textContent = `Schema: ${escapeHtml(state.schema_version)}`;
} catch (error) {
  showError(error.message);
  const knowledgeState = document.querySelector('#knowledge-state');
  if (knowledgeState) knowledgeState.textContent = 'Public projection unavailable';
}
