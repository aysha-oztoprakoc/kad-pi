import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '../../..');

// Import theme adapter modules
import {
  AMDY_THEME_TOKENS,
  projectAestheticTokensToHost,
  generateHyprlandConfig,
  generateQuickshellTheme,
  generateTerminalColorSchemes,
  createDegradedDesktopThemeState
} from '../../../interface/themes/omarchy/adapter.mjs';

test('WP-017: AMDY theme tokens match canonical ISA-KAD-AESTHETIC-001 definitions', () => {
  assert.equal(AMDY_THEME_TOKENS.canvas, '#07090e');
  assert.equal(AMDY_THEME_TOKENS.panel, '#151923');
  assert.equal(AMDY_THEME_TOKENS.crimson, '#1a080a');
  assert.equal(AMDY_THEME_TOKENS.textCyan, '#68d5e8');
  assert.equal(AMDY_THEME_TOKENS.textBone, '#e7e8e6');
  assert.equal(AMDY_THEME_TOKENS.sanctityGold, '#e7ba72');

  const themeDir = path.join(repoRoot, 'interface/themes/omarchy');
  assert.ok(fs.existsSync(themeDir), 'interface/themes/omarchy directory must exist');

  const tokensJsonPath = path.join(themeDir, 'tokens.json');
  assert.ok(fs.existsSync(tokensJsonPath), 'tokens.json must exist');
  const tokens = JSON.parse(fs.readFileSync(tokensJsonPath, 'utf8'));
  assert.equal(tokens.colors.canvas, AMDY_THEME_TOKENS.canvas);
  assert.equal(tokens.colors.cyan, AMDY_THEME_TOKENS.textCyan);
});

test('WP-017: Hyprland configuration enforces sharp framing, 2px borders, and 150-200ms motion', () => {
  const hyprConfig = generateHyprlandConfig(AMDY_THEME_TOKENS);

  // Check border colors
  assert.ok(hyprConfig.includes('col.active_border = rgb(68d5e8)'));
  assert.ok(hyprConfig.includes('col.inactive_border = rgb(303746)'));

  // Check rounding & gaps
  assert.ok(hyprConfig.includes('rounding = 2') || hyprConfig.includes('rounding = 0'));

  // Check animations: 150ms-200ms, zero infinite loops
  assert.ok(hyprConfig.includes('animation = windows, 1, 2') || hyprConfig.includes('animation = windows, 1, 1.5') || hyprConfig.includes('150ms') || hyprConfig.includes('200ms') || hyprConfig.includes('bezier = cyberdeck'));
  assert.ok(!hyprConfig.includes('infinite'), 'Hyprland config must not contain infinite looping animations');

  // Verify on-disk file
  const onDiskPath = path.join(repoRoot, 'interface/themes/omarchy/hyprland.conf');
  assert.ok(fs.existsSync(onDiskPath));
  const onDiskContent = fs.readFileSync(onDiskPath, 'utf8');
  assert.ok(onDiskContent.includes('col.active_border'));
});

test('WP-017: Quickshell QML theme singleton and HUD overlay enforce NO_AUDIO_UI and zero shell mutation', () => {
  const quickshellDir = path.join(repoRoot, 'interface/themes/omarchy/quickshell');
  assert.ok(fs.existsSync(quickshellDir), 'quickshell directory must exist');

  const themeQmlPath = path.join(quickshellDir, 'Theme.qml');
  assert.ok(fs.existsSync(themeQmlPath), 'Theme.qml must exist');
  const themeQml = fs.readFileSync(themeQmlPath, 'utf8');

  // Verify semantic color bindings
  assert.ok(themeQml.includes('property color canvas: "#07090e"'));
  assert.ok(themeQml.includes('property color cyan: "#68d5e8"'));
  assert.ok(themeQml.includes('property color gold: "#e7ba72"'));
  assert.ok(themeQml.includes('property color bone: "#e7e8e6"'));

  const hudQmlPath = path.join(quickshellDir, 'KadHudOverlay.qml');
  assert.ok(fs.existsSync(hudQmlPath), 'KadHudOverlay.qml must exist');
  const hudQml = fs.readFileSync(hudQmlPath, 'utf8');

  // Zero Audio UI
  assert.ok(!hudQml.includes('SoundEffect') && !hudQml.includes('Audio'), 'Strict NO_AUDIO_UI in QML HUD');

  // Zero arbitrary shell execution mutation authority
  assert.ok(!hudQml.includes('Process {') && !hudQml.includes('sh -c'), 'Zero shell mutation in QML HUD');
});

test('WP-017: Terminal TrueColor 24-bit color schemes generated for Alacritty, Foot, and Kitty', () => {
  const terminalSchemes = generateTerminalColorSchemes(AMDY_THEME_TOKENS);

  assert.ok(terminalSchemes.alacritty.includes('[colors.primary]'));
  assert.ok(terminalSchemes.alacritty.includes('background = "#07090e"'));
  assert.ok(terminalSchemes.alacritty.includes('foreground = "#e7e8e6"'));

  assert.ok(terminalSchemes.foot.includes('background=07090e'));
  assert.ok(terminalSchemes.foot.includes('foreground=e7e8e6'));

  assert.ok(terminalSchemes.kitty.includes('background #07090e'));
  assert.ok(terminalSchemes.kitty.includes('foreground #e7e8e6'));

  // Verify on-disk files
  const termDir = path.join(repoRoot, 'interface/themes/omarchy/terminal');
  assert.ok(fs.existsSync(path.join(termDir, 'alacritty.toml')));
  assert.ok(fs.existsSync(path.join(termDir, 'foot.ini')));
  assert.ok(fs.existsSync(path.join(termDir, 'kitty.conf')));
});

test('WP-017: Deterministic projection adapter transforms ISA tokens into complete host suite', () => {
  const isaProjectionPath = path.join(repoRoot, 'vault/90_Derived/Projections/isa-aesthetic.json');
  const isaProjection = JSON.parse(fs.readFileSync(isaProjectionPath, 'utf8'));

  const hostSuite = projectAestheticTokensToHost(isaProjection, 'host.amdy.workstation');
  assert.equal(hostSuite.host, 'host.amdy.workstation');
  assert.equal(hostSuite.profile, 'surface.amdy.quickshell');
  assert.ok(hostSuite.tokens);
  assert.ok(hostSuite.hyprland);
  assert.ok(hostSuite.quickshell);
  assert.ok(hostSuite.terminals);
});

test('WP-017: Graceful degradation: compositor/GPU outage drops to 0ms static monochrome/TUI', () => {
  const degradedState = createDegradedDesktopThemeState({ gpuAccelerated: false, compositorAvailable: false });
  assert.equal(degradedState.mode, 'STATIC_MONOSPACE_FALLBACK');
  assert.equal(degradedState.animationDurationMs, 0);
  assert.equal(degradedState.audioEnabled, false);
  assert.ok(degradedState.terminalFallback);
});
