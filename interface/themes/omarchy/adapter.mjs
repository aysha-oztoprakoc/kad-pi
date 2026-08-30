/**
 * AMDY Omarchy Cyberdeck Theme Adapter
 * Surface Profile: surface.amdy.quickshell & surface.amdy.hyprland (ISA-KAD-AESTHETIC-001)
 *
 * Invariants:
 * 1. Pure deterministic projection: transforms canonical aesthetic ISA tokens to host-specific theme files.
 * 2. Zero shell mutation authority: UI presentation widgets cannot execute arbitrary mutating shell commands.
 * 3. Strict NO_AUDIO_UI and 150ms-200ms state transitions (zero ambient looping animations).
 * 4. Graceful degradation to 0ms static monochrome/TUI on compositor/GPU outage.
 */

export const AMDY_THEME_TOKENS = Object.freeze({
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
  historicalPurple: '#c084fc',
  borderBase: '#303746',
  borderHot: '#68d5e8'
});

export function generateHyprlandConfig(tokens = AMDY_THEME_TOKENS) {
  const hex = (c) => c.replace('#', '');
  return `# Hyprland Cyberdeck Theme (surface.amdy.hyprland)
# Governed by ISA-KAD-AESTHETIC-001

general {
    gaps_in = 4
    gaps_out = 8
    border_size = 2
    col.active_border = rgb(${hex(tokens.borderHot || tokens.textCyan)}) rgb(${hex(tokens.crimson)}) 45deg
    col.inactive_border = rgb(${hex(tokens.borderBase)})
    layout = dwindle
    no_border_on_floating = false
}

decoration {
    rounding = 2
    active_opacity = 0.98
    inactive_opacity = 0.88
    dim_inactive = true
    dim_strength = 0.15

    shadow {
        enabled = true
        range = 12
        render_power = 3
        color = rgba(${hex(tokens.canvas)}ee)
    }
}

animations {
    enabled = true
    bezier = cyberdeck, 0.05, 0.9, 0.1, 1.05
    animation = windows, 1, 2, cyberdeck, slide
    animation = windowsOut, 1, 2, cyberdeck, slide
    animation = border, 1, 2, cyberdeck
    animation = fade, 1, 2, cyberdeck
    animation = workspaces, 1, 2, cyberdeck, slide
}
`;
}

export function generateQuickshellTheme(tokens = AMDY_THEME_TOKENS) {
  return `pragma Singleton
import QtQuick

QtObject {
    id: theme

    // Color Roles (ISA-KAD-AESTHETIC-001)
    readonly property color canvas: "${tokens.canvas}"
    readonly property color panel: "${tokens.panel}"
    readonly property color crimson: "${tokens.crimson}"
    readonly property color lift: "${tokens.lift}"

    readonly property color cyan: "${tokens.textCyan}"
    readonly property color bone: "${tokens.textBone}"
    readonly property color secondary: "${tokens.textSecondary}"
    readonly property color faint: "${tokens.textFaint}"

    readonly property color gold: "${tokens.sanctityGold}"
    readonly property color green: "${tokens.passGreen}"
    readonly property color red: "${tokens.failRed}"
    readonly property color purple: "${tokens.historicalPurple}"

    readonly property color borderBase: "${tokens.borderBase}"
    readonly property color borderHot: "${tokens.borderHot}"

    // Typography
    readonly property string fontMono: "JetBrains Mono"
    readonly property string fontProse: "Inter"

    // Geometry
    readonly property int radius: 2
    readonly property int borderWidth: 2

    // Motion Profile (150ms state transitions)
    readonly property int animDuration: 150
    readonly property int targetRefreshRate: 200

    // Strict Silence Invariant
    readonly property bool audioEnabled: false
}
`;
}

export function generateTerminalColorSchemes(tokens = AMDY_THEME_TOKENS) {
  const hex = (c) => c.replace('#', '');

  const alacritty = `# Alacritty Cyberdeck Color Scheme (surface.terminal.omarchy)
[colors.primary]
background = "${tokens.canvas}"
foreground = "${tokens.textBone}"

[colors.cursor]
text = "${tokens.canvas}"
cursor = "${tokens.textCyan}"

[colors.normal]
black   = "${tokens.panel}"
red     = "${tokens.failRed}"
green   = "${tokens.passGreen}"
yellow  = "${tokens.sanctityGold}"
blue    = "${tokens.textCyan}"
magenta = "${tokens.historicalPurple}"
cyan    = "${tokens.textCyan}"
white   = "${tokens.textBone}"

[colors.bright]
black   = "${tokens.borderBase}"
red     = "${tokens.failRed}"
green   = "${tokens.passGreen}"
yellow  = "${tokens.sanctityGold}"
blue    = "${tokens.textCyan}"
magenta = "${tokens.historicalPurple}"
cyan    = "${tokens.textCyan}"
white   = "#ffffff"
`;

  const foot = `# Foot Cyberdeck Color Scheme (surface.terminal.omarchy)
[main]
font=monospace:size=11

[colors]
background=${hex(tokens.canvas)}
foreground=${hex(tokens.textBone)}

regular0=${hex(tokens.panel)}
regular1=${hex(tokens.failRed)}
regular2=${hex(tokens.passGreen)}
regular3=${hex(tokens.sanctityGold)}
regular4=${hex(tokens.textCyan)}
regular5=${hex(tokens.historicalPurple)}
regular6=${hex(tokens.textCyan)}
regular7=${hex(tokens.textBone)}

bright0=${hex(tokens.borderBase)}
bright1=${hex(tokens.failRed)}
bright2=${hex(tokens.passGreen)}
bright3=${hex(tokens.sanctityGold)}
bright4=${hex(tokens.textCyan)}
bright5=${hex(tokens.historicalPurple)}
bright6=${hex(tokens.textCyan)}
bright7=ffffff
`;

  const kitty = `# Kitty Cyberdeck Color Scheme (surface.terminal.omarchy)
background ${tokens.canvas}
foreground ${tokens.textBone}

cursor ${tokens.textCyan}
cursor_text_color ${tokens.canvas}

color0 ${tokens.panel}
color1 ${tokens.failRed}
color2 ${tokens.passGreen}
color3 ${tokens.sanctityGold}
color4 ${tokens.textCyan}
color5 ${tokens.historicalPurple}
color6 ${tokens.textCyan}
color7 ${tokens.textBone}

color8 ${tokens.borderBase}
color9 ${tokens.failRed}
color10 ${tokens.passGreen}
color11 ${tokens.sanctityGold}
color12 ${tokens.textCyan}
color13 ${tokens.historicalPurple}
color14 ${tokens.textCyan}
color15 #ffffff
`;

  return { alacritty, foot, kitty };
}

export function projectAestheticTokensToHost(isaProjection, hostProfile = 'host.amdy.workstation') {
  const tokens = AMDY_THEME_TOKENS;
  const hyprland = generateHyprlandConfig(tokens);
  const quickshell = generateQuickshellTheme(tokens);
  const terminals = generateTerminalColorSchemes(tokens);

  return {
    host: hostProfile,
    profile: 'surface.amdy.quickshell',
    tokens,
    hyprland,
    quickshell,
    terminals,
    generatedAt: new Date().toISOString()
  };
}

export function createDegradedDesktopThemeState({ gpuAccelerated = true, compositorAvailable = true } = {}) {
  if (gpuAccelerated && compositorAvailable) {
    return {
      mode: 'FULL_HARDWARE_ACCELERATED',
      animationDurationMs: 150,
      audioEnabled: false,
      terminalFallback: false
    };
  }

  return {
    mode: 'STATIC_MONOSPACE_FALLBACK',
    animationDurationMs: 0,
    audioEnabled: false,
    terminalFallback: true,
    message: 'Compositor or GPU unavailable; degraded to 0ms static monospace rendering.'
  };
}
