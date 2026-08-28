#!/usr/bin/env node
/**
 * Deterministic, read-only readiness receipt for the KAD OMP bridge.
 * Configuration is transport; KAD remains the routing, trust, and lifecycle authority.
 */
import { existsSync, readFileSync, readlinkSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, relative, resolve } from 'node:path';

const EXPECTED_OMP = '18.0.9';
function text(path) {
  try { return readFileSync(path, 'utf8'); } catch { return ''; }
}

function section(source, heading) {
  const lines = source.split(/\r?\n/);
  const start = lines.findIndex(line => line.trim() === `${heading}:`);
  if (start === -1) return '';
  const body = [];
  for (const line of lines.slice(start + 1)) {
    if (/^\S/.test(line) && !/^\s*$/.test(line)) break;
    body.push(line);
  }
  return body.join('\n');
}

function scalar(source, key) {
  const match = source.match(new RegExp(`^\\s*${key}:\\s*(?:"([^"]*)"|'([^']*)'|([^\\s#]+))`, 'm'));
  return match ? (match[1] ?? match[2] ?? match[3]) : undefined;
}

function rolesFromConfig(config) {
  const roles = {};
  const body = section(config, 'modelRoles');
  for (const match of body.matchAll(/^\s{2}([\w-]+):\s*["']?([^"'\n]+?)["']?\s*$/gm)) roles[match[1]] = match[2].trim();
  return roles;
}

function enabledModelsFromConfig(config) {
  const body = section(config, 'enabledModels');
  return [...body.matchAll(/^\s*-\s*["']?([^"'\n]+?)["']?\s*$/gm)].map(match => match[1].trim());
}

function modelsFromConfig(models) {
  const providers = {};
  const providerMatches = [...models.matchAll(/^  ([\w-]+):\s*$/gm)];
  for (let index = 0; index < providerMatches.length; index += 1) {
    const start = providerMatches[index].index;
    const end = providerMatches[index + 1]?.index ?? models.length;
    const body = models.slice(start, end);
    const provider = providerMatches[index][1];
    providers[provider] = {
      baseUrl: scalar(body, 'baseUrl'),
      auth: scalar(body, 'auth'),
      models: [...body.matchAll(/^\s*- id:\s*([^\s#]+)\s*$/gm)].map(match => match[1].replace(/^['"]|['"]$/g, '')),
      contextWindows: [...body.matchAll(/^\s*contextWindow:\s*(\d+)/gm)].map(match => Number(match[1]))
    };
  }
  return providers;
}

function rel(root, path) {
  return relative(root, path) || '.';
}

function pathStatus(root, path) {
  return { path: rel(root, path), exists: existsSync(path), executable: existsSync(path) && (() => { try { return (statSync(path).mode & 0o111) !== 0; } catch { return false; } })() };
}

function parseManifest(root) {
  const candidates = [join(root, '.omp', 'install-manifest.json'), join(root, 'evidence', 'WP-KAD-OMP-001', 'install-manifest.json')];
  for (const path of candidates) {
    if (!existsSync(path)) continue;
    try { return { ...JSON.parse(text(path)), path: rel(root, path) }; } catch { return { path: rel(root, path), invalid: true }; }
  }
  return null;
}

function inspectOmp(root, observed) {
  const binary = pathStatus(root, join(root, '.tools', 'oh-my-pi', `v${EXPECTED_OMP}`));
  const wrapper = pathStatus(root, join(root, 'bin', 'omp-kad'));
  const manifest = parseManifest(root);
  let version = observed.ompVersion;
  if (!version && binary.executable) {
    try { version = execFileSync(binary.path.startsWith('/') ? binary.path : join(root, binary.path), ['--version'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim().match(/(?:v|omp\/?)(\d+\.\d+\.\d+)/i)?.[1] ?? null; } catch {}
  }
  version ??= manifest?.release ?? null;
  const versionMatches = version === EXPECTED_OMP;
  const failures = [];
  if (!binary.exists) failures.push('OMP_PINNED_BINARY_MISSING');
  else if (!binary.executable) failures.push('OMP_PINNED_BINARY_NOT_EXECUTABLE');
  if (!wrapper.exists) failures.push('OMP_WRAPPER_MISSING');
  else if (!wrapper.executable) failures.push('OMP_WRAPPER_NOT_EXECUTABLE');
  if (!manifest || manifest.invalid) failures.push('OMP_INSTALL_MANIFEST_MISSING_OR_INVALID');
  if (manifest && manifest.release !== EXPECTED_OMP) failures.push('OMP_MANIFEST_VERSION_MISMATCH');
  if (version && !versionMatches) failures.push('OMP_VERSION_MISMATCH');
  return { version: version ?? 'UNKNOWN', expected_version: EXPECTED_OMP, binary, wrapper, manifest: manifest ? { path: manifest.path, release: manifest.release ?? 'UNKNOWN', sha256_observed: manifest.sha256_observed ?? 'NOT_REPORTED' } : null, version_matches: versionMatches, failures };
}

function inspectGovernance(root, config) {
  const agents = text(join(root, '.omp', 'AGENTS.md'));
  const rules = text(join(root, '.omp', 'RULES.md'));
  const prime = existsSync(join(root, 'PRIME_DIRECTIVE.md'));
  const pointer = /PRIME_DIRECTIVE\.md/.test(agents) && !agents.includes(text(join(root, 'PRIME_DIRECTIVE.md')).trim());
  const result = { prime_directive: prime, bridge_pointer: pointer, rules_reference_kad: /KAD authority|KAD invariants/i.test(rules), failures: [] };
  if (!prime) result.failures.push('PRIME_DIRECTIVE_MISSING');
  if (!pointer) result.failures.push('OMP_GOVERNANCE_BRIDGE_NOT_POINTER');
  if (!result.rules_reference_kad) result.failures.push('OMP_RULES_MISSING_KAD_AUTHORITY');
  return result;
}

function inspectSkills(root, config) {
  const canonical = join(root, '.agents', 'skills');
  const gate = join(canonical, 'kad-evidence-gate', 'SKILL.md');
  const shadow = join(root, '.omp', 'skills');
  const enabled = scalar(section(config, 'skills'), 'enableAgentsProject') === 'true';
  const result = { canonical_source: rel(root, canonical), canonical_exists: existsSync(canonical), evidence_gate: existsSync(gate), agents_project_discovery: enabled, shadow_corpus: existsSync(shadow), failures: [] };
  if (!result.canonical_exists || !result.evidence_gate) result.failures.push('CANONICAL_KAD_SKILL_MISSING');
  if (!enabled) result.failures.push('OMP_AGENTS_PROJECT_DISCOVERY_DISABLED');
  if (result.shadow_corpus) result.failures.push('OMP_SKILL_SHADOW_CORPUS_PRESENT');
  return result;
}

function inspectLearning(config) {
  const advisor = scalar(section(config, 'advisor'), 'enabled');
  const memory = scalar(section(config, 'memory'), 'backend');
  const autolearn = scalar(section(config, 'autolearn'), 'enabled');
  const result = { advisor_enabled: advisor === 'true', memory_backend: memory ?? 'UNKNOWN', autolearn_enabled: autolearn === 'true', safe: advisor !== 'true' && memory === 'off' && autolearn !== 'true', failures: [] };
  if (result.advisor_enabled) result.failures.push('ADVISOR_ENABLED');
  if (result.memory_backend !== 'off') result.failures.push('MEMORY_NOT_OFF');
  if (result.autolearn_enabled) result.failures.push('AUTOLEARN_ENABLED');
  return result;
}

function parseSelector(selector) {
  const match = String(selector ?? '').match(/^([^/]+)\/([^:]+)(?::[^:]+)?$/);
  return match ? { provider: match[1], model: match[2] } : null;
}

function inspectRoles(root, config, models, observed) {
  const declared = rolesFromConfig(config);
  const enabled = enabledModelsFromConfig(config);
  const roles = {};
  for (const name of ['world', 'local_retrieval']) {
    const selector = declared[name];
    const parsed = parseSelector(selector);
    const provider = parsed && models[parsed.provider];
    const listed = Boolean(provider?.models.includes(parsed.model));
    const enabledByPolicy = parsed && enabled.some(pattern => pattern === `${parsed.provider}/${parsed.model}` || pattern === `${parsed.provider}/*`);
    let status = 'UNRESOLVED';
    if (parsed && listed && enabledByPolicy) status = 'RESOLVED';
    if (name === 'local_retrieval' && observed.localInference) {
      if (observed.localInference.available === false) status = 'UNAVAILABLE';
      if (observed.localInference.available === true && (observed.localInference.provider !== parsed?.provider || observed.localInference.model !== parsed?.model)) status = 'STALE';
    }
    roles[name] = { status, selector: selector ?? 'UNKNOWN', provider: parsed?.provider ?? 'UNKNOWN', model: parsed?.model ?? 'UNKNOWN' };
  }
  return { roles, failures: roles.local_retrieval.status === 'UNRESOLVED' ? ['LOCAL_RETRIEVAL_ROLE_UNRESOLVED'] : [], unknowns: roles.local_retrieval.status === 'UNKNOWN' ? ['LOCAL_RETRIEVAL_ROLE_UNKNOWN'] : [] };
}

function inspectAuthority(root) {
  const router = text(join(root, 'tools', 'kad', 'local-router.mjs'));
  const tests = text(join(root, 'tools', 'kad', 'test', 'local-router.test.mjs'));
  const exactTrust = /trust_domain\s*===\s*resource\.trust_domain/.test(router);
  const worldBoundary = /WORLD resources cannot satisfy retrieval or engineering requirements/.test(tests);
  return { exact_trust_domain_filter: exactTrust, world_engineering_eligible: false, verified_by_contract_test: worldBoundary, failures: exactTrust && worldBoundary ? [] : ['WORLD_AUTHORITY_BOUNDARY_UNVERIFIED'] };
}

function inspectSpend(config, models) {
  const enabled = enabledModelsFromConfig(config);
  const unsafe = enabled.some(pattern => pattern === '*' || pattern.includes('*/*') || !Object.entries(models).some(([provider, definition]) => (pattern === `${provider}/*` || pattern.startsWith(`${provider}/`)) && definition.auth === 'none' && /^https?:\/\/127\.0\.0\.1(?::\d+)?\//.test(definition.baseUrl ?? '')));
  return { enabled_models: enabled, approved_surface: !unsafe, new_paid_spend_possible: unsafe, failures: unsafe ? ['UNAPPROVED_OR_PAYG_MODEL_SURFACE'] : [] };
}

function inspectPi(observed) {
  let version = observed.piVersion;
  if (!version) { try { version = execFileSync('pi', ['--version'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim().replace(/^pi\s+v?/, ''); } catch { version = null; } }
  return { available: Boolean(version), version: version ?? 'UNKNOWN', provenance: observed.piProvenance ?? 'pi --version', failures: version ? [] : ['PI_UNAVAILABLE'] };
}

function collectLiveLocalInference(models) {
  const provider = Object.values(models).find(value => value.baseUrl)?.baseUrl ?? 'http://127.0.0.1:5001/v1';
  let endpointAvailable = false;
  let identity = '';
  try {
    const health = execFileSync('curl', ['-fsS', '--max-time', '2', `${provider.replace(/\/$/, '').replace(/\/v1$/, '')}/api/v1/model`], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    endpointAvailable = true;
    identity = JSON.parse(health).result ?? '';
  } catch {}
  let processArgs = '';
  let processCwd = '';
  try {
    const processLine = execFileSync('ps', ['-eo', 'pid=,args='], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).split('\n').map(line => line.trim()).find(line => /^(\d+)\s+.*(?:koboldcpp|llama-server).*--port\s+5001/i.test(line));
    processArgs = processLine?.replace(/^\d+\s+/, '') ?? '';
    const pid = processLine?.match(/^(\d+)/)?.[1];
    if (pid) { try { processCwd = readlinkSync(`/proc/${pid}/cwd`); } catch {} }
  } catch {}
  const lower = identity.toLowerCase();
  const qwen = lower.includes('qwen');
  const stheno = lower.includes('stheno');
  const ownership = processArgs ? (/kad-sillytavern|sillytavern/.test(`${processArgs} ${processCwd}`) ? 'EXTERNAL' : 'UNKNOWN') : (endpointAvailable ? 'UNKNOWN' : 'INACTIVE');
  return { endpoint: provider, endpoint_available: endpointAvailable, available: qwen, provider: qwen ? 'kad-local-qwen' : stheno ? 'kad-local-world' : 'UNKNOWN', model: qwen ? 'qwen-local' : stheno ? 'kad-local-s13' : 'UNKNOWN', identity: identity || 'UNKNOWN', ownership };
}

function inspectLocalInference(observed) {
  const value = observed.localInference ?? {};
  const ownership = ['OWNED', 'EXTERNAL', 'UNKNOWN', 'INACTIVE'].includes(value.ownership) ? value.ownership : 'UNKNOWN';
  return { endpoint: value.endpoint ?? 'UNKNOWN', endpoint_available: value.endpoint_available ?? value.available ?? 'UNKNOWN', loaded_provider: value.provider ?? 'UNKNOWN', loaded_model: value.model ?? 'UNKNOWN', ownership, mutation_performed: false, failures: ownership === 'UNKNOWN' ? ['LOCAL_PROCESS_OWNERSHIP_UNKNOWN'] : [] };
}

function statusFor(sections) {
  const blocking = [...sections.omp.failures, ...sections.learning.failures, ...sections.spend.failures, ...sections.pi.failures];
  const degraded = [...sections.governance.failures, ...sections.skills.failures, ...sections.roles.failures, ...sections.authority.failures, ...sections.local_inference.failures];
  if (blocking.length) return 'BLOCKED';
  if (degraded.length || sections.roles.roles.local_retrieval.status !== 'RESOLVED' || sections.local_inference.endpoint_available !== true) return 'DEGRADED';
  return 'READY';
}

export function inspectPreflight({ root = process.cwd(), observed = {} } = {}) {
  root = resolve(root);
  const config = text(join(root, '.omp', 'config.yml'));
  const modelsText = text(join(root, '.omp', 'models.yml'));
  const models = modelsFromConfig(modelsText);
  const effectiveObserved = Object.hasOwn(observed, 'localInference') ? observed : { ...observed, localInference: collectLiveLocalInference(models) };
  const sections = {
    omp: inspectOmp(root, effectiveObserved),
    pi: inspectPi(effectiveObserved),
    governance: inspectGovernance(root, config),
    skills: inspectSkills(root, config),
    learning: inspectLearning(config),
    roles: inspectRoles(root, config, models, effectiveObserved),
    authority: inspectAuthority(root),
    local_inference: inspectLocalInference(effectiveObserved),
    spend: inspectSpend(config, models)
  };
  const failures = Object.values(sections).flatMap(section => section.failures ?? []);
  const unknowns = [
    ...(sections.roles.unknowns ?? []),
    ...(sections.local_inference.ownership === 'UNKNOWN' ? ['LOCAL_PROCESS_OWNERSHIP_UNKNOWN'] : []),
    ...(sections.pi.version === 'UNKNOWN' ? ['PI_VERSION_UNKNOWN'] : [])
  ];
  return { schema_version: 'kad-omp-preflight-1', status: statusFor(sections), omp: sections.omp, pi: sections.pi, governance: sections.governance, skills: sections.skills, learning: sections.learning, roles: sections.roles, local_inference: sections.local_inference, spend: sections.spend, authority: sections.authority, failures: [...new Set(failures)], unknowns: [...new Set(unknowns)] };
}

export function canonicalReceipt(receipt) {
  return JSON.parse(JSON.stringify(receipt));
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const receipt = inspectPreflight();
  process.stdout.write(`${JSON.stringify(canonicalReceipt(receipt), null, 2)}\n`);
  process.exitCode = receipt.status === 'READY' ? 0 : receipt.status === 'DEGRADED' ? 2 : 1;
}
