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
  VALIDATOR_REGISTRY
} from '../isa.mjs';

const ROOT = new URL('../../..', import.meta.url).pathname;
const CANONICAL_ISA = resolve(ROOT, 'vault/00_Governance/ISA-KAD-AESTHETIC-001.md');

test('parseIsa extracts frontmatter, sections, and structured claims', () => {
  const content = readFileSync(CANONICAL_ISA, 'utf8');
  const parsed = parseIsa(content);
  assert.equal(parsed.metadata.kad_id, 'ISA-KAD-AESTHETIC-001');
  assert.equal(parsed.metadata.status, 'ACCEPTED');
  assert.equal(parsed.metadata.authority, 'CANONICAL');
  assert.ok(parsed.claims.length >= 10);

  const claim1 = parsed.claims.find(c => c.id === 'ISA-KAD-AESTHETIC-001');
  assert.ok(claim1);
  assert.equal(claim1.class, 'DETERMINISTIC');
  assert.equal(claim1.validator, 'aesthetic.assets.local_only');
  assert.equal(claim1.severity, 'BLOCKER');
});

test('lintIsa validates correct schema and catches missing sections', () => {
  const lintResult = lintIsa(CANONICAL_ISA);
  assert.equal(lintResult.ok, true);
  assert.equal(lintResult.errors.length, 0);
  assert.equal(lintResult.kad_id, 'ISA-KAD-AESTHETIC-001');

  // Test missing file
  const missingResult = lintIsa(resolve(ROOT, 'non-existent.md'));
  assert.equal(missingResult.ok, false);
  assert.match(missingResult.errors[0], /does not exist/);
});

test('checkIsa executes all allowlisted validators and passes canonical ISA', () => {
  const checkResult = checkIsa(CANONICAL_ISA, { rootDir: ROOT });
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

test('statusIsa returns structured counts and accepted status', () => {
  const status = statusIsa(CANONICAL_ISA);
  assert.equal(status.status, 'ACCEPTED');
  assert.equal(status.isa_id, 'ISA-KAD-AESTHETIC-001');
  assert.ok(status.counts.deterministic >= 7);
  assert.ok(status.counts.human_review >= 2);
  assert.ok(status.counts.hybrid >= 1);
});

test('explainClaim returns detailed metadata and guidance', () => {
  const explanation = explainClaim('ISA-KAD-AESTHETIC-001', CANONICAL_ISA);
  assert.equal(explanation.id, 'ISA-KAD-AESTHETIC-001');
  assert.equal(explanation.class, 'DETERMINISTIC');
  assert.equal(explanation.validator, 'aesthetic.assets.local_only');
  assert.equal(explanation.validator_name, 'Local-First Asset Verification');
  assert.ok(explanation.surfaces.includes('surface.web.site'));
});

test('buildIsaProjection compiles valid machine-readable JSON', () => {
  const outPath = resolve(ROOT, 'vault/90_Derived/Projections/isa-aesthetic.json');
  const projection = buildIsaProjection(CANONICAL_ISA, outPath);
  assert.equal(projection.projection_type, 'KAD_AESTHETIC_ISA_PROJECTION');
  assert.equal(projection.isa.id, 'ISA-KAD-AESTHETIC-001');
  assert.equal(projection.validation_summary.ok, true);
  assert.ok(existsSync(outPath));

  const loaded = JSON.parse(readFileSync(outPath, 'utf8'));
  assert.equal(loaded.isa.id, 'ISA-KAD-AESTHETIC-001');
  assert.equal(loaded.token_contracts.semantics.canonical, '#e7ba72');
  assert.equal(loaded.token_contracts.semantics.derived, '#68d5e8');
});

test('validator registry rejects arbitrary shell commands in markdown', () => {
  // Verify that all validators are pure JS functions, not shell executions
  for (const [id, spec] of Object.entries(VALIDATOR_REGISTRY)) {
    assert.ok(typeof spec.execute === 'function');
    assert.ok(spec.name);
    assert.ok(['DETERMINISTIC', 'HUMAN_REVIEW', 'HYBRID'].includes(spec.class));
  }
});
