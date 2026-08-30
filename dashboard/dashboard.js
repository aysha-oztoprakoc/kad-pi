import { applyStaleness, createRuntimeStatus, runtimeTransition, validateRuntimeStatus } from '../tools/kad/runtime-status.mjs';
import { displayDate, escapeHtml, loadJson, statusBadge } from '../interface/kad-ui.js';
import {
  parseCanonicalGraph,
  filterGraph,
  searchGraphNodes,
  getNodeNeighborhood,
  toCytoscapeElements,
  GRAPH_NODE_CLASSES,
  EPISTEMIC_TIERS
} from './graph-adapter.mjs';
import {
  summarizeProjects,
  summarizeWorkpackages,
  summarizeResearchCorpus,
  summarizeTechnologyRegistry,
  buildWorkpackageStatusChartOptions,
  buildProjectClassificationChartOptions
} from './adapter.mjs';
import { renderChart, disposeAllCharts } from './charts.mjs';

const content = document.querySelector('#dashboard-content');
const navLinks = [...document.querySelectorAll('[data-view]')];
const projectionStatusEl = document.querySelector('#projection-status');
const loadedFromEl = document.querySelector('#loaded-from');

let projections = {
  graph: null,
  projects: null,
  workpackages: null,
  research: null,
  technology: null,
  sofia: null
};

let graphModel = null;
let cyInstance = null;
let selectedNodeId = null;
let graphFilterState = {
  query: '',
  nodeType: '',
  epistemicTier: ''
};

let liveState = null;
const liveMeta = { last_successful: null, last_failure: null, last_transition: null };
const LIVE_STALE_THRESHOLD_MS = 30000;

function unavailableLiveState(reason, observedAt = new Date().toISOString()) {
  return createRuntimeStatus(undefined, { observedAt, state: 'UNAVAILABLE', reason });
}

function updateLiveState(candidate) {
  liveMeta.last_transition = runtimeTransition(liveState, candidate);
  liveState = candidate;
}

function currentLiveState() {
  return applyStaleness(liveState ?? unavailableLiveState('live runtime observation has not been received'), { maxAgeMs: LIVE_STALE_THRESHOLD_MS });
}

async function refreshLiveStatus() {
  try {
    const response = await fetch('/api/runtime-status', { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const candidate = await response.json();
    if (!validateRuntimeStatus(candidate)) throw new Error('Malformed runtime status');
    updateLiveState(candidate);
    liveMeta.last_successful = candidate.observed_at;
  } catch (error) {
    updateLiveState(unavailableLiveState(`Runtime API offline: ${error.message}`));
    liveMeta.last_failure = new Date().toISOString();
  }

  const activeView = location.hash.slice(1) || 'overview';
  if (activeView === 'overview' || activeView === 'telemetry') {
    render(activeView);
  }
}

function tierBadgeHtml(tier) {
  const t = String(tier || 'UNKNOWN').toUpperCase();
  if (t === 'EXPLICIT_CANONICAL') {
    return `<span class="tier-badge tier-badge--canonical">EXPLICIT CANONICAL</span>`;
  }
  if (t === 'DETERMINISTIC_DERIVED') {
    return `<span class="tier-badge tier-badge--derived">DETERMINISTIC DERIVED</span>`;
  }
  if (t === 'HEURISTIC_SUGGESTION') {
    return `<span class="tier-badge tier-badge--heuristic">HEURISTIC SUGGESTION</span>`;
  }
  return `<span class="tier-badge">${escapeHtml(t)}</span>`;
}

function renderOverview() {
  const live = currentLiveState();
  const wpSummary = summarizeWorkpackages(projections.workpackages);
  const projSummary = summarizeProjects(projections.projects);
  const resSummary = summarizeResearchCorpus(projections.research);
  const graphCount = graphModel ? graphModel.nodeCount : (projections.sofia?.records?.length || 0);

  const attentionItems = [];
  if (['DEGRADED', 'UNAVAILABLE', 'UNKNOWN', 'STALE'].includes(live.state)) {
    attentionItems.push({
      label: `Runtime Control Plane (${live.runtime_id || 'unidentified'})`,
      state: live.state,
      reason: live.reason || 'Telemetry snapshot unavailable'
    });
  }
  if (wpSummary.reviewCount > 0) {
    attentionItems.push({
      label: `${wpSummary.reviewCount} Workpackage(s) Awaiting Review`,
      state: 'REVIEW',
      reason: 'Workpackages require human or gate review before acceptance'
    });
  }

  return `
    <div class="dashboard-title">
      <div>
        <p class="eyebrow">Sofia v3 / Canonical Cockpit</p>
        <h1>Operational Overview</h1>
        <p>Ground-truth state compiled from canonical Obsidian vault (<code class="mono">vault/</code>).</p>
      </div>
      ${statusBadge(wpSummary.reviewCount > 0 ? 'REVIEW' : 'PASS')}
    </div>

    <div class="grid grid-4">
      <article class="panel metric">
        <span class="metric-label">Active Projects</span>
        <strong class="metric-value">${projSummary.activeCount} <span style="font-size: 1rem; color: var(--faint);">/ ${projSummary.total}</span></strong>
        <span class="kicker">${projSummary.byClassification.CORE || 0} Core · ${projSummary.byClassification.ACTIVE_SUPPORTING || 0} Supporting</span>
      </article>
      <article class="panel metric">
        <span class="metric-label">Workpackage Progress</span>
        <strong class="metric-value">${wpSummary.completionRate}%</strong>
        <span class="kicker">${wpSummary.acceptedCount} Accepted · ${wpSummary.inProgressCount} In-Flight</span>
      </article>
      <article class="panel metric">
        <span class="metric-label">Knowledge Topology</span>
        <strong class="metric-value">${graphCount}</strong>
        <span class="kicker">${graphModel ? `${graphModel.edgeCount} relationships` : 'nodes indexed'}</span>
      </article>
      <article class="panel metric">
        <span class="metric-label">Live Telemetry</span>
        <strong class="metric-value" style="font-size: 1.8rem;">${escapeHtml(live.state)}</strong>
        <span class="kicker">${escapeHtml(live.runtime_id || 'localhost')} · ${live.latency_ms ? `${live.latency_ms}ms` : 'no probe'}</span>
      </article>
    </div>

    ${attentionItems.length ? `
      <section class="section" style="margin-top: 28px;">
        <div class="section-head">
          <div>
            <p class="eyebrow">Attention Items</p>
            <h2>Items Requiring Observation or Action</h2>
          </div>
        </div>
        <div class="record-list">
          ${attentionItems.map(item => `
            <article class="record">
              <header>
                <div><h3>${escapeHtml(item.label)}</h3></div>
                ${statusBadge(item.state)}
              </header>
              <p>${escapeHtml(item.reason)}</p>
            </article>
          `).join('')}
        </div>
      </section>
    ` : ''}

    <section class="section" style="margin-top: 32px;">
      <div class="section-head">
        <div>
          <p class="eyebrow">Workpackages</p>
          <h2>Recent Workpackage Lifecycle</h2>
        </div>
        <a href="#workpackages" class="graph-btn">View All Workpackages →</a>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Workpackage ID</th>
              <th>Title</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${(projections.workpackages?.workpackages || []).slice(0, 5).map(wp => `
              <tr>
                <td><code class="mono">${escapeHtml(wp.wp_id)}</code></td>
                <td>${escapeHtml(wp.title)}</td>
                <td>${statusBadge(wp.status)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderGraphView() {
  if (!graphModel) {
    return `
      <div class="dashboard-title">
        <div>
          <p class="eyebrow">Graph Explorer</p>
          <h1>Canonical Knowledge Topology</h1>
        </div>
      </div>
      <div class="error">
        <strong>Graph projection unavailable.</strong>
        <p>Could not load <code class="mono">vault/90_Derived/Projections/graph.json</code>.</p>
      </div>
    `;
  }

  return `
    <div class="dashboard-title">
      <div>
        <p class="eyebrow">Interactive Explorer</p>
        <h1>Canonical Knowledge Graph</h1>
        <p>Explore typed nodes, explicit edges, and 3-tier epistemic authority in real-time.</p>
      </div>
      <div class="chip-row">
        <span class="chip" id="graph-node-counter">${graphModel.nodeCount} Nodes</span>
        <span class="chip" id="graph-edge-counter">${graphModel.edgeCount} Edges</span>
      </div>
    </div>

    <div class="graph-controls">
      <div class="graph-controls-group">
        <input type="search" id="graph-search-input" class="graph-input" placeholder="Search nodes (ID, title)..." value="${escapeHtml(graphFilterState.query)}">
        <select id="graph-node-type-select" class="graph-select">
          <option value="">All Node Types</option>
          ${GRAPH_NODE_CLASSES.map(cls => `<option value="${cls}" ${graphFilterState.nodeType === cls ? 'selected' : ''}>${cls}</option>`).join('')}
        </select>
        <select id="graph-tier-select" class="graph-select">
          <option value="">All Epistemic Tiers</option>
          ${EPISTEMIC_TIERS.map(tier => `<option value="${tier}" ${graphFilterState.epistemicTier === tier ? 'selected' : ''}>${tier.replace(/_/g, ' ')}</option>`).join('')}
        </select>
      </div>
      <div class="graph-controls-group">
        <button type="button" id="btn-graph-fit" class="graph-btn">Fit View</button>
        <button type="button" id="btn-graph-reset" class="graph-btn">Reset</button>
      </div>
    </div>

    <div class="graph-layout">
      <div class="graph-canvas-container">
        <div id="cy-container"></div>
      </div>
      <aside class="graph-inspector" id="graph-inspector">
        <div class="inspector-header">
          <p class="kicker">Node Inspector</p>
          <h3 class="inspector-title">Select a node</h3>
          <p class="faint" style="font-size: .8rem; margin-top: 4px;">Click any node in the graph canvas to inspect metadata, epistemic authority, and connected neighborhood.</p>
        </div>
      </aside>
    </div>
  `;
}

function updateInspector(nodeId) {
  const inspector = document.querySelector('#graph-inspector');
  if (!inspector || !graphModel) return;

  const hood = getNodeNeighborhood(graphModel, nodeId);
  if (!hood || !hood.center) {
    inspector.innerHTML = `
      <div class="inspector-header">
        <p class="kicker">Node Inspector</p>
        <h3 class="inspector-title">Node not found</h3>
      </div>
    `;
    return;
  }

  const { center, neighbors, edges } = hood;
  const metaEntries = Object.entries(center.metadata || {});

  inspector.innerHTML = `
    <div class="inspector-header">
      <p class="kicker">${escapeHtml(center.type)} · <code class="mono">${escapeHtml(center.id)}</code></p>
      <h3 class="inspector-title">${escapeHtml(center.label)}</h3>
      <div class="inspector-badge-row">
        ${tierBadgeHtml(center.epistemic_tier)}
        ${center.metadata?.status ? statusBadge(center.metadata.status) : ''}
      </div>
    </div>

    ${metaEntries.length ? `
      <div style="margin-top: 12px;">
        <strong style="font-size: .75rem; text-transform: uppercase; color: var(--faint);">Attributes</strong>
        <div style="margin-top: 6px; font-size: .82rem; display: grid; gap: 4px;">
          ${metaEntries.map(([k, v]) => `
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--line); padding: 3px 0;">
              <span class="faint">${escapeHtml(k)}:</span>
              <span class="mono">${escapeHtml(typeof v === 'object' ? JSON.stringify(v) : String(v))}</span>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}

    <div style="margin-top: 16px;">
      <strong style="font-size: .75rem; text-transform: uppercase; color: var(--faint);">Connected Relationships (${edges.length})</strong>
      <ul class="neighbor-list">
        ${neighbors.length ? neighbors.map(n => {
          const edge = edges.find(e => (e.source === n.id && e.target === center.id) || (e.target === n.id && e.source === center.id));
          return `
            <li class="neighbor-item" data-node-id="${escapeHtml(n.id)}">
              <div style="display: flex; justify-content: space-between;">
                <strong>${escapeHtml(n.label)}</strong>
                <span class="mono faint" style="font-size: .7rem;">${escapeHtml(edge?.type || 'RELATES_TO')}</span>
              </div>
              <div style="font-size: .72rem; margin-top: 2px;">
                <span class="faint">${escapeHtml(n.type)}</span> · ${tierBadgeHtml(n.epistemic_tier)}
              </div>
            </li>
          `;
        }).join('') : '<li class="faint" style="font-size: .8rem; padding: 6px 0;">No connected neighbors.</li>'}
      </ul>
    </div>
  `;

  inspector.querySelectorAll('.neighbor-item').forEach(item => {
    item.addEventListener('click', () => {
      const targetId = item.dataset.nodeId;
      if (targetId) focusGraphNode(targetId);
    });
  });
}

async function initCytoscape() {
  const container = document.querySelector('#cy-container');
  if (!container || !graphModel) return;

  let cytoscape;
  try {
    const mod = await import('cytoscape');
    cytoscape = mod.default || mod;
  } catch (error) {
    console.warn('[Sofia Graph] Cytoscape failed to load:', error);
    container.innerHTML = `
      <div class="degraded-chart-fallback">
        <div>
          <p><strong>Interactive canvas visualization unavailable.</strong></p>
          <p class="faint">Native tabular inspection and search remain fully active.</p>
        </div>
      </div>
    `;
    return;
  }

  const filtered = filterGraph(graphModel, {
    nodeTypes: graphFilterState.nodeType ? [graphFilterState.nodeType] : null,
    epistemicTiers: graphFilterState.epistemicTier ? [graphFilterState.epistemicTier] : null,
    query: graphFilterState.query || null
  });

  const elements = toCytoscapeElements(filtered);

  try {
    if (cyInstance) cyInstance.destroy();

    cyInstance = cytoscape({
      container,
      elements,
      style: [
        {
          selector: 'node',
          style: {
            'label': 'data(label)',
            'color': '#f0ede6',
            'font-family': 'ui-monospace, monospace',
            'font-size': '10px',
            'text-valign': 'center',
            'text-halign': 'right',
            'text-margin-x': 6,
            'background-color': '#1f293d',
            'border-width': 1.5,
            'border-color': '#8b9bb4',
            'width': 24,
            'height': 24
          }
        },
        {
          selector: 'node.node-project',
          style: { 'background-color': '#00e5ff', 'border-color': '#ffffff', 'width': 32, 'height': 32 }
        },
        {
          selector: 'node.node-workpackage',
          style: { 'background-color': '#ffd700', 'border-color': '#ffffff', 'width': 28, 'height': 28 }
        },
        {
          selector: 'node.node-decision',
          style: { 'background-color': '#a78bfa', 'border-color': '#ffffff', 'width': 26, 'height': 26 }
        },
        {
          selector: 'node.node-research-paper',
          style: { 'background-color': '#4ade80', 'border-color': '#ffffff', 'width': 24, 'height': 24 }
        },
        {
          selector: 'node.tier-explicit-canonical',
          style: { 'border-style': 'solid', 'border-width': 2 }
        },
        {
          selector: 'node.tier-deterministic-derived',
          style: { 'border-style': 'solid', 'border-width': 1.5, 'border-color': '#00e5ff' }
        },
        {
          selector: 'node.tier-heuristic-suggestion',
          style: { 'border-style': 'dashed', 'border-width': 1.5, 'border-color': '#ffd700' }
        },
        {
          selector: 'edge',
          style: {
            'width': 1.5,
            'line-color': 'rgba(255, 255, 255, 0.25)',
            'target-arrow-color': 'rgba(255, 255, 255, 0.4)',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'arrow-scale': 0.8
          }
        },
        {
          selector: 'edge.tier-heuristic-suggestion',
          style: { 'line-style': 'dashed', 'line-color': 'rgba(255, 215, 0, 0.4)' }
        },
        {
          selector: ':selected',
          style: {
            'border-color': '#ff003c',
            'border-width': 3,
            'line-color': '#ff003c',
            'target-arrow-color': '#ff003c'
          }
        }
      ],
      layout: {
        name: 'cose',
        animate: false,
        padding: 30,
        nodeRepulsion: 450000,
        idealEdgeLength: 100
      }
    });

    cyInstance.on('tap', 'node', evt => {
      const node = evt.target;
      selectedNodeId = node.id();
      updateInspector(selectedNodeId);
    });

    cyInstance.on('tap', evt => {
      if (evt.target === cyInstance) {
        selectedNodeId = null;
      }
    });

    if (selectedNodeId) {
      const node = cyInstance.getElementById(selectedNodeId);
      if (node && node.length) {
        node.select();
        updateInspector(selectedNodeId);
      }
    }
  } catch (error) {
    console.error('[Sofia Graph] Cytoscape init error:', error);
  }
}

function focusGraphNode(nodeId) {
  selectedNodeId = nodeId;
  updateInspector(nodeId);
  if (cyInstance) {
    const node = cyInstance.getElementById(nodeId);
    if (node && node.length) {
      cyInstance.elements().unselect();
      node.select();
      cyInstance.animate({
        center: { eles: node },
        zoom: 1.5,
        duration: 300
      });
    }
  }
}

function attachGraphEvents() {
  const searchInput = document.querySelector('#graph-search-input');
  const typeSelect = document.querySelector('#graph-node-type-select');
  const tierSelect = document.querySelector('#graph-tier-select');
  const btnFit = document.querySelector('#btn-graph-fit');
  const btnReset = document.querySelector('#btn-graph-reset');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      graphFilterState.query = e.target.value;
      initCytoscape();
    });
  }
  if (typeSelect) {
    typeSelect.addEventListener('change', (e) => {
      graphFilterState.nodeType = e.target.value;
      initCytoscape();
    });
  }
  if (tierSelect) {
    tierSelect.addEventListener('change', (e) => {
      graphFilterState.epistemicTier = e.target.value;
      initCytoscape();
    });
  }
  if (btnFit && cyInstance) {
    btnFit.addEventListener('click', () => { cyInstance.fit(null, 30); });
  }
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      graphFilterState = { query: '', nodeType: '', epistemicTier: '' };
      selectedNodeId = null;
      render('graph');
    });
  }
}

function renderProjectsView() {
  const summary = summarizeProjects(projections.projects);
  return `
    <div class="dashboard-title">
      <div>
        <p class="eyebrow">Ecosystem Projects</p>
        <h1>Governed Projects</h1>
        <p>All active, supporting, reference, and legacy projects in the KAD ecosystem.</p>
      </div>
      <span class="chip">${summary.total} Projects Registered</span>
    </div>

    <div class="chart-grid">
      <article class="chart-panel">
        <p class="kicker">Project Classification Breakdown</p>
        <div id="projects-classification-chart" class="chart-box"></div>
      </article>
    </div>

    <section class="section" style="margin-top: 28px;">
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Project ID</th>
              <th>Name</th>
              <th>Classification</th>
              <th>Status</th>
              <th>Languages</th>
            </tr>
          </thead>
          <tbody>
            ${summary.projects.map(p => `
              <tr>
                <td><code class="mono">${escapeHtml(p.id)}</code></td>
                <td><strong>${escapeHtml(p.name)}</strong></td>
                <td><span class="chip">${escapeHtml(p.classification)}</span></td>
                <td>${statusBadge(p.status)}</td>
                <td class="faint">${escapeHtml((p.languages || []).join(', ') || 'N/A')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderWorkpackagesView() {
  const summary = summarizeWorkpackages(projections.workpackages);
  return `
    <div class="dashboard-title">
      <div>
        <p class="eyebrow">Workpackage Ledger</p>
        <h1>Workpackages & Milestones</h1>
        <p>Deterministic workpackages tracked with explicit claims and verification evidence.</p>
      </div>
      <div class="chip-row">
        <span class="chip">${summary.acceptedCount} / ${summary.total} Accepted</span>
        <span class="chip">${summary.completionRate}% Complete</span>
      </div>
    </div>

    <div class="chart-grid">
      <article class="chart-panel">
        <p class="kicker">Workpackage Status Distribution</p>
        <div id="workpackages-status-chart" class="chart-box"></div>
      </article>
    </div>

    <section class="section" style="margin-top: 28px;">
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>WP ID</th>
              <th>Title</th>
              <th>Status</th>
              <th>Verdict</th>
              <th>Commit</th>
            </tr>
          </thead>
          <tbody>
            ${summary.workpackages.map(wp => `
              <tr>
                <td><code class="mono">${escapeHtml(wp.wp_id)}</code></td>
                <td>${escapeHtml(wp.title)}</td>
                <td>${statusBadge(wp.status)}</td>
                <td>${statusBadge(wp.verdict || 'NONE')}</td>
                <td><code class="mono faint">${escapeHtml(wp.commit ? wp.commit.slice(0, 7) : 'pending')}</code></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderResearchView() {
  const summary = summarizeResearchCorpus(projections.research);
  return `
    <div class="dashboard-title">
      <div>
        <p class="eyebrow">Scientific Corpus</p>
        <h1>Research Papers & Claims</h1>
        <p>Audited primary scientific literature backing the KAD agentic architecture.</p>
      </div>
      <span class="chip">${summary.totalPapers} Papers Audited</span>
    </div>

    <div class="record-list" style="margin-top: 20px;">
      ${summary.papers.map(paper => `
        <article class="record">
          <header>
            <div>
              <p class="kicker">${escapeHtml(paper.id)} · ${paper.year || 'Unknown Year'}</p>
              <h3>${escapeHtml(paper.title)}</h3>
              <p class="faint" style="font-size: .8rem;">${escapeHtml((paper.authors || []).join(', '))}</p>
            </div>
            <span class="tier-badge tier-badge--canonical">${escapeHtml(paper.epistemic_verification)}</span>
          </header>
          <p>${escapeHtml(paper.core_findings || 'No findings abstract recorded.')}</p>
          <div class="meta" style="margin-top: 10px;">
            <span>Relevance: ${escapeHtml(paper.relevance_to_kad || 'General')}</span>
            ${paper.arxiv ? `<span><a href="https://arxiv.org/abs/${encodeURIComponent(paper.arxiv)}" target="_blank" rel="noreferrer">arXiv:${escapeHtml(paper.arxiv)}</a></span>` : ''}
            ${paper.doi ? `<span><a href="https://doi.org/${encodeURIComponent(paper.doi)}" target="_blank" rel="noreferrer">DOI:${escapeHtml(paper.doi)}</a></span>` : ''}
          </div>
        </article>
      `).join('')}
    </div>
  `;
}

function renderTelemetryView() {
  const live = currentLiveState();
  return `
    <div class="dashboard-title">
      <div>
        <p class="eyebrow">Runtime Probe</p>
        <h1>Telemetry & Control Plane HUD</h1>
        <p>Localhost control-plane telemetry snapshot with staleness detection.</p>
      </div>
      <button type="button" id="btn-refresh-telemetry" class="hud-refresh-btn">Refresh Snapshot ↻</button>
    </div>

    <div class="grid grid-4">
      <article class="panel metric">
        <span class="metric-label">Runtime State</span>
        <strong class="metric-value" style="font-size: 1.8rem;">${escapeHtml(live.state)}</strong>
        <span class="kicker">${live.reason ? escapeHtml(live.reason) : 'Operational'}</span>
      </article>
      <article class="panel metric">
        <span class="metric-label">Runtime ID</span>
        <strong class="metric-value" style="font-size: 1.4rem;">${escapeHtml(live.runtime_id || 'none')}</strong>
        <span class="kicker">${escapeHtml(live.endpoint_class || 'localhost')}</span>
      </article>
      <article class="panel metric">
        <span class="metric-label">Probe Latency</span>
        <strong class="metric-value">${live.latency_ms ? `${live.latency_ms}ms` : '--'}</strong>
        <span class="kicker">Local loopback</span>
      </article>
      <article class="panel metric">
        <span class="metric-label">Trust Domain</span>
        <strong class="metric-value" style="font-size: 1.4rem;">${escapeHtml(live.trust_domain || 'unknown')}</strong>
        <span class="kicker">Capability: ${escapeHtml(live.capability || 'none')}</span>
      </article>
    </div>

    <section class="section" style="margin-top: 32px;">
      <div class="section-head">
        <div>
          <p class="eyebrow">Probe Receipts</p>
          <h2>Observation Timestamps</h2>
        </div>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <tbody>
            <tr><td><strong>Observed At:</strong></td><td><code class="mono">${escapeHtml(live.observed_at || 'never')}</code></td></tr>
            <tr><td><strong>Last Successful:</strong></td><td><code class="mono">${escapeHtml(liveMeta.last_successful || 'never')}</code></td></tr>
            <tr><td><strong>Last Failure:</strong></td><td><code class="mono">${escapeHtml(liveMeta.last_failure || 'none')}</code></td></tr>
            <tr><td><strong>Last State Transition:</strong></td><td><code class="mono">${escapeHtml(liveMeta.last_transition ? `${liveMeta.last_transition.from} → ${liveMeta.last_transition.to}` : 'none')}</code></td></tr>
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderSystemView() {
  const techSummary = summarizeTechnologyRegistry(projections.technology);
  return `
    <div class="dashboard-title">
      <div>
        <p class="eyebrow">System & Governance</p>
        <h1>Canonical Provenance & Tech Registry</h1>
        <p>Projection verification and classified technology stack decisions from ADRs 0009–0012.</p>
      </div>
      <span class="status status--PASS">READ-ONLY</span>
    </div>

    <div class="grid grid-2">
      <article class="panel panel--gold">
        <p class="kicker">Projection Metadata</p>
        <h3>Canonical Vault Source</h3>
        <p>Loaded from <code class="mono">vault/90_Derived/Projections/</code>.</p>
        <div class="meta" style="margin-top: 12px;">
          <span>Vault Revision: <code class="mono">${escapeHtml(graphModel?.source_vault_revision || 'unknown')}</code></span>
          <span>Generated: <code class="mono">${displayDate((graphModel?.generated_at || new Date().toISOString()).slice(0, 10))}</code></span>
        </div>
      </article>

      <article class="panel">
        <p class="kicker">Technology Stack Decisions</p>
        <h3>${techSummary.total} Governed Technologies</h3>
        <div class="inspector-badge-row" style="margin-top: 10px;">
          <span class="chip">${techSummary.byDecision.KEEP || 0} KEEP</span>
          <span class="chip">${techSummary.byDecision.ADOPT || 0} ADOPT</span>
          <span class="chip">${techSummary.byDecision.AUGMENT || 0} AUGMENT</span>
          <span class="chip">${techSummary.byDecision.EXPERIMENTAL || 0} EXPERIMENTAL</span>
          <span class="chip">${techSummary.byDecision.RETIRE || 0} RETIRE</span>
        </div>
      </article>
    </div>

    <section class="section" style="margin-top: 32px;">
      <div class="section-head">
        <div>
          <p class="eyebrow">Technology Registry</p>
          <h2>Classified Architectural Components</h2>
        </div>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Technology ID</th>
              <th>Name</th>
              <th>Role</th>
              <th>Decision</th>
            </tr>
          </thead>
          <tbody>
            ${techSummary.technologies.map(t => `
              <tr>
                <td><code class="mono">${escapeHtml(t.id)}</code></td>
                <td><strong>${escapeHtml(t.name)}</strong></td>
                <td class="faint">${escapeHtml(t.role)}</td>
                <td><span class="chip">${escapeHtml(t.decision)}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function render(view = location.hash.slice(1) || 'overview') {
  disposeAllCharts();
  const allowed = new Set(['overview', 'graph', 'projects', 'workpackages', 'research', 'telemetry', 'system']);
  const selected = allowed.has(view) ? view : 'overview';

  navLinks.forEach(link => {
    if (link.dataset.view === selected) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });

  const views = {
    overview: renderOverview,
    graph: renderGraphView,
    projects: renderProjectsView,
    workpackages: renderWorkpackagesView,
    research: renderResearchView,
    telemetry: renderTelemetryView,
    system: renderSystemView
  };

  content.innerHTML = views[selected]();

  if (selected === 'graph') {
    initCytoscape();
    attachGraphEvents();
  } else if (selected === 'projects') {
    const chartContainer = document.querySelector('#projects-classification-chart');
    if (chartContainer && projections.projects) {
      renderChart(chartContainer, buildProjectClassificationChartOptions(projections.projects));
    }
  } else if (selected === 'workpackages') {
    const chartContainer = document.querySelector('#workpackages-status-chart');
    if (chartContainer && projections.workpackages) {
      renderChart(chartContainer, buildWorkpackageStatusChartOptions(projections.workpackages));
    }
  } else if (selected === 'telemetry') {
    const refreshBtn = document.querySelector('#btn-refresh-telemetry');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', refreshLiveStatus);
    }
  }
}

async function bootstrap() {
  try {
    const [graph, projects, workpackages, research, technology, sofia] = await Promise.all([
      loadJson('/vault/90_Derived/Projections/graph.json').catch(e => null),
      loadJson('/vault/90_Derived/Projections/projects.json').catch(e => null),
      loadJson('/vault/90_Derived/Projections/workpackages.json').catch(e => null),
      loadJson('/vault/90_Derived/Projections/research.json').catch(e => null),
      loadJson('/vault/90_Derived/Projections/technology-registry.json').catch(e => null),
      loadJson('/vault/90_Derived/Projections/sofia-projection.json').catch(e => null)
    ]);

    projections = { graph, projects, workpackages, research, technology, sofia };

    if (graph) {
      try {
        graphModel = parseCanonicalGraph(graph);
      } catch (err) {
        console.warn('[Sofia] Could not parse graph projection:', err);
      }
    }

    if (projectionStatusEl) {
      projectionStatusEl.textContent = 'STATE ACTIVE';
    }
    if (loadedFromEl && graphModel) {
      loadedFromEl.textContent = `Revision ${graphModel.source_vault_revision.slice(0, 10)} · ${displayDate(new Date().toISOString().slice(0, 10))}`;
    }

    render();
    refreshLiveStatus();
  } catch (error) {
    if (projectionStatusEl) projectionStatusEl.textContent = 'STATE ERROR';
    content.innerHTML = `
      <div class="error">
        <strong>Projection bootstrap failed.</strong>
        <p>${escapeHtml(error.message)}</p>
      </div>
    `;
  }
}

bootstrap();
window.addEventListener('hashchange', () => { render(); });
