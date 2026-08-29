import fs from 'node:fs';
import path from 'node:path';

const WORK_ITEM_STATES = new Set(['PROPOSED', 'READY', 'CLAIMED', 'IN_PROGRESS', 'BLOCKED', 'REVIEW', 'ACCEPTED', 'REJECTED', 'SUPERSEDED']);
const REQUIRED = ['id', 'project', 'title', 'fixed_point', 'scope', 'non_scope', 'owned_paths', 'required_capabilities', 'trust_domain', 'authority_required', 'validation', 'evidence_target', 'blocked_by', 'blocks', 'priority'];
const FORBIDDEN_KEYS = new Set(['model', 'provider', 'harness']);

function requireString(value, field) {
  if (typeof value !== 'string' || value.trim() === '') throw new Error(`${field} must be a non-empty string`);
  return value;
}
function requireArray(value, field) {
  if (!Array.isArray(value)) throw new Error(`${field} must be an array`);
  return value;
}
function safeId(id) {
  requireString(id, 'id');
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(id)) throw new Error('id contains unsafe path characters');
  return id;
}
function rejectForbiddenKeys(value, location = 'ticket') {
  if (!value || typeof value !== 'object') return;
  for (const key of Object.keys(value)) {
    if (FORBIDDEN_KEYS.has(key.toLowerCase())) throw new Error(`${location}.${key} is not allowed in a provider/model/harness-neutral work contract`);
    rejectForbiddenKeys(value[key], `${location}.${key}`);
  }
}

export function validateTicket(ticket) {
  if (!ticket || typeof ticket !== 'object' || Array.isArray(ticket)) throw new Error('ticket must be an object');
  rejectForbiddenKeys(ticket);
  for (const field of REQUIRED) if (!(field in ticket)) throw new Error(`ticket ${ticket.id ?? '<unknown>'} missing ${field}`);
  const id = safeId(ticket.id);
  requireString(ticket.project, `${id}.project`);
  requireString(ticket.title, `${id}.title`);
  requireString(ticket.fixed_point, `${id}.fixed_point`);
  requireString(ticket.trust_domain, `${id}.trust_domain`);
  requireString(ticket.authority_required, `${id}.authority_required`);
  requireString(ticket.evidence_target, `${id}.evidence_target`);
  for (const field of ['scope', 'non_scope', 'owned_paths', 'required_capabilities', 'validation', 'blocked_by', 'blocks']) {
    requireArray(ticket[field], `${id}.${field}`);
    if (ticket[field].some((entry) => typeof entry !== 'string' || entry.trim() === '')) throw new Error(`${id}.${field} entries must be non-empty strings`);
  }
  if (ticket.acceptance_criteria !== undefined) {
    requireArray(ticket.acceptance_criteria, `${id}.acceptance_criteria`);
    if (ticket.acceptance_criteria.some((entry) => typeof entry !== 'string' || entry.trim() === '')) throw new Error(`${id}.acceptance_criteria entries must be non-empty strings`);
  }
  if (ticket.description !== undefined) requireString(ticket.description, `${id}.description`);
  if (ticket.spec_decisions !== undefined) requireArray(ticket.spec_decisions, `${id}.spec_decisions`);
  const state = ticket.status ?? 'READY';
  const normalizedState = state === 'ready-for-agent' ? 'READY' : state;
  if (normalizedState !== 'READY') throw new Error(`${id}.status is not importable: ${state}; tickets must be ready-for-agent`);
  if (ticket.project !== 'kad-pi' && ticket.authority_required === 'kad-pi-project') throw new Error(`${id} assigns KAD project authority outside kad-pi`);
  return { ...ticket, id, status: normalizedState };
}

export function ticketToWorkItem(ticket) {
  const source = validateTicket(ticket);
  return {
    id: source.id,
    project: source.project,
    title: source.title,
    status: source.status,
    priority: Number(source.priority),
    spec_ref: source.spec_ref ?? null,
    fixed_point: source.fixed_point,
    scope: [...source.scope],
    non_scope: [...source.non_scope],
    owned_paths: [...source.owned_paths],
    required_capabilities: [...source.required_capabilities],
    trust_domain: source.trust_domain,
    authority_required: source.authority_required,
    validation: [...source.validation],
    evidence_target: source.evidence_target,
    blocked_by: [...source.blocked_by],
    blocks: [...source.blocks],
    acceptance_criteria: [...(source.acceptance_criteria ?? [])],
    description: source.description ?? null,
    spec_decisions: [...(source.spec_decisions ?? [])],
    source_ticket: source.source_ticket ?? source.id,
  };
}

function workPath(root, id) { return path.join(root, '.agents', 'work', `${safeId(id)}.json`); }
function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
function writeJson(file, value) { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`); }

export function importTickets(tickets, { root = process.cwd() } = {}) {
  if (!Array.isArray(tickets) || tickets.length === 0) throw new Error('ticket import requires a non-empty array');
  const items = tickets.map(ticketToWorkItem);
  const ids = new Set(items.map((item) => item.id));
  if (ids.size !== items.length) throw new Error('ticket import contains duplicate ids');
  const existing = new Map();
  for (const item of items) {
    const file = workPath(root, item.id);
    if (fs.existsSync(file)) existing.set(item.id, readJson(file));
  }
  for (const item of items) {
    for (const dependency of [...item.blocked_by, ...item.blocks]) {
      if (!ids.has(dependency) && !fs.existsSync(workPath(root, dependency))) throw new Error(`${item.id} references unknown work item ${dependency}`);
    }
    const prior = existing.get(item.id);
    if (prior && JSON.stringify(prior) !== JSON.stringify(item)) throw new Error(`${item.id} already exists with different work contract`);
  }
  const imported = [];
  for (const item of items) {
    const file = workPath(root, item.id);
    if (!existing.has(item.id)) { writeJson(file, item); imported.push(item.id); }
  }
  return { imported, existing: [...existing.keys()], work_items: items };
}

export function importTicketFile(file, options = {}) {
  const source = readJson(path.resolve(options.root ?? process.cwd(), file));
  const tickets = Array.isArray(source) ? source : source.tickets;
  return importTickets(tickets, options);
}
