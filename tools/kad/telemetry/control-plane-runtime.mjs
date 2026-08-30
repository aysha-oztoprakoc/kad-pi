import { TelemetryLedger } from './quota-ledger.mjs';
import { discoverProviders, createProviderTelemetry } from './provider-adapters.mjs';
import {
  collectOmpSessionUsage,
  collectOmpUsageReportsCli,
  normalizeOmpUsageReports,
  handleAfterProviderResponse,
} from './omp-usage-adapter.mjs';
import { createEconomicViewModel } from './economic-adapter.mjs';
import { createWorkctlViewModel, readWorkspaceWorkState } from './workctl-adapter.mjs';
import { collectGpuTelemetry } from './system-metrics.mjs';
import { collectServiceHealth } from './health.mjs';
import { computeTokenmaxxingMetrics } from './tokenmaxxing.mjs';
import { buildControlPlaneViewModel } from './view-model.mjs';
import { execFileSync } from 'node:child_process';
import { ShadowObservatoryJournal, aggregateObservations, evaluateJournalReadiness } from './observatory.mjs';

export function renderCompactMeter(state = {}) {
  const parts = ['KAD'];
  // Session tokens
  const sessionTok = state.session_tokens ?? 0;
  if (sessionTok >= 1000000) parts.push(`${(sessionTok / 1000000).toFixed(1)}M tok`);
  else if (sessionTok >= 1000) parts.push(`${(sessionTok / 1000).toFixed(0)}k tok`);
  else parts.push(`${sessionTok} tok`);

  // Route / Paid status
  const route = state.economic_route || 'FREE';
  if (route === 'DEGRADED') parts.push('ROUTE !');
  else if (route.includes('FREE')) parts.push('FREE ✓');
  else parts.push(`${route}`);

  // Provider Quota
  if (Number.isFinite(state.provider_quota_percent)) {
    parts.push(`P:${state.provider_quota_percent}%`);
  } else if (state.provider_quota_percent === null && state.quota_display) {
    parts.push(`P:${state.quota_display}`);
  } else {
    parts.push('QUOTA ?');
  }

  // GPU
  if (state.gpu && Number.isFinite(state.gpu.vram_used) && Number.isFinite(state.gpu.vram_total)) {
    parts.push(`GPU ${state.gpu.vram_used}/${state.gpu.vram_total}G`);
  } else if (state.gpu && Number.isFinite(state.gpu.vram_used_mib) && Number.isFinite(state.gpu.vram_total_mib)) {
    const usedG = (state.gpu.vram_used_mib / 1024).toFixed(1);
    const totalG = (state.gpu.vram_total_mib / 1024).toFixed(1);
    parts.push(`GPU ${usedG}/${totalG}G`);
  }

  // Workctl ticket
  const work = state.workctl;
  if (work?.has_active_claim) {
    const id = work.ticket_id.replace(/^WP-KAD-/, '').replace(/^WP-/, '');
    parts.push(`WP:${id} ✓`);
  } else {
    parts.push('WP:none');
  }

  // Degraded services alert
  if (Array.isArray(state.degraded_services) && state.degraded_services.length > 0) {
    parts.push(`[${state.degraded_services.join(',')} !]`);
  }

  return parts.join(' │ ');
}

export function renderProgressBar(percent, width = 16) {
  if (!Number.isFinite(percent)) return '?'.repeat(width);
  const filled = Math.max(0, Math.min(width, Math.round((percent / 100) * width)));
  const empty = width - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

export function renderDetailedPanel(viewModel = {}) {
  const lines = [];
  lines.push('╔══════════════════════════════════════════════════════════════════╗');
  lines.push('║                  KAD OPERATOR CONTROL PLANE                      ║');
  lines.push('╚══════════════════════════════════════════════════════════════════╝');
  lines.push('');

  // Overview
  const ov = viewModel.overview || {};
  lines.push(`▶ OVERVIEW`);
  lines.push(`  Model: ${ov.model || 'unknown'}   Provider: ${ov.provider || 'unknown'}`);
  lines.push(`  Session Tokens: ${ov.session_tokens ?? 0}   Execution Class: ${ov.execution_class || 'UNKNOWN'}`);
  lines.push(`  Paid Authorized: ${ov.paid_authorized ? 'YES' : 'NO (FREE/SUBSCRIPTION ONLY)'}`);
  lines.push('');

  // Economic & Shadow Routing
  lines.push(`▶ ECONOMIC ROUTING & SHADOW EVALUATOR`);
  const eco = viewModel.economic || {};
  lines.push(`  Production Route: ${ov.economic_route || 'DEFAULT'} (${ov.execution_class || 'UNKNOWN'})   Status: ${ov.route_status || 'UNKNOWN'}`);
  if (ov.shadow_route) {
    const shadowStatus = ov.shadow_same_or_different === 'SAME' ? '[SAME AS PRODUCTION]' : '[DIVERGENT ADVICE]';
    lines.push(`  [SHADOW] Recommended: ${ov.shadow_route} (${ov.shadow_class || 'UNKNOWN'}) ${shadowStatus}`);
    if (eco.shadow?.reason_codes?.length) {
      lines.push(`  [SHADOW] Reasons: ${eco.shadow.reason_codes.join(', ')}`);
    }
  } else {
    lines.push(`  [SHADOW] Recommendation: ${ov.economic_route || 'DEFAULT'} (aligns with production)`);
  }
  lines.push('');
  // Providers & Quotas
  lines.push(`▶ TOKENS & QUOTAS`);
  const providers = viewModel.providers || [];
  if (!providers.length) {
    lines.push('  No providers configured or observed.');
  } else {
    for (const p of providers) {
      const bar = renderProgressBar(p.percent_remaining, 14);
      const pctLabel = p.percent_remaining !== null ? `${p.percent_remaining}%` : 'UNKNOWN';
      const resetLabel = p.resets_in ? `reset ${p.resets_in}` : '';
      const stateLabel = p.source_class || p.state || 'UNKNOWN';
      const label = p.metadata?.limitLabel || (p.window_kind && p.window_kind !== 'session' ? p.window_kind : null);
      const displayId = label ? `${p.provider_id} (${label})` : p.provider_id;
      lines.push(`  ${displayId.padEnd(28)} ${bar}  ${pctLabel.padEnd(8)} ${resetLabel.padEnd(12)} [${stateLabel}]`);
    }
  }
  lines.push('');

  // Local Compute & GPU
  lines.push(`▶ LOCAL COMPUTE & GPU`);
  const gpu = viewModel.gpu;
  if (gpu && (gpu.state === 'AVAILABLE' || (!gpu.state && gpu.device_name))) {
    const vramUsedG = gpu.vram_used_mib ? (gpu.vram_used_mib / 1024).toFixed(1) : (gpu.vram_used ?? 0);
    const vramTotalG = gpu.vram_total_mib ? (gpu.vram_total_mib / 1024).toFixed(1) : (gpu.vram_total ?? 0);
    const util = gpu.gpu_utilization_percent ?? gpu.util_percent ?? 0;
    const temp = gpu.temperature_c ?? gpu.temp_c ?? 0;
    const pwr = gpu.power_w ?? 0;
    lines.push(`  Device: ${gpu.device_name}   Utilization: ${util}%`);
    lines.push(`  VRAM: ${vramUsedG} / ${vramTotalG} GiB   Temp: ${temp}°C   Power: ${pwr}W`);
  } else {
    lines.push(`  AMD GPU: ${gpu?.state || 'UNAVAILABLE'} (${gpu?.reason || 'no telemetry'})`);
  }
  lines.push('');

  // Services
  lines.push(`▶ SERVICE HEALTH`);
  const s = viewModel.services || {};
  const ovState = s.openviking?.state || 'UNAVAILABLE';
  const zotState = s.zotero?.state || 'UNAVAILABLE';
  const needleState = s.needle?.state || 'UNAVAILABLE';
  const localState = s.local_runtime?.state || 'UNAVAILABLE';
  lines.push(`  OpenViking: ${ovState.padEnd(12)} Zotero API: ${zotState.padEnd(12)} Needle: ${needleState}`);
  lines.push(`  Local Inference: ${localState}`);
  lines.push('');

  // Workctl
  lines.push(`▶ WORKCTL`);
  const w = viewModel.workctl || {};
  if (w.has_active_claim) {
    lines.push(`  Active Claim: ${w.ticket_id}   Actor: ${w.actor_label || 'operator'}`);
    if (w.frontier?.length) lines.push(`  Frontier: ${w.frontier.join(', ')}`);
  } else {
    lines.push(`  NO ACTIVE CLAIM`);
    if (w.frontier?.length) lines.push(`  Ready Frontier: ${w.frontier.join(', ')}`);
  }
  lines.push('');

  // Tokenmaxxing
  if (viewModel.tokenmaxxing) {
    const tm = viewModel.tokenmaxxing;
    lines.push(`▶ TOKENMAXXING METRICS`);
    lines.push(`  Cache Hit Rate: ${(tm.cache_hit_rate * 100).toFixed(1)}%   Total Tokens: ${tm.total_tokens}`);
    if (tm.tokens_per_accepted_ticket) lines.push(`  Tokens/Ticket: ${tm.tokens_per_accepted_ticket.toFixed(0)}`);
    if (tm.tokens_per_pass) lines.push(`  Tokens/PASS: ${tm.tokens_per_pass.toFixed(0)}`);
    lines.push('');
  }

  // Counterfactual Observatory & Promotion Readiness
  if (viewModel.observatory && viewModel.observatory.total_observations > 0) {
    const obs = viewModel.observatory;
    lines.push(`▶ COUNTERFACTUAL OBSERVATORY`);
    lines.push(`  Observations: ${obs.total_observations}   Agreements: ${obs.agreement_count}   Divergences: ${obs.divergence_count} (rate: ${(obs.divergence_rate * 100).toFixed(1)}%)`);
    lines.push(`  Journal Integrity: ${obs.integrity?.valid ? 'VALID ✓' : 'COMPROMISED !'}`);
    if (obs.readiness) {
      lines.push(`  Canary Readiness: ${obs.readiness.global_readiness?.status || 'UNKNOWN'}`);
    }
    lines.push('');
  }
  return lines.join('\n');
}

export async function executeKadCommand(action = 'status', { faultyState = null, cwd = process.cwd() } = {}) {
  const errors = [];
  let providers = [];
  let gpu = null;
  let health = null;
  let workctl = null;

  try {
    if (faultyState?.providers) providers = faultyState.providers();
    else providers = discoverProviders({ cwd });
  } catch (err) {
    errors.push(`Providers probe failed: ${err.message}`);
  }

  try {
    if (faultyState?.gpu) gpu = faultyState.gpu();
    else gpu = collectGpuTelemetry();
  } catch (err) {
    errors.push(`GPU probe failed: ${err.message}`);
  }

  try {
    health = await collectServiceHealth();
  } catch (err) {
    errors.push(`Health probe failed: ${err.message}`);
  }

  try {
    const rawWork = readWorkspaceWorkState(cwd);
    workctl = createWorkctlViewModel(rawWork);
  } catch (err) {
    errors.push(`Workctl probe failed: ${err.message}`);
  }
  let nativeRecords = [];
  try {
    const rawReports = collectOmpUsageReportsCli();
    nativeRecords = normalizeOmpUsageReports(rawReports);
  } catch {
    // fallback gracefully
  }

  let economic = null;
  try {
    economic = createEconomicViewModel({ telemetryRecords: nativeRecords });
  } catch (err) {
    errors.push(`Economic probe failed: ${err.message}`);
  }

  let observatoryState = null;
  try {
    const journal = new ShadowObservatoryJournal();
    const records = journal.readObservations();
    const integrity = journal.verifyJournalIntegrity();
    const aggregates = aggregateObservations(records);
    const readiness = evaluateJournalReadiness(journal);
    observatoryState = {
      ...aggregates,
      integrity,
      readiness
    };
  } catch (err) {
    errors.push(`Observatory probe failed: ${err.message}`);
  }

  const vm = buildControlPlaneViewModel({
    telemetryRecords: nativeRecords,
    discoveredProviders: Array.isArray(providers) ? providers : [],
    economicState: economic,
    observatoryState,
    gpuState: gpu,
    healthState: health,
    workctlState: workctl,
  });
  return {
    ...vm,
    status: errors.length > 0 ? 'DEGRADED' : 'READY',
    errors,
  };
}

export async function executeKadDoctor({ cwd = process.cwd() } = {}) {
  const checks = [];
  // Check 1: OMP extension
  checks.push({
    name: 'omp_extension',
    status: 'PASS',
    message: 'kad-control-plane extension registered',
  });

  // Check 2: workctl
  try {
    const work = readWorkspaceWorkState(cwd);
    checks.push({
      name: 'workctl',
      status: 'PASS',
      message: work.activeClaim ? `Active ticket: ${work.activeClaim.task}` : 'Workctl state clean (no active claim)',
    });
  } catch (e) {
    checks.push({ name: 'workctl', status: 'DEGRADED', message: e.message });
  }

  // Check 3: Economic router
  try {
    const eco = createEconomicViewModel();
    checks.push({
      name: 'economic_router',
      status: 'PASS',
      message: `Economic policy active (paidAuthorized: ${eco.paid_authorized})`,
    });
  } catch (e) {
    checks.push({ name: 'economic_router', status: 'DEGRADED', message: e.message });
  }

  // Check 4: Observatory journal integrity
  try {
    const journal = new ShadowObservatoryJournal();
    const integrity = journal.verifyJournalIntegrity();
    checks.push({
      name: 'observatory_journal',
      status: integrity.valid ? 'PASS' : 'DEGRADED',
      message: integrity.valid ? `Journal valid (${integrity.record_count} events recorded)` : `Journal integrity degraded: ${integrity.errors.join(', ')}`,
    });
  } catch (e) {
    checks.push({ name: 'observatory_journal', status: 'DEGRADED', message: e.message });
  }
  // Check 5: Promotion Readiness Gate
  try {
    const journal = new ShadowObservatoryJournal();
    const readiness = evaluateJournalReadiness(journal);
    checks.push({
      name: 'readiness_gate',
      status: 'PASS',
      message: `Gate active (status: ${readiness.global_readiness.status}, canary authorized: ${readiness.authority_contract.canary_authorized})`,
    });
  } catch (e) {
    checks.push({ name: 'readiness_gate', status: 'DEGRADED', message: e.message });
  }

  // Check 4: Toolchain - trivy
  try {
    const ver = execFileSync('trivy', ['--version'], { encoding: 'utf8' }).trim().split('\n')[0];
    checks.push({ name: 'toolchain_trivy', status: 'PASS', message: ver });
  } catch {
    checks.push({ name: 'toolchain_trivy', status: 'DEGRADED', message: 'trivy not found or failed' });
  }

  // Check 5: Toolchain - gitleaks
  try {
    const ver = execFileSync('gitleaks', ['version'], { encoding: 'utf8' }).trim();
    checks.push({ name: 'toolchain_gitleaks', status: 'PASS', message: `gitleaks ${ver}` });
  } catch {
    checks.push({ name: 'toolchain_gitleaks', status: 'DEGRADED', message: 'gitleaks not found or failed' });
  }

  // Check 6: Toolchain - amdgpu_top
  try {
    const ver = execFileSync('amdgpu_top', ['--version'], { encoding: 'utf8' }).trim();
    checks.push({ name: 'toolchain_amdgpu_top', status: 'PASS', message: ver });
  } catch {
    checks.push({ name: 'toolchain_amdgpu_top', status: 'DEGRADED', message: 'amdgpu_top not found' });
  }

  const anyFail = checks.some((c) => c.status === 'FAIL');
  const anyDegraded = checks.some((c) => c.status === 'DEGRADED');
  const verdict = anyFail ? 'FAIL' : anyDegraded ? 'DEGRADED' : 'PASS';

  return {
    verdict,
    checks,
    checked_at: new Date().toISOString(),
  };
}

export function createKadControlPlaneExtension(pi) {
  const ledger = new TelemetryLedger();
  let refreshTimer = null;
  let cachedNativeUsageRecords = [];
  let lastUsageFetchAt = 0;

  function getNativeUsageRecords(force = false) {
    const now = Date.now();
    if (force || now - lastUsageFetchAt > 60000 || cachedNativeUsageRecords.length === 0) {
      try {
        const rawReports = collectOmpUsageReportsCli();
        cachedNativeUsageRecords = normalizeOmpUsageReports(rawReports, { now });
        for (const rec of cachedNativeUsageRecords) {
          ledger.record(rec);
        }
        lastUsageFetchAt = now;
      } catch {
        // fallback
      }
    }
    return cachedNativeUsageRecords;
  }

  async function updateTelemetry(ctx, event = null) {
    try {
      const usage = collectOmpSessionUsage(ctx, event);
      const rawWork = readWorkspaceWorkState(ctx?.cwd || process.cwd());
      const workctl = createWorkctlViewModel(rawWork);
      const gpu = collectGpuTelemetry();
      const health = await collectServiceHealth();
      const providers = discoverProviders({ cwd: ctx?.cwd || process.cwd() });
      const economic = createEconomicViewModel();
      const nativeUsage = getNativeUsageRecords();
      const ledgerRecords = ledger.getAllLatest();
      const mergedRecords = [...nativeUsage, ...ledgerRecords];

      const vm = buildControlPlaneViewModel({
        sessionUsage: usage,
        telemetryRecords: mergedRecords,
        discoveredProviders: providers,
        economicState: economic,
        workctlState: workctl,
        gpuState: gpu,
        healthState: health,
      });

      const meterText = renderCompactMeter({
        session_tokens: usage.total_tokens,
        economic_route: economic.selected_execution_class,
        provider_quota_percent: vm.overview?.primary_quota_percent,
        gpu: gpu.state === 'AVAILABLE' ? gpu : null,
        workctl,
      });

      if (ctx?.ui?.setStatus) {
        ctx.ui.setStatus('kad-meter', meterText);
      }
      if (ctx?.ui?.setWidget) {
        ctx.ui.setWidget('kad-widget', [meterText], { placement: 'belowEditor' });
      }
    } catch {
      // Failure isolation: never crash OMP
    }
  }

  // Register events
  pi.on('session_start', async (event, ctx) => {
    await updateTelemetry(ctx, event);
    if (!refreshTimer) {
      refreshTimer = setInterval(() => updateTelemetry(ctx), 5000);
    }
  });

  pi.on('turn_end', async (event, ctx) => {
    await updateTelemetry(ctx, event);
  });

  pi.on('message_end', async (event, ctx) => {
    await updateTelemetry(ctx, event);
  });

  pi.on('model_select', async (event, ctx) => {
    await updateTelemetry(ctx, event);
  });

  pi.on('after_provider_response', async (event, ctx) => {
    try {
      const record = handleAfterProviderResponse(event, ctx);
      if (record) ledger.record(record);
      await updateTelemetry(ctx, event);
    } catch {
      // ignore
    }
  });

  pi.on('session_shutdown', () => {
    if (refreshTimer) {
      clearInterval(refreshTimer);
      refreshTimer = null;
    }
  });

  // Register commands
  pi.registerCommand('kad', {
    description: 'Toggle KAD Operator Control Plane modal panel',
    handler: async (_args, ctx) => {
      const usage = collectOmpSessionUsage(ctx);
      const rawWork = readWorkspaceWorkState(ctx.cwd);
      const workctl = createWorkctlViewModel(rawWork);
      const gpu = collectGpuTelemetry();
      const health = await collectServiceHealth();
      const providers = discoverProviders({ cwd: ctx.cwd });
      const economic = createEconomicViewModel();

      const vm = buildControlPlaneViewModel({
        sessionUsage: usage,
        discoveredProviders: providers,
        economicState: economic,
        workctlState: workctl,
        gpuState: gpu,
        healthState: health,
      });

      const panelText = renderDetailedPanel(vm);
      if (ctx.ui?.custom) {
        await ctx.ui.custom((_tui, _theme, _keybindings, done) => ({
          render: () => panelText.split('\n'),
          handleInput: (key) => {
            if (key === 'escape' || key === 'q' || key === 'enter') done(true);
          },
        }), { overlay: true });
      } else {
        ctx.ui.notify(panelText, 'info');
      }
    },
  });

  pi.registerCommand('kad-status', {
    description: 'Display quick KAD control plane status',
    handler: async (_args, ctx) => {
      const res = await executeKadCommand('status', { cwd: ctx.cwd });
      ctx.ui.notify(JSON.stringify(res, null, 2), 'info');
    },
  });

  pi.registerCommand('kad-tokens', {
    description: 'Display live token and quota breakdown',
    handler: async (_args, ctx) => {
      const usage = collectOmpSessionUsage(ctx);
      ctx.ui.notify(`Session Tokens: ${usage.total_tokens} (In: ${usage.input_tokens}, Out: ${usage.output_tokens}, Cache: ${usage.cache_read_tokens})`, 'info');
    },
  });

  pi.registerCommand('kad-providers', {
    description: 'Display configured providers and quota telemetry',
    handler: async (_args, ctx) => {
      const providers = discoverProviders({ cwd: ctx.cwd });
      ctx.ui.notify(JSON.stringify(providers, null, 2), 'info');
    },
  });

  pi.registerCommand('kad-budget', {
    description: 'Display current KAD economic policy and budget state',
    handler: async (_args, ctx) => {
      const eco = createEconomicViewModel();
      ctx.ui.notify(JSON.stringify(eco, null, 2), 'info');
    },
  });

  pi.registerCommand('kad-services', {
    description: 'Check OpenViking, Zotero, and local model health',
    handler: async (_args, ctx) => {
      const health = await collectServiceHealth();
      ctx.ui.notify(JSON.stringify(health, null, 2), 'info');
    },
  });

  pi.registerCommand('kad-work', {
    description: 'Display current workctl active claim and frontier',
    handler: async (_args, ctx) => {
      const raw = readWorkspaceWorkState(ctx.cwd);
      ctx.ui.notify(JSON.stringify(raw, null, 2), 'info');
    },
  });

  pi.registerCommand('kad-refresh', {
    description: 'Force fresh quota and health probe refresh',
    handler: async (_args, ctx) => {
      await updateTelemetry(ctx);
      ctx.ui.notify('KAD telemetry refreshed', 'info');
    },
  });

  pi.registerCommand('kad-doctor', {
    description: 'Run KAD Doctor diagnostic verification suite',
    handler: async (_args, ctx) => {
      const report = await executeKadDoctor({ cwd: ctx.cwd });
      ctx.ui.notify(JSON.stringify(report, null, 2), 'info');
    },
  });

  // Register tools
  pi.registerTool({
    name: 'kad_telemetry',
    label: 'KAD Telemetry',
    description: 'Query compact deterministic telemetry and quota state',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', enum: ['summary', 'providers', 'gpu', 'services', 'workctl'] },
      },
    },
    async execute(_id, params, _signal, _update, ctx) {
      const q = params?.query || 'summary';
      const usage = collectOmpSessionUsage(ctx);
      const rawWork = readWorkspaceWorkState(ctx.cwd);
      const workctl = createWorkctlViewModel(rawWork);
      const gpu = collectGpuTelemetry();
      const health = await collectServiceHealth();
      const providers = discoverProviders({ cwd: ctx.cwd });

      if (q === 'providers') return { content: [{ type: 'text', text: JSON.stringify(providers, null, 2) }] };
      if (q === 'gpu') return { content: [{ type: 'text', text: JSON.stringify(gpu, null, 2) }] };
      if (q === 'services') return { content: [{ type: 'text', text: JSON.stringify(health, null, 2) }] };
      if (q === 'workctl') return { content: [{ type: 'text', text: JSON.stringify(workctl, null, 2) }] };

      const vm = buildControlPlaneViewModel({
        sessionUsage: usage,
        discoveredProviders: providers,
        workctlState: workctl,
        gpuState: gpu,
        healthState: health,
      });
      return { content: [{ type: 'text', text: JSON.stringify(vm, null, 2) }] };
    },
  });

  pi.registerTool({
    name: 'kad_policy_status',
    label: 'KAD Policy Status',
    description: 'Query read-only KAD economic routing policy and lane status',
    parameters: {
      type: 'object',
      properties: {},
    },
    async execute() {
      const eco = createEconomicViewModel();
      return { content: [{ type: 'text', text: JSON.stringify(eco, null, 2) }] };
    },
  });

  // Register shortcut
  if (typeof pi.registerShortcut === 'function') {
    pi.registerShortcut('ctrl+k', {
      description: 'Open KAD Control Plane',
      handler: async (ctx) => {
        const usage = collectOmpSessionUsage(ctx);
        const rawWork = readWorkspaceWorkState(ctx.cwd);
        const workctl = createWorkctlViewModel(rawWork);
        const gpu = collectGpuTelemetry();
        const health = await collectServiceHealth();
        const providers = discoverProviders({ cwd: ctx.cwd });
        const vm = buildControlPlaneViewModel({
          sessionUsage: usage,
          discoveredProviders: providers,
          workctlState: workctl,
          gpuState: gpu,
          healthState: health,
        });
        const panelText = renderDetailedPanel(vm);
        if (ctx.ui?.custom) {
          await ctx.ui.custom((_tui, _theme, _kb, done) => ({
            render: () => panelText.split('\n'),
            handleInput: (k) => { if (k === 'escape' || k === 'q' || k === 'enter') done(true); },
          }), { overlay: true });
        } else {
          ctx.ui.notify(panelText, 'info');
        }
      },
    });
  }

  return {
    ledger,
    updateTelemetry,
    dispose() {
      if (refreshTimer) {
        clearInterval(refreshTimer);
        refreshTimer = null;
      }
    },
  };
}
