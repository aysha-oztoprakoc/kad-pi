/**
 * KAD Obsidian Bridge Plugin (ESM Core)
 * Surface Profile: surface.obsidian (ISA-KAD-AESTHETIC-001, ADR 0010, ADR 0013, ADR 0014)
 *
 * Invariants:
 * 1. Read-only observer: zero authority to directly mutate canonical vault notes or derived projections.
 * 2. 100% offline & local-first: zero remote network requests, external CDN, or cloud sync.
 * 3. Epistemic 3-tier integrity: EXPLICIT_CANONICAL, DETERMINISTIC_DERIVED, HEURISTIC_SUGGESTION.
 * 4. Strict NO_AUDIO_UI and state-driven 150ms-200ms transitions (zero ambient looping animations).
 * 5. Graceful degradation: missing projections leave ordinary Obsidian Markdown editing 100% operational.
 */

import fs from 'node:fs';
import path from 'node:path';

export const PLUGIN_MANIFEST = Object.freeze({
  id: 'kad-obsidian-bridge',
  name: 'KAD Knowledge & Compute Bridge',
  version: '1.0.0',
  minAppVersion: '0.15.0',
  description: 'Canonical read-only bridge connecting Obsidian to governed KAD vault projections, Bases views, and local semantic graphs.',
  author: 'KAD Architecture',
  authorUrl: '',
  isDesktopOnly: true
});

export const KAD_OBSIDIAN_VIEWS = Object.freeze({
  BASES_VIEW: 'kad-bases-view',
  GRAPH_NEIGHBORHOOD_VIEW: 'kad-graph-neighborhood-view',
  STATE_SUMMARY_VIEW: 'kad-state-view'
});

export const OBSIDIAN_THEME_TOKENS = Object.freeze({
  canvas: '#07090e',
  panel: '#151923',
  crimson: '#1a080a',
  lift: '#1b202b',
  textCyan: '#68d5e8',
  textBone: '#e7e8e6',
  textSecondary: '#9da5b2',
  textFaint: '#515d70',
  sanctityGold: '#e7ba72',
  passGreen: '#79d69a',
  failRed: '#f05252',
  historicalPurple: '#c084fc'
});

function safeReadJson(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    return { _error: err.message };
  }
}

/**
 * Loads all compiled machine-readable projections from the derived directory.
 */
export function loadCompiledProjections(projectionsDir) {
  const errors = [];
  if (!fs.existsSync(projectionsDir)) {
    return {
      isaRegistry: null,
      isaAesthetic: null,
      isaComputeFabric: null,
      projects: null,
      workpackages: null,
      graph: null,
      technologyRegistry: null,
      research: null,
      errors: ['PROJECTIONS_DIRECTORY_NOT_FOUND']
    };
  }

  const isaRegistry = safeReadJson(path.join(projectionsDir, 'isa-registry.json'));
  if (!isaRegistry || isaRegistry._error) errors.push('MISSING_OR_CORRUPT_ISA_REGISTRY');

  const isaAesthetic = safeReadJson(path.join(projectionsDir, 'isa-aesthetic.json'));
  const isaComputeFabric = safeReadJson(path.join(projectionsDir, 'isa-compute-fabric.json'));
  
  const projects = safeReadJson(path.join(projectionsDir, 'projects.json'));
  if (!projects || projects._error) errors.push('MISSING_OR_CORRUPT_PROJECTS');

  const workpackages = safeReadJson(path.join(projectionsDir, 'workpackages.json'));
  if (!workpackages || workpackages._error) errors.push('MISSING_OR_CORRUPT_WORKPACKAGES');

  const graph = safeReadJson(path.join(projectionsDir, 'graph.json'));
  if (!graph || graph._error) errors.push('MISSING_OR_CORRUPT_GRAPH');

  const technologyRegistry = safeReadJson(path.join(projectionsDir, 'technology-registry.json'));
  const research = safeReadJson(path.join(projectionsDir, 'research.json'));

  return {
    isaRegistry,
    isaAesthetic,
    isaComputeFabric,
    projects,
    workpackages,
    graph,
    technologyRegistry,
    research,
    errors
  };
}

/**
 * Transforms compiled projections into tabular Bases viewmodels for Obsidian.
 */
export function buildBasesViewModel(projections) {
  const rawProjects = projections.projects?.projects || projections.projects?.records || [];
  const projectsTable = rawProjects.map(p => ({
    id: p.project_id || p.id || p.kad_id,
    name: p.name || p.title,
    classification: p.role || p.classification || p.kind || 'UNKNOWN',
    status: p.status || 'ACTIVE',
    path: p.canonical_note || p.canonical_path || p.path || '',
    description: p.description || ''
  }));

  const rawWps = projections.workpackages?.workpackages || projections.workpackages?.records || [];
  const workpackagesTable = rawWps.map(wp => ({
    id: wp.id || wp.kad_id,
    title: wp.title || wp.name,
    status: wp.status,
    priority: wp.priority,
    trustDomain: wp.trust_domain || 'engineering',
    evidenceTarget: wp.evidence_target || ''
  }));

  const rawIsas = projections.isaRegistry?.artifacts || projections.isaRegistry?.isas || [];
  const isaTable = rawIsas.map(isa => ({
    id: isa.id || isa.kad_id,
    title: isa.title,
    domain: isa.domain || 'aesthetic',
    status: isa.status || 'ACCEPTED',
    claimsCount: isa.claims_count !== undefined ? isa.claims_count : (isa.claims?.length || 0),
    temporalStatus: isa.temporal_status || 'CURRENT'
  }));

  const rawResearch = projections.research?.records || projections.research?.papers || [];
  const researchTable = rawResearch.map(r => ({
    id: r.id || r.kad_id,
    title: r.title,
    epistemicStatus: r.epistemic_status || r.epistemic_class || 'SOURCE_FACT',
    authors: Array.isArray(r.authors) ? r.authors.join(', ') : (r.authors || '')
  }));

  return {
    schema: 'kad-obsidian-bases-v1',
    generatedAt: new Date().toISOString(),
    projectsTable,
    workpackagesTable,
    isaTable,
    researchTable
  };
}

/**
 * Normalizes epistemic status into 3-tier presentation classification.
 */
function normalizeEpistemicTier(node) {
  const authority = node.authority || '';
  const epistemicClass = node.epistemic_class || node.epistemic_tier || node.tier || '';
  
  if (authority === 'CANONICAL_KNOWLEDGE' || epistemicClass === 'SOURCE_FACT' || epistemicClass === 'EXPLICIT_CANONICAL') {
    return 'EXPLICIT_CANONICAL';
  }
  if (epistemicClass === 'DERIVED_SYNTHESIS' || epistemicClass === 'PROJECT_INFERENCE' || epistemicClass === 'DETERMINISTIC_DERIVED') {
    return 'DETERMINISTIC_DERIVED';
  }
  return 'HEURISTIC_SUGGESTION';
}

/**
 * Builds local 1-hop or 2-hop graph neighborhood viewmodels from canonical graph projection.
 */
export function buildLocalGraphNeighborhood(graphProjection, centerNodeId, { depth = 1 } = {}) {
  if (!graphProjection || !Array.isArray(graphProjection.nodes) || !Array.isArray(graphProjection.edges)) {
    return { centerNode: null, nodes: [], edges: [], depth, error: 'INVALID_GRAPH_PROJECTION' };
  }

  const nodesById = new Map();
  for (const n of graphProjection.nodes) {
    const id = n.kad_id || n.id;
    nodesById.set(id, { ...n, id });
  }

  const centerNode = nodesById.get(centerNodeId);
  if (!centerNode) {
    return { centerNode: null, nodes: [], edges: [], depth, error: `NODE_NOT_FOUND: ${centerNodeId}` };
  }

  const includedNodeIds = new Set([centerNodeId]);
  let currentHop = new Set([centerNodeId]);

  for (let d = 0; d < depth; d++) {
    const nextHop = new Set();
    for (const edge of graphProjection.edges) {
      if (currentHop.has(edge.source)) {
        includedNodeIds.add(edge.target);
        nextHop.add(edge.target);
      }
      if (currentHop.has(edge.target)) {
        includedNodeIds.add(edge.source);
        nextHop.add(edge.source);
      }
    }
    currentHop = nextHop;
  }

  const filteredNodes = [];
  for (const id of includedNodeIds) {
    const node = nodesById.get(id);
    if (node) {
      const epistemicTier = normalizeEpistemicTier(node);
      const cssClass = `tier-${String(epistemicTier).toLowerCase().replace(/_/g, '-')}`;
      filteredNodes.push({
        id: node.id,
        label: node.title || node.label || node.id,
        type: node.type || node.class || 'UNKNOWN',
        epistemicTier,
        cssClass,
        path: node.path || ''
      });
    }
  }

  const filteredEdges = graphProjection.edges
    .filter(e => includedNodeIds.has(e.source) && includedNodeIds.has(e.target))
    .map(e => ({
      id: e.id || `${e.source}->${e.target}`,
      source: e.source,
      target: e.target,
      type: e.relation || e.type || 'REFERENCES',
      label: e.label || e.relation || e.type || ''
    }));

  return {
    centerNode: {
      id: centerNode.id,
      label: centerNode.title || centerNode.label || centerNode.id,
      type: centerNode.type || centerNode.class || 'UNKNOWN'
    },
    depth,
    nodes: filteredNodes,
    edges: filteredEdges
  };
}

/**
 * Creates structured degraded status object when projections are missing or corrupt.
 */
export function createDegradedBridgeState(projectionsOrErrors) {
  const errors = Array.isArray(projectionsOrErrors?.errors) ? projectionsOrErrors.errors : ['UNKNOWN_ERROR'];
  if (errors.length === 0) {
    return {
      status: 'HEALTHY',
      markdownEditingIntact: true,
      message: 'All projections loaded and synchronized.'
    };
  }

  const isTotal = errors.includes('PROJECTIONS_DIRECTORY_NOT_FOUND');
  return {
    status: isTotal ? 'DEGRADED' : 'PARTIAL',
    markdownEditingIntact: true,
    errors,
    message: isTotal
      ? 'KAD projections unavailable. Markdown editing remains 100% operational in native Obsidian.'
      : 'Some KAD projections are missing or stale. Available subsystems remain functional.',
    degradedAt: new Date().toISOString()
  };
}

/**
 * Main Obsidian Plugin Implementation
 */
export class KadObsidianBridgePlugin {
  constructor(app, manifest = PLUGIN_MANIFEST, options = {}) {
    this.app = app;
    this.manifest = manifest;
    this.repoRoot = options.repoRoot || process.cwd();
    this.projectionsDir = path.join(this.repoRoot, 'vault/90_Derived/Projections');
    this.isLoaded = false;
    this.activeSubscriptions = [];
    this.cachedProjections = null;
  }

  onload() {
    this.isLoaded = true;
    this.cachedProjections = loadCompiledProjections(this.projectionsDir);

    // Register custom Obsidian views
    if (this.app?.workspace?.registerView) {
      this.app.workspace.registerView(KAD_OBSIDIAN_VIEWS.BASES_VIEW, (leaf) => this.createBasesView(leaf));
      this.app.workspace.registerView(KAD_OBSIDIAN_VIEWS.GRAPH_NEIGHBORHOOD_VIEW, (leaf) => this.createGraphView(leaf));
      this.app.workspace.registerView(KAD_OBSIDIAN_VIEWS.STATE_SUMMARY_VIEW, (leaf) => this.createStateView(leaf));
    }

    this.activeSubscriptions.push({ id: 'projections-cache', active: true });
  }

  onunload() {
    this.isLoaded = false;
    this.cachedProjections = null;
    this.activeSubscriptions = [];

    if (this.app?.workspace?.unregisterView) {
      this.app.workspace.unregisterView(KAD_OBSIDIAN_VIEWS.BASES_VIEW);
      this.app.workspace.unregisterView(KAD_OBSIDIAN_VIEWS.GRAPH_NEIGHBORHOOD_VIEW);
      this.app.workspace.unregisterView(KAD_OBSIDIAN_VIEWS.STATE_SUMMARY_VIEW);
    }
  }

  getProjections() {
    if (!this.cachedProjections) {
      this.cachedProjections = loadCompiledProjections(this.projectionsDir);
    }
    return this.cachedProjections;
  }

  getBasesViewModel() {
    const projections = this.getProjections();
    return buildBasesViewModel(projections);
  }

  getGraphNeighborhood(centerNodeId, options) {
    const projections = this.getProjections();
    if (!projections.graph) {
      return { error: 'GRAPH_PROJECTION_UNAVAILABLE', nodes: [], edges: [] };
    }
    return buildLocalGraphNeighborhood(projections.graph, centerNodeId, options);
  }

  createBasesView(leaf) {
    return {
      getViewType: () => KAD_OBSIDIAN_VIEWS.BASES_VIEW,
      getDisplayText: () => 'KAD Bases View',
      getIcon: () => 'table',
      render: () => this.getBasesViewModel()
    };
  }

  createGraphView(leaf) {
    return {
      getViewType: () => KAD_OBSIDIAN_VIEWS.GRAPH_NEIGHBORHOOD_VIEW,
      getDisplayText: () => 'KAD Graph Neighborhood',
      getIcon: () => 'git-branch',
      render: (nodeId) => this.getGraphNeighborhood(nodeId)
    };
  }

  createStateView(leaf) {
    return {
      getViewType: () => KAD_OBSIDIAN_VIEWS.STATE_SUMMARY_VIEW,
      getDisplayText: () => 'KAD State Overview',
      getIcon: () => 'activity',
      render: () => createDegradedBridgeState(this.getProjections())
    };
  }

  /**
   * Pure proposal generator for formatted markdown links.
   * Strictly read-only: does not write to vault files.
   */
  proposeWikiLink(kadId, label) {
    const linkMap = {
      'kad-home': '00_Home/Home',
      'kad-navigation': '00_Home/Navigation',
      'kad-pi-overview': '50_Projects/KAD-PI/Overview/KAD-PI-Overview',
      'kad-current-architecture': '50_Projects/KAD-PI/Architecture/Current-Architecture'
    };
    const targetPath = linkMap[kadId] || kadId;
    return `[[${targetPath}|${label || kadId}]]`;
  }
}
