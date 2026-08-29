export const STATUS_STATES = Object.freeze(['PASS', 'QUALIFIED', 'AVAILABLE', 'PARTIAL', 'DEGRADED', 'UNAVAILABLE', 'BLOCKED', 'FAILED', 'UNKNOWN', 'EXPERIMENTAL', 'FILE_ONLY', 'LOADABLE', 'ACTIVE', 'STALE', 'QUARANTINED']);

export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

export function statusBadge(status) {
  const safeStatus = STATUS_STATES.includes(status) ? status : 'UNKNOWN';
  return `<span class="status status--${safeStatus}" aria-label="Status: ${safeStatus}">${safeStatus}</span>`;
}

export async function loadJson(url) {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Unable to load governed state (${response.status})`);
  return response.json();
}

export function displayDate(value) {
  if (!value) return 'date not recorded';
  return escapeHtml(value);
}
