import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '../../..');

// Import plugin modules
import {
  PLUGIN_MANIFEST,
  KAD_OBSIDIAN_VIEWS,
  KadObsidianBridgePlugin,
  loadCompiledProjections,
  buildBasesViewModel,
  buildLocalGraphNeighborhood,
  createDegradedBridgeState,
  OBSIDIAN_THEME_TOKENS
} from '../obsidian-bridge/index.mjs';

test('WP-016: Plugin manifest conforms to canonical Obsidian specifications', () => {
  assert.equal(PLUGIN_MANIFEST.id, 'kad-obsidian-bridge');
  assert.equal(PLUGIN_MANIFEST.name, 'KAD Knowledge & Compute Bridge');
  assert.equal(PLUGIN_MANIFEST.version, '1.0.0');
  assert.equal(PLUGIN_MANIFEST.minAppVersion, '0.15.0');
  assert.equal(PLUGIN_MANIFEST.isDesktopOnly, true);
  assert.ok(PLUGIN_MANIFEST.description.includes('read-only'));

  const manifestPath = path.join(repoRoot, 'tools/kad/obsidian-bridge/manifest.json');
  assert.ok(fs.existsSync(manifestPath), 'manifest.json must exist in tools/kad/obsidian-bridge/');
  const onDiskManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert.deepEqual(onDiskManifest, PLUGIN_MANIFEST);
});

test('WP-016: Plugin class registers custom views and manages lifecycle with clean teardown', () => {
  const registeredViews = new Map();

  const mockApp = {
    vault: {
      adapter: {
        read: async (filePath) => {
          const abs = path.resolve(repoRoot, filePath);
          return fs.readFileSync(abs, 'utf8');
        },
        exists: async (filePath) => {
          const abs = path.resolve(repoRoot, filePath);
          return fs.existsSync(abs);
        }
      },
      getName: () => 'KAD-Vault'
    },
    workspace: {
      registerView: (type, viewCreator) => {
        registeredViews.set(type, viewCreator);
      },
      unregisterView: (type) => {
        registeredViews.delete(type);
      }
    }
  };

  const plugin = new KadObsidianBridgePlugin(mockApp, PLUGIN_MANIFEST, { repoRoot });

  assert.equal(plugin.isLoaded, false);
  plugin.onload();
  assert.equal(plugin.isLoaded, true);

  // Check registered views
  assert.ok(registeredViews.has(KAD_OBSIDIAN_VIEWS.BASES_VIEW));
  assert.ok(registeredViews.has(KAD_OBSIDIAN_VIEWS.GRAPH_NEIGHBORHOOD_VIEW));
  assert.ok(registeredViews.has(KAD_OBSIDIAN_VIEWS.STATE_SUMMARY_VIEW));

  // Teardown
  plugin.onunload();
  assert.equal(plugin.isLoaded, false);
  assert.equal(plugin.activeSubscriptions.length, 0);
});

test('WP-016: Read-only invariant: plugin operates as observer with zero vault mutation methods', () => {
  const plugin = new KadObsidianBridgePlugin({}, PLUGIN_MANIFEST, { repoRoot });

  // Verify no mutation methods exist on plugin prototype
  const prototypeMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(plugin));
  const forbiddenPatterns = ['write', 'modify', 'delete', 'update', 'append', 'mutate', 'createNote', 'patch'];
  
  for (const method of prototypeMethods) {
    for (const forbidden of forbiddenPatterns) {
      assert.ok(
        !method.toLowerCase().includes(forbidden.toLowerCase()),
        `Forbidden mutation method found on Obsidian bridge plugin: ${method}`
      );
    }
  }

  // Pure link proposal generator does not mutate disk
  const proposal = plugin.proposeWikiLink('kad-pi-overview', 'KAD-PI Overview');
  assert.equal(proposal, '[[50_Projects/KAD-PI/Overview/KAD-PI-Overview|KAD-PI Overview]]');
});

test('WP-016: Multi-ISA projection discovery and Bases viewmodel aggregation', () => {
  const projections = loadCompiledProjections(path.join(repoRoot, 'vault/90_Derived/Projections'));

  assert.ok(projections.isaRegistry, 'isaRegistry must load');
  assert.ok(projections.projects, 'projects must load');
  assert.ok(projections.workpackages, 'workpackages must load');
  assert.ok(projections.graph, 'graph must load');

  const basesModel = buildBasesViewModel(projections);

  // Projects table viewmodel
  assert.ok(Array.isArray(basesModel.projectsTable));
  assert.ok(basesModel.projectsTable.length > 0);
  const kadPi = basesModel.projectsTable.find(p => p.id === 'kad-pi' || p.name === 'KAD-PI');
  assert.ok(kadPi, 'KAD-PI must be in projects table');
  assert.equal(kadPi.classification, 'CORE');

  // Workpackages table viewmodel
  assert.ok(Array.isArray(basesModel.workpackagesTable));
  assert.ok(basesModel.workpackagesTable.length > 0);

  // ISA registry table viewmodel
  assert.ok(Array.isArray(basesModel.isaTable));
  assert.ok(basesModel.isaTable.some(isa => isa.id === 'ISA-KAD-AESTHETIC-001'));
  assert.ok(basesModel.isaTable.some(isa => isa.id === 'ISA-KAD-COMPUTE-FABRIC-001'));
});

test('WP-016: 1-hop and 2-hop local graph neighborhood extraction for Obsidian sidebar', () => {
  const projections = loadCompiledProjections(path.join(repoRoot, 'vault/90_Derived/Projections'));
  assert.ok(projections.graph);

  // 1-hop neighborhood for kad-home note
  const neighborhood1Hop = buildLocalGraphNeighborhood(projections.graph, 'kad-home', { depth: 1 });
  assert.ok(neighborhood1Hop.centerNode);
  assert.equal(neighborhood1Hop.centerNode.id, 'kad-home');
  assert.ok(neighborhood1Hop.nodes.length > 1);
  assert.ok(neighborhood1Hop.edges.length > 0);

  // 2-hop neighborhood expands scope deterministically
  const neighborhood2Hop = buildLocalGraphNeighborhood(projections.graph, 'kad-home', { depth: 2 });
  assert.ok(neighborhood2Hop.nodes.length >= neighborhood1Hop.nodes.length);

  // Check epistemic tier tagging on neighborhood nodes
  for (const node of neighborhood1Hop.nodes) {
    assert.ok(['EXPLICIT_CANONICAL', 'DETERMINISTIC_DERIVED', 'HEURISTIC_SUGGESTION'].includes(node.epistemicTier));
    assert.ok(node.cssClass.startsWith('tier-'));
  }
});

test('WP-016: surface.obsidian theme tokens, WCAG AAA contrast (>14:1 for bone, >10:1 for cyan), and zero ambient loops', () => {
  // Check token definitions
  assert.equal(OBSIDIAN_THEME_TOKENS.canvas, '#07090e');
  assert.equal(OBSIDIAN_THEME_TOKENS.panel, '#151923');
  assert.equal(OBSIDIAN_THEME_TOKENS.crimson, '#1a080a');
  assert.equal(OBSIDIAN_THEME_TOKENS.textCyan, '#68d5e8');
  assert.equal(OBSIDIAN_THEME_TOKENS.textBone, '#e7e8e6');
  assert.equal(OBSIDIAN_THEME_TOKENS.sanctityGold, '#e7ba72');

  // Verify contrast mathematically: (L1 + 0.05) / (L2 + 0.05)
  function relativeLuminance(hex) {
    const rgb = hex.replace('#', '').match(/.{2}/g).map(x => parseInt(x, 16) / 255);
    const [r, g, b] = rgb.map(c => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  function contrastRatio(hex1, hex2) {
    const l1 = relativeLuminance(hex1);
    const l2 = relativeLuminance(hex2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  // Cyan on canvas/panel/crimson (> 10:1)
  const cyanCanvasContrast = contrastRatio(OBSIDIAN_THEME_TOKENS.textCyan, OBSIDIAN_THEME_TOKENS.canvas);
  const cyanCrimsonContrast = contrastRatio(OBSIDIAN_THEME_TOKENS.textCyan, OBSIDIAN_THEME_TOKENS.crimson);
  const boneCanvasContrast = contrastRatio(OBSIDIAN_THEME_TOKENS.textBone, OBSIDIAN_THEME_TOKENS.canvas);

  assert.ok(cyanCanvasContrast > 10.0, `Cyan on Canvas contrast ${cyanCanvasContrast.toFixed(2)} must exceed 10:1`);
  assert.ok(cyanCrimsonContrast > 10.0, `Cyan on Crimson contrast ${cyanCrimsonContrast.toFixed(2)} must exceed 10:1`);
  assert.ok(boneCanvasContrast > 14.0, `Bone on Canvas contrast ${boneCanvasContrast.toFixed(2)} must exceed 14:1`);

  // Verify styles.css
  const stylesPath = path.join(repoRoot, 'tools/kad/obsidian-bridge/styles.css');
  assert.ok(fs.existsSync(stylesPath), 'styles.css must exist');
  const stylesContent = fs.readFileSync(stylesPath, 'utf8');

  // No ambient animation loops in CSS rules
  const hasInfiniteAnimation = /animation:\s*[^;]*infinite/i.test(stylesContent);
  assert.ok(!hasInfiniteAnimation, 'styles.css must not contain infinite looping animation rules');
  // State-driven transition duration
  assert.ok(stylesContent.includes('150ms') || stylesContent.includes('200ms'));
});

test('WP-016: NO_AUDIO_UI and 100% offline local-first operation verified', () => {
  const pluginDir = path.join(repoRoot, 'tools/kad/obsidian-bridge');
  const files = fs.readdirSync(pluginDir).filter(f => f.endsWith('.js') || f.endsWith('.mjs'));

  for (const file of files) {
    const content = fs.readFileSync(path.join(pluginDir, file), 'utf8');
    
    // Strict NO_AUDIO_UI
    assert.ok(!content.includes('Audio('), `Audio API must not be referenced in ${file}`);
    assert.ok(!content.includes('HTMLAudioElement'), `HTMLAudioElement must not be referenced in ${file}`);
    assert.ok(!content.includes('webkitAudioContext'), `AudioContext must not be referenced in ${file}`);

    // Strict Offline / Local-first
    assert.ok(!content.includes('fetch('), `fetch() must not be used in offline bridge: ${file}`);
    assert.ok(!content.includes('XMLHttpRequest'), `XHR must not be used in offline bridge: ${file}`);
    assert.ok(!content.includes('WebSocket'), `WebSocket must not be used in offline bridge: ${file}`);
    assert.ok(!content.includes('http://') && !content.includes('https://'), `Remote URLs forbidden in ${file}`);
  }
});

test('WP-016: Graceful degradation on missing or corrupted projection data', () => {
  // Empty directory / missing projections
  const emptyProjections = loadCompiledProjections(path.join(repoRoot, 'nonexistent-directory'));
  assert.deepEqual(emptyProjections.errors, ['PROJECTIONS_DIRECTORY_NOT_FOUND']);
  
  const degradedState = createDegradedBridgeState(emptyProjections);
  assert.equal(degradedState.status, 'DEGRADED');
  assert.ok(degradedState.message.includes('Markdown editing remains 100% operational'));
  assert.equal(degradedState.markdownEditingIntact, true);

  // Partial projections
  const partialProjections = {
    isaRegistry: null,
    projects: { records: [] },
    workpackages: null,
    graph: null,
    errors: ['MISSING_ISA_REGISTRY']
  };
  const partialState = createDegradedBridgeState(partialProjections);
  assert.equal(partialState.status, 'PARTIAL');
});
