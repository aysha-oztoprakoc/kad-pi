import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { migrationManifest, stableKadId, executeMigration } from '../wiki/migration.mjs';

test('migration inventories every legacy artifact with provenance and stable identity', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'kad-vault-'));
  const legacy = fs.mkdtempSync(path.join(os.tmpdir(), 'kad-wiki-'));
  fs.mkdirSync(path.join(legacy, 'generated'), { recursive: true });
  fs.mkdirSync(path.join(legacy, 'synthetic'), { recursive: true });
  fs.writeFileSync(path.join(legacy, 'KAD_Project.md'), '# Project\n');
  fs.writeFileSync(path.join(legacy, 'generated', 'index.md'), '# Generated\n');
  fs.writeFileSync(path.join(legacy, 'synthetic', 'fixture.md'), '# Fixture\n');
  const first = migrationManifest({ root, legacyRoot: legacy });
  const second = migrationManifest({ root, legacyRoot: legacy });
  assert.equal(first.entries.length, 3);
  assert.deepEqual(first.entries, second.entries);
  assert.equal(first.entries.every((entry) => entry.hash && entry.canonical_id && entry.destination && entry.evidence.length === 1), true);
  assert.equal(first.entries.find((entry) => entry.old_path.startsWith('generated/')).classification, 'DERIVED_ONLY');
  assert.equal(first.entries.find((entry) => entry.old_path.startsWith('synthetic/')).classification, 'ARCHIVE');
  const project = first.entries.find((entry) => entry.old_path === 'KAD_Project.md');
  assert.equal(stableKadId(project.hash), project.canonical_id);
});

test('executeMigration physically transfers MIGRATE_CANONICAL, creates review records, and archives synthetic material', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'kad-vault-'));
  const legacy = fs.mkdtempSync(path.join(os.tmpdir(), 'kad-wiki-'));
  fs.mkdirSync(path.join(legacy, 'generated'), { recursive: true });
  fs.mkdirSync(path.join(legacy, 'synthetic'), { recursive: true });
  fs.writeFileSync(path.join(legacy, 'KAD_Usage_Bridge_2026-08-30.md'), '# Usage Bridge\nUsage details');
  fs.writeFileSync(path.join(legacy, 'KAD_Implementation_Plan.md'), '# Implementation Plan\nPlan details');
  fs.writeFileSync(path.join(legacy, 'generated', 'index.md'), '# Generated\n');
  fs.writeFileSync(path.join(legacy, 'synthetic', 'fixture.md'), '# Fixture\n');
  const res = executeMigration({ root, legacyRoot: legacy });
  assert.equal(res.migrated, 1);
  assert.equal(res.review, 1);
  assert.equal(res.derived, 1);
  assert.equal(res.archive, 1);
  assert.equal(fs.existsSync(path.join(root, '50_Projects/KAD-PI/Workpackages/KAD_Usage_Bridge_2026-08-30.md')), true);
  assert.equal(fs.existsSync(path.join(root, '80_Review/Pending/legacy-kad_implementation_plan.md.md')), true);
  assert.equal(fs.existsSync(path.join(root, '99_Archive/LegacyWiki/synthetic/fixture.md')), true);
  assert.equal(fs.existsSync(path.join(root, '90_Derived/LegacyWiki/generated/index.md')), true);
});
