import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  parseIsa,
  lintIsa,
  checkIsa,
  statusIsa,
  explainClaim,
  buildIsaProjection,
  discoverIsas,
  compileAllIsas,
  VALIDATOR_REGISTRY
} from '../isa.mjs';
import { vaultRoot } from '../wiki/index.mjs';

const ROOT = new URL('../../..', import.meta.url).pathname;
// The knowledge root resolves through vaultRoot(): the ai-memory wiki of record
// when the substrate owns the corpus, the committed vault/ mirror otherwise.
const VAULT = vaultRoot();
const AESTHETIC_ISA = resolve(VAULT, '00_Governance/ISA-KAD-AESTHETIC-001.md');
const COMPUTE_ISA = resolve(VAULT, '00_Governance/ISA-KAD-COMPUTE-FABRIC-001.md');
const MEMORY_ISA = resolve(VAULT, '00_Governance/ISA-KAD-MEMORY-001.md');

test('parseIsa extracts frontmatter, sections, and structured claims for aesthetic ISA', () => {
  const content = readFileSync(AESTHETIC_ISA, 'utf8');
  const parsed = parseIsa(content);
  assert.equal(parsed.metadata.kad_id, 'ISA-KAD-AESTHETIC-001');
  assert.equal(parsed.metadata.status, 'ACCEPTED');
  assert.match(parsed.metadata.authority, /^CANONICAL/);
  assert.ok(parsed.claims.length >= 10);

  const claim1 = parsed.claims.find(c => c.id === 'ISA-KAD-AESTHETIC-001');
  assert.ok(claim1);
  assert.equal(claim1.class, 'DETERMINISTIC');
  assert.equal(claim1.validator, 'aesthetic.assets.local_only');
  assert.equal(claim1.severity, 'BLOCKER');
});

test('parseIsa extracts frontmatter, sections, and structured claims for compute fabric ISA', () => {
  const content = readFileSync(COMPUTE_ISA, 'utf8');
  const parsed = parseIsa(content);
  assert.equal(parsed.metadata.kad_id, 'ISA-KAD-COMPUTE-FABRIC-001');
  assert.equal(parsed.metadata.status, 'ACCEPTED');
  assert.equal(parsed.metadata.domain, 'compute-fabric');
  assert.match(parsed.metadata.authority, /^CANONICAL/);
  assert.ok(parsed.claims.length >= 10);

  const ponClaim = parsed.claims.find(c => c.validator === 'compute.pon.typed_notifications');
  assert.ok(ponClaim);
  assert.equal(ponClaim.class, 'DETERMINISTIC');
  assert.equal(ponClaim.severity, 'BLOCKER');
});

test('lintIsa validates correct schema across different ISA domains', () => {
  const aestheticLint = lintIsa(AESTHETIC_ISA);
  assert.equal(aestheticLint.ok, true);
  assert.equal(aestheticLint.errors.length, 0);
  assert.equal(aestheticLint.kad_id, 'ISA-KAD-AESTHETIC-001');

  const computeLint = lintIsa(COMPUTE_ISA);
  assert.equal(computeLint.ok, true);
  assert.equal(computeLint.errors.length, 0);
  assert.equal(computeLint.kad_id, 'ISA-KAD-COMPUTE-FABRIC-001');

  // Test missing file
  const missingResult = lintIsa(resolve(ROOT, 'non-existent.md'));
  assert.equal(missingResult.ok, false);
  assert.match(missingResult.errors[0], /does not exist/);
});

test('discoverIsas discovers all active ISAs in canonical governance directory', () => {
  const isas = discoverIsas(VAULT);
  assert.ok(Array.isArray(isas));
  assert.ok(isas.length >= 2);
  const ids = isas.map(i => i.kad_id);
  assert.ok(ids.includes('ISA-KAD-AESTHETIC-001'));
  assert.ok(ids.includes('ISA-KAD-COMPUTE-FABRIC-001'));
});

test('checkIsa executes all allowlisted validators and passes aesthetic ISA', () => {
  const checkResult = checkIsa(AESTHETIC_ISA, { rootDir: ROOT });
  assert.equal(checkResult.ok, true);
  assert.equal(checkResult.isa_id, 'ISA-KAD-AESTHETIC-001');
  assert.equal(checkResult.passed_claims, checkResult.total_claims);
  assert.equal(checkResult.failed_claims, 0);

  for (const r of checkResult.results) {
    assert.equal(r.pass, true);
    assert.ok(r.evidence);
    assert.ok(VALIDATOR_REGISTRY[r.validator]);
  }
});

test('checkIsa executes all allowlisted validators and passes compute fabric ISA', () => {
  const checkResult = checkIsa(COMPUTE_ISA, { rootDir: ROOT });
  assert.equal(checkResult.ok, true);
  assert.equal(checkResult.isa_id, 'ISA-KAD-COMPUTE-FABRIC-001');
  assert.equal(checkResult.passed_claims, checkResult.total_claims);
  assert.equal(checkResult.failed_claims, 0);

  for (const r of checkResult.results) {
    assert.equal(r.pass, true);
    assert.ok(r.evidence);
    assert.ok(VALIDATOR_REGISTRY[r.validator]);
  }
});

test('statusIsa returns structured counts and accepted status for single and all ISAs', () => {
  const aestheticStatus = statusIsa(AESTHETIC_ISA);
  assert.equal(aestheticStatus.status, 'ACCEPTED');
  assert.equal(aestheticStatus.isa_id, 'ISA-KAD-AESTHETIC-001');
  assert.ok(aestheticStatus.counts.deterministic >= 7);

  const computeStatus = statusIsa(COMPUTE_ISA);
  assert.equal(computeStatus.status, 'ACCEPTED');
  assert.equal(computeStatus.isa_id, 'ISA-KAD-COMPUTE-FABRIC-001');
  assert.ok(computeStatus.counts.deterministic >= 8);
});

test('explainClaim returns detailed metadata and guidance across domains', () => {
  const aestheticExpl = explainClaim('ISA-KAD-AESTHETIC-001', AESTHETIC_ISA);
  assert.equal(aestheticExpl.id, 'ISA-KAD-AESTHETIC-001');
  assert.equal(aestheticExpl.class, 'DETERMINISTIC');
  assert.equal(aestheticExpl.validator, 'aesthetic.assets.local_only');

  const computeExpl = explainClaim('ISA-KAD-COMPUTE-001', COMPUTE_ISA);
  assert.equal(computeExpl.id, 'ISA-KAD-COMPUTE-001');
  assert.equal(computeExpl.class, 'DETERMINISTIC');
  assert.equal(computeExpl.validator, 'compute.pon.typed_notifications');
});

test('buildIsaProjection compiles domain-specific machine-readable projections', () => {
  const aestheticOut = resolve(VAULT, '90_Derived/Projections/isa-aesthetic.json');
  const aestheticProj = buildIsaProjection(AESTHETIC_ISA, aestheticOut, { rootDir: ROOT });
  assert.equal(aestheticProj.projection_type, 'KAD_AESTHETIC_ISA_PROJECTION');
  assert.equal(aestheticProj.isa.id, 'ISA-KAD-AESTHETIC-001');
  assert.ok(aestheticProj.token_contracts);

  const computeOut = resolve(VAULT, '90_Derived/Projections/isa-compute-fabric.json');
  const computeProj = buildIsaProjection(COMPUTE_ISA, computeOut, { rootDir: ROOT });
  assert.equal(computeProj.projection_type, 'KAD_COMPUTE_FABRIC_ISA_PROJECTION');
  assert.equal(computeProj.isa.id, 'ISA-KAD-COMPUTE-FABRIC-001');
  assert.ok(computeProj.host_profiles);
  assert.ok(computeProj.cognition_classes);
  assert.ok(computeProj.experimental_tuple_schema);
});

test('compileAllIsas builds domain projections and composite registry', () => {
  const result = compileAllIsas(ROOT);
  assert.equal(result.ok, true);
  assert.ok(result.compiled_count >= 2);
  assert.ok(existsSync(resolve(VAULT, '90_Derived/Projections/isa-registry.json')));

  const registry = JSON.parse(readFileSync(resolve(VAULT, '90_Derived/Projections/isa-registry.json'), 'utf8'));
  assert.equal(registry.registry_type, 'KAD_ISA_REGISTRY');
  assert.ok(registry.artifacts.length >= 2);
  assert.ok(registry.artifacts.some(a => a.id === 'ISA-KAD-AESTHETIC-001'));
  assert.ok(registry.artifacts.some(a => a.id === 'ISA-KAD-COMPUTE-FABRIC-001'));
});

test('validator registry rejects arbitrary shell commands in markdown', () => {
  for (const [id, spec] of Object.entries(VALIDATOR_REGISTRY)) {
    assert.ok(typeof spec.execute === 'function');
    assert.ok(spec.name);
    assert.ok(['DETERMINISTIC', 'HUMAN_REVIEW', 'HYBRID'].includes(spec.class));
  }
});

test('memory domain ISAs lint, expose memory contracts, and compile to their own projection', () => {
  const lint = lintIsa(MEMORY_ISA);
  assert.equal(lint.ok, true, `memory ISA lint errors: ${lint.errors?.join(', ')}`);
  assert.equal(lint.domain, 'memory');
  assert.ok(lint.claimCount >= 8, 'memory ISA must carry a substantive claim set');

  // Every claim must resolve to a registered validator; none may execute shell.
  const parsed = parseIsa(readFileSync(MEMORY_ISA, 'utf8'));
  for (const claim of parsed.claims) {
    assert.ok(VALIDATOR_REGISTRY[claim.validator], `unregistered validator ${claim.validator} on ${claim.id}`);
    assert.equal(claim.class, 'DETERMINISTIC', `${claim.id} must be DETERMINISTIC`);
  }

  const projection = buildIsaProjection(MEMORY_ISA, undefined, { rootDir: ROOT });
  assert.equal(projection.projection_type, 'KAD_MEMORY_ISA_PROJECTION');
  assert.deepEqual(projection.memory_contracts.authority_order, ['SOURCE', 'EVIDENCE', 'DERIVATION']);
  assert.ok(projection.memory_contracts.prohibited.includes('silent-promotion-to-CANONICAL'));

  const discovered = discoverIsas(VAULT).map(i => i.kad_id);
  assert.ok(discovered.includes('ISA-KAD-MEMORY-001'));
});

test('memory.record.versioned rejects a ref that does not resolve, accepts one that does', async () => {
  // A truncated object write leaves `refs/heads/master` in place while the object it
  // names is gone. Presence of a ref is not versioning: the 2026-09-11 corruption was
  // reported as PASS by a presence-only check, so this guards the resolution step.
  const { mkdtemp, mkdir, writeFile, rm } = await import('node:fs/promises');
  const { tmpdir } = await import('node:os');
  const { execFileSync } = await import('node:child_process');

  const root = await mkdtemp(resolve(tmpdir(), 'kad-isa-record-'));
  const record = resolve(root, 'wiki', 'ws', 'proj');
  const gitDir = resolve(root, 'wiki', '.git');
  try {
    await mkdir(resolve(gitDir, 'refs', 'heads'), { recursive: true });
    await mkdir(record, { recursive: true });
    await mkdir(resolve(root, '.ai-memory'), { recursive: true });
    await writeFile(resolve(root, '.ai-memory', 'vault-path'), `${record}\n`);
    await writeFile(resolve(gitDir, 'HEAD'), 'ref: refs/heads/master\n');
    await writeFile(resolve(gitDir, 'refs', 'heads', 'master'), `${'a'.repeat(40)}\n`);
    await writeFile(resolve(record, 'page.md'), 'content\n');

    const dangling = VALIDATOR_REGISTRY['memory.record.versioned'].execute(root);
    assert.equal(dangling.pass, false, 'a ref pointing at an absent object must not count as versioned');
    assert.match(dangling.evidence, /does not resolve/);

    // A real commit in the same record resolves and passes.
    execFileSync('git', ['-C', record, 'init', '-q', '-b', 'master']);
    execFileSync('git', ['-C', record, '-c', 'user.name=t', '-c', 'user.email=t@local', 'add', '-A']);
    execFileSync('git', ['-C', record, '-c', 'user.name=t', '-c', 'user.email=t@local', 'commit', '-q', '-m', 'seed']);
    const versioned = VALIDATOR_REGISTRY['memory.record.versioned'].execute(root);
    assert.equal(versioned.pass, true);
    assert.match(versioned.evidence, /resolves HEAD [0-9a-f]{12}/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
