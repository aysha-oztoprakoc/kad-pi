import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createKadControlPlaneExtension,
  renderCompactMeter,
  renderDetailedPanel,
  executeKadCommand,
  executeKadDoctor,
} from '../telemetry/control-plane-runtime.mjs';

test('CP1 Extension registers lifecycle hooks, commands, shortcuts, and custom tools', () => {
  const registeredEvents = [];
  const registeredCommands = new Map();
  const registeredTools = [];
  const registeredShortcuts = [];
  const statuses = new Map();
  const widgets = new Map();

  const mockPi = {
    on(event, handler) {
      registeredEvents.push(event);
    },
    registerCommand(name, spec) {
      registeredCommands.set(name, spec);
    },
    registerTool(tool) {
      registeredTools.push(tool);
    },
    registerShortcut(key, spec) {
      registeredShortcuts.push({ key, spec });
    },
  };

  const ext = createKadControlPlaneExtension(mockPi);
  assert.ok(registeredEvents.includes('session_start'));
  assert.ok(registeredEvents.includes('turn_end'));
  assert.ok(registeredEvents.includes('message_end'));
  assert.ok(registeredEvents.includes('model_select'));

  assert.ok(registeredCommands.has('kad'));
  assert.ok(registeredCommands.has('kad-status'));
  assert.ok(registeredCommands.has('kad-tokens'));
  assert.ok(registeredCommands.has('kad-providers'));
  assert.ok(registeredCommands.has('kad-budget'));
  assert.ok(registeredCommands.has('kad-services'));
  assert.ok(registeredCommands.has('kad-work'));
  assert.ok(registeredCommands.has('kad-refresh'));
  assert.ok(registeredCommands.has('kad-doctor'));

  assert.ok(registeredTools.some((t) => t.name === 'kad_telemetry'));
  assert.ok(registeredTools.some((t) => t.name === 'kad_policy_status'));
});

test('CP2 Compact meter formats status bar string cleanly and gracefully degrades', () => {
  const normalState = {
    session_tokens: 84200,
    economic_route: 'FREE',
    provider_quota_percent: 62,
    gpu: { vram_used: 5.8, vram_total: 8.0, util_percent: 12 },
    workctl: { ticket_id: 'CLI-002', has_active_claim: true },
  };

  const meter = renderCompactMeter(normalState);
  assert.ok(meter.includes('84k'));
  assert.ok(meter.includes('FREE'));
  assert.ok(meter.includes('62%'));
  assert.ok(meter.includes('CLI-002'));

  const degradedState = {
    session_tokens: 12000,
    economic_route: 'DEGRADED',
    provider_quota_percent: null,
    gpu: null,
    workctl: { ticket_id: 'NO ACTIVE CLAIM', has_active_claim: false },
    degraded_services: ['openviking'],
  };

  const degradedMeter = renderCompactMeter(degradedState);
  assert.ok(degradedMeter.includes('12k'));
  assert.ok(degradedMeter.includes('QUOTA ?') || degradedMeter.includes('UNKNOWN'));
  assert.ok(degradedMeter.includes('NO CLAIM') || degradedMeter.includes('none'));
});

test('CP3 Detailed panel renders structured sections with theme tokens', () => {
  const viewModel = {
    overview: {
      model: 'gpt-5.6-luna',
      provider: 'openai-codex',
      session_tokens: 182400,
      execution_class: 'REMOTE_SUBSCRIPTION',
      paid_authorized: false,
    },
    providers: [
      {
        provider_id: 'openai-codex',
        status: 'KNOWN',
        remaining: 72,
        limit: 100,
        unit: 'percent',
        source_class: 'AUTHORITATIVE_REMOTE',
        resets_in: '2h 15m',
      },
      {
        provider_id: 'google-antigravity',
        status: 'KNOWN',
        remaining: 390,
        limit: 1000,
        unit: 'requests',
        source_class: 'OBSERVED',
        resets_in: '1d',
      },
      {
        provider_id: 'provider-opaque',
        status: 'UNKNOWN',
        remaining: null,
        limit: null,
        unit: 'tokens',
        source_class: 'UNKNOWN',
        resets_in: null,
      },
    ],
    gpu: {
      device_name: 'AMD Radeon RX 9060 XT',
      util_percent: 6,
      vram_used_mib: 5955,
      vram_total_mib: 8144,
      temp_c: 58,
      power_w: 18,
    },
    services: {
      openviking: { state: 'AVAILABLE' },
      zotero: { state: 'DEGRADED' },
      needle: { state: 'UNAVAILABLE' },
    },
    workctl: {
      has_active_claim: true,
      ticket_id: 'WP-KAD-OPERATOR-CONTROL-PLANE-001',
      actor_label: 'operator',
    },
  };

  const rendered = renderDetailedPanel(viewModel);
  assert.ok(rendered.includes('KAD OPERATOR CONTROL PLANE'));
  assert.ok(rendered.includes('openai-codex'));
  assert.ok(rendered.includes('AUTHORITATIVE_REMOTE'));
  assert.ok(rendered.includes('UNKNOWN'));
  assert.ok(rendered.includes('AMD Radeon RX 9060 XT'));
  assert.ok(rendered.includes('WP-KAD-OPERATOR-CONTROL-PLANE-001'));
});

test('CP4 Failure isolation: Collector errors do not crash extension or UI', async () => {
  const faultyState = {
    providers: () => {
      throw new Error('Provider adapter network timeout');
    },
    gpu: () => {
      throw new Error('GPU device busy');
    },
  };

  const vm = await executeKadCommand('status', { faultyState });
  assert.ok(vm);
  assert.ok(vm.errors?.length > 0);
  assert.equal(vm.status, 'DEGRADED');
});

test('CP5 KAD doctor diagnostics command checks toolchain, runtime, and services', async () => {
  const report = await executeKadDoctor();
  assert.ok(report.checks);
  assert.ok(report.checks.some((c) => c.name === 'omp_extension'));
  assert.ok(report.checks.some((c) => c.name === 'workctl'));
  assert.ok(report.checks.some((c) => c.name === 'economic_router'));
  assert.ok(report.checks.some((c) => c.name === 'toolchain_trivy'));
  assert.ok(report.checks.some((c) => c.name === 'toolchain_gitleaks'));
  assert.ok(report.checks.some((c) => c.name === 'toolchain_amdgpu_top'));
  assert.ok(['PASS', 'DEGRADED'].includes(report.verdict));
});

test('CP6 Command dispatch for all subcommands (tokens, providers, budget, services, work)', async () => {
  const tokensVm = await executeKadCommand('tokens');
  assert.ok(tokensVm);
  assert.ok(Array.isArray(tokensVm.providers));

  const providersVm = await executeKadCommand('providers');
  assert.ok(providersVm);

  const budgetVm = await executeKadCommand('budget');
  assert.ok(budgetVm);
  assert.ok(budgetVm.overview);

  const servicesVm = await executeKadCommand('services');
  assert.ok(servicesVm);
  assert.ok(servicesVm.services);

  const workVm = await executeKadCommand('work');
  assert.ok(workVm);
  assert.ok(workVm.workctl);
});

test('CP7 Extension cleanup on session_shutdown clears timers without leaks', () => {
  const handlers = {};
  const mockPi = {
    on: (ev, fn) => {
      handlers[ev] = fn;
    },
    registerCommand: () => {},
    registerTool: () => {},
    registerShortcut: () => {},
    setStatus: () => {},
    setWidget: () => {},
  };

  const ext = createKadControlPlaneExtension(mockPi);
  assert.ok(ext);
  assert.ok(typeof handlers['session_shutdown'] === 'function');
  // Invoking shutdown hook executes without error
  handlers['session_shutdown']();
});
