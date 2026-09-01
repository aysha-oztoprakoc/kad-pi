/**
 * KAD Architecture Complexity Telemetry Analyzer
 *
 * Derives project-level structural complexity proxies to detect architecture creep,
 * incomprehensibility, and excessive state synchronization burden.
 *
 * Invariant: These are deterministic structural proxies, not a mathematical comprehensibility scalar.
 */

import fs from 'node:fs';
import path from 'node:path';

export function analyzeArchitectureComplexity(cwd = process.cwd()) {
  const stores = [];
  const daemons = [];
  const databases = [];
  const providerAdapters = [];
  const schemas = [];
  const cliSurfaces = [];
  const manualSyncEdges = [];

  // 1. Authoritative Stores
  const vaultDir = path.join(cwd, 'vault');
  if (fs.existsSync(vaultDir)) {
    stores.push({ id: 'store:vault', name: 'Obsidian Canonical Knowledge Vault', path: 'vault/' });
  }

  const workDir = path.join(cwd, '.agents', 'work');
  if (fs.existsSync(workDir)) {
    stores.push({ id: 'store:workctl', name: 'Workctl Distributed Task Ledger', path: '.agents/work/' });
  }

  const intentDir = path.join(cwd, 'evidence', 'intent');
  if (fs.existsSync(intentDir) || fs.existsSync(path.join(cwd, 'tools', 'kad', 'intent'))) {
    stores.push({ id: 'store:intent-journal', name: 'Intent Fidelity Decision Journal', path: 'evidence/intent/' });
  }

  const gitDir = path.join(cwd, '.git');
  if (fs.existsSync(gitDir)) {
    stores.push({ id: 'store:git', name: 'Git Repository Object Store', path: '.git/' });
  }

  // 2. Persistent Databases
  const findDbFiles = (dir, depth = 0) => {
    if (depth > 3 || !fs.existsSync(dir)) return;
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name === 'node_modules' || entry.name === '.git') continue;
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          findDbFiles(full, depth + 1);
        } else if (entry.isFile() && (entry.name.endsWith('.sqlite') || entry.name.endsWith('.sqlite3') || entry.name.endsWith('.db'))) {
          databases.push({ id: `db:${entry.name}`, path: path.relative(cwd, full) });
        }
      }
    } catch {}
  };
  findDbFiles(cwd);

  // 3. Persistent Daemons / Services
  const interfaceServer = path.join(cwd, 'tools', 'kad', 'interface-server.mjs');
  if (fs.existsSync(interfaceServer)) {
    daemons.push({ id: 'daemon:kad-interface-server', name: 'KAD Live Interface HTTP/SSE Server', port: 4173 });
  }

  // 4. Provider Adapters
  const providerAdapterFile = path.join(cwd, 'tools', 'kad', 'telemetry', 'provider-adapters.mjs');
  if (fs.existsSync(providerAdapterFile)) {
    providerAdapters.push({ id: 'adapter:omp-providers', name: 'OMP Native Provider Adapter (Codex, Antigravity, OMP)' });
  }
  const zoteroAdapter = path.join(cwd, 'tools', 'kad', 'research-zotero.mjs');
  if (fs.existsSync(zoteroAdapter)) {
    providerAdapters.push({ id: 'adapter:zotero', name: 'Zotero Read-Only Local API Adapter' });
  }
  const openVikingAdapter = path.join(cwd, 'tools', 'kad', 'research-openviking.mjs');
  if (fs.existsSync(openVikingAdapter)) {
    providerAdapters.push({ id: 'adapter:openviking', name: 'OpenViking Research Engine Adapter' });
  }
  const localInferenceAdapter = path.join(cwd, 'tools', 'kad', 'local-inference-capability.mjs');
  if (fs.existsSync(localInferenceAdapter)) {
    providerAdapters.push({ id: 'adapter:local-qwen', name: 'Local Qwen STC Inference Adapter' });
  }

  // 5. Schemas
  const knownSchemas = [
    { id: 'schema:kad-telemetry-v1', name: 'KAD Control Plane & Quota Telemetry Schema' },
    { id: 'schema:kad-outcome-cost-telemetry-v1', name: 'KAD Outcome & Total Cost Telemetry Schema' },
    { id: 'schema:kad-shadow-observation-v1', name: 'KAD Counterfactual Shadow Observation Schema' },
    { id: 'schema:kad-intent-event-v1', name: 'KAD Intent Event & Normalization Schema' },
    { id: 'schema:kad-isa-v1', name: 'KAD Ideal State Artifact Schema' },
    { id: 'schema:workctl-task-v1', name: 'Workctl Task & Claim Contract Schema' },
    { id: 'schema:kad-workload-contract-v1', name: 'KAD Workload Neutrality Contract Schema' },
    { id: 'schema:kad-role-contract-v1', name: 'KAD Role & Capability Contract Schema' },
  ];
  for (const s of knownSchemas) {
    schemas.push(s);
  }

  // 6. Mandatory CLI Surfaces
  const binDir = path.join(cwd, 'bin');
  if (fs.existsSync(binDir)) {
    const entries = fs.readdirSync(binDir);
    for (const entry of entries) {
      if (!entry.startsWith('.')) {
        cliSurfaces.push({ id: `cli:${entry}`, command: `bin/${entry}` });
      }
    }
  }

  // 7. Manual Sync Edges
  manualSyncEdges.push(
    { id: 'sync:vault-projection', description: 'Canonical Vault to Derived Markdown Projections' },
    { id: 'sync:intent-fidelity', description: 'Intent Event Journal to Alignment Reports' },
    { id: 'sync:isa-projections', description: 'ISA Markdown Documents to Derived JSON Projections' },
    { id: 'sync:historical-telemetry', description: 'Historical Workpackage Receipts to Reconstructed Telemetry' },
  );

  return {
    authoritative_store_count: stores.length,
    persistent_daemon_count: daemons.length,
    persistent_database_count: databases.length,
    provider_adapter_count: providerAdapters.length,
    schema_count: schemas.length,
    mandatory_cli_surface_count: cliSurfaces.length,
    manual_sync_edge_count: manualSyncEdges.length,
    details: {
      stores,
      daemons,
      databases,
      provider_adapters: providerAdapters,
      schemas,
      cli_surfaces: cliSurfaces,
      manual_sync_edges: manualSyncEdges,
    },
    provenance: {
      evaluated_at: new Date().toISOString(),
      origin_class: 'DERIVED_DETERMINISTIC',
      collector: 'kad-complexity-analyzer-v1',
    },
  };
}
