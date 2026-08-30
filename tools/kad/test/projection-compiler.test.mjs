import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

import {
  compileProjections,
  exportProjectGraph,
  exportProjectStatus,
  exportWorkpackages,
  exportResearchIndex,
  compileRepoDocs,
  compileReadme,
  compileWebsiteState,
  compileSofiaAdapter,
  isProjectionFresh,
  sofiaDeviationReport,
  exportTechnologyRegistry
} from '../wiki/projection.mjs';
import { revision, ensureVault, lintVault } from '../wiki/index.mjs';

function tmpVault() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'kad-vault-proj-'));
  ensureVault(root);
  // Add a sample canonical note
  fs.writeFileSync(path.join(root, '50_Projects', 'sample.md'), `---
kad_id: kad-sample-note
title: Sample Architecture Note
type: architecture
authority: CANONICAL_KNOWLEDGE
epistemic_class: PROJECT_INFERENCE
review_status: APPROVED
visibility: public
publish: true
context_eligible: true
train_eligible: false
temporal_status: CURRENT
---

# Sample Architecture Note

See [[../00_Home/Home|Home]].
`);
  return root;
}

test('Projection Compiler: exports graph.json with explicit nodes and edges from vault', () => {
  const root = tmpVault();
  const graph = exportProjectGraph({ root });
  assert.ok(Array.isArray(graph.nodes));
  assert.ok(Array.isArray(graph.edges));
  const sampleNode = graph.nodes.find(n => n.kad_id === 'kad-sample-note');
  assert.ok(sampleNode, 'sample note must appear as graph node');
  assert.equal(sampleNode.title, 'Sample Architecture Note');
  assert.equal(sampleNode.type, 'architecture');
  assert.equal(sampleNode.temporal_status, 'CURRENT');

  const edge = graph.edges.find(e => e.source === 'kad-sample-note');
  assert.ok(edge, 'explicit wikilink must produce edge');
  assert.equal(edge.relation, 'REFERENCES');
});

test('Projection Compiler: exports projects.json with ecosystem project classifications', () => {
  const root = tmpVault();
  const projects = exportProjectStatus({ root });
  assert.ok(Array.isArray(projects.projects));
  const kadPi = projects.projects.find(p => p.project_id === 'kad-pi');
  assert.ok(kadPi);
  assert.equal(kadPi.role, 'CORE');
  assert.equal(kadPi.status, 'ACTIVE');
});

test('Projection Compiler: exports workpackages.json with complete reconciled WPs', () => {
  const root = tmpVault();
  const wps = exportWorkpackages({ root });
  assert.ok(Array.isArray(wps.workpackages));
  assert.ok(wps.workpackages.length >= 10);
  const wp010 = wps.workpackages.find(w => w.wp_id === 'WP-KAD-VAULT-WIKI-UNIFICATION-010');
  assert.ok(wp010);
  assert.equal(wp010.status, 'ACCEPTED');
});

test('Projection Compiler: exports research.json with approved research bibliographic metadata', () => {
  const root = tmpVault();
  const research = exportResearchIndex({ root });
  assert.ok(Array.isArray(research.corpus));
  assert.ok(research.corpus.length >= 5);
  const toolformer = research.corpus.find(c => c.id === 'toolformer-schick-2023');
  assert.ok(toolformer);
  assert.ok(toolformer.doi || toolformer.arxiv);
  assert.equal(toolformer.epistemic_verification, 'SOURCE_FACT_VERIFIED');
});

test('Projection Compiler: generates repository docs in docs/generated/ with provenance manifest', () => {
  const root = tmpVault();
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kad-docs-'));
  const manifest = compileRepoDocs({ root, outputDir: outDir });
  assert.ok(manifest.source_vault_revision);
  assert.ok(fs.existsSync(path.join(outDir, 'README.md')));
  assert.ok(fs.existsSync(path.join(outDir, 'manifest.json')));
  const content = fs.readFileSync(path.join(outDir, 'README.md'), 'utf8');
  assert.match(content, /Derived from Canonical Vault/i);
});

test('Projection Compiler: generates root README.md distinguishing CURRENT, EXPERIMENTAL, PLANNED', () => {
  const root = tmpVault();
  const readme = compileReadme({ root });
  assert.match(readme, /# KAD-PI/);
  assert.match(readme, /## Current Architecture/);
  assert.match(readme, /## Status/);
  assert.ok(!readme.includes('sk-ant-'), 'no API keys');
});

test('Projection Compiler: website public filter fails closed on unapproved/private/review/governance notes', () => {
  const root = tmpVault();
  // Add private and unreviewed notes
  fs.writeFileSync(path.join(root, '50_Projects', 'private.md'), `---
kad_id: kad-private-note
title: Private Note
type: secret
authority: CANONICAL_KNOWLEDGE
epistemic_class: SOURCE_FACT
review_status: APPROVED
visibility: private
publish: false
context_eligible: false
train_eligible: false
temporal_status: CURRENT
---
Secret info.
`);
  const webState = compileWebsiteState({ root });
  assert.ok(webState.records.some(r => r.kad_id === 'kad-sample-note'));
  assert.ok(!webState.records.some(r => r.kad_id === 'kad-private-note'), 'private note must be excluded');
  assert.ok(!webState.records.some(r => r.path?.startsWith('00_Governance/')), 'governance raw files excluded from public site records');
  assert.ok(!webState.records.some(r => r.path?.startsWith('80_Review/')), 'review notes excluded from public site records');
});

test('Projection Compiler: Sofia v3 adapter retains complete provenance and detects stale revision', () => {
  const root = tmpVault();
  const sofiaData = compileSofiaAdapter({ root });
  assert.ok(sofiaData.records.length > 0);
  const sample = sofiaData.records.find(r => r.kad_id === 'kad-sample-note');
  assert.ok(sample);
  assert.equal(sample.authority, 'CANONICAL_KNOWLEDGE');
  assert.equal(sample.epistemic_class, 'PROJECT_INFERENCE');
  assert.equal(sample.temporal_status, 'CURRENT');
  assert.ok(sample.canonical_hash);
  assert.equal(sample.vault_revision, revision(root));

  assert.equal(isProjectionFresh(sofiaData, root), true);

  // Mutate vault -> should become stale
  fs.appendFileSync(path.join(root, '50_Projects', 'sample.md'), '\n# Update\n');
  assert.equal(isProjectionFresh(sofiaData, root), false);
});

test('Projection Compiler: Sofia deviation report classifies subsystems accurately', () => {
  const report = sofiaDeviationReport();
  assert.ok(report.deviations.length >= 4);
  assert.ok(report.deviations.some(d => d.subsystem === 'Storage & Persistence' && d.classification === 'ADAPTER_REQUIRED'));
  assert.ok(report.deviations.some(d => d.subsystem === 'Knowledge Model' && d.classification === 'DIRECT_COMPAT'));
});

test('Projection Compiler: exports technology-registry.json with classified tech stack decisions', () => {
  const registry = exportTechnologyRegistry();
  assert.equal(registry.schema, 'kad-technology-registry-v1');
  assert.ok(Array.isArray(registry.technologies));
  assert.ok(registry.technologies.length >= 8);

  const nodeEsm = registry.technologies.find(t => t.id === 'node-esm');
  assert.ok(nodeEsm);
  assert.equal(nodeEsm.decision, 'KEEP');

  const cytoscape = registry.technologies.find(t => t.id === 'cytoscape-js');
  assert.ok(cytoscape);
  assert.equal(cytoscape.decision, 'ADOPT');

  const echarts = registry.technologies.find(t => t.id === 'apache-echarts');
  assert.ok(echarts);
  assert.equal(echarts.decision, 'ADOPT');

  const vega = registry.technologies.find(t => t.id === 'vega-lite');
  assert.ok(vega);
  assert.equal(vega.decision, 'EXPERIMENTAL');
});
