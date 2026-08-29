import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { canonicalize } from './distillation.mjs';
import { normalizeResourceContract, preflightResourceContract } from './resource-contract.mjs';

const hash = value => createHash('sha256').update(value, 'utf8').digest('hex');
const DEFAULT_MAX_CLAIM_BYTES = 160;
const DEFAULT_MAX_EVIDENCE_BYTES = 220;
const JSON_SCHEMA_OVERHEAD = 64;

function readSource(source) {
  if (!source?.path) throw new Error('source path is required');
  const content = String(source.content ?? readFileSync(source.path, 'utf8'));
  return { path: source.path, content, source_sha256: hash(content) };
}

function assertAllowed(path, allowlist) {
  if (!allowlist.includes(path)) throw new Error(`selector path is outside allowlist: ${path}`);
}

function extractBalancedBlock(content, start) {
  const open = content.indexOf('{', start);
  if (open < 0) throw new Error('symbol block has no body');
  let depth = 0, quoted = false, escaped = false;
  for (let i = open; i < content.length; i += 1) {
    const ch = content[i];
    if (quoted) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"' || ch === "'" || ch === '`') quoted = false;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') { quoted = true; continue; }
    if (ch === '{') depth += 1;
    if (ch === '}') depth -= 1;
    if (depth === 0) return content.slice(start, i + 1).trim();
  }
  throw new Error('symbol block is unbounded');
}

function selectSymbol(content, symbol) {
  const name = String(symbol).split('.').at(-1);
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(?:export\\s+)?(?:async\\s+)?(?:function\\s+${escaped}\\s*\\(|(?:const|let|var)\\s+${escaped}\\s*=|${escaped}\\s*\\([^)]*\\)\\s*{)`, 'gm');
  const matches = [...content.matchAll(re)];
  if (matches.length !== 1) throw new Error(`symbol selector must resolve uniquely: ${symbol}`);
  const start = matches[0].index;
  const declaration = matches[0][0];
  if (/^(?:export\\s+)?(?:const|let|var)\\b/.test(declaration)) {
    const end = content.indexOf(';', start);
    const open = content.indexOf('{', start);
    if (end >= 0 && (open < 0 || end < open)) return content.slice(start, end + 1).trim();
  }
  return extractBalancedBlock(content, start);
}

function decodePointerToken(token) { return token.replace(/~1/g, '/').replace(/~0/g, '~'); }
function selectJsonPointer(content, pointer) {
  const root = JSON.parse(content);
  if (pointer !== '' && (!String(pointer).startsWith('/') || String(pointer).startsWith('//'))) throw new Error(`invalid json pointer: ${pointer}`);
  const tokens = pointer === '' ? [] : pointer.slice(1).split('/').map(decodePointerToken);
  let value = root;
  for (const token of tokens) {
    if (value === null || typeof value !== 'object' || !(token in value)) throw new Error(`json pointer does not exist: ${pointer}`);
    value = value[token];
  }
  return JSON.stringify(value, null, 2);
}

function parseYamlScalar(value) {
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (/^-?\d+(?:\.\d+)?$/.test(value)) return Number(value);
  return value.replace(/^['"]|['"]$/g, '');
}

function parseSimpleYaml(content) {
  const root = {};
  const stack = [{ indent: -1, value: root }];
  for (const raw of content.split(/\r?\n/)) {
    if (!raw.trim() || raw.trimStart().startsWith('#')) continue;
    const indent = raw.match(/^ */)[0].length;
    const line = raw.trim();
    if (line.startsWith('- ')) {
      const parent = stack.at(-1).value;
      if (!Array.isArray(parent)) throw new Error('yaml arrays are supported only under explicit list containers');
      const item = {};
      parent.push(item);
      const rest = line.slice(2).trim();
      if (rest) {
        const [key, ...tail] = rest.split(':');
        item[key.trim()] = parseYamlScalar(tail.join(':').trim());
      }
      stack.push({ indent, value: item });
      continue;
    }
    const [key, ...tail] = line.split(':');
    const valueText = tail.join(':').trim();
    while (stack.at(-1).indent >= indent) stack.pop();
    const parent = stack.at(-1).value;
    if (valueText === '') {
      const nextLine = content.split(/\r?\n/).find(l => l.match(/^ */)?.[0].length > indent && l.trim().startsWith('- '));
      parent[key.trim()] = nextLine ? [] : {};
    } else parent[key.trim()] = parseYamlScalar(valueText);
    stack.push({ indent, value: parent[key.trim()] });
  }
  return root;
}

function selectYamlPath(content, yamlPath) {
  const root = parseSimpleYaml(content);
  const tokens = Array.isArray(yamlPath) ? yamlPath : String(yamlPath).split('.');
  let value = root;
  for (const token of tokens) {
    const key = /^\d+$/.test(String(token)) ? Number(token) : token;
    if (value === null || typeof value !== 'object' || !(key in value)) throw new Error(`yaml path does not exist: ${tokens.join('.')}`);
    value = value[key];
  }
  return JSON.stringify(value, null, 2);
}

function selectLineRange(content, range) {
  const lines = content.split(/\r?\n/);
  const start = range.start ?? range[0];
  const end = range.end ?? range[1];
  if (!Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end < start || end > lines.length) throw new Error('invalid line_range selector');
  return lines.slice(start - 1, end).join('\n');
}

export function resolveSourceSelector(source, selector, allowlist) {
  assertAllowed(source.path, allowlist);
  const loaded = readSource(source);
  const kind = selector?.kind ?? 'whole_file';
  let selected;
  if (kind === 'symbol') selected = selectSymbol(loaded.content, selector.value);
  else if (kind === 'json_pointer') selected = selectJsonPointer(loaded.content, selector.value);
  else if (kind === 'yaml_path') selected = selectYamlPath(loaded.content, selector.value);
  else if (kind === 'line_range') selected = selectLineRange(loaded.content, selector.value);
  else if (kind === 'whole_file') {
    const maxBytes = selector.max_bytes ?? 12000;
    if (Buffer.byteLength(loaded.content) > maxBytes) throw new Error('whole_file selector exceeds bound; use a precise selector');
    selected = loaded.content;
  }
  else throw new Error(`unsupported selector kind: ${kind}`);
  if (!selected || Buffer.byteLength(selected) > (selector.max_bytes ?? 12000)) throw new Error('selector is empty or exceeds bound');
  return {
    path: source.path,
    selector: { kind, value: selector.value ?? null },
    source_sha256: loaded.source_sha256,
    selected_sha256: hash(selected),
    selected_bytes: Buffer.byteLength(selected),
    excerpt: selected,
    reason: selector.reason ?? 'bounded source selection',
  };
}

export function estimatePromptTokensConservative(packet, { bytes_per_token = 3 } = {}) {
  const serialized = canonicalize(packet);
  return {
    token_count: Math.ceil(Buffer.byteLength(serialized) / bytes_per_token),
    tokenizer: `conservative-bytes/${bytes_per_token}`,
    tokenizer_version_hash: hash(`conservative-bytes/${bytes_per_token}`),
    confidence: 'CONSERVATIVE_BOUND',
  };
}

export function requiredOutputReserve({ max_facts = 1, max_claim_bytes = DEFAULT_MAX_CLAIM_BYTES, max_evidence_bytes = DEFAULT_MAX_EVIDENCE_BYTES } = {}) {
  const bytes = JSON_SCHEMA_OVERHEAD + Math.max(1, max_facts) * (max_claim_bytes + max_evidence_bytes + 32);
  return Math.ceil(bytes / 4);
}

export function compileResourceAwareTaskPacket({ request, sources, selectors, resource_contract, output_reserve = null, requested_output_tokens = null, token_counter = estimatePromptTokensConservative } = {}) {
  const resource = normalizeResourceContract(resource_contract ?? {});
  const allowlist = request.source_paths;
  const proposedSelectors = selectors?.length ? selectors : allowlist.map(path => ({ path, selector: { kind: 'whole_file', max_bytes: 12000, reason: 'legacy bounded source' } }));
  const selectorList = [...new Map(proposedSelectors.map(item => [canonicalize({ path: item.path, selector: item.selector }), item])).values()]
    .sort((a, b) => canonicalize({ path: a.path, selector: a.selector }).localeCompare(canonicalize({ path: b.path, selector: b.selector })));
  const byPath = new Map((sources ?? []).map(source => [source.path, source]));
  const selected = selectorList.map(item => resolveSourceSelector(byPath.get(item.path) ?? { path: item.path }, item.selector, allowlist));
  const reserve = output_reserve ?? requiredOutputReserve({ max_facts: request.max_facts });
  const packet = {
    task_id: request.task_id,
    role: request.role,
    capability: request.capability,
    trust_domain: request.trust_domain,
    question: request.question,
    sources: selected,
    requested: { budget: request.budget ?? {}, max_facts: request.max_facts, source_paths: request.source_paths },
    compiled: { resource_id: resource.resource_id, context_window: resource.effective_context_window, output_reserve: reserve, effective_max_output_tokens: resource.effective_max_output_tokens },
    output_schema: { task_id: 'string', facts: 'array', unknowns: 'array', conflicts: 'array', fact: { claim: 'string', source_path: 'string', evidence: 'exact selected-source substring' } },
    limits: { max_facts: request.max_facts, allowed_source_paths: selected.map(source => source.path), required_evidence: true },
  };
  const tokenEstimate = token_counter(packet);
  const fit = preflightResourceContract({ resource, required_prompt_tokens: tokenEstimate.token_count, required_output_reserve: reserve, requested_output_tokens: requested_output_tokens ?? reserve });
  const result = { ...packet, token_count: tokenEstimate, resource_fit: fit.ok ? 'PASS' : 'FAIL', fit, packet_sha256: hash(canonicalize(packet)) };
  return result;
}

export function classifyResourceAdmission(result) {
  if (result.resource_fit === 'PASS') return { worker_invoked: false, model_failure: false, infrastructure_contract_failure: false, decision: 'worker.authorized' };
  return { worker_invoked: false, model_failure: false, infrastructure_contract_failure: true, decision: 'worker.rejected_resource_fit', reason: result.fit?.code };
}

export function interpretHistoricalResourceFit({ task_id, attempts, resource_contract, requested_output_tokens }) {
  return {
    task_id,
    execution: 'OBSERVED',
    acceptance: 'FAIL',
    historical_evidence_immutable: true,
    task_fit_under_current_proven_contract: attempts.every(attempt => preflightResourceContract({ resource: resource_contract, required_prompt_tokens: attempt.input_tokens, required_output_reserve: resource_contract.effective_max_output_tokens, requested_output_tokens: Math.min(requested_output_tokens, resource_contract.effective_max_output_tokens) }).ok) && requested_output_tokens <= resource_contract.effective_max_output_tokens ? 'PASS' : 'FAIL',
    QWEN_SEMANTIC_RELIABILITY_SIGNAL: 'INVALID_FOR_PROMOTION',
  };
}

export function evaluateSplitAuthorization({ subtasks = [], max_model_calls = 1 } = {}) {
  return { authorized: subtasks.length <= max_model_calls, subtask_count: subtasks.length, max_model_calls };
}

export function validateStcContractIdentity(contract, observed) {
  return Boolean(contract?.resource_id === observed?.resource_id && contract?.model_identity === observed?.model_identity && contract?.runtime_argv_sha256 === observed?.runtime_argv_sha256);
}
