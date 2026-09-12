#!/usr/bin/env node
/**
 * Deterministic, read-only readiness receipt for the KAD OMP bridge.
 * Configuration is transport; KAD remains the routing, trust, and lifecycle authority.
 */
import { existsSync, readFileSync, readdirSync, readlinkSync, realpathSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { homedir } from 'node:os';
import { join, relative, resolve, sep } from 'node:path';
import { inspectPosture } from './posture-check.mjs';

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
      identityContains: scalar(body, 'identityContains'),
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

/**
 * ADR 0018: the newest mise-provided OMP is authoritative.
 *
 * The receipt identifies the harness the launcher would actually execute - `OMP_BINARY`, then
 * `omp` on PATH, then the KAD canary - rather than a staged pin the launcher never touches. An
 * unresolvable version blocks: a receipt that cannot name the harness cannot vouch for it.
 * Non-mise provenance degrades rather than blocks, so a checkout without mise stays usable.
 */
const OMP_TOOL = 'github:can1357/oh-my-pi';

function miseInstallsRoot() {
  return join(process.env.MISE_DATA_DIR ?? join(homedir(), '.local', 'share', 'mise'), 'installs');
}

/** The build mise itself would dispatch `omp` to; the strongest available provenance answer. */
function miseWhichOmp() {
  try {
    const resolved = execFileSync('mise', ['which', 'omp'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    return resolved && existsSync(resolved) ? resolved : null;
  } catch { return null; }
}

function realpathOrSelf(path) {
  try { return realpathSync(path); } catch { return path; }
}

/**
 * A mise shim (`<mise data>/shims/omp`) is a symlink to the mise binary that dispatches at exec
 * time, so its realpath names mise, not the build. It is still a mise-provided harness — and it is
 * what `command -v omp` returns whenever the shims directory precedes the installs directory on
 * PATH, which is the normal case in a login shell.
 */
function isMiseShim(path) {
  return /(^|[\\/])shims[\\/][^\\/]+$/.test(path);
}

function activeOmpBinary(root) {
  if (process.env.OMP_BINARY) return process.env.OMP_BINARY;
  try {
    const onPath = execFileSync('sh', ['-c', 'command -v omp'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    if (onPath) return onPath;
  } catch { /* no omp on PATH: fall through to the canary */ }
  const canary = join(root, 'bin', 'omp-patched-canary');
  return existsSync(canary) ? canary : null;
}

function ompVersionOf(binary) {
  try {
    const output = execFileSync(binary, ['--version'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    return output.match(/(\d+\.\d+\.\d+)/)?.[1] ?? null;
  } catch { return null; }
}

function compareSemver(left, right) {
  const a = left.split('.').map(Number);
  const b = right.split('.').map(Number);
  for (const index of [0, 1, 2]) {
    if ((a[index] ?? 0) !== (b[index] ?? 0)) return (a[index] ?? 0) - (b[index] ?? 0);
  }
  return 0;
}

/** Newest staged pin left by the pre-ADR-0018 qualification, reported as drift, not authority. */
function stagedPin(root) {
  const directory = join(root, '.tools', 'oh-my-pi');
  if (!existsSync(directory)) return null;
  let entries;
  try { entries = readdirSync(directory); } catch { return null; }
  const versions = entries.map((name) => name.match(/^v(\d+\.\d+\.\d+)$/)?.[1]).filter(Boolean).sort(compareSemver);
  if (!versions.length) return null;
  const version = versions.at(-1);
  return { version, path: join('.tools', 'oh-my-pi', `v${version}`), superseded: true };
}

function inspectOmp(root, observed) {
  const wrapper = pathStatus(root, join(root, 'bin', 'omp-kad'));
  const dispatchedPath = miseWhichOmp();
  const pathBinary = activeOmpBinary(root);
  // Precedence follows the launcher: an explicit override wins, then what was observed to run,
  // then what mise would dispatch, then PATH, then the canary (inside `activeOmpBinary`).
  const override = process.env.OMP_BINARY || null;
  const binaryPath = override ?? observed.ompBinary ?? dispatchedPath ?? pathBinary;
  const resolvedPath = binaryPath ? realpathOrSelf(binaryPath) : null;
  const binary = binaryPath
    ? {
        path: binaryPath.startsWith(root) ? rel(root, binaryPath) : binaryPath,
        resolved: resolvedPath.startsWith(root) ? rel(root, resolvedPath) : resolvedPath,
        exists: existsSync(binaryPath),
        executable: existsSync(binaryPath) && (() => { try { return (statSync(binaryPath).mode & 0o111) !== 0; } catch { return false; } })()
      }
    : null;
  const version = observed.ompVersion ?? (binary?.executable ? ompVersionOf(binaryPath) : null);
  const managed = Boolean(resolvedPath) && (resolvedPath.startsWith(`${miseInstallsRoot()}${sep}`) || isMiseShim(binaryPath));
  // A PATH `omp` that is not the build mise dispatches is what a bare invocation gets. It does not
  // invalidate this receipt — the launcher and the receipt both use the mise build — but it is
  // reported, because "which omp" answering a different binary is how a stale harness runs.
  const shadow = pathBinary && dispatchedPath && realpathOrSelf(pathBinary) !== realpathOrSelf(dispatchedPath) && !observed.ompBinary
    ? { path: pathBinary, version: ompVersionOf(pathBinary) ?? 'UNKNOWN' }
    : null;
  const staged = stagedPin(root);
  const manifest = parseManifest(root);
  const failures = [];
  if (!wrapper.exists) failures.push('OMP_WRAPPER_MISSING');
  else if (!wrapper.executable) failures.push('OMP_WRAPPER_NOT_EXECUTABLE');
  if (!binary) failures.push('OMP_BINARY_UNAVAILABLE');
  else if (!version) failures.push('OMP_VERSION_UNKNOWN');
  return {
    version: version ?? 'UNKNOWN',
    tool: managed ? OMP_TOOL : null,
    source: managed ? 'mise' : binary ? 'unmanaged' : 'UNKNOWN',
    via: managed ? (dispatchedPath && binaryPath === dispatchedPath ? 'mise which' : isMiseShim(binaryPath) ? 'shim' : 'install') : null,
    binary,
    path_shadow: shadow,
    wrapper,
    staged_pin: staged ? { ...staged, drift: staged.version !== version } : null,
    legacy_manifest: manifest ? { path: manifest.path, release: manifest.release ?? 'UNKNOWN', superseded_by: 'docs/adr/0018-newest-mise-provided-omp-is-authoritative.md' } : null,
    provenance_failures: binary && !managed ? ['OMP_BINARY_NOT_MISE_MANAGED'] : [],
    failures
  };
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

function parseSelector(selector) {
  const match = String(selector ?? '').match(/^([^/]+)\/([^:]+)(?::[^:]+)?$/);
  return match ? { provider: match[1], model: match[2] } : null;
}

function inspectRoles(root, config, models, observed) {
  const declared = rolesFromConfig(config);
  const enabled = enabledModelsFromConfig(config);
  const resources = observed.localInference?.resources ?? [];
  const roles = {};
  for (const name of ['world', 'local_retrieval']) {
    const selector = declared[name];
    const parsed = parseSelector(selector);
    const provider = parsed && models[parsed.provider];
    const listed = Boolean(provider?.models.includes(parsed.model));
    const enabledByPolicy = parsed && enabled.some(pattern => pattern === `${parsed.provider}/${parsed.model}` || pattern === `${parsed.provider}/*`);
    let status = parsed && listed && enabledByPolicy ? 'RESOLVED' : 'UNRESOLVED';
    if (name === 'local_retrieval') {
      const resource = resources.find(item => item.provider === parsed?.provider);
      if (resource) status = resource.capability_state === 'AVAILABLE' && resource.ownership === 'OWNED' ? 'RESOLVED' : resource.capability_state;
      else if (observed.localInference?.available === false) status = 'UNAVAILABLE';
      else if (observed.localInference?.available === true && (observed.localInference.provider !== parsed?.provider || observed.localInference.model !== parsed?.model)) status = 'STALE';
    }
    roles[name] = { status, selector: selector ?? 'UNKNOWN', provider: parsed?.provider ?? 'UNKNOWN', model: parsed?.model ?? 'UNKNOWN' };
  }
  return { roles, failures: roles.local_retrieval.status === 'UNRESOLVED' ? ['LOCAL_RETRIEVAL_ROLE_UNRESOLVED'] : [], unknowns: ['UNKNOWN', 'NOT_STC_OWNED'].includes(roles.local_retrieval.status) ? ['LOCAL_RETRIEVAL_ROLE_UNKNOWN'] : [] };
}

function inspectAuthority(root) {
  const router = text(join(root, 'tools', 'kad', 'local-router.mjs'));
  const tests = text(join(root, 'tools', 'kad', 'test', 'local-router.test.mjs'));
  const exactTrust = /trust_domain\s*===\s*resource\.trust_domain/.test(router);
  const worldBoundary = /WORLD resources cannot satisfy retrieval or engineering requirements/.test(tests);
  return { exact_trust_domain_filter: exactTrust, world_engineering_eligible: false, verified_by_contract_test: worldBoundary, failures: exactTrust && worldBoundary ? [] : ['WORLD_AUTHORITY_BOUNDARY_UNVERIFIED'] };
}

/** Cost classes the operator has approved for exposure (ADR 0016). */
const APPROVED_COST_CLASSES = new Set(['LOCAL', 'FIXED_SUBSCRIPTION', 'FREE_TIER']);

/**
 * `omp_provider` -> declared cost class, from the external-provider registry.
 *
 * The gate asks a declaration question rather than pinning the surface. Accepting loopback
 * endpoints only blocked the operator's fixed-cost subscriptions and had to be ignored to get
 * any work done, which made it useless as a gate; a provider nobody has classified still fails
 * closed, and METERED lanes still block (ADR 0016).
 */
function declaredCostClasses(root) {
  try {
    const registry = JSON.parse(text(join(root, 'config', 'external-providers.json')));
    return new Map((registry.providers ?? [])
      .filter((entry) => typeof entry.omp_provider === 'string' && typeof entry.cost_class === 'string')
      .map((entry) => [entry.omp_provider, entry.cost_class]));
  } catch {
    return new Map();
  }
}

function inspectSpend(config, models, costClasses) {
  const enabled = enabledModelsFromConfig(config);
  const lanes = enabled.map((pattern) => {
    const provider = String(pattern).split('/')[0];
    const definition = models[provider];
    const ownEndpoint = Boolean(definition?.auth === 'none' && /^https?:\/\/127\.0\.0\.1(?::\d+)?\//.test(definition.baseUrl ?? ''));
    const costClass = ownEndpoint ? 'LOCAL' : costClasses.get(provider) ?? 'UNDECLARED';
    return { pattern, provider, cost_class: costClass, approved: APPROVED_COST_CLASSES.has(costClass) };
  });
  const unapproved = lanes.filter((lane) => !lane.approved);
  // No declared surface is not a clean surface. An empty `enabledModels` leaves nothing to approve,
  // which is the fail-open shape this gate exists to close: the absence of lanes must fail like an
  // unapproved lane, not pass like a clean one.
  const failures = [
    ...(enabled.length === 0 ? ['OMP_MODEL_SURFACE_UNDECLARED'] : []),
    ...(unapproved.length ? ['UNAPPROVED_OR_PAYG_MODEL_SURFACE'] : [])
  ];
  return { enabled_models: enabled, lanes, approved_surface: failures.length === 0, new_paid_spend_possible: unapproved.length > 0, failures };
}

function pathWithin(parent, candidate) {
  const outer = resolve(parent);
  const inner = resolve(candidate);
  return inner === outer || inner.startsWith(`${outer}${sep}`);
}

/** Repository root plus the resolved wiki of record: everything canon lives under one of them. */
function canonRoots(root) {
  const roots = [resolve(root)];
  try {
    const target = readFileSync(join(root, '.ai-memory', 'vault-path'), 'utf8').trim();
    if (target) roots.push(resolve(target));
  } catch {}
  return roots;
}

/** Harness-local cognition stores: OMP's own state, and where auto-learning mints skills. */
function managedStorePaths() {
  const home = homedir();
  return [join(home, '.omp'), join(home, '.omp', 'agent', 'managed-skills')];
}

/**
 * OMP's memory and auto-learning are advisory and must stay outside canon (ADR 0017).
 *
 * The gate used to pin `memory.backend: off` and `autolearn: false`. The invariant behind that
 * protects *promotion authority* — nothing reaches canon on a model's own judgment — not the
 * existence of a local learning store, which is why the pinned values were overridden by an
 * operator decision and the gate went on failing for three days. It now asserts the property:
 * the posture is declared and enforced, the advisor stays off, and no managed store resolves
 * inside a canon root.
 */
function inspectLearning(config, root) {
  const advisor = scalar(section(config, 'advisor'), 'enabled');
  const memory = scalar(section(config, 'memory'), 'backend');
  const autolearn = scalar(section(config, 'autolearn'), 'enabled');
  const posture = inspectPosture({ root });
  const stores = managedStorePaths();
  const canon = canonRoots(root);
  const storesInCanon = stores.filter((store) => canon.some((entry) => pathWithin(entry, store)));
  const canonInStore = canon.filter((entry) => stores.some((store) => pathWithin(store, entry)));
  const failures = [
    ...new Set(posture.problems.map((problem) => problem.code)),
    ...(advisor === 'true' ? ['ADVISOR_ENABLED'] : []),
    ...storesInCanon.map((store) => `MANAGED_STORE_INSIDE_CANON:${store}`),
    ...canonInStore.map((entry) => `CANON_INSIDE_MANAGED_STORE:${entry}`)
  ];
  return {
    advisor_enabled: advisor === 'true',
    memory_backend: memory ?? 'UNKNOWN',
    autolearn_enabled: autolearn === 'true',
    advisory_systems: [memory && memory !== 'off' ? `memory:${memory}` : null, autolearn === 'true' ? 'autolearn' : null].filter(Boolean),
    posture: { declared: posture.declared, enforced: posture.observed, problems: posture.problems.map((problem) => problem.code) },
    managed_stores: stores,
    canon_roots: canon,
    safe: failures.length === 0,
    failures
  };
}

function inspectPi(observed) {
  let version = observed.piVersion;
  if (!version) { try { version = execFileSync('pi', ['--version'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim().replace(/^pi\s+v?/, ''); } catch { version = null; } }
  return { available: Boolean(version), version: version ?? 'UNKNOWN', provenance: observed.piProvenance ?? 'pi --version', failures: version ? [] : ['PI_UNAVAILABLE'] };
}

function endpointBase(endpoint) {
  try { const url = new URL(endpoint); url.pathname = ''; return url.toString().replace(/\/$/, ''); } catch { return ''; }
}

function liveProcessForPort(port, processLines) {
  if (!port) return null;
  return processLines.map(line => line.trim()).find(line => new RegExp(`^(\\d+)\\s+.*(?:koboldcpp|llama-server).*--port\\s+${port}(?:\\s|$)`, 'i').test(line)) ?? null;
}

function ownedPidFromReceipt(root, provider, endpoint) {
  const path = join(root, '.state', 'omp-kad', 'qwen-retrieval', 'activation.json');
  try {
    const receipt = JSON.parse(text(path));
    if (receipt.provider !== provider || receipt.ownership !== 'OWNED' || endpointBase(receipt.endpoint) !== endpointBase(endpoint) || !Number.isInteger(receipt.pid)) return null;
    process.kill(receipt.pid, 0);
    const port = new URL(endpoint).port;
    const cmdline = readFileSync(`/proc/${receipt.pid}/cmdline`, 'utf8').replaceAll('\0', ' ');
    if (!new RegExp(`(?:^|\\s)--port\\s+${port}(?:\\s|$)`).test(cmdline)) return null;
    return receipt.pid;
  } catch { return null; }
}

function collectLiveLocalInference(models, root) {
  let processLines = [];
  try { processLines = execFileSync('ps', ['-eo', 'pid=,args='], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).split('\n'); } catch {}
  return Object.entries(models).filter(([, definition]) => definition.baseUrl).map(([provider, definition]) => {
    const endpoint = definition.baseUrl;
    let endpointAvailable = false;
    let identity = '';
    try {
      const health = execFileSync('curl', ['-fsS', '--max-time', '2', `${endpointBase(endpoint)}/api/v1/model`], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
      endpointAvailable = true;
      identity = JSON.parse(health).result ?? '';
    } catch {}
    const port = (() => { try { return new URL(endpoint).port; } catch { return ''; } })();
    const processLine = liveProcessForPort(port, processLines);
    const pid = processLine?.match(/^(\d+)/)?.[1];
    let cwd = '';
    if (pid) { try { cwd = readlinkSync(`/proc/${pid}/cwd`); } catch {} }
    const ownedPid = ownedPidFromReceipt(root, provider, endpoint);
    const ownership = ownedPid ? 'OWNED' : processLine ? (/kad-sillytavern|sillytavern/.test(`${processLine} ${cwd}`) ? 'EXTERNAL' : 'UNKNOWN') : endpointAvailable ? 'UNKNOWN' : 'INACTIVE';
    return { provider, endpoint, endpoint_available: endpointAvailable, expected_model: definition.models[0] ?? 'UNKNOWN', expected_identity: definition.identityContains ?? 'UNKNOWN', observed_identity: identity || 'UNKNOWN', ownership, pid: ownedPid ?? (pid ? Number(pid) : undefined) };
  });
}

function identityMatches(resource, definition) {
  const expected = definition.identityContains ?? (resource.provider.includes('qwen') ? 'qwen' : resource.provider.includes('world') ? 'stheno' : definition.models[0]);
  return resource.observed_identity !== 'UNKNOWN' && resource.observed_identity.toLowerCase().includes(expected.toLowerCase());
}

function resourceState(resource, definition) {
  if (resource.capability_state) return resource.capability_state;
  if (resource.endpoint_available === false) return 'UNAVAILABLE';
  if (resource.endpoint_available !== true || resource.observed_identity === 'UNKNOWN') return 'UNKNOWN';
  if (!identityMatches(resource, definition)) return 'CAPABILITY_MISMATCH';
  if (resource.provider.includes('qwen') && resource.ownership !== 'OWNED') return 'NOT_STC_OWNED';
  return 'AVAILABLE';
}

function inspectLocalInference(observed, models) {
  const value = observed.localInference ?? {};
  const supplied = Array.isArray(value.resources) ? value.resources : value.provider ? [{ provider: value.provider, model: value.model, endpoint: value.endpoint, endpoint_available: value.endpoint_available ?? value.available, observed_identity: value.identity ?? 'UNKNOWN', ownership: value.ownership, capability_state: value.capability_state ?? (value.available === true ? 'AVAILABLE' : value.available === false ? 'UNAVAILABLE' : undefined) }] : [];
  const resources = Object.entries(models).filter(([, definition]) => definition.baseUrl).map(([provider, definition]) => {
    const source = supplied.find(item => item.provider === provider) ?? { provider, endpoint: definition.baseUrl, endpoint_available: false, observed_identity: 'UNKNOWN', ownership: 'INACTIVE' };
    const resource = { provider, endpoint: source.endpoint ?? definition.baseUrl, expected_model: source.expected_model ?? definition.models[0] ?? 'UNKNOWN', expected_identity: source.expected_identity ?? definition.identityContains ?? 'UNKNOWN', observed_identity: source.observed_identity ?? 'UNKNOWN', endpoint_available: source.endpoint_available ?? 'UNKNOWN', ownership: ['OWNED', 'EXTERNAL', 'UNKNOWN', 'INACTIVE'].includes(source.ownership) ? source.ownership : 'UNKNOWN' };
    return { ...resource, capability_state: resourceState({ ...resource, capability_state: source.capability_state }, definition) };
  });
  const retrieval = resources.find(resource => providerForRole(models, 'qwen', resource.provider));
  const failures = resources.filter(resource => resource.ownership === 'UNKNOWN').map(resource => `LOCAL_PROCESS_OWNERSHIP_UNKNOWN:${resource.provider}`);
  return { resources, endpoint: retrieval?.endpoint ?? 'UNKNOWN', endpoint_available: retrieval?.endpoint_available ?? 'UNKNOWN', loaded_provider: retrieval?.provider ?? 'UNKNOWN', loaded_model: retrieval?.expected_model ?? 'UNKNOWN', ownership: retrieval?.ownership ?? 'UNKNOWN', mutation_performed: false, failures };
}

function providerForRole(models, role, provider) {
  return role === 'qwen' ? provider.includes('qwen') : Boolean(models[provider]);
}

/**
 * The local-retrieval role plus the resource standing behind it.
 *
 * This is the one condition the status computation reads beyond the section failures, so both
 * `statusFor` and the degraded-cause list must ask the same question of the same pair; answering
 * it twice from two lookups is how a status and its stated cause drift apart.
 */
function retrievalCondition(sections) {
  const role = sections.roles.roles.local_retrieval;
  const resource = sections.local_inference.resources.find((item) => item.provider === role.provider);
  return { status: role.status, available: resource?.capability_state === 'AVAILABLE' };
}

function statusFor(sections) {
  const blocking = [...sections.omp.failures, ...sections.learning.failures, ...sections.spend.failures, ...sections.pi.failures];
  const degraded = [...sections.governance.failures, ...sections.skills.failures, ...sections.roles.failures, ...sections.authority.failures, ...sections.local_inference.failures, ...sections.omp.provenance_failures];
  const retrieval = retrievalCondition(sections);
  if (blocking.length) return 'BLOCKED';
  if (degraded.length || retrieval.status !== 'RESOLVED' || !retrieval.available) return 'DEGRADED';
  return 'READY';
}

/**
 * Every cause behind a DEGRADED receipt, and whether the operator declared it.
 *
 * The gate prints this list, so a degraded checkout names what is wrong instead of printing a bare
 * status. A down retrieval endpoint is `intended` only when the operator declared on-demand
 * endpoints *and* the role resolved to exactly UNAVAILABLE: `UNRESOLVED`, `STALE`, `UNKNOWN` and
 * `NOT_STC_OWNED` mean the role is misdeclared or unowned, which nobody declared and someone must
 * fix, so labelling one of those as the steady state would mask the very faults this gate exists
 * to surface.
 */
function degradedCauses(sections, retrievalMode) {
  const causes = [
    ...sections.governance.failures, ...sections.skills.failures, ...sections.roles.failures,
    ...sections.authority.failures, ...sections.local_inference.failures, ...sections.omp.provenance_failures
  ].map((code) => ({ code, intended: false }));
  const retrieval = retrievalCondition(sections);
  if (retrieval.status !== 'RESOLVED' || !retrieval.available) {
    const intended = retrievalMode === 'on-demand' && retrieval.status === 'UNAVAILABLE';
    causes.push({ code: intended ? 'LOCAL_RETRIEVAL_ON_DEMAND' : 'LOCAL_RETRIEVAL_UNAVAILABLE', intended });
  }
  return causes;
}

/**
 * Providers that KAD-PI's external-provider registry declares TRANSPORT_ONLY.
 *
 * A gateway that proxies other providers is not local inference. Counting it in
 * the local-inference census asserts ownership of a process KAD-PI never starts,
 * reports a bogus LOCAL_PROCESS_OWNERSHIP_UNKNOWN, and pollutes the resource list
 * an acceptance receipt is built from. The registry already carries the fact, so
 * the census reads it rather than guessing from the provider name.
 */
function transportOnlyProviders(root) {
  try {
    const registry = JSON.parse(text(join(root, 'config', 'external-providers.json')));
    return new Set((registry.providers ?? [])
      .filter((entry) => entry.authority === 'TRANSPORT_ONLY' && typeof entry.omp_provider === 'string')
      .map((entry) => entry.omp_provider));
  } catch {
    return new Set();
  }
}

/**
 * The declared local-retrieval mode, from the operator's steady-state declaration.
 *
 * Fail-soft like the provider registry above: a missing or malformed declaration means nothing is
 * declared, and the receipt reports the degradation unnamed rather than inventing intent the
 * operator never stated.
 */
function declaredRetrievalMode(root) {
  try {
    const declaration = JSON.parse(text(join(root, 'config', 'omp-steady-state.json')));
    return typeof declaration?.local_retrieval?.mode === 'string' ? declaration.local_retrieval.mode : null;
  } catch {
    return null;
  }
}

export function inspectPreflight({ root = process.cwd(), observed = {} } = {}) {
  root = resolve(root);
  const config = text(join(root, '.omp', 'config.yml'));
  const modelsText = text(join(root, '.omp', 'models.yml'));
  const models = modelsFromConfig(modelsText);
  const transportOnly = transportOnlyProviders(root);
  const inferenceModels = Object.fromEntries(
    Object.entries(models).filter(([provider]) => !transportOnly.has(provider))
  );
  const effectiveObserved = Object.hasOwn(observed, 'localInference') ? observed : { ...observed, localInference: { resources: collectLiveLocalInference(inferenceModels, root) } };
  const localInference = inspectLocalInference(effectiveObserved, inferenceModels);
  const roleObservation = { ...effectiveObserved, localInference };
  const costClasses = declaredCostClasses(root);
  const sections = {
    omp: inspectOmp(root, effectiveObserved),
    pi: inspectPi(effectiveObserved),
    governance: inspectGovernance(root, config),
    skills: inspectSkills(root, config),
    learning: inspectLearning(config, root),
    roles: inspectRoles(root, config, models, roleObservation),
    authority: inspectAuthority(root),
    local_inference: localInference,
    spend: inspectSpend(config, models, costClasses)
  };
  const failures = Object.values(sections).flatMap(section => section.failures ?? []);
  const unknowns = [
    ...(sections.roles.unknowns ?? []),
    ...(sections.local_inference.ownership === 'UNKNOWN' ? ['LOCAL_PROCESS_OWNERSHIP_UNKNOWN'] : []),
    ...(sections.pi.version === 'UNKNOWN' ? ['PI_VERSION_UNKNOWN'] : [])
  ];
  return { schema_version: 'kad-omp-preflight-1', status: statusFor(sections), degraded_causes: degradedCauses(sections, declaredRetrievalMode(root)), omp: sections.omp, pi: sections.pi, governance: sections.governance, skills: sections.skills, learning: sections.learning, roles: sections.roles, local_inference: sections.local_inference, spend: sections.spend, authority: sections.authority, failures: [...new Set(failures)], unknowns: [...new Set(unknowns)] };
}

export function canonicalReceipt(receipt) {
  return JSON.parse(JSON.stringify(receipt));
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const receipt = inspectPreflight();
  process.stdout.write(`${JSON.stringify(canonicalReceipt(receipt), null, 2)}\n`);
  process.exitCode = receipt.status === 'READY' ? 0 : receipt.status === 'DEGRADED' ? 2 : 1;
}
