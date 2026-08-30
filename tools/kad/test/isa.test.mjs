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

const ROOT = new URL('../../..', import.meta.url).pathname;
const AESTHETIC_ISA = resolve(ROOT, 'vault/00_Governance/ISA-KAD-AESTHETIC-001.md');
const COMPUTE_ISA = resolve(ROOT, 'vault/00_Governance/ISA-KAD-COMPUTE-FABRIC-001.md');

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
  const isas = discoverIsas(ROOT);
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
  const aestheticOut = resolve(ROOT, 'vault/90_Derived/Projections/isa-aesthetic.json');
  const aestheticProj = buildIsaProjection(AESTHETIC_ISA, aestheticOut);
  assert.equal(aestheticProj.projection_type, 'KAD_AESTHETIC_ISA_PROJECTION');
  assert.equal(aestheticProj.isa.id, 'ISA-KAD-AESTHETIC-001');
  assert.ok(aestheticProj.token_contracts);

  const computeOut = resolve(ROOT, 'vault/90_Derived/Projections/isa-compute-fabric.json');
  const computeProj = buildIsaProjection(COMPUTE_ISA, computeOut);
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
  assert.ok(existsSync(resolve(ROOT, 'vault/90_Derived/Projections/isa-registry.json')));

  const registry = JSON.parse(readFileSync(resolve(ROOT, 'vault/90_Derived/Projections/isa-registry.json'), 'utf8'));
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
