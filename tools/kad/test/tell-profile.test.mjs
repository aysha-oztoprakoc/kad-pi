import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '../../..');

// Import TELL server profile modules
import {
  TELL_PROFILE_CONFIG,
  ANSI_16_PALETTE,
  TRUECOLOR_PALETTE,
  formatAnsi,
  formatMeter,
  formatEpistemicBadge,
  renderServerStatusView,
  createTellHostCapabilityDescriptor,
  validateHostCapabilityDescriptor
} from '../../../interface/themes/tell/index.mjs';

test('WP-018: TELL server profile config enforces KAD_PROFILE_SERVER, 0ms motion, and NO_AUDIO_UI', () => {
  assert.equal(TELL_PROFILE_CONFIG.profile_id, 'surface.tell.server');
  assert.equal(TELL_PROFILE_CONFIG.host, 'host.tell.server');
  assert.equal(TELL_PROFILE_CONFIG.execution_class, 'KAD_PROFILE_SERVER');
  assert.equal(TELL_PROFILE_CONFIG.motion_duration_ms, 0);
  assert.equal(TELL_PROFILE_CONFIG.audio_ui, false);
  assert.equal(TELL_PROFILE_CONFIG.monospace_only, true);

  const tellDir = path.join(repoRoot, 'interface/themes/tell');
  assert.ok(fs.existsSync(tellDir), 'interface/themes/tell must exist');

  const profileJsonPath = path.join(tellDir, 'profile.json');
  assert.ok(fs.existsSync(profileJsonPath));
  const profileJson = JSON.parse(fs.readFileSync(profileJsonPath, 'utf8'));
  assert.equal(profileJson.profile_id, 'surface.tell.server');
  assert.equal(profileJson.motion_duration_ms, 0);
});

test('WP-018: 16-color ANSI and 24-bit TrueColor palettes with deterministic fallback', () => {
  // TrueColor formatting
  const trueColorCyan = formatAnsi('KAD-SYSTEM', { color: 'cyan', mode: 'truecolor' });
  assert.ok(trueColorCyan.includes('\x1b[38;2;104;213;232m'), 'Must contain 24-bit RGB escape code for #68d5e8');
  assert.ok(trueColorCyan.includes('\x1b[0m'), 'Must reset ANSI formatting');

  // 16-color fallback
  const ansi16Cyan = formatAnsi('KAD-SYSTEM', { color: 'cyan', mode: 'ansi16' });
  assert.ok(ansi16Cyan.includes('\x1b[36m') || ansi16Cyan.includes('\x1b[96m'), 'Must map to standard/bright ANSI cyan');

  // Plain text fallback (0-color)
  const plainText = formatAnsi('KAD-SYSTEM', { color: 'cyan', mode: 'plain' });
  assert.equal(plainText, 'KAD-SYSTEM', 'Plain mode must return raw text without ANSI escapes');
});

test('WP-018: High-density TUI status meters and ASCII views render telemetry without graphical deps', () => {
  // Meter rendering
  const meter50 = formatMeter(0.5, { width: 10, mode: 'plain' });
  assert.equal(meter50, '[█████░░░░░] 50.0%');

  const meterAnsi = formatMeter(0.8, { width: 10, mode: 'ansi16' });
  assert.ok(meterAnsi.includes('80.0%'));
  assert.ok(meterAnsi.includes('\x1b['));

  // Epistemic badges
  const canonicalBadge = formatEpistemicBadge('CANONICAL_KNOWLEDGE', { mode: 'plain' });
  assert.equal(canonicalBadge, '[CANONICAL]');

  const derivedBadge = formatEpistemicBadge('PROJECT_INFERENCE', { mode: 'plain' });
  assert.equal(derivedBadge, '[DERIVED]');

  // Full TUI server summary render
  const sampleTelemetry = {
    host: 'tell',
    cpuPercent: 32.5,
    ramUsedBytes: 16 * 1024 * 1024 * 1024,
    ramTotalBytes: 64 * 1024 * 1024 * 1024,
    activeWorkers: 2,
    epistemicStatus: 'CANONICAL_KNOWLEDGE'
  };

  const renderedView = renderServerStatusView(sampleTelemetry, { mode: 'ansi16' });
  assert.ok(renderedView.includes('TELL SERVER // HEADLESS OBSERVABILITY'));
  assert.ok(renderedView.includes('CPU:'));
  assert.ok(renderedView.includes('RAM:'));
});

test('WP-018: Host-specific capability adapter contract for host.tell.server isolates NixOS from cognition policy', () => {
  const rawTellHardware = {
    hostname: 'tell',
    arch: 'x86_64',
    cpuCores: 16,
    totalRamBytes: 68719476736,
    accelerator: 'cpu_avx512',
    nixosVersion: '26.05.pre',
    nixStorePath: '/nix/store/xyz'
  };

  const descriptor = createTellHostCapabilityDescriptor(rawTellHardware);

  assert.equal(descriptor.schema, 'kad-compute-host-capability-v1');
  assert.equal(descriptor.host, 'host.tell.server');
  assert.equal(descriptor.trust_domain, 'engineering');
  assert.ok(Array.isArray(descriptor.supported_cognition_classes));
  assert.ok(descriptor.supported_cognition_classes.includes('deterministic_transformation'));
  assert.ok(descriptor.supported_cognition_classes.includes('retrieval_ranking'));

  // Strict boundary: No NixOS internals leaked into cognition policy
  const validation = validateHostCapabilityDescriptor(descriptor);
  assert.equal(validation.valid, true);
  assert.equal(validation.hasLeakedSystemPaths, false);
});

test('WP-018: Zero mutation authority over production routing or canonical vault verified', () => {
  const descriptor = createTellHostCapabilityDescriptor({ hostname: 'tell' });

  // Descriptor proposes capabilities; does not authorize production routes
  assert.equal(descriptor.authority_grant, false);
  assert.equal(descriptor.routing_mutation_allowed, false);
  assert.equal(descriptor.vault_mutation_allowed, false);
});
